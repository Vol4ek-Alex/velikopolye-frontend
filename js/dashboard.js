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

    <div class="grid gap-6 lg:grid-cols-3 mb-6 relative z-10">
        
        <div class="space-y-2.5 flex flex-col">
            <h3 class="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1">
                📋 Активные задачи и заметки
            </h3>
            
            <div class="bg-white border-2 border-gray-300 rounded-xl p-2.5 space-y-2 shadow-2xs">
                <select id="taskVehicleSelect" class="w-full text-xs bg-gray-50 border border-gray-300 rounded-lg p-1.5 focus:outline-none focus:border-emerald-500 font-medium">
                    <option value="">-- Общая заметка (без привязки) --</option>
                </select>
                <div class="flex gap-1.5">
                    <input type="text" id="taskTextInput" placeholder="Текст задачи..." class="flex-1 text-xs bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500">
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
                    ⚙️ Фильтр
                </button>
            </div>

            <div id="dashFilterDropdown" class="absolute right-0 top-8 w-64 bg-white border border-gray-300 rounded-xl shadow-xl p-3 z-50 space-y-2 hidden max-h-[350px] overflow-y-auto">
                <p class="text-[10px] font-black uppercase text-gray-400 tracking-wider border-b pb-1">Отображать технику:</p>
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

    <div id="dashEditModal" class="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-[150] flex items-center justify-center p-4 hidden">
        <div class="bg-white border-2 border-gray-950 p-5 rounded-2xl w-full max-w-sm shadow-2xl space-y-4 relative">
            <button onclick="window.dashCloseModal()" class="absolute top-3 right-3 text-gray-400 hover:text-gray-900 font-bold text-base">✕</button>
            
            <div>
                <h4 id="modalVehicleTitle" class="text-sm font-black text-gray-950 leading-tight">Модель техники</h4>
                <p id="modalVehiclePlate" class="text-[10px] font-mono text-gray-500 mt-0.5">[0000 AA-7]</p>
            </div>

            <div id="modalWarrantySection" class="space-y-3 pt-2 border-t border-gray-100 hidden">
                <div>
                    <label class="block text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Текущая наработка (м/ч)</label>
                    <input type="number" id="inputModalCurrentHours" class="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-bold focus:border-emerald-500 focus:outline-none">
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Нулевая база</label>
                        <input type="number" id="inputModalZeroHours" class="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none">
                    </div>
                    <div>
                        <label class="block text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Периодичность ТО</label>
                        <input type="number" id="inputModalStepHours" class="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none">
                    </div>
                </div>
            </div>

            <div id="modalDocsSection" class="space-y-3 pt-2 border-t border-gray-100 hidden">
                <div>
                    <label class="block text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Дата Гостехосмотра</label>
                    <input type="date" id="inputModalInspectionDate" class="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-medium focus:border-emerald-500 focus:outline-none bg-white">
                </div>
                <div>
                    <label class="block text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Дата Страховки</label>
                    <input type="date" id="inputModalInsuranceDate" class="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-medium focus:border-emerald-500 focus:outline-none bg-white">
                </div>
            </div>

            <button onclick="window.dashSaveModalData()" class="w-full bg-gray-950 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition shadow-md text-xs text-center">
                Сохранить изменения
            </button>
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
let activeModalVehicleId = null;

export async function init() {
    window.dashCompleteTask = dashCompleteTask;
    window.dashAddRepairTask = dashAddRepairTask;
    window.dashToggleFilterDropdown = dashToggleFilterDropdown;
    window.dashToggleLocalVisibility = dashToggleLocalVisibility;
    
    window.dashOpenWarrantyModal = dashOpenWarrantyModal;
    window.dashOpenDocsModal = dashOpenDocsModal;
    window.dashCloseModal = dashCloseModal;
    window.dashSaveModalData = dashSaveModalData;

    document.addEventListener('click', function(e) {
        const drop = document.getElementById('dashFilterDropdown');
        if (drop && !drop.contains(e.target) && !e.target.closest('button')) {
            drop.classList.add('hidden');
        }
    });

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
        const isChecked = !hiddenVehicles.includes(v.id) ? 'checked' : '';
        return `
            <label class="flex items-center gap-2 cursor-pointer py-0.5 hover:bg-gray-50 rounded px-1 text-gray-900 font-medium">
                <input type="checkbox" ${isChecked} onchange="window.dashToggleLocalVisibility(${v.id}, this.checked)" class="w-3.5 h-3.5 rounded text-emerald-600 border-gray-300 focus:ring-emerald-500">
                <span class="truncate">${v.model} ${v.plate ? '('+v.plate+')' : '(б/н)'}</span>
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

function dashOpenWarrantyModal(id, model, plate, current, zero, step, inspectDate, insDate) {
    activeModalVehicleId = id;
    document.getElementById('modalVehicleTitle').innerText = model;
    document.getElementById('modalVehiclePlate').innerText = plate ? `[${plate}]` : '[б/н]';
    
    document.getElementById('inputModalCurrentHours').value = current;
    document.getElementById('inputModalZeroHours').value = zero;
    document.getElementById('inputModalStepHours').value = step;
    
    document.getElementById('inputModalInspectionDate').value = inspectDate || '';
    document.getElementById('inputModalInsuranceDate').value = insDate || '';

    document.getElementById('modalWarrantySection').classList.remove('hidden');
    document.getElementById('modalDocsSection').classList.add('hidden');
    document.getElementById('dashEditModal').classList.remove('hidden');
}

function dashOpenDocsModal(id, model, plate, inspectDate, insDate, current, zero, step) {
    activeModalVehicleId = id;
    document.getElementById('modalVehicleTitle').innerText = model;
    document.getElementById('modalVehiclePlate').innerText = plate ? `[${plate}]` : '[б/н]';
    
    document.getElementById('inputModalInspectionDate').value = inspectDate || '';
    document.getElementById('inputModalInsuranceDate').value = insDate || '';
    
    document.getElementById('inputModalCurrentHours').value = current;
    document.getElementById('inputModalZeroHours').value = zero;
    document.getElementById('inputModalStepHours').value = step;

    document.getElementById('modalDocsSection').classList.remove('hidden');
    document.getElementById('modalWarrantySection').classList.add('hidden');
    document.getElementById('dashEditModal').classList.remove('hidden');
}

function dashCloseModal() {
    document.getElementById('dashEditModal').classList.add('hidden');
    activeModalVehicleId = null;
}

async function dashSaveModalData() {
    if (!activeModalVehicleId) return;
    
    const curHrs = parseInt(document.getElementById('inputModalCurrentHours').value) || 0;
    const zeroHrs = parseInt(document.getElementById('inputModalZeroHours').value) || 0;
    const stepHrs = parseInt(document.getElementById('inputModalStepHours').value) || 125;
    const inspectDt = document.getElementById('inputModalInspectionDate').value || null;
    const insDt = document.getElementById('inputModalInsuranceDate').value || null;

    try {
        const { error } = await window._supabase
            .from('vehicles')
            .update({
                current_hours: curHrs,
                zero_hours: zeroHrs,
                step_hours: stepHrs,
                inspection_date: inspectDt,
                insurance_date: insDt
            })
            .eq('id', activeModalVehicleId);

        if (error) throw error;
        dashCloseModal();
        await loadDashboardData();
    } catch (err) {
        alert("Ошибка сохранения: " + err.message);
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
    const finalTaskText = `${input.value.trim()} [${userRole}]`;
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
        alert("Ошибка добавления: " + err.message);
    }
}

async function dashCompleteTask(taskId) {
    try {
        const { error } = await window._supabase.from('vehicle_tasks').update({ is_completed: true }).eq('id', taskId);
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

    const containerTasks = document.getElementById('containerTasks');
    if (containerTasks) {
        if (activeTasks.length > 0) {
            containerTasks.innerHTML = activeTasks.map(task => {
                const plateStr = plateMap[task.vehicle_id] || '';
                return `
                    <div class="p-2 bg-amber-50 border border-amber-300 rounded-lg text-[11px] flex flex-col justify-between gap-1.5 shadow-3xs">
                        <div class="flex items-start justify-between gap-2">
                            <div>
                                <span class="font-extrabold text-[9px] uppercase tracking-wider text-amber-800">${task.vehicle_id ? '🚜 ' + task.vehicle_name : '📝 Заметка'}</span>
                                <span class="text-gray-500 font-mono text-[9px]">${plateStr}</span>
                                <p class="text-gray-900 font-semibold leading-tight mt-0.5">${task.text}</p>
                            </div>
                            <button onclick="window.dashCompleteTask('${task.id}')" class="bg-amber-600 hover:bg-emerald-700 text-white text-[9px] font-bold px-2 py-0.5 rounded transition shadow-3xs">Готово</button>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            containerTasks.innerHTML = `<div class="bg-emerald-50/50 border border-emerald-100 text-emerald-950 p-3 rounded-lg text-center text-[11px] font-bold">Нет активных задач</div>`;
        }
    }

    const warrantyAlerts = [];
    const docAlerts = [];

    list.forEach(v => {
        const cleanPlate = v.plate || '';
        const plateStr = v.plate ? ` [${v.plate}]` : ' [б/н]';

        if (v.inspection_date) {
            const diff = Math.ceil((new Date(v.inspection_date) - today) / (1000 * 60 * 60 * 24));
            if (diff <= 30) {
                docAlerts.push({
                    id: v.id,
                    model: v.model,
                    plate: cleanPlate,
                    plateLabel: plateStr,
                    daysLeft: diff,
                    isCritical: diff <= 0,
                    inspectDate: v.inspection_date,
                    insDate: v.insurance_date,
                    current: v.current_hours || 0,
                    zero: v.zero_hours || 0,
                    step: v.step_hours || 125,
                    statusText: diff <= 0 ? `🛑 Просрочен Гостехосмотр!` : `⚠️ Техосмотр истекает через ${diff} дн.`
                });
            }
        }

        if (v.insurance_date) {
            const diffIns = Math.ceil((new Date(v.insurance_date) - today) / (1000 * 60 * 60 * 24));
            if (diffIns <= 30) {
                docAlerts.push({
                    id: v.id,
                    model: v.model,
                    plate: cleanPlate,
                    plateLabel: plateStr,
                    daysLeft: diffIns,
                    isCritical: diffIns <= 0,
                    inspectDate: v.inspection_date,
                    insDate: v.insurance_date,
                    current: v.current_hours || 0,
                    zero: v.zero_hours || 0,
                    step: v.step_hours || 125,
                    statusText: diffIns <= 0 ? `🛑 Закончилась страховка!` : `⚠️ Страховка истекает через ${diffIns} дн.`
                });
            }
        }

        const vehicleTagsArray = v.tags ? v.tags.split(',').map(t => t.trim()) : [];
        if (vehicleTagsArray.includes('Гарантия') && !hiddenVehicles.includes(v.id)) {
            const hours = v.current_hours || 0;
            const zeroHours = v.zero_hours || 0;
            const stepHours = v.step_hours || 125;
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
            let statusText = `⚙️ Наработка ${hours} м/ч. До ${toType} (${nextTO}) ещё <b>${hoursLeft} м/ч</b>.`;
            if (hoursLeft <= 50) {
                status = 'danger'; // Станет красным, если осталось 50 м/ч или меньше
                statusText = `🚨 <span class="text-red-700 font-black">Срочно ${toType} (${nextTO})!</span> Осталось <b>${hoursLeft} м/ч</b>.`;
            } else if (hoursLeft <= 100) {
                status = 'warning'; // Станет жёлтым, если осталось от 51 до 100 м/ч
                statusText = `⚠️ Срок ${toType} (${nextTO}). Осталось <b>${hoursLeft} м/ч</b>.`;
}

            warrantyAlerts.push({
                id: v.id,
                status: status,
                hoursLeft: hoursLeft,
                model: v.model,
                plate: cleanPlate,
                plateLabel: plateStr,
                hours: hours,
                zeroHours: zeroHours,
                stepHours: stepHours,
                inspectDate: v.inspection_date,
                insDate: v.insurance_date,
                text: statusText
            });
        }
    });

    warrantyAlerts.sort((a, b) => a.hoursLeft - b.hoursLeft);
    docAlerts.sort((a, b) => a.daysLeft - b.daysLeft);

    const containerWarranty = document.getElementById('containerWarranty');
    if (containerWarranty) {
        if (warrantyAlerts.length === 0) {
            containerWarranty.innerHTML = `<div class="bg-emerald-50/50 border border-emerald-100 text-emerald-950 p-3 rounded-lg text-center text-[11px] font-bold">Нет техники на контроле</div>`;
        } else {
            containerWarranty.innerHTML = warrantyAlerts.map(a => {
                let cardClass = "bg-blue-50/40 border-blue-200 text-blue-950";
                if (a.status === 'danger') cardClass = "bg-red-50/50 border-red-200 text-red-950";
                if (a.status === 'warning') cardClass = "bg-amber-50/50 border-amber-200 text-amber-950";
                
                return `
                    <div class="p-2 border rounded-lg text-[11px] shadow-3xs flex flex-col ${cardClass}">
                        <div class="flex items-center justify-between gap-1">
                            <div class="truncate">
                                <span class="font-extrabold">${a.model}</span> <span class="font-mono text-[9px] text-gray-500">${a.plateLabel}</span>
                                <p class="text-gray-900 mt-0.5">${a.text}</p>
                            </div>
                            <button onclick="window.dashOpenWarrantyModal(${a.id}, '${a.model}', '${a.plate}', ${a.hours}, ${a.zeroHours}, ${a.stepHours}, '${a.inspectDate || ''}', '${a.insDate || ''}')" class="p-1 hover:bg-black/5 rounded text-xs" title="Изменить параметры">✏️</button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    const containerDocs = document.getElementById('containerDocs');
    if (containerDocs) {
        if (docAlerts.length === 0) {
            containerDocs.innerHTML = `<div class="bg-emerald-50/50 border border-emerald-100 text-emerald-900 p-3 rounded-lg text-center text-[11px] font-bold">Все документы в порядке!</div>`;
        } else {
            containerDocs.innerHTML = docAlerts.map(d => {
                const cardClass = d.isCritical ? "bg-red-50/50 border-red-200 text-red-950" : "bg-amber-50/50 border-amber-200 text-amber-950";
                return `
                    <div class="p-2 border rounded-lg text-[11px] shadow-3xs flex flex-col ${cardClass}">
                        <div class="flex items-center justify-between gap-1">
                            <div class="truncate">
                                <span class="font-extrabold">${d.model}</span> <span class="font-mono text-[9px] text-gray-500">${d.plateLabel}</span>
                                <p class="mt-0.5 text-gray-900 font-medium">${d.statusText}</p>
                            </div>
                            <button onclick="window.dashOpenDocsModal(${d.id}, '${d.model}', '${d.plate}', '${d.inspectDate || ''}', '${d.insDate || ''}', ${d.current}, ${d.zero}, ${d.step})" class="p-1 hover:bg-black/5 rounded text-xs" title="Изменить даты">✏️</button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}