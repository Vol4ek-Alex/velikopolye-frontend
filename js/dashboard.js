export const template = `
    <div class="mb-6">
        <h2 class="text-xl font-bold text-gray-950 tracking-tight">Панель управления</h2>
        <p class="text-xs text-gray-600 font-medium">Оперативная сводка по филиалу СХК «Великополье»</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="md:col-span-1 bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-950 rounded-2xl p-5 shadow-sm text-white flex flex-col justify-between min-h-[115px]">
            <div class="flex items-center justify-between">
                <p class="text-[10px] font-black uppercase tracking-wider text-gray-400">Общий автопарк</p>
                <span class="text-xs bg-white/10 px-2 py-0.5 rounded-md font-bold text-gray-300">Всего</span>
            </div>
            <div class="mt-2 flex items-baseline gap-1">
                <h3 id="dashTotal" class="text-4xl font-black tracking-tight">0</h3>
                <span class="text-xs font-bold text-gray-400">ед. техники</span>
            </div>
        </div>

        <div class="md:col-span-2 grid grid-cols-3 gap-3 bg-white border-2 border-gray-400/80 rounded-2xl p-3.5 shadow-2xs">
            <div class="bg-emerald-50/60 border-2 border-emerald-500/30 rounded-xl p-3 flex flex-col justify-between">
                <p class="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block animate-pulse"></span> Готово
                </p>
                <h4 id="dashReady" class="text-2xl font-black text-gray-950 mt-2">0</h4>
            </div>

            <div class="bg-blue-50/60 border-2 border-blue-500/20 rounded-xl p-3 flex flex-col justify-between">
                <p class="text-[10px] font-black uppercase tracking-wider text-blue-800 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span> Хранение
                </p>
                <h4 id="dashStorage" class="text-2xl font-black text-gray-950 mt-2">0</h4>
            </div>

            <div class="bg-red-50/60 border-2 border-red-500/30 rounded-xl p-3 flex flex-col justify-between">
                <p class="text-[10px] font-black uppercase tracking-wider text-red-800 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-red-600 inline-block"></span> Ремонт
                </p>
                <h4 id="dashInRepair" class="text-2xl font-black text-gray-950 mt-2">0</h4>
            </div>
        </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3 mb-6">
        <div class="space-y-2.5">
            <h3 class="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1">
                📋 Активные задачи по ремонту
            </h3>
            <div id="containerTasks" class="space-y-2 max-h-[380px] overflow-y-auto pr-1"></div>
        </div>

        <div class="space-y-2.5">
            <h3 class="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1">
                🛠️ Гарантийное обслуживание (ТО)
            </h3>
            <div id="containerWarranty" class="space-y-2 max-h-[380px] overflow-y-auto pr-1"></div>
        </div>

        <div class="space-y-2.5">
            <h3 class="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1">
                ⚙️ Сроки документов (ТО и Страховка)
            </h3>
            <div id="containerDocs" class="space-y-2 max-h-[380px] overflow-y-auto pr-1"></div>
        </div>
    </div>

    <div class="bg-white border-2 border-gray-400/80 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
        <div class="space-y-0.5">
            <p class="text-xs font-bold text-gray-950">Необходимо внести изменения или записать лог ремонта?</p>
            <p class="text-[11px] text-gray-600 font-medium">Перейдите в соответствующий раздел для редактирования карточек</p>
        </div>
        <button onclick="window.switchModule('fleet')" class="bg-gray-950 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-xs">
            Перейти в Автопарк ➔
        </button>
    </div>
`;

export async function init() {
    // Гарантируем, что кнопки бокового меню не пропадут при переключении модулей
    if (typeof window.renderMenu === 'function') {
        window.renderMenu();
    }
    
    await loadDashboardData();
    
    if (window.dashIntervalId) {
        clearInterval(window.dashIntervalId);
    }
    window.dashIntervalId = setInterval(loadDashboardData, 5000);
}

async function loadDashboardData() {
    if (!window._supabase) return;
    try {
        let { data: vehicles, error: vErr } = await window._supabase.from('vehicles').select('*');
        let { data: tasks, error: tErr } = await window._supabase.from('vehicle_tasks').select('*').eq('is_completed', false);

        if (vErr || tErr) {
            console.error("Ошибка Supabase:", vErr || tErr);
            return;
        }

        window.globalVehicles = vehicles || [];
        window.globalTasks = tasks || [];

        renderCounters();
        renderSeparatedAlerts();

    } catch (e) {
        console.error("Ошибка обновления дашборда:", e);
    }
}

function renderCounters() {
    const list = window.globalVehicles || [];
    
    const total = list.length;
    
    // Бронебойный фильтр: проверяет и русские, и английские варианты + убирает пробелы
    const ready = list.filter(v => {
        if (!v.status) return false;
        const s = v.status.toLowerCase().trim();
        return s === 'готово' || s === 'ready';
    }).length;

    const storage = list.filter(v => {
        if (!v.status) return false;
        const s = v.status.toLowerCase().trim();
        return s === 'хранение' || s === 'storage';
    }).length;

    const repair = list.filter(v => {
        if (!v.status) return false;
        const s = v.status.toLowerCase().trim();
        return s === 'ремонт' || s === 'repair';
    }).length;

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
            containerTasks.innerHTML = `<div class="bg-emerald-50/50 border border-emerald-200 text-emerald-950 p-3 rounded-lg text-center text-[11px] font-bold">Все текущие ремонты завершены!</div>`;
        } else {
            containerTasks.innerHTML = listTasks.map(t => {
                return `
                    <div class="p-2.5 bg-amber-50 border-2 border-amber-300 rounded-lg text-[11px] text-gray-950 font-bold flex flex-col gap-1">
                        <div class="flex items-center justify-between text-[10px] text-amber-900 border-b border-amber-200 pb-1">
                            <span>🛠️ ${t.vehicle_name || 'Техника'}</span>
                        </div>
                        <div class="pt-0.5 text-gray-900 font-medium">${t.text}</div>
                    </div>
                `;
            }).join('');
        }
    }

    const warrantyAlerts = [];
    const docAlerts = [];
    const now = new Date();

    listVehicles.forEach(v => {
        const plateStr = v.plate ? ` [${v.plate}]` : '';

        // Проверка Гарантии
        const vehicleTagsArray = v.tags ? v.tags.split(',').map(t => t.trim()) : [];
        if (vehicleTagsArray.includes('Гарантия')) {
            const hours = v.current_hours || 0;
            const nextTO = Math.ceil((hours + 1) / 125) * 125;
            const hoursLeft = nextTO - hours;

            let toType = "(ТО-1)"; 
            if (nextTO % 1000 === 0) {
                toType = "(ТО-3)";
            } else if (nextTO % 250 === 0) { 
                toType = "(ТО-2)";
            }

            if (hoursLeft <= 30) {
                warrantyAlerts.push({ status: 'danger', text: `🚨 <b>${v.model}</b><span class="font-mono text-gray-700">${plateStr}</span>:<br><span class="text-red-700 font-black">Срочно ТО-${nextTO} ${toType}!</span> Осталось <b>${hoursLeft} м/ч</b>.` });
            } else if (hoursLeft <= 60) {
                warrantyAlerts.push({ status: 'warning', text: `⚠️ <b>${v.model}</b><span class="font-mono text-gray-700">${plateStr}</span>:<br>Приближается ТО-${nextTO} ${toType}. Осталось <b>${hoursLeft} м/ч</b>.` });
            } else {
                warrantyAlerts.push({ status: 'info', text: `⚙️ <b>${v.model}</b><span class="font-mono text-gray-700">${plateStr}</span>:<br>Наработка ${hours} м/ч. До ТО-${nextTO} ${toType} ещё <b>${hoursLeft} м/ч</b>.` });
            }
        }

        // Проверка Техосмотра
        if (v.inspection_to) {
            const inspDate = new Date(v.inspection_to);
            const diffTime = inspDate - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 0) {
                docAlerts.push({ status: 'danger', text: `❌ <b>${v.model}</b> ${plateStr}: <span class="text-red-700 font-bold">Техосмотр ИСТЕК!</span> (${v.inspection_to})` });
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
                docAlerts.push({ status: 'danger', text: `❌ <b>${v.model}</b> ${plateStr}: <span class="text-red-700 font-bold">Страховка ИСТЕКЛА!</span> (${v.insurance_to})` });
            } else if (diffDays <= 15) {
                docAlerts.push({ status: 'warning', text: `⏳ <b>${v.model}</b> ${plateStr}: Страховка заканчивается через <b>${diffDays} дн.</b> (${v.insurance_to})` });
            }
        }
    });

    // 2. РЕНДЕР ГАРАНТИИ
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
                let c = "bg-amber-50 border-amber-300 text-amber-950 font-medium";
                if (a.status === 'danger') c = "bg-red-50 border-red-300 text-red-950 font-bold";
                return `<div class="p-2.5 border rounded-lg text-[11px] ${c}">${a.text}</div>`;
            }).join('');
        }
    }
}