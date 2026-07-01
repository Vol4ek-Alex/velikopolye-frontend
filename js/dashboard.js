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

export async function init() {
    await loadDashboardData();
    // Обновление раз в 5 секунд
    window.dashIntervalId = setInterval(loadDashboardData, 5000);
}

async function loadDashboardData() {
    if (!window._supabase) return;
    try {
        let { data: vehicles, error: vErr } = await window._supabase.from('vehicles').select('*');
        let { data: tasks, error: tErr } = await window._supabase.from('vehicle_tasks').select('*').eq('is_completed', false);

        if (vErr || tErr) return;

        // Наполняем глобальный кэш
        window.globalVehicles = vehicles || [];
        window.globalTasks = tasks || [];

        renderCounters();
        renderSeparatedAlerts();

    } catch (e) {
        console.error("Ошибка обновления дашборда:", e);
    }
}

function renderCounters() {
    const list = window.globalVehicles;
    
    const total = list.length;
    const ready = list.filter(v => (v.status || '').toLowerCase() === 'готово').length;
    const storage = list.filter(v => (v.status || '').toLowerCase() === 'хранение').length;
    const repair = list.filter(v => (v.status || '').toLowerCase() === 'ремонт').length;

    const tEl = document.getElementById('dashTotal');
    const rEl = document.getElementById('dashReady');
    const sEl = document.getElementById('dashStorage');
    const repEl = document.getElementById('dashInRepair');

    if (tEl) tEl.innerText = total;
    if (rEl) rEl.innerText = ready;
    if (sEl) sEl.innerText = storage;
    if (repEl) repEl.innerText = repair;
}

function renderSeparatedAlerts() {
    const listVehicles = window.globalVehicles;
    const listTasks = window.globalTasks;

    // 1. АКТИВНЫЕ ЗАДАЧИ
    const containerTasks = document.getElementById('containerTasks');
    if (containerTasks) {
        if (listTasks.length === 0) {
            containerTasks.innerHTML = `<div class="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-900/50 text-emerald-950 dark:text-emerald-400 p-3 rounded-lg text-center text-[11px] font-bold">Все текущие ремонты завершены!</div>`;
        } else {
            containerTasks.innerHTML = listTasks.map(t => {
                return `
                    <div class="p-2.5 bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-400 dark:border-amber-600/40 rounded-lg text-[11px] text-gray-950 dark:text-amber-100 font-bold flex flex-col gap-1">
                        <div class="flex items-center justify-between text-[10px] text-amber-900 dark:text-amber-400 border-b border-amber-200 dark:border-amber-800 pb-1">
                            <span>🛠️ ${t.vehicle_name || 'Техника'}</span>
                        </div>
                        <div class="pt-0.5 text-gray-900 dark:text-amber-200 font-medium">${t.text}</div>
                    </div>
                `;
            }).join('');
        }
    }

    // Сборщики алертов для окон 2 и 3
    const warrantyAlerts = [];
    const docAlerts = [];

    const now = new Date();

    listVehicles.forEach(v => {
        const plateStr = v.plate ? ` [${v.plate}]` : '';

        // Проверка Гарантии
        const vehicleTagsArray = v.tags ? v.tags.split(',').map(t => t.trim()) : [];
        if (vehicleTagsArray.includes('Гарантия')) {
            const hours = v.current_hours || 0;
            
            // Считаем ближайшее ТО с шагом 125 м/ч
            const nextTO = Math.ceil((hours + 1) / 125) * 125;
            const hoursLeft = nextTO - hours;

            // Определяем тип ТО в зависимости от целевой наработки
            let toType = "(ТО-1)"; 
            
            if (nextTO % 1000 === 0) {
                toType = "(ТО-3)";
            } else if (nextTO % 250 === 0) { 
                toType = "(ТО-2)";
            }

            // Формируем текст уведомления с новым обозначением
            if (hoursLeft <= 30) {
                warrantyAlerts.push({ status: 'danger', text: `🚨 <b>${v.model}</b><span class="font-mono text-gray-700 dark:text-gray-400">${plateStr}</span>:<br><span class="text-red-700 dark:text-red-400 font-black">Срочно ТО-${nextTO} ${toType}!</span> Осталось <b>${hoursLeft} м/ч</b>.` });
            } else if (hoursLeft <= 60) {
                warrantyAlerts.push({ status: 'warning', text: `⚠️ <b>${v.model}</b><span class="font-mono text-gray-700 dark:text-gray-400">${plateStr}</span>:<br>Приближается ТО-${nextTO} ${toType}. Осталось <b>${hoursLeft} м/ч</b>.` });
            } else {
                warrantyAlerts.push({ status: 'info', text: `⚙️ <b>${v.model}</b><span class="font-mono text-gray-700 dark:text-gray-400">${plateStr}</span>:<br>Наработка ${hours} м/ч. До ТО-${nextTO} ${toType} ещё <b>${hoursLeft} м/ч</b>.` });
            }
        }

        // Проверка Техосмотра (Гостехосмотр)
        if (v.inspection_to) {
            const inspDate = new Date(v.inspection_to);
            const diffTime = inspDate - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 0) {
                docAlerts.push({ status: 'danger', text: `❌ <b>${v.model}</b> ${plateStr}: <span class="text-red-700 dark:text-red-400 font-bold">Техосмотр ИСТЕК!</span> (${v.inspection_to})` });
            } else if (diffDays <= 15) {
                docAlerts.push({ status: 'warning', text: `⏳ <b>${v.model}</b> ${plateStr}: ТО заканчивается через <b>${diffDays} дн.</b> (${v.inspection_to})` });
            }
        }

        // Проверка Страховки
        if (v.insurance_to) {
            const insDate = new Date(v.insurance_to);
            const diffTime = insDate - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 0) {
                docAlerts.push({ status: 'danger', text: `❌ <b>${v.model}</b> ${plateStr}: <span class="text-red-700 dark:text-red-400 font-bold">Страховка ИСТЕКЛА!</span> (${v.insurance_to})` });
            } else if (diffDays <= 15) {
                docAlerts.push({ status: 'warning', text: `⏳ <b>${v.model}</b> ${plateStr}: Страховка заканчивается через <b>${diffDays} дн.</b> (${v.insurance_to})` });
            }
        }
    });

    // 2. РЕНДЕР ГАРАНТИИ
    const containerWarranty = document.getElementById('containerWarranty');
    if (containerWarranty) {
        if (warrantyAlerts.length === 0) {
            containerWarranty.innerHTML = `<div class="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-900/50 text-emerald-950 dark:text-emerald-400 p-3 rounded-lg text-center text-[11px] font-bold">Нет гарантийной техники на контроле</div>`;
        } else {
            containerWarranty.innerHTML = warrantyAlerts.map(a => {
                let c = "bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-900/50 text-blue-950 dark:text-blue-300 font-medium";
                if (a.status === 'danger') c = "bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-900/50 text-red-950 dark:text-red-200 font-bold";
                if (a.status === 'warning') c = "bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/50 text-amber-950 dark:text-amber-200 font-medium";
                return `<div class="p-2.5 border rounded-lg text-[11px] ${c}">${a.text}</div>`;
            }).join('');
        }
    }

    // 3. ДОКУМЕНТЫ
    const containerDocs = document.getElementById('containerDocs');
    if (containerDocs) {
        if (docAlerts.length === 0) {
            containerDocs.innerHTML = `<div class="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-400 p-3 rounded-lg text-center text-[11px] font-bold">Все документы в полном порядке!</div>`;
        } else {
            containerDocs.innerHTML = docAlerts.map(a => {
                let c = "bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/50 text-amber-950 dark:text-amber-200 font-medium";
                if (a.status === 'danger') c = "bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-900/50 text-red-950 dark:text-red-200 font-bold";
                return `<div class="p-2.5 border rounded-lg text-[11px] ${c}">${a.text}</div>`;
            }).join('');
        }
    }
}