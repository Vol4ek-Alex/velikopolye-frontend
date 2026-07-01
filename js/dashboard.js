export const template = `
    <div class="mb-6">
        <h2 class="text-xl font-bold text-gray-950 dark:text-white tracking-tight">Панель управления</h2>
        <p class="text-xs text-gray-600 dark:text-gray-400 font-medium">Оперативная сводка по филиалу СХК «Великополье»</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="md:col-span-1 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 border-2 border-gray-950 rounded-2xl p-5 shadow-sm text-white flex flex-col justify-between min-h-[115px]">
            <div class="flex items-center justify-between">
                <p class="text-[10px] font-black uppercase tracking-wider text-gray-400">Общий автопарк</p>
                <span class="text-xs bg-white/10 px-2 py-0.5 rounded-md font-bold text-gray-300">Всего</span>
            </div>
            <div class="mt-2 flex items-baseline gap-1">
                <h3 id="dashTotal" class="text-4xl font-black tracking-tight">0</h3>
                <span class="text-xs font-bold text-gray-400">ед. техники</span>
            </div>
        </div>

        <div class="md:col-span-2 grid grid-cols-3 gap-3 bg-white dark:bg-gray-900 border-2 border-gray-400/80 dark:border-gray-800 rounded-2xl p-3.5 shadow-2xs">
            <div class="bg-emerald-50/60 dark:bg-emerald-950/20 border-2 border-emerald-500/30 dark:border-emerald-500/20 rounded-xl p-3 flex flex-col justify-between">
                <p class="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block animate-pulse"></span> Готово
                </p>
                <h4 id="dashReady" class="text-2xl font-black text-gray-950 dark:text-white mt-2">0</h4>
            </div>

            <div class="bg-blue-50/60 dark:bg-blue-950/20 border-2 border-blue-500/20 dark:border-blue-500/20 rounded-xl p-3 flex flex-col justify-between">
                <p class="text-[10px] font-black uppercase tracking-wider text-blue-800 dark:text-blue-400 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span> Хранение
                </p>
                <h4 id="dashStorage" class="text-2xl font-black text-gray-950 dark:text-white mt-2">0</h4>
            </div>

            <div class="bg-red-50/60 dark:bg-red-950/20 border-2 border-red-500/30 dark:border-red-500/20 rounded-xl p-3 flex flex-col justify-between">
                <p class="text-[10px] font-black uppercase tracking-wider text-red-800 dark:text-red-400 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-red-600 inline-block"></span> Ремонт
                </p>
                <h4 id="dashInRepair" class="text-2xl font-black text-gray-950 dark:text-white mt-2">0</h4>
            </div>
        </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3 mb-6">
        <div class="space-y-2.5">
            <h3 class="text-xs font-black text-gray-900 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1">
                📋 Активные задачи по ремонту
            </h3>
            <div id="containerTasks" class="space-y-2 max-h-[380px] overflow-y-auto pr-1"></div>
        </div>

        <div class="space-y-2.5">
            <h3 class="text-xs font-black text-gray-900 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1">
                🛠️ Гарантийное обслуживание (ТО)
            </h3>
            <div id="containerWarranty" class="space-y-2 max-h-[380px] overflow-y-auto pr-1"></div>
        </div>

        <div class="space-y-2.5">
            <h3 class="text-xs font-black text-gray-900 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1">
                ⚙️ Сроки документов (ТО и Страховка)
            </h3>
            <div id="containerDocs" class="space-y-2 max-h-[380px] overflow-y-auto pr-1"></div>
        </div>
    </div>

    <div class="bg-white dark:bg-gray-900 border-2 border-gray-400/80 dark:border-gray-800 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
        <div class="space-y-0.5">
            <p class="text-xs font-bold text-gray-950 dark:text-white">Необходимо внести изменения или записать лог ремонта?</p>
            <p class="text-[11px] text-gray-600 dark:text-gray-400 font-medium">Перейдите в соответствующий раздел для редактирования карточек</p>
        </div>
        <button onclick="window.switchModule('fleet')" class="bg-gray-950 dark:bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-xs">
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
    // 1. Всего техники
    document.getElementById('dashTotal').innerText = list.length;
    
    // 2. Готовы к работе (проверяем тег)
    document.getElementById('dashReady').innerText = list.filter(v => v.tags && v.tags.includes('Готов')).length;
    
    // 3. На хранении (новый счетчик)
    document.getElementById('dashStorage').innerText = list.filter(v => v.tags && v.tags.includes('На хранении')).length;
    
    // 4. В ремонте
    document.getElementById('dashInRepair').innerText = list.filter(v => v.tags && v.tags.includes('В ремонте')).length;
}

function renderSeparatedAlerts(list, activeTasks) {
    const today = new Date();
    const plateMap = {};
    list.forEach(v => {
        plateMap[v.id] = v.plate ? `[${v.plate}]` : '[б/н]';
    });

    // 1. ЗАДАЧИ
    const containerTasks = document.getElementById('containerTasks');
    if (containerTasks) {
        if (activeTasks.length === 0) {
            containerTasks.innerHTML = `<div class="bg-emerald-50/50 border border-emerald-200 text-emerald-950 p-3 rounded-lg text-center text-[11px] font-bold">Нет active задач по ремонту</div>`;
        } else {
            containerTasks.innerHTML = activeTasks.map(task => {
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

    const warrantyAlerts = [];
    const docAlerts = [];

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
        // Проверка Гарантии
        const vehicleTagsArray = v.tags ? v.tags.split(',').map(t => t.trim()) : [];
        if (vehicleTagsArray.includes('Гарантия')) {
            const hours = v.current_hours || 0;
            
            // Считаем ближайшее ТО с шагом 125 м/ч
            const nextTO = Math.ceil((hours + 1) / 125) * 125;
            const hoursLeft = nextTO - hours;

            // Определяем тип ТО в зависимости от целевой наработки
            let toType = "(ТО-1)"; // По умолчанию для x125, x375, x625, x875
            
            if (nextTO % 1000 === 0) {
                toType = "(ТО-3)";
            } else if (nextTO % 250 === 0) { // Сюда же автоматически попадает и кратность 500
                toType = "(ТО-2)";
            }

            // Формируем текст уведомления с новым обозначением
            if (hoursLeft <= 30) {
                warrantyAlerts.push({ status: 'danger', text: `🚨 <b>${v.model}</b><span class="font-mono text-gray-700">${plateStr}</span>:<br><span class="text-red-700 font-black">Срочно ТО-${nextTO} ${toType}!</span> Осталось <b>${hoursLeft} м/ч</b>.` });
            } else if (hoursLeft <= 60) {
                warrantyAlerts.push({ status: 'warning', text: `⚠️ <b>${v.model}</b><span class="font-mono text-gray-700">${plateStr}</span>:<br>Приближается ТО-${nextTO} ${toType}. Осталось <b>${hoursLeft} м/ч</b>.` });
            } else {
                warrantyAlerts.push({ status: 'info', text: `⚙️ <b>${v.model}</b><span class="font-mono text-gray-700">${plateStr}</span>:<br>Наработка ${hours} м/ч. До ТО-${nextTO} ${toType} ещё <b>${hoursLeft} м/ч</b>.` });
            }
        }
    });

    // 2. ГАРАНТИЯ
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

    // 3. ДОКУМЕНТЫ
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