export const template = `
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h2 class="text-xl font-bold text-gray-950 tracking-tight">Панель управления</h2>
            <p class="text-xs text-gray-600 font-medium">Оперативная сводка по филиалу СХК «Великополье»</p>
        </div>
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
        
        <div class="space-y-2.5 flex flex-col">
            <h3 class="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1">
                📋 Активные задачи и заметки
            </h3>
            
            <div class="bg-white border-2 border-gray-300 rounded-xl p-2.5 space-y-2 shadow-2xs">
                <select id="taskVehicleSelect" class="w-full text-xs bg-gray-50 border border-gray-300 rounded-lg p-1.5 focus:outline-none focus:border-emerald-500">
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
                <button onclick="window.dashToggleFilterDropdown()" class="text-[11px] bg-gray-100 hover:bg-gray-200 border border-gray-300 font-bold px-2 py-0.5 rounded-md transition shadow-3xs">
                    ⚙️ Выбрать технику
                </button>
            </div>

            <div id="dashFilterDropdown" class="absolute right-0 top-7 w-64 bg-white border-2 border-gray-950 rounded-xl shadow-xl p-3 z-50 space-y-2 hidden max-h-[350px] overflow-y-auto">
                <p class="text-[10px] font-black uppercase text-gray-400 tracking-wider border-b pb-1">Вывод на контроль:</p>
                <div id="dashFilterCheckboxes" class="space-y-1.5 text-xs">
                    </div>
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

    <div id="dashEditModal" class="fixed inset-0 bg-gray-900/50 backdrop-blur-xs z-[100] flex items-center justify-center p-4 hidden">
        <div class="bg-white border-2 border-gray-950 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div class="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <h3 id="modalVehicleTitle" class="font-black text-gray-900 text-sm">Редактирование параметров ТО</h3>
                <button onclick="window.dashCloseModal()" class="text-gray-400 hover:text-gray-600 text-sm">✕</button>
            </div>
            
            <input type="hidden" id="modalVehicleId">
            
            <div class="space-y-3">
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Текущий спидометр (м/ч)</label>
                        <input type="number" id="modalVehicleHours" class="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-mono focus:outline-none focus:border-emerald-500">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Нулевая точка (база отсчета)</label>
                        <input type="number" id="modalVehicleZeroHours" placeholder="0" class="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-mono focus:outline-none focus:border-emerald-500">
                    </div>
                </div>
                
                <div>
                    <label class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Периодичность ТО (шаг в м/ч)</label>
                    <input type="number" id="modalVehicleStep" placeholder="По умолчанию 125" class="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl p-2.5 font-mono focus:outline-none focus:border-emerald-500">
                </div>

                <div class="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-1">
                    <label class="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-gray-800">
                        <input type="checkbox" id="modalVehicleWarrantyCheckbox" class="w-4 h-4 rounded text-emerald-600 border-gray-300 focus:ring-emerald-500">
                        <span>Состоит на Гарантийном Контроле</span>
                    </label>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
                <button onclick="window.dashSubmitFastTO()" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-xs">
                    ⚙️ Выполнено ТО
                </button>
                <button onclick="window.dashSaveModalData()" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-xs">
                    Сохранить изменения
                </button>
            </div>
        </div>
    </div>

    <div id="dashDocModal" class="fixed inset-0 bg-gray-900/50 backdrop-blur-xs z-[100] flex items-center justify-center p-4 hidden">
        <div class="bg-white border-2 border-gray-950 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div class="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <h3 id="modalDocTitle" class="font-black text-gray-900 text-sm">Обновление сроков документов</h3>
                <button onclick="window.dashCloseDocModal()" class="text-gray-400 hover:text-gray-600 text-sm">✕</button>
            </div>
            
            <input type="hidden" id="modalDocVehicleId">
            
            <div class="space-y-3">
                <div>
                    <label class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Дата окончания Гостехосмотра</label>
                    <input type="date" id="modalDocInspection" class="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500">
                </div>
                
                <div>
                    <label class="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Дата окончания Страховки</label>
                    <input type="date" id="modalDocInsurance" class="w-full text-xs bg-gray-50 border border-gray-300 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500">
                </div>
            </div>

            <div class="border-t border-gray-100 pt-3">
                <button onclick="window.dashSaveDocModalData()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition shadow-xs">
                    Сохранить изменения
                </button>
            </div>
        </div>
    </div>
`;

let refreshIntervalId = null;

export async function init() {
    window.dashCompleteTask = dashCompleteTask;
    window.dashAddRepairTask = dashAddRepairTask;
    window.dashOpenModal = dashOpenModal;
    window.dashCloseModal = dashCloseModal;
    window.dashSaveModalData = dashSaveModalData;
    window.dashSubmitFastTO = dashSubmitFastTO;
    window.dashToggleFilterDropdown = dashToggleFilterDropdown;
    window.dashUpdateWarrantyTagViaCheckbox = dashUpdateWarrantyTagViaCheckbox;
    window.dashOpenDocModal = dashOpenDocModal;
    window.dashCloseDocModal = dashCloseDocModal;
    window.dashSaveDocModalData = dashSaveDocModalData;

    // Скрываем дропдаун при клике в любое другое место
    document.addEventListener('click', function(e) {
        const drop = document.getElementById('dashFilterDropdown');
        if (drop && !drop.contains(e.target) && !e.target.innerText.includes('Выбрать технику')) {
            drop.classList.add('hidden');
        }
    });

    if (typeof window.renderMenu === 'function') window.renderMenu();

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
    
    vehicles.forEach(v => {
        const opt = document.createElement('option');
        opt.value = JSON.stringify({ id: v.id, name: v.model });
        opt.innerText = `${v.model} ${v.plate ? '['+v.plate+']' : '[б/н]'}`;
        select.appendChild(opt);
    });
}

function dashToggleFilterDropdown() {
    const drop = document.getElementById('dashFilterDropdown');
    if (drop) drop.classList.toggle('hidden');
}

// Генерация списка чекбоксов для мгновенного включения/выключения гарантии
function renderFilterCheckboxes(vehicles) {
    const container = document.getElementById('dashFilterCheckboxes');
    if (!container) return;
    
    container.innerHTML = vehicles.map(v => {
        const tagsArray = v.tags ? v.tags.split(',').map(t => t.trim()) : [];
        const isChecked = tagsArray.includes('Гарантия') ? 'checked' : '';
        const nameStr = `${v.model} ${v.plate ? '('+v.plate+')' : '(б/н)'}`;
        
        return `
            <label class="flex items-center gap-2 cursor-pointer py-0.5 hover:bg-gray-50 rounded px-1 text-gray-900 font-medium">
                <input type="checkbox" ${isChecked} onchange="window.dashUpdateWarrantyTagViaCheckbox(${v.id}, this.checked)" class="w-3.5 h-3.5 rounded text-emerald-600 border-gray-300 focus:ring-emerald-500">
                <span class="truncate">${nameStr}</span>
            </label>
        `;
    }).join('');
}

// Быстрое переключение тега Гарантия из выпадающего меню флажков
async function dashUpdateWarrantyTagViaCheckbox(vehicleId, isChecked) {
    const v = (window.dashCachedVehicles || []).find(item => item.id === vehicleId);
    if (!v) return;

    let tagsArray = v.tags ? v.tags.split(',').map(t => t.trim()) : [];
    if (isChecked && !tagsArray.includes('Гарантия')) {
        tagsArray.push('Гарантия');
    } else if (!isChecked && tagsArray.includes('Гарантия')) {
        tagsArray = tagsArray.filter(t => t !== 'Гарантия');
    }

    try {
        const { error } = await window._supabase
            .from('vehicles')
            .update({ tags: tagsArray.join(', ') })
            .eq('id', vehicleId);

        if (error) throw error;
        await loadDashboardData();
    } catch (err) {
        alert("Ошибка изменения флага контроля: " + err.message);
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

    try {
        const { error } = await window._supabase.from('vehicle_tasks').insert([{
            vehicle_id: vehicleId,
            vehicle_name: vehicleName,
            text: input.value.trim(),
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
        const { error } = await window._supabase
            .from('vehicle_tasks')
            .update({ is_completed: true })
            .eq('id', taskId);

        if (error) throw error;
        await loadDashboardData();
    } catch (err) {
        alert("Ошибка закрытия задачи: " + err.message);
    }
}

function dashOpenModal(vehicleId) {
    const targetId = Number(vehicleId);
    const v = (window.dashCachedVehicles || []).find(item => item.id === targetId);
    if (!v) return;

    document.getElementById('modalVehicleId').value = v.id;
    document.getElementById('modalVehicleTitle').innerText = `⚙️ Настройки: ${v.model}`;
    document.getElementById('modalVehicleHours').value = v.current_hours || 0;
    document.getElementById('modalVehicleZeroHours').value = v.zero_hours || 0; // Новая точка базы отсчета
    document.getElementById('modalVehicleStep').value = v.to_step_hours || 125;

    const tagsArray = v.tags ? v.tags.split(',').map(t => t.trim()) : [];
    document.getElementById('modalVehicleWarrantyCheckbox').checked = tagsArray.includes('Гарантия');

    document.getElementById('dashEditModal').classList.remove('hidden');
}

function dashCloseModal() {
    document.getElementById('dashEditModal').classList.add('hidden');
}

async function dashSaveModalData() {
    const id = document.getElementById('modalVehicleId').value;
    const hours = parseInt(document.getElementById('modalVehicleHours').value) || 0;
    const zeroHours = parseInt(document.getElementById('modalVehicleZeroHours').value) || 0;
    const step = parseInt(document.getElementById('modalVehicleStep').value) || 125;
    const isWarranty = document.getElementById('modalVehicleWarrantyCheckbox').checked;

    const v = (window.dashCachedVehicles || []).find(item => item.id == id);
    if (!v) return;

    let tagsArray = v.tags ? v.tags.split(',').map(t => t.trim()) : [];
    if (isWarranty && !tagsArray.includes('Гарантия')) {
        tagsArray.push('Гарантия');
    } else if (!isWarranty && tagsArray.includes('Гарантия')) {
        tagsArray = tagsArray.filter(t => t !== 'Гарантия');
    }

    try {
        const { error } = await window._supabase
            .from('vehicles')
            .update({
                current_hours: hours,
                zero_hours: zeroHours,
                to_step_hours: step,
                tags: tagsArray.join(', ')
            })
            .eq('id', id);

        if (error) throw error;
        dashCloseModal();
        await loadDashboardData();
    } catch (err) {
        alert("Ошибка сохранения: " + err.message);
    }
}

async function dashSubmitFastTO() {
    const id = document.getElementById('modalVehicleId').value;
    const hours = parseInt(document.getElementById('modalVehicleHours').value) || 0;
    const zeroHours = parseInt(document.getElementById('modalVehicleZeroHours').value) || 0;
    const step = parseInt(document.getElementById('modalVehicleStep').value) || 125;

    // Рассчитываем чистую наработку от нулевой точки
    const effectiveHours = hours - zeroHours;
    const nextEffectiveTO = Math.ceil((effectiveHours + 1) / step) * step;
    const nextAbsoluteTO = nextEffectiveTO + zeroHours;
    
    if (!confirm(`Подтверждаете выполнение ТО на отметке спидометра ${nextAbsoluteTO} м/ч (чистый шаг от базы: ${nextEffectiveTO} м/ч)?`)) return;

    try {
        const { error } = await window._supabase
            .from('vehicles')
            .update({ current_hours: nextAbsoluteTO })
            .eq('id', id);

        if (error) throw error;
        dashCloseModal();
        await loadDashboardData();
    } catch (err) {
        alert("Ошибка проведения ТО: " + err.message);
    }
}

// ОКНО ОПЕРАТИВНОГО ИЗМЕНЕНИЯ СТРАХОВОК/ТЕХОСМОТРОВ
function dashOpenDocModal(vehicleId) {
    const v = (window.dashCachedVehicles || []).find(item => item.id === Number(vehicleId));
    if (!v) return;

    document.getElementById('modalDocVehicleId').value = v.id;
    document.getElementById('modalDocTitle').innerText = `✏️ Документы: ${v.model}`;
    document.getElementById('modalDocInspection').value = v.inspection_date || '';
    document.getElementById('modalDocInsurance').value = v.insurance_date || '';

    document.getElementById('dashDocModal').classList.remove('hidden');
}

function dashCloseDocModal() {
    document.getElementById('dashDocModal').classList.add('hidden');
}

async function dashSaveDocModalData() {
    const id = document.getElementById('modalDocVehicleId').value;
    const inspection = document.getElementById('modalDocInspection').value || null;
    const insurance = document.getElementById('modalDocInsurance').value || null;

    try {
        const { error } = await window._supabase
            .from('vehicles')
            .update({
                inspection_date: inspection,
                insurance_date: insurance
            })
            .eq('id', id);

        if (error) throw error;
        dashCloseDocModal();
        await loadDashboardData();
    } catch (err) {
        alert("Ошибка сохранения документов: " + err.message);
    }
}

function renderSeparatedAlerts(list, activeTasks) {
    const today = new Date();
    const plateMap = {};
    list.forEach(v => { plateMap[v.id] = v.plate ? `[${v.plate}]` : '[б/н]'; });

    // 1. СТРУКТУРИРОВАННЫЕ ЗАДАЧИ И СВОБОДНЫЕ ПОМЕТКИ
    const containerTasks = document.getElementById('containerTasks');
    if (containerTasks) {
        if (activeTasks.length === 0) {
            containerTasks.innerHTML = `<div class="bg-emerald-50/50 border border-emerald-200 text-emerald-950 p-3 rounded-lg text-center text-[11px] font-bold">Нет активных задач и заметок</div>`;
        } else {
            containerTasks.innerHTML = activeTasks.map(task => {
                const plateStr = plateMap[task.vehicle_id] || '';
                const isSystemTask = task.vehicle_id !== null;
                
                return `
                    <div class="p-2.5 bg-amber-50 border-2 border-amber-400 text-gray-950 rounded-lg text-[11px] shadow-2xs flex items-start justify-between gap-2">
                        <div class="flex-1">
                            <span class="text-[10px] uppercase font-black tracking-wider ${isSystemTask ? 'text-amber-900' : 'text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded'}">
                                ${isSystemTask ? '🛠️ ' + task.vehicle_name : '📌 Общая заметка'}
                            </span>
                            <span class="text-gray-600 font-mono font-medium text-[10px]">${plateStr}</span>
                            <p class="text-gray-950 font-bold mt-1 leading-tight">${task.text}</p>
                        </div>
                        <button onclick="window.dashCompleteTask('${task.id}')" class="bg-amber-600 hover:bg-emerald-700 text-white text-[10px] font-black px-2 py-1 rounded transition whitespace-nowrap">
                            ✓ Закрыть
                        </button>
                    </div>
                `;
            }).join('');
        }
    }

    const warrantyAlerts = [];
    const docAlerts = [];

    list.forEach(v => {
        const plateStr = v.plate ? ` [${v.plate}]` : ' [б/н]';
        const customStep = v.to_step_hours || 125;
        const zeroHours = v.zero_hours || 0;

        // Проверка Гостехосмотра
        if (v.inspection_date) {
            const diff = Math.ceil((new Date(v.inspection_date) - today) / (1000 * 60 * 60 * 24));
            if (diff <= 0) {
                docAlerts.push({ id: v.id, daysLeft: diff, text: `🛑 <b>${v.model}</b><span class="font-mono text-gray-700">${plateStr}</span>:<br><span class="text-red-700 font-black">Просрочен Гостехосмотр!</span>` });
            } else if (diff <= 30) {
                docAlerts.push({ id: v.id, daysLeft: diff, text: `⚠️ <b>${v.model}</b><span class="font-mono text-gray-700">${plateStr}</span>:<br>Техосмотр истекает через <b>${diff} дн.</b>` });
            }
        }

        // Проверка Страховки
        if (v.insurance_date) {
            const diffIns = Math.ceil((new Date(v.insurance_date) - today) / (1000 * 60 * 60 * 24));
            if (diffIns <= 0) {
                docAlerts.push({ id: v.id, daysLeft: diffIns, text: `🛑 <b>${v.model}</b><span class="font-mono text-gray-700">${plateStr}</span>:<br><span class="text-red-700 font-black">Закончилась страховка!</span>` });
            } else if (diffIns <= 30) {
                docAlerts.push({ id: v.id, daysLeft: diffIns, text: `⚠️ <b>${v.model}</b><span class="font-mono text-gray-700">${plateStr}</span>:<br>Страховка истекает через <b>${diffIns} дн.</b>` });
            }
        }

        // Проверка Гарантии с учетом базовой (нулевой) точки наработки zero_hours
        const vehicleTagsArray = v.tags ? v.tags.split(',').map(t => t.trim()) : [];
        if (vehicleTagsArray.includes('Гарантия')) {
            const currentHours = v.current_hours || 0;
            
            // Чистая эффективная наработка с момента ввода/сброса спидометра
            const effectiveHours = Math.max(0, currentHours - zeroHours);
            const nextEffectiveTO = Math.ceil((effectiveHours + 1) / customStep) * customStep;
            const nextAbsoluteTO = nextEffectiveTO + zeroHours; // Целевая точка на спидометре
            
            const hoursLeft = nextAbsoluteTO - currentHours;

            let toType = "(ТО-1)";
            if (nextEffectiveTO % 1000 === 0) {
                toType = "(ТО-3)";
            } else if (nextEffectiveTO % (customStep * 2) === 0) {
                toType = "(ТО-2)";
            }

            if (hoursLeft <= 30) {
                warrantyAlerts.push({ id: v.id, hoursLeft: hoursLeft, status: 'danger', text: `🚨 <b>${v.model}</b><span class="font-mono text-gray-700">${plateStr}</span>:<br><span class="text-red-700 font-black">Срочно ТО-${nextAbsoluteTO} ${toType}!</span> Осталось <b>${hoursLeft} м/ч</b>.` });
            } else if (hoursLeft <= 60) {
                warrantyAlerts.push({ id: v.id, hoursLeft: hoursLeft, status: 'warning', text: `⚠️ <b>${v.model}</b><span class="font-mono text-gray-700">${plateStr}</span>:<br>Приближается ТО-${nextAbsoluteTO} ${toType}. Осталось <b>${hoursLeft} м/ч</b>.` });
            } else {
                warrantyAlerts.push({ id: v.id, hoursLeft: hoursLeft, status: 'info', text: `⚙️ <b>${v.model}</b><span class="font-mono text-gray-700">${plateStr}</span>:<br>Наработка ${currentHours} м/ч. До ТО-${nextAbsoluteTO} еще <b>${hoursLeft} м/ч</b>.` });
            }
        }
    });

    // СОРТИРОВКА: Меньше моточасов осталось/меньше дней осталось — НАВЕРХУ
    warrantyAlerts.sort((a, b) => a.hoursLeft - b.hoursLeft);
    docAlerts.sort((a, b) => a.daysLeft - b.daysLeft);

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
                
                return `
                    <div class="p-2.5 border rounded-lg text-[11px] ${c} flex items-center justify-between gap-2 shadow-2xs">
                        <div class="flex-1">${a.text}</div>
                        <button onclick="window.dashOpenModal(${a.id})" class="bg-white/70 hover:bg-white text-gray-800 border p-1.5 rounded-lg transition shrink-0" title="Редактировать параметры ТО">
                            ✏️
                        </button>
                    </div>
                `;
            }).join('');
        }
    }

    // 3. РЕНДЕР ДОКУМЕНТОВ С ВОЗМОЖНОСТЬЮ РЕДАКТИРОВАНИЯ
    const containerDocs = document.getElementById('containerDocs');
    if (containerDocs) {
        if (docAlerts.length === 0) {
            containerDocs.innerHTML = `<div class="bg-emerald-50/50 border border-emerald-200 text-emerald-900 p-3 rounded-lg text-center text-[11px] font-bold">Все документы в полном порядке!</div>`;
        } else {
            containerDocs.innerHTML = docAlerts.map(a => {
                const c = a.daysLeft <= 0 ? "bg-red-50 border-red-300 text-red-950 font-bold" : "bg-amber-50 border-amber-300 text-amber-950 font-medium";
                return `
                    <div class="p-2.5 border rounded-lg text-[11px] ${c} shadow-2xs flex items-center justify-between gap-2">
                        <div class="flex-1">${a.text}</div>
                        <button onclick="window.dashOpenDocModal(${a.id})" class="bg-white/70 hover:bg-white text-gray-800 border p-1.5 rounded-lg transition shrink-0" title="Редактировать сроки документов">
                            ✏️
                        </button>
                    </div>
                `;
            }).join('');
        }
    }
}