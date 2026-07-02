export const template = `
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h2 class="text-xl font-bold text-gray-950 tracking-tight">Панель управления</h2>
            <p class="text-xs text-gray-600 font-medium">Оперативная сводка по филиалу СХК «Великополье»</p>
        </div>
    </div>

    <!-- БЛОК СТАТИСТИКИ АВТОПАРКА -->
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

    <!-- ТРИ ОПЕРАТИВНЫХ БЛОКА -->
    <div class="grid gap-6 lg:grid-cols-3 mb-6 relative z-10">
        
        <!-- 📋 АКТИВНЫЕ ЗАДАЧИ И ЗАМЕТКИ -->
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

        <!-- 🛠️ ГАРАНТИЙНОЕ ОБСЛУЖИВАНИЕ -->
        <div class="space-y-2.5 relative">
            <div class="flex items-center justify-between">
                <h3 class="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1">
                    🛠️ Гарантийный контроль (ТО)
                </h3>
                <button onclick="window.dashToggleFilterDropdown(event)" class="text-[11px] bg-white hover:bg-gray-50 border border-gray-300 font-bold px-2.5 py-1 rounded-lg transition shadow-3xs">
                    ⚙️ Выбрать технику
                </button>
            </div>

            <!-- Локальное выпадающее меню флажков для скрытия/вывода -->
            <div id="dashFilterDropdown" class="absolute right-0 top-8 w-64 bg-white border border-gray-300 rounded-xl shadow-xl p-3 z-50 space-y-2 hidden max-h-[350px] overflow-y-auto">
                <p class="text-[10px] font-black uppercase text-gray-400 tracking-wider border-b pb-1">Отображать на главной:</p>
                <div id="dashFilterCheckboxes" class="space-y-1.5 text-xs"></div>
            </div>

            <div id="containerWarranty" class="space-y-2 max-h-[430px] overflow-y-auto pr-1">
                <div class="text-gray-400 text-xs py-4 text-center bg-white border border-gray-200 rounded-lg">Загрузка...</div>
            </div>
        </div>

        <!-- ⚙️ СРОКИ ДОКУМЕНТОВ -->
        <div class="space-y-2.5">
            <h3 class="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1">
                ⚙️ Сроки документов (ТО и Страховка)
            </h3>
            <div id="containerDocs" class="space-y-2 max-h-[465px] overflow-y-auto pr-1">
                <div class="text-gray-400 text-xs py-4 text-center bg-white border border-gray-200 rounded-lg">Загрузка...</div>
            </div>
        </div>
    </div>

    <!-- КРАСИВЫЙ НИЖНИЙ БАННЕР -->
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

export async function init() {
    window.dashCompleteTask = dashCompleteTask;
    window.dashAddRepairTask = dashAddRepairTask;
    window.dashToggleFilterDropdown = dashToggleFilterDropdown;
    window.dashToggleLocalVisibility = dashToggleLocalVisibility;

    // Скрытие дропдауна кликом мимо
    document.addEventListener('click', function(e) {
        const drop = document.getElementById('dashFilterDropdown');
        if (drop && !drop.contains(e.target) && !e.target.closest('button')) {
            drop.classList.add('hidden');
        }
    });

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

    // Сохраняется только должность автора из локальной сессии
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

    // 1. АКТИВНЫЕ ЗАДАЧИ И ЗАМЕТКИ
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

        // Проверка Гостехосмотра
        if (v.inspection_date) {
            const diff = Math.ceil((new Date(v.inspection_date) - today) / (1000 * 60 * 60 * 24));
            if (diff <= 0) {
                docAlerts.push({ 
                    isCritical: true, 
                    model: v.model,
                    plate: plateStr,
                    text: `<span class="text-red-600 font-black">Просрочен Гостехосмотр!</span>` 
                });
            } else if (diff <= 30) {
                docAlerts.push({ 
                    isCritical: false, 
                    model: v.model,
                    plate: plateStr,
                    text: `Техосмотр истекает через <span class="font-black">${diff} дн.</span>` 
                });
            }
        }

        // Проверка Страховки
        if (v.insurance_date) {
            const diffIns = Math.ceil((new Date(v.insurance_date) - today) / (1000 * 60 * 60 * 24));
            if (diffIns <= 0) {
                docAlerts.push({ 
                    isCritical: true, 
                    model: v.model,
                    plate: plateStr,
                    text: `<span class="text-red-600 font-black">Закончилась страховка!</span>` 
                });
            } else if (diffIns <= 30) {
                docAlerts.push({ 
                    isCritical: false, 
                    model: v.model,
                    plate: plateStr,
                    text: `Страховка истекает через <span class="font-black">${diffIns} дн.</span>` 
                });
            }
        }

        // Оригинальный точный расчёт моточасов Гарантии
        const vehicleTagsArray = v.tags ? v.tags.split(',').map(t => t.trim()) : [];
        if (vehicleTagsArray.includes('Гарантия') && !hiddenVehicles.includes(v.id)) {
            const hours = v.current_hours || 0;
            const nextTO = Math.ceil((hours + 1) / 125) * 125;
            const hoursLeft = nextTO - hours;

            let toType = "ТО-1";
            if (nextTO % 1000 === 0) {
                toType = "ТО-3";
            } else if (nextTO % 250 === 0) {
                toType = "ТО-2";
            }

            if (hoursLeft <= 10) {
                warrantyAlerts.push({ 
                    status: 'danger', 
                    model: v.model,
                    plate: plateStr,
                    text: `<span class="text-red-600 font-extrabold">Срочно ${toType} (${nextTO})!</span> Осталось <span class="font-black">${hoursLeft} м/ч</span>.` 
                });
            } else if (hoursLeft <= 35) {
                warrantyAlerts.push({ 
                    status: 'warning', 
                    model: v.model,
                    plate: plateStr,
                    text: `Подходит срок ${toType}. Осталось <span class="font-bold">${hoursLeft} м/ч</span>.` 
                });
            } else {
                warrantyAlerts.push({ 
                    status: 'info', 
                    model: v.model,
                    plate: plateStr,
                    text: `Наработка ${hours} м/ч. До ${toType} (${nextTO}) ещё <span class="font-bold">${hoursLeft} м/ч</span>.` 
                });
            }
        }
    });

    // 2. РЕНДЕР КАРТОЧЕК ГАРАНТИИ
    const containerWarranty = document.getElementById('containerWarranty');
    if (containerWarranty) {
        if (warrantyAlerts.length === 0) {
            containerWarranty.innerHTML = `<div class="bg-emerald-50/50 border border-emerald-100 text-emerald-950 p-4 rounded-xl text-center text-xs font-bold">Нет подконтрольной гарантийной техники</div>`;
        } else {
            containerWarranty.innerHTML = warrantyAlerts.map(a => {
                let cardClass = "bg-blue-50/40 border-blue-200 text-blue-950";
                let iconColor = "text-blue-500";
                if (a.status === 'danger') { cardClass = "bg-red-50/60 border-red-300 text-red-950"; iconColor = "text-red-600"; }
                if (a.status === 'warning') { cardClass = "bg-amber-50/60 border-amber-300 text-amber-950"; iconColor = "text-amber-600"; }
                
                return `
                    <div class="p-3 border-2 rounded-xl text-xs flex items-center justify-between shadow-3xs ${cardClass}">
                        <div class="space-y-0.5">
                            <p class="font-bold">${a.model} <span class="font-mono text-gray-500 text-[11px]">${a.plate}</span></p>
                            <p class="text-[11px] leading-tight">${a.text}</p>
                        </div>
                        <button onclick="window.switchModule('fleet')" class="p-1 hover:bg-white/50 rounded-lg transition ${iconColor}">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        </button>
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
            containerDocs.innerHTML = docAlerts.map(a => {
                const cardClass = a.isCritical ? "bg-red-50/60 border-red-300 text-red-950" : "bg-amber-50/60 border-amber-300 text-amber-950";
                const iconColor = a.isCritical ? "text-red-600" : "text-amber-600";
                return `
                    <div class="p-3 border-2 rounded-xl text-xs flex items-center justify-between shadow-3xs ${cardClass}">
                        <div class="space-y-0.5">
                            <p class="font-bold">${a.model} <span class="font-mono text-gray-500 text-[11px]">${a.plate}</span></p>
                            <p class="text-[11px] leading-tight">${a.text}</p>
                        </div>
                        <button onclick="window.switchModule('fleet')" class="p-1 hover:bg-white/50 rounded-lg transition ${iconColor}">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        </button>
                    </div>
                `;
            }).join('');
        }
    }
}