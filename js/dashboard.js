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

    <div class="grid gap-6 lg:grid-cols-3 mb-6">
        
        <div class="space-y-2.5">
            <h3 class="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1">
                📋 Активные задачи по ремонту
            </h3>
            <div id="containerTasks" class="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                <div class="text-gray-400 text-xs py-4 text-center bg-white border border-gray-200 rounded-lg">Загрузка...</div>
            </div>
        </div>

        <div class="space-y-2.5">
            <h3 class="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1">
                🛠️ Гарантийное обслуживание (ТО)
            </h3>
            <div id="containerWarranty" class="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                <div class="text-gray-400 text-xs py-4 text-center bg-white border border-gray-200 rounded-lg">Загрузка...</div>
            </div>
        </div>

        <div class="space-y-2.5">
            <h3 class="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1">
                ⚙️ Сроки документов (ТО и Страховка)
            </h3>
            <div id="containerDocs" class="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                <div class="text-gray-400 text-xs py-4 text-center bg-white border border-gray-200 rounded-lg">Загрузка...</div>
            </div>
        </div>

    </div>

    <div class="bg-white border-2 border-gray-400/80 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
        <div class="space-y-0.5">
            <p class="text-xs font-bold text-gray-950">Необходимо внести изменения или записать лог ремонта?</p>
            <p class="text-[11px] text-gray-600 font-medium">Перейдите в соответствующий раздел для редактирования карточек</p>
        </div>
        <button onclick="window.switchModule('fleet')" class="bg-gray-950 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-xs">
            Перейти в Автопарк ➔
        </button>
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
        const [vehiclesRes, tasksRes] = await Promise.all([
            window._supabase.from('vehicles').select('*'),
            window._supabase.from('vehicle_tasks').select('*').eq('is_completed', false)
        ]);

        if (vehiclesRes.error) throw vehiclesRes.error;
        
        const vehiclesList = vehiclesRes.data || [];
        const activeTasks = tasksRes.data || [];

        renderStats(vehiclesList);
        renderSeparatedAlerts(vehiclesList, activeTasks);
    } catch (err) {
        console.error("Ошибка Dashboard:", err.message);
    }
}

function renderStats(list) {
    document.getElementById('dashTotal').innerHTML = `${list.length} <span class="text-xs font-normal text-gray-500">ед.</span>`;
    document.getElementById('dashReady').innerText = list.filter(v => v.tags && v.tags.includes('Готов')).length;
    document.getElementById('dashInRepair').innerText = list.filter(v => v.tags && v.tags.includes('В ремонте')).length;
}

function renderSeparatedAlerts(list, activeTasks) {
    const today = new Date();
    
    // Создаем карту соответствия ID техники -> Госномер
    const plateMap = {};
    list.forEach(v => {
        plateMap[v.id] = v.plate ? `[${v.plate}]` : '[б/н]';
    });

    // 1. РЕНДЕРИНГ БЛОКА ЗАДАЧ
    const containerTasks = document.getElementById('containerTasks');
    if (containerTasks) {
        if (activeTasks.length === 0) {
            containerTasks.innerHTML = `<div class="bg-emerald-50/50 border border-emerald-200 text-emerald-950 p-3 rounded-lg text-center text-[11px] font-bold">Нет активных задач по ремонту</div>`;
        } else {
            containerTasks.innerHTML = activeTasks.map(task => {
                // Ищем госномер для этой задачи
                const plateStr = plateMap[task.vehicle_id] || '';
                return `
                    <div class="p-2.5 bg-amber-50 border-2 border-amber-400 text-gray-950 font-bold rounded-lg text-[11px] shadow-2xs">
                        <b>${task.vehicle_name || 'Техника'}</b> <span class="text-gray-600 font-mono font-medium">${plateStr}</span>:<br>
                        <span class="text-amber-950 font-medium mt-0.5 block">${task.text}</span>
                    </div>
                `;
            }).join('');
        }
    }

    // Списки для двух других категорий
    const warrantyAlerts = [];
    const docAlerts = [];

    // Разносим данные по массивам
    list.forEach(v => {
        const plateStr = v.plate ? ` [${v.plate}]` : ' [б/н]';

        // Проверка Гостехосмотра
        if (v.inspection_date) {
            const diff = Math.ceil((new Date(v.inspection_date) - today) / (1000 * 60 * 60 * 24));
            if (diff <= 0) {
                docAlerts.push({ isCritical: true, text: `🛑 <b>${v.model}</b><span class="font-mono text-gray-700">${plateStr}</span>:<br><span class="text-red-700 font-black">Просрочен Гостехосмотр!</span>` });
            } else if (diff <= 30) {
                docAlerts.push({ isCritical: false, text: `⚠️ <b>${v.model}</b><span class="font-mono text-gray-700">${plateStr}</span>:<br>Техосмотр истекает через <b>${diff} дн.</b>` });
            }
        }

        // Проверка Страховки
        if (v.insurance_date) {
            const diffIns = Math.ceil((new Date(v.insurance_date) - today) / (1000 * 60 * 60 * 24));
            if (diffIns <= 0) {
                docAlerts.push({ isCritical: true, text: `🛑 <b>${v.model}</b><span class="font-mono text-gray-700">${plateStr}</span>:<br><span class="text-red-700 font-black">Закончилась страховка!</span>` });
            } else if (diffIns <= 30) {
                docAlerts.push({ isCritical: false, text: `⚠️ <b>${v.model}</b><span class="font-mono text-gray-700">${plateStr}</span>:<br>Страховка истекает через <b>${diffIns} дн.</b>` });
            }
        }

        // Проверка Гарантии
        const vehicleTagsArray = v.tags ? v.tags.split(',').map(t => t.trim()) : [];
        if (vehicleTagsArray.includes('Гарантия')) {
            const hours = v.current_hours || 0;
            const nextTO = Math.ceil((hours + 1) / 250) * 250;
            const hoursLeft = nextTO - hours;

            if (hoursLeft <= 30) {
                warrantyAlerts.push({ status: 'danger', text: `🚨 <b>${v.model}</b><span class="font-mono text-gray-700">${plateStr}</span>:<br><span class="text-red-700 font-black">Срочно ТО-${nextTO}!</span> Осталось <b>${hoursLeft} м/ч</b>.` });
            } else if (hoursLeft <= 60) {
                warrantyAlerts.push({ status: 'warning', text: `⚠️ <b>${v.model}</b><span class="font-mono text-gray-700">${plateStr}</span>:<br>Приближается ТО-${nextTO}. Осталось <b>${hoursLeft} м/ч</b>.` });
            } else {
                warrantyAlerts.push({ status: 'info', text: `⚙️ <b>${v.model}</b><span class="font-mono text-gray-700">${plateStr}</span>:<br>Наработка ${hours} м/ч. До ТО-${nextTO} ещё <b>${hoursLeft} м/ч</b>.` });
            }
        }
    });

    // 2. РЕНДЕРИНГ БЛОКА ГАРАНТИИ
    const containerWarranty = document.getElementById('containerWarranty');
    if (containerWarranty) {
        if (warrantyAlerts.length === 0) {
            containerWarranty.innerHTML = `<div class="bg-emerald-50/50 border border-emerald-200 text-emerald-950 p-3 rounded-lg text-center text-[11px] font-bold">Нет гарантийной техники на контроле</div>`;
        } else {
            containerWarranty.innerHTML = warrantyAlerts.map(a => {
                let c = "bg-blue-50 border-blue-300 text-blue-950 font-medium";
                if (a.status === 'danger') c = "bg-red-50 border-red-300 text-red-950 font-bold";
                if (a.status === 'warning') c = "bg-amber-50 border-amber-300 text-amber-950 font-medium";
                return `<div class="p-2.5 border rounded-lg text-[11px] ${c}">${a.text}</div>`;
            }).join('');
        }
    }

    // 3. РЕНДЕРИНГ БЛОКА ДОКУМЕНТОВ
    const containerDocs = document.getElementById('containerDocs');
    if (containerDocs) {
        if (docAlerts.length === 0) {
            containerDocs.innerHTML = `<div class="bg-emerald-50/50 border border-emerald-200 text-emerald-900 p-3 rounded-lg text-center text-[11px] font-bold">Все документы в полном порядке!</div>`;
        } else {
            containerDocs.innerHTML = docAlerts.map(a => {
                const c = a.isCritical ? "bg-red-50 border-red-300 text-red-950 font-bold" : "bg-amber-50 border-amber-300 text-amber-950 font-medium";
                return `<div class="p-2.5 border rounded-lg text-[11px] ${c}">${a.text}</div>`;
            }).join('');
        }
    }
}