export const template = `
    <div class="mb-6">
        <h2 class="text-xl font-bold text-gray-950 tracking-tight">Панель управления</h2>
        <p class="text-xs text-gray-600 font-medium">Оперативная сводка по филиалу СХК «Великополье»</p>
    </div>

    <div class="grid gap-4 sm:grid-cols-3 mb-6">
        <div class="bg-white border-2 border-gray-400/80 rounded-xl p-4 shadow-2xs">
            <p class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Всего техники</p>
            <h3 id="dashTotal" class="text-2xl font-black text-gray-950 mt-1">0 <span class="text-xs font-normal text-gray-500">ед.</span></h3>
        </div>
        <div class="bg-white border-2 border-gray-400/80 rounded-xl p-4 shadow-2xs border-l-4 border-l-emerald-600">
            <p class="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">🟢 Готовы к работе</p>
            <h3 id="dashReady" class="text-2xl font-black text-gray-950 mt-1">0</h3>
        </div>
        <div class="bg-white border-2 border-gray-400/80 rounded-xl p-4 shadow-2xs border-l-4 border-l-red-600">
            <p class="text-[11px] font-bold text-red-600 uppercase tracking-wider">🔴 В ремонте</p>
            <h3 id="dashInRepair" class="text-2xl font-black text-gray-950 mt-1">0</h3>
        </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2 space-y-3">
            <h3 class="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                ⚠️ Требует внимания (Сроки, Задачи и ТО)
            </h3>
            <div id="dashAlertsContainer" class="space-y-2">
                <div class="text-center text-gray-500 py-6 text-xs font-bold bg-white border border-gray-300 rounded-xl">Загрузка данных...</div>
            </div>
        </div>

        <div class="space-y-3">
            <h3 class="text-xs font-bold text-gray-900 uppercase tracking-wider">Быстрые действия</h3>
            <div class="bg-white border-2 border-gray-400/80 rounded-xl p-4 shadow-2xs space-y-3">
                <button onclick="window.switchModule('fleet')" class="w-full text-left p-3.5 bg-gray-50 hover:bg-emerald-50 rounded-lg border border-gray-300 hover:border-emerald-600 transition flex items-center justify-between group">
                    <div>
                        <p class="text-xs font-bold text-gray-950">Открыть автопарк</p>
                        <p class="text-[11px] text-gray-600 font-medium">Управление машинами и задачами</p>
                    </div>
                    <span class="text-gray-500 group-hover:text-emerald-700 transition text-sm font-bold">➔</span>
                </button>
            </div>
        </div>
    </div>
`;

let refreshIntervalId = null;

export async function init() {
    await loadDashboardData();
    if (refreshIntervalId) clearInterval(refreshIntervalId);
    refreshIntervalId = setInterval(loadDashboardData, 5000);
}

async function loadDashboardData() {
    if (!window._supabase) return;
    try {
        // Параллельно загружаем технику и список незавершенных задач
        const [vehiclesRes, tasksRes] = await Promise.all([
            window._supabase.from('vehicles').select('*'),
            window._supabase.from('vehicle_tasks').select('*').eq('is_completed', false)
        ]);

        if (vehiclesRes.error) throw vehiclesRes.error;
        
        const vehiclesList = vehiclesRes.data || [];
        const activeTasks = tasksRes.data || [];

        renderStats(vehiclesList);
        renderAlerts(vehiclesList, activeTasks);
    } catch (err) {
        console.error("Ошибка Dashboard:", err.message);
        const container = document.getElementById('dashAlertsContainer');
        if (container) {
            container.innerHTML = `<div class="p-3 bg-red-50 text-red-700 rounded-lg text-xs font-bold border border-red-300">Ошибка: ${err.message}</div>`;
        }
    }
}

function renderStats(list) {
    document.getElementById('dashTotal').innerHTML = `${list.length} <span class="text-xs font-normal text-gray-500">ед.</span>`;
    document.getElementById('dashReady').innerText = list.filter(v => v.tags && v.tags.includes('Готов')).length;
    document.getElementById('dashInRepair').innerText = list.filter(v => v.tags && v.tags.includes('В ремонте')).length;
}

function renderAlerts(list, activeTasks) {
    const container = document.getElementById('dashAlertsContainer');
    if (!container) return;

    const alerts = [];
    const today = new Date();
    
    // 1. Сначала добавляем в список критические задачи по ремонту/обслуживанию от пользователя
    activeTasks.forEach(task => {
        alerts.push({
            type: 'task',
            text: `📋 <b>${task.vehicle_name || 'Техника'}</b>: <span class="text-amber-950 font-bold">${task.text}</span>`
        });
    });

    // 2. Обрабатываем документы и гарантию каждой машины
    list.forEach(v => {
        // Проверка Гостехосмотра
        if (v.inspection_date) {
            const diff = Math.ceil((new Date(v.inspection_date) - today) / (1000 * 60 * 60 * 24));
            if (diff <= 0) {
                alerts.push({ type: 'danger', text: `⚙️ <b>${v.model}</b> (${v.plate || 'б/н'}): <span class="text-red-700 font-bold">Просрочен Гостехосмотр!</span>` });
            } else if (diff <= 30) {
                alerts.push({ type: 'warning', text: `⚙️ <b>${v.model}</b>: Гостехосмотр истекает через <span class="font-bold">${diff} дн.</span>` });
            }
        }

        // Проверка Страховки
        if (v.insurance_date) {
            const diffIns = Math.ceil((new Date(v.insurance_date) - today) / (1000 * 60 * 60 * 24));
            if (diffIns <= 0) {
                alerts.push({ type: 'danger', text: `📄 <b>${v.model}</b> (${v.plate || 'б/н'}): <span class="text-red-700 font-bold">Закончилась страховка!</span>` });
            } else if (diffIns <= 30) {
                alerts.push({ type: 'warning', text: `📄 <b>${v.model}</b>: Страховка истекает через <span class="font-bold">${diffIns} дн.</span>` });
            }
        }

        // Проверка Гарантийной наработки до ТО (кратно 250 м/ч)
        const vehicleTagsArray = v.tags ? v.tags.split(',').map(t => t.trim()) : [];
        if (vehicleTagsArray.includes('Гарантия')) {
            const hours = v.current_hours || 0;
            const nextTO = Math.ceil((hours + 1) / 250) * 250;
            const hoursLeft = nextTO - hours;

            if (hoursLeft <= 30) {
                alerts.push({ 
                    type: 'danger', 
                    text: `🛠️ <b>${v.model}</b> (ГАРАНТИЯ): <span class="text-red-700 font-bold">Срочно требуется ТО-${nextTO}!</span> Осталось всего <b>${hoursLeft} м/ч</b>.` 
                });
            } else if (hoursLeft <= 60) {
                alerts.push({ 
                    type: 'warning', 
                    text: `🛠️ <b>${v.model}</b> (ГАРАНТИЯ): Приближается ТО-${nextTO}. Осталось <b>${hoursLeft} м/ч</b>.` 
                });
            } else {
                alerts.push({ 
                    type: 'info', 
                    text: `🛠️ <b>${v.model}</b> (ГАРАНТИЯ): Наработка ${hours} м/ч. До планового ТО-${nextTO} осталось <b>${hoursLeft} м/ч</b>.` 
                });
            }
        }
    });

    if (alerts.length === 0) {
        container.innerHTML = `
            <div class="bg-emerald-50 border-2 border-emerald-300 text-emerald-900 p-4 rounded-xl text-center text-xs font-bold">
                Все документы в порядке, активных задач и критических сроков обслуживания нет!
            </div>`;
        return;
    }

    // Выводим все события на экран с индивидуальными стилями
    container.innerHTML = alerts.map(a => {
        let classes = "bg-amber-50 border-amber-300 text-amber-950 font-medium"; // warning по умолчанию
        if (a.type === 'danger') classes = "bg-red-50 border-red-300 text-red-950 font-bold";
        if (a.type === 'info') classes = "bg-blue-50 border-blue-300 text-blue-950 font-medium";
        
        // Для задач делаем стильную оранжево-желтую плашку с хорошей жирностью текста
        if (a.type === 'task') classes = "bg-amber-50 border-2 border-amber-400 text-gray-950 font-bold shadow-2xs";
        
        return `<div class="p-2.5 border rounded-lg text-xs ${classes}">${a.text}</div>`;
    }).join('');
}