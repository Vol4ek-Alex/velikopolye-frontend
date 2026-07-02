export const template = `
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h2 class="text-xl font-bold text-gray-950 tracking-tight">Панель управления</h2>
            <p class="text-xs text-gray-600 font-medium">Оперативная сводка по филиалу СХК «Великополье»</p>
        </div>
        <div class="bg-white border-2 border-gray-950 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm">
            <span class="text-xl animate-pulse">⏰</span>
            <div class="text-right">
                <p id="dashLiveTime" class="text-sm font-black font-mono text-gray-950 leading-none">00:00:00</p>
                <p id="dashLiveDate" class="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Загрузка даты...</p>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 relative z-10">
        <div class="md:col-span-1 bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-950 rounded-2xl p-5 shadow-sm text-white flex flex-col justify-between min-h-[115px]">
            <div class="flex items-center justify-between">
                <p class="text-[10px] font-black uppercase tracking-wider text-gray-400">Общий автопарк</p>
                <span class="text-xs bg-white/10 px-2 py-0.5 rounded-md font-bold text-gray-300">Всего</span>
            </div>
            <div class="mt-2 flex items-baseline gap-1">
                <h3 id="dashTotal" class="text-4xl font-black tracking-tight">60</h3>
                <span class="text-xs font-bold text-gray-400">ед. техники</span>
            </div>
        </div>

        <div class="md:col-span-2 grid grid-cols-3 gap-3 bg-white border-2 border-gray-400/80 rounded-2xl p-3.5 shadow-2xs">
            <div class="bg-emerald-50/60 border-2 border-emerald-500/30 rounded-xl p-3 flex flex-col justify-between">
                <p class="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block animate-pulse"></span> Готово
                </p>
                <h4 id="dashReady" class="text-2xl font-black text-gray-950 mt-2">50</h4>
            </div>

            <div class="bg-blue-50/60 border-2 border-blue-500/20 rounded-xl p-3 flex flex-col justify-between">
                <p class="text-[10px] font-black uppercase tracking-wider text-blue-800 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span> Хранение
                </p>
                <h4 id="dashStorage" class="text-2xl font-black text-gray-950 mt-2">1</h4>
            </div>

            <div class="bg-red-50/60 border-2 border-red-500/30 rounded-xl p-3 flex flex-col justify-between">
                <p class="text-[10px] font-black uppercase tracking-wider text-red-800 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-red-600 inline-block"></span> Ремонт
                </p>
                <h4 id="dashInRepair" class="text-2xl font-black text-gray-950 mt-2">10</h4>
            </div>
        </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3 mb-6 relative z-10">
        
        <div class="space-y-2.5 flex flex-col">
            <h3 class="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1">
                📋 Активные задачи и заметки
            </h3>
            
            <div class="bg-white border-2 border-gray-300 rounded-xl p-2.5 space-y-2 shadow-2xs">
                <select id="taskVehicleSelect" class="w-full text-xs bg-gray-50 border border-gray-300 rounded-lg p-1.5 focus:outline-none focus:border-emerald-500 font-medium">
                    <option value="">-- Общая заметка (без привязки к технике) --</option>
                </select>
                <div class="flex gap-1.5">
                    <input type="text" id="taskTextInput" placeholder="Текст задачи или пометки..." class="flex-1 text-xs bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500">
                    <button onclick="window.dashAddRepairTask()" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-xs">＋</button>
                </div>
            </div>

            <div id="containerTasks" class="space-y-2 max-h-[380px] overflow-y-auto pr-1 flex-1 mt-1">
                <div class="text-gray-400 text-xs py-4 text-center bg-white border border-gray-200 rounded-lg">Загрузка...</div>
            </div>
        </div>

        <div class="space-y-2.5 relative">
            <div class="flex items-center justify-between">
                <h3 class="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1">
                    🛠️ Гарантийный контроль (ТО)
                </h3>
                <button onclick="window.dashToggleFilterDropdown(event)" class="text-[11px] bg-white hover:bg-gray-50 border border-gray-300 font-bold px-2.5 py-1 rounded-lg transition shadow-3xs">
                    ⚙️ Выбрать технику
                </button>
            </div>

            <div id="dashFilterDropdown" class="absolute right-0 top-8 w-64 bg-white border border-gray-300 rounded-xl shadow-xl p-3 z-50 space-y-2 hidden max-h-[350px] overflow-y-auto">
                <p class="text-[10px] font-black uppercase text-gray-400 tracking-wider border-b pb-1">Отображать на главной:</p>
                <div id="dashFilterCheckboxes" class="space-y-1.5 text-xs"></div>
            </div>

            <div id="containerWarranty" class="space-y-2 max-h-[430px] overflow-y-auto pr-1">
                <div class="text-gray-400 text-xs py-4 text-center bg-white border border-gray-200 rounded-lg">Загрузка...</div>
            </div>
        </div>

        <div class="space-y-2.5">
            <h3 class="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1">
                ⚙️ Сроки документов (ТО и Страховка)
            </h3>
            <div id="containerDocs" class="space-y-2 max-h-[465px] overflow-y-auto pr-1">
                <div class="text-gray-400 text-xs py-4 text-center bg-white border border-gray-200 rounded-lg">Загрузка...</div>
            </div>
        </div>
    </div>

    <div class="bg-white border-2 border-gray-400/80 rounded-xl p-3.5 shadow-2xs flex items-center justify-between relative z-10">
        <div class="space-y-0.5">
            <p class="text-xs font-bold text-gray-950">Необходимо внести комплексные изменения или записать лог ремонта?</p>
            <p class="text-[11px] text-gray-600 font-medium">Перейдите в соответствующий раздел для редактирования карточек</p>
        </div>
        <button onclick="window.switchModule('fleet')" class="bg-gray-950 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-xs">
            Перейти в Автопарк ➔
        </button>
    </div>
`;

let refreshIntervalId = null;
let clockIntervalId = null;

export async function init() {
    window.dashCompleteTask = dashCompleteTask;
    window.dashAddRepairTask = dashAddRepairTask;
    window.dashToggleFilterDropdown = dashToggleFilterDropdown;
    window.dashToggleLocalVisibility = dashToggleLocalVisibility;
    
    // Новые глобальные инлайн функции изменения данных
    window.dashUpdateHours = dashUpdateHours;
    window.dashUpdateDocDate = dashUpdateDocDate;

    document.addEventListener('click', function(e) {
        const drop = document.getElementById('dashFilterDropdown');
        if (drop && !drop.contains(e.target) && !e.target.closest('button')) {
            drop.classList.add('hidden');
        }
    });

    // Запуск живых часов
    if (clockIntervalId) clearInterval(clockIntervalId);
    startLiveClock();

    await loadDashboardData();
    if (refreshIntervalId) clearInterval(refreshIntervalId);
    refreshIntervalId = setInterval(loadDashboardData, 5000);
}

function startLiveClock() {
    const updateClock = () => {
        const now = new Date();
        const timeEl = document.getElementById('dashLiveTime');
        const dateEl = document.getElementById('dashLiveDate');
        
        if (timeEl) timeEl.innerText = now.toLocaleTimeString('ru-RU');
        if (dateEl) {
            const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
            dateEl.innerText = now.toLocaleDateString('ru-RU', options).replace('.', '');
        }
    };
    updateClock();
    clockIntervalId = setInterval(updateClock, 1000);
}

async function loadDashboardData() {
    if (!window._supabase) return;
    try {
        const [vehiclesRes, tasksRes] = await Promise.all([
            window._supabase.from('vehicles').select('*'),
            window._supabase.from('vehicle_tasks').select('*').eq('is_completed', false)
        ]);

        if (vehiclesRes.error) throw vehiclesRes.error;
        if (tasksRes.error) throw tasksRes.error;
        
        const vehiclesList = vehiclesRes.data || [];
        const activeTasks = tasksRes.data || [];

        window.dashCachedVehicles = vehiclesList;
        window.dashCachedTasks = activeTasks;

        renderStats(vehiclesList);
        populateVehicleDropdown(vehiclesList);
        renderFilterCheckboxes(vehiclesList);
        renderSeparatedAlerts(vehiclesList, activeTasks);
    } catch (err) {
        console.error("Ошибка обновления Dashboard:", err.message);
    }
}

function renderStats(list) {
    document.getElementById('dashTotal').innerText = list.length;
    document.getElementById('dashReady').innerText = list.filter(v => v.tags && v.tags.includes('Готов')).length;
    document.getElementById('dashStorage').innerText = list.filter(v => v.tags && v.tags.includes('На хранении')).length;
    document.getElementById('dashInRepair').innerText = list.filter(v => v.tags && v.tags.includes('В ремонте')).length;
}

function populateVehicleDropdown(vehicles) {
    const select = document.getElementById('taskVehicleSelect');
    if (!select || select.options.length > 1) return;
    
    const sorted = [...vehicles].sort((a,b) => a.model.localeCompare(b.model));
    sorted.forEach(v => {
        const opt = document.createElement('option');
        opt.value = JSON.stringify({ id: v.id, name: v.model });
        opt.innerText = `${v.model} ${v.plate ? '['+v.plate+']' : '[б/н]'}`;
        select.appendChild(opt);
    });
}

function dashToggleFilterDropdown(e) {
    e.stopPropagation();
    const drop = document.getElementById('dashFilterDropdown');
    if (drop) drop.classList.toggle('hidden');
}

function renderFilterCheckboxes(vehicles) {
    const container = document.getElementById('dashFilterCheckboxes');
    if (!container) return;
    
    const hiddenVehicles = JSON.parse(localStorage.getItem('dash_hidden_warranty') || '[]');
    
    const warrantyVehicles = vehicles.filter(v => {
        const tags = v.tags ? v.tags.split(',').map(t => t.trim()) : [];
        return tags.includes('Гарантия');
    });

    if (warrantyVehicles.length === 0) {
        container.innerHTML = `<p class="text-gray-400 text-[11px] py-1 text-center font-medium">Нет гарантийной техники</p>`;
        return;
    }

    warrantyVehicles.sort((a,b) => a.model.localeCompare(b.model));

    container.innerHTML = warrantyVehicles.map(v => {
        const isVisible = !hiddenVehicles.includes(v.id);
        const isChecked = isVisible ? 'checked' : '';
        const nameStr = `${v.model} ${v.plate ? '('+v.plate+')' : '(б/н)'}`;
        
        return `
            <label class="flex items-center gap-2 cursor-pointer py-0.5 hover:bg-gray-50 rounded px-1 text-gray-900 font-medium">
                <input type="checkbox" ${isChecked} onchange="window.dashToggleLocalVisibility(${v.id}, this.checked)" class="w-3.5 h-3.5 rounded text-emerald-600 border-gray-300 focus:ring-emerald-500">
                <span class="truncate">${nameStr}</span>
            </label>
        `;
    }).join('');
}

function dashToggleLocalVisibility(vehicleId, isChecked) {
    let hiddenVehicles = JSON.parse(localStorage.getItem('dash_hidden_warranty') || '[]');
    if (isChecked) {
        hiddenVehicles = hiddenVehicles.filter(id => id !== vehicleId);
    } else {
        if (!hiddenVehicles.includes(vehicleId)) hiddenVehicles.push(vehicleId);
    }
    localStorage.setItem('dash_hidden_warranty', JSON.stringify(hiddenVehicles));
    
    if (window.dashCachedVehicles && window.dashCachedTasks) {
        renderSeparatedAlerts(window.dashCachedVehicles, window.dashCachedTasks);
    }
}

// Прямое инлайн-редактирование наработки, нулевой точки и периодичности ТО
async function dashUpdateHours(vehicleId, type, value) {
    let field = 'current_hours';
    if (type === 'zero') field = 'zero_hours';
    if (type === 'period') field = 'step_hours';

    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 0) return;

    try {
        const { error } = await window._supabase
            .from('vehicles')
            .update({ [field]: numValue })
            .eq('id', vehicleId);

        if (error) throw error;
        await loadDashboardData();
    } catch (err) {
        console.error("Ошибка сохранения наработки:", err.message);
    }
}

// Прямое инлайн-редактирование дат документов (техосмотр и страховка)
async function dashUpdateDocDate(vehicleId, field, value) {
    if (!value) return;
    try {
        const { error } = await window._supabase
            .from('vehicles')
            .update({ [field]: value })
            .eq('id', vehicleId);

        if (error) throw error;
        await loadDashboardData();
    } catch (err) {
        console.error("Ошибка сохранения даты:", err.message);
    }
}

async function dashAddRepairTask() {
    const select = document.getElementById('taskVehicleSelect');
    const input = document.getElementById('taskTextInput');
    
    if (!input || !input.value.trim()) return;

    let vehicleId = null;
    let vehicleName = "Заметка / Пометка";

    if (select && select.value) {
        const parsed = JSON.parse(select.value);
        vehicleId = parsed.id;
        vehicleName = parsed.name;
    }

    const userRole = localStorage.getItem('user_role') || 'Сотрудник';
    const authorSignature = ` [${userRole}]`;
    const finalTaskText = `${input.value.trim()}${authorSignature}`;

    try {
        const { error } = await window._supabase.from('vehicle_tasks').insert([{
            vehicle_id: vehicleId,
            vehicle_name: vehicleName,
            text: finalTaskText,
            is_completed: false
        }]);

        if (error) throw error;
        
        input.value = '';
        if (select) select.value = '';
        await loadDashboardData();
    } catch (err) {
        alert("Ошибка добавления заметки: " + err.message);
    }
}

async function dashCompleteTask(taskId) {
    try {
        const { error } = await window._supabase
            .from('vehicle_tasks')
            .update({ is_completed: true })
            .eq('id', taskId);

        if (error) throw error;
        await loadDashboardData();
    } catch (err) {
        alert("Ошибка закрытия: " + err.message);
    }
}

function renderSeparatedAlerts(list, activeTasks) {
    const today = new Date();
    const plateMap = {};
    list.forEach(v => { plateMap[v.id] = v.plate ? `[${v.plate}]` : '[б/н]'; });

    const hiddenVehicles = JSON.parse(localStorage.getItem('dash_hidden_warranty') || '[]');

    // 1. АКТИВНЫЕ ЗАДАЧИ
    const containerTasks = document.getElementById('containerTasks');
    if (containerTasks) {
        if (activeTasks.length > 0) {
            containerTasks.innerHTML = activeTasks.map(task => {
                const plateStr = plateMap[task.vehicle_id] || '';
                const isSystemTask = task.vehicle_id !== null;
                
                return `
                    <div class="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs shadow-3xs flex flex-col justify-between gap-2.5">
                        <div class="flex items-start justify-between gap-4">
                            <div class="space-y-1">
                                <span class="font-extrabold text-[10px] uppercase tracking-wider text-amber-800">
                                    ${isSystemTask ? '🚜 ' + task.vehicle_name : '📝 Заметка'}
                                </span>
                                <span class="text-gray-500 font-mono text-[10px]">${plateStr}</span>
                                <p class="text-gray-900 font-semibold leading-snug">${task.text}</p>
                            </div>
                            <button onclick="window.dashCompleteTask('${task.id}')" class="bg-amber-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg transition whitespace-nowrap shadow-3xs">
                                Закрыть
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            containerTasks.innerHTML = `<div class="bg-emerald-50/50 border border-emerald-100 text-emerald-950 p-4 rounded-xl text-center text-xs font-bold">Нет активных задач и заметок</div>`;
        }
    }

    const warrantyAlerts = [];
    const docAlerts = [];

    list.forEach(v => {
        const plateStr = v.plate ? ` [${v.plate}]` : ' [б/н]';

        // Формирование блока дат документов с интерактивным изменением (сохранение по событию change)
        if (v.inspection_date) {
            const diff = Math.ceil((new Date(v.inspection_date) - today) / (1000 * 60 * 60 * 24));
            const criticalClass = diff <= 0 ? "text-red-600 font-black animate-pulse" : (diff <= 30 ? "font-black text-amber-700" : "font-bold text-gray-700");
            const statusText = diff <= 0 ? "Просрочен Гостехосмотр!" : `Техосмотр истекает через ${diff} дн.`;
            
            docAlerts.push({
                id: v.id,
                model: v.model,
                plate: plateStr,
                isCritical: diff <= 0,
                html: `
                    <div class="space-y-2">
                        <p class="text-[11px] leading-tight ${criticalClass}">${statusText}</p>
                        <div class="flex items-center gap-1.5 mt-1">
                            <span class="text-[10px] text-gray-500 font-medium">Новая дата ТО:</span>
                            <input type="date" value="${v.inspection_date}" onchange="window.dashUpdateDocDate(${v.id}, 'inspection_date', this.value)" class="text-[10px] border border-gray-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-emerald-500 bg-white">
                        </div>
                    </div>`
            });
        }

        if (v.insurance_date) {
            const diffIns = Math.ceil((new Date(v.insurance_date) - today) / (1000 * 60 * 60 * 24));
            const criticalClass = diffIns <= 0 ? "text-red-600 font-black animate-pulse" : (diffIns <= 30 ? "font-black text-amber-700" : "font-bold text-gray-700");
            const statusText = diffIns <= 0 ? "Закончилась страховка!" : `Страховка истекает через ${diffIns} дн.`;

            docAlerts.push({
                id: v.id,
                model: v.model,
                plate: plateStr,
                isCritical: diffIns <= 0,
                html: `
                    <div class="space-y-2 border-t border-gray-200/50 pt-1.5 mt-1.5">
                        <p class="text-[11px] leading-tight ${criticalClass}">${statusText}</p>
                        <div class="flex items-center gap-1.5 mt-1">
                            <span class="text-[10px] text-gray-500 font-medium">Новая Страховка:</span>
                            <input type="date" value="${v.insurance_date}" onchange="window.dashUpdateDocDate(${v.id}, 'insurance_date', this.value)" class="text-[10px] border border-gray-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-emerald-500 bg-white">
                        </div>
                    </div>`
            });
        }

        // ПОЛНОЦЕННЫЙ ОРИГИНАЛЬНЫЙ КОНТРОЛЬ МОТОЧАСОВ С КАСТОМИЗАЦИЕЙ С КЛАВИАТУРЫ
        const vehicleTagsArray = v.tags ? v.tags.split(',').map(t => t.trim()) : [];
        if (vehicleTagsArray.includes('Гарантия') && !hiddenVehicles.includes(v.id)) {
            const hours = v.current_hours || 0;
            const zeroHours = v.zero_hours || 0;
            const stepHours = v.step_hours || 125; // Кастомная периодичность (дефолт 125)

            // Расчет с учетом нулевой точки и кастомного шага ТО
            const relativeHours = hours - zeroHours;
            const nextTO = zeroHours + (Math.ceil((relativeHours + 1) / stepHours) * stepHours);
            const hoursLeft = nextTO - hours;

            let toType = "ТО-1";
            if ((nextTO - zeroHours) % (stepHours * 8) === 0) {
                toType = "ТО-3";
            } else if ((nextTO - zeroHours) % (stepHours * 2) === 0) {
                toType = "ТО-2";
            }

            let status = 'info';
            let alertText = `Наработка ${hours} м/ч. До ${toType} (${nextTO}) ещё <span class="font-bold">${hoursLeft} м/ч</span>.`;

            if (hoursLeft <= 10) {
                status = 'danger';
                alertText = `<span class="text-red-600 font-extrabold">Срочно ${toType} (${nextTO})!</span> Осталось <span class="font-black">${hoursLeft} м/ч</span>.`;
            } else if (hoursLeft <= 35) {
                status = 'warning';
                alertText = `Подходит срок ${toType}. Осталось <span class="font-bold">${hoursLeft} м/ч</span>.`;
            }

            warrantyAlerts.push({
                id: v.id,
                status: status,
                model: v.model,
                plate: plateStr,
                hours: hours,
                zeroHours: zeroHours,
                stepHours: stepHours,
                text: alertText
            });
        }
    });

    // 2. РЕНДЕР КАРТОЧЕК ГАРАНТИИ + ФУНКЦИОНАЛ ИЗМЕНЕНИЯ ЧАСОВ НА СТОЛЕ
    const containerWarranty = document.getElementById('containerWarranty');
    if (containerWarranty) {
        if (warrantyAlerts.length === 0) {
            containerWarranty.innerHTML = `<div class="bg-emerald-50/50 border border-emerald-100 text-emerald-950 p-4 rounded-xl text-center text-xs font-bold">Нет подконтрольной гарантийной техники</div>`;
        } else {
            containerWarranty.innerHTML = warrantyAlerts.map(a => {
                let cardClass = "bg-blue-50/40 border-blue-200 text-blue-950";
                if (a.status === 'danger') cardClass = "bg-red-50/60 border-red-300 text-red-950";
                if (a.status === 'warning') cardClass = "bg-amber-50/60 border-amber-300 text-amber-950";
                
                return `
                    <div class="p-3 border-2 rounded-xl text-xs space-y-2.5 shadow-3xs ${cardClass}">
                        <div class="flex items-center justify-between">
                            <p class="font-bold">${a.model} <span class="font-mono text-gray-500 text-[11px]">${a.plate}</span></p>
                            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/60 border border-black/5 uppercase tracking-wide">Гарантия</span>
                        </div>
                        
                        <p class="text-[11px] leading-tight">${a.text}</p>
                        
                        <div class="grid grid-cols-3 gap-1.5 pt-2 border-t border-gray-400/20 text-[10px]">
                            <div>
                                <label class="block text-gray-500 font-bold mb-0.5">Текущие м/ч</label>
                                <input type="number" value="${a.hours}" onblur="window.dashUpdateHours(${a.id}, 'current', this.value)" class="w-full border border-gray-300 rounded px-1.5 py-0.5 font-bold focus:outline-none focus:border-emerald-500">
                            </div>
                            <div>
                                <label class="block text-gray-500 font-bold mb-0.5">Нулевая база</label>
                                <input type="number" value="${a.zeroHours}" onblur="window.dashUpdateHours(${a.id}, 'zero', this.value)" class="w-full border border-gray-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-emerald-500">
                            </div>
                            <div>
                                <label class="block text-gray-500 font-bold mb-0.5">Период ТО</label>
                                <input type="number" value="${a.stepHours}" onblur="window.dashUpdateHours(${a.id}, 'period', this.value)" class="w-full border border-gray-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-emerald-500">
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    // 3. РЕНДЕР КАРТОЧЕК СРОКОВ ДОКУМЕНТОВ
    const containerDocs = document.getElementById('containerDocs');
    if (containerDocs) {
        if (docAlerts.length === 0) {
            containerDocs.innerHTML = `<div class="bg-emerald-50/50 border border-emerald-100 text-emerald-900 p-4 rounded-xl text-center text-xs font-bold">Все документы в полном порядке!</div>`;
        } else {
            // Группируем документы по одной машине для чистоты интерфейса
            const groupedDocs = {};
            docAlerts.forEach(item => {
                if (!groupedDocs[item.id]) {
                    groupedDocs[item.id] = { model: item.model, plate: item.plate, isCritical: item.isCritical, htmls: [] };
                }
                if (item.isCritical) groupedDocs[item.id].isCritical = true;
                groupedDocs[item.id].htmls.push(item.html);
            });

            containerDocs.innerHTML = Object.values(groupedDocs).map(g => {
                const cardClass = g.isCritical ? "bg-red-50/60 border-red-300 text-red-950" : "bg-amber-50/60 border-amber-300 text-amber-950";
                return `
                    <div class="p-3 border-2 rounded-xl text-xs space-y-2 shadow-3xs ${cardClass}">
                        <p class="font-bold border-b border-gray-400/20 pb-1">${g.model} <span class="font-mono text-gray-500 text-[11px]">${g.plate}</span></p>
                        <div class="space-y-1.5">
                            ${g.htmls.join('')}
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}