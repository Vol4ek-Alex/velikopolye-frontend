export const template = `
    <div class="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-gray-300/70 shadow-xs">
        <div class="space-y-0.5">
            <h2 class="text-xl font-bold text-gray-900 tracking-tight">Управление автопарком</h2>
            <p class="text-xs text-gray-500">Учет техники, контроль сроков действия документов и логов ремонта</p>
        </div>
        <div class="flex flex-wrap gap-2">
            <button id="showProblemsBtn" onclick="window.toggleProblemsFilter()" class="bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs">
                <span>⚠️</span> Контроль сроков
            </button>
            <button id="manageCatsBtn" onclick="window.openCategoriesModal()" class="bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-xs font-bold transition shadow-2xs">
                Категории
            </button>
            <button id="addVehicleBtn" onclick="window.openVehicleModalForm()" class="bg-emerald-600 hover:bg-emerald-700 border border-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm">
                + Добавить технику
            </button>
        </div>
    </div>

    <div class="bg-white p-4 rounded-xl border border-gray-300/70 shadow-xs space-y-3 mb-5">
        <div class="flex flex-col sm:flex-row gap-3">
            <input type="text" id="vehicleSearchInput" class="flex-1 bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs text-gray-950 placeholder-gray-400 focus:outline-none focus:border-emerald-600 focus:bg-white font-medium transition" placeholder="Поиск по модели, госномеру, инвентарному или VIN...">
            <select id="sortSelect" onchange="window.handleSortChange(this.value)" class="bg-white border border-gray-300 rounded-lg p-2.5 text-xs font-bold text-gray-700 focus:outline-none focus:border-emerald-600">
                <option value="name_asc">По названию (А-Я)</option>
                <option value="name_desc">По названию (Я-А)</option>
                <option value="hours_desc">По наработке (сначала max)</option>
            </select>
        </div>
        
        <div class="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100" id="fleetCategoriesBar">
            <div class="text-xs text-gray-400">Загрузка категорий...</div>
        </div>
    </div>

    <div id="fleetGridContainer" class="space-y-6">
        <div class="text-center text-gray-400 py-10 text-xs font-medium">Загрузка данных автопарка...</div>
    </div>

    <div id="vFormModal" class="fixed inset-0 bg-gray-900/40 backdrop-blur-xs hidden z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl w-full max-w-md p-6 border border-gray-300 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 id="vModalTitle" class="text-sm font-bold text-gray-900 border-b border-gray-200 pb-2">Карточка техники</h3>
            <form id="vForm" class="space-y-3.5 text-xs">
                <input type="hidden" id="vId">
                
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-gray-600 mb-1 font-bold">Категория</label>
                        <select id="vCategory" required class="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 font-medium focus:outline-none focus:border-emerald-600"></select>
                    </div>
                    <div>
                        <label class="block text-gray-600 mb-1 font-bold">Модель / Название</label>
                        <input type="text" id="vName" required class="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 font-medium focus:outline-none focus:border-emerald-600" placeholder="МТЗ-3522">
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-2.5">
                    <div>
                        <label class="block text-gray-600 mb-1 font-bold">Госномер</label>
                        <input type="text" id="vPlate" class="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 font-mono font-bold focus:border-emerald-600" placeholder="1234 AB-7">
                    </div>
                    <div>
                        <label class="block text-gray-600 mb-1 font-bold">Инвентарный №</label>
                        <input type="text" id="vInv" class="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 font-mono font-bold focus:border-emerald-600" placeholder="00125">
                    </div>
                    <div>
                        <label class="block text-gray-600 mb-1 font-bold">Наработка (м/ч)</label>
                        <input type="number" id="vHours" required class="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 font-bold focus:border-emerald-600" placeholder="0">
                    </div>
                </div>

                <div>
                    <label class="block text-gray-600 mb-1 font-bold">VIN / Заводской серийный номер</label>
                    <input type="text" id="vVin" class="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 font-mono focus:border-emerald-600" placeholder="Номер рамы или кузова">
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-gray-600 mb-1 font-bold">Техосмотр (до)</label>
                        <input type="date" id="vToDate" class="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 font-medium focus:border-emerald-600">
                    </div>
                    <div>
                        <label class="block text-gray-600 mb-1 font-bold">Страховка (до)</label>
                        <input type="date" id="vInsuranceDate" class="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 font-medium focus:border-emerald-600">
                    </div>
                </div>

                <div>
                    <label class="block text-gray-600 mb-1 font-bold">Теги текущего состояния (до 2-х)</label>
                    <div id="tagsCheckboxContainer" class="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200"></div>
                </div>

                <div class="flex gap-2.5 pt-3 border-t border-gray-200">
                    <button type="button" onclick="window.closeVModal()" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-bold transition">Отмена</button>
                    <button type="submit" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-bold transition shadow-xs">Сохранить</button>
                </div>
                <button type="button" id="vDeleteBtn" class="w-full bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg font-bold transition hidden border border-red-200">Удалить из базы данных</button>
            </form>
        </div>
    </div>

    <div id="categoriesModal" class="fixed inset-0 bg-gray-900/40 backdrop-blur-xs hidden z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl w-full max-w-xs p-5 border border-gray-300 shadow-2xl space-y-4">
            <h3 class="text-xs font-bold text-gray-900 border-b border-gray-200 pb-1.5">Настройка категорий</h3>
            <div class="space-y-1.5 max-h-40 overflow-y-auto" id="modalCategoriesList"></div>
            <div class="pt-2 border-t border-gray-200 space-y-1.5">
                <input type="text" id="newCatInput" class="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs focus:outline-none focus:border-emerald-600" placeholder="Новая категория...">
                <button onclick="window.addCustomCategory()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-lg text-xs font-bold transition">Добавить</button>
            </div>
            <button onclick="document.getElementById('categoriesModal').classList.add('hidden')" class="w-full bg-gray-100 text-gray-600 py-1.5 rounded-lg text-xs font-bold transition border border-gray-200">Закрыть</button>
        </div>
    </div>

    <div id="tasksModal" class="fixed inset-0 bg-gray-900/40 backdrop-blur-xs hidden z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl w-full max-w-sm p-5 border border-gray-300 shadow-2xl space-y-4">
            <div class="space-y-0.5">
                <h3 id="tasksModalTitle" class="text-sm font-bold text-gray-900">Задачи по технике</h3>
                <p class="text-xs text-gray-500" id="tasksModalSubtitle"></p>
            </div>
            <input type="hidden" id="taskVehicleId">
            <input type="hidden" id="taskVehicleName">
            
            <div class="space-y-2 max-h-44 overflow-y-auto" id="vehicleTasksList"></div>
            
            <div class="pt-2 border-t border-gray-200 space-y-1.5">
                <textarea id="newTaskText" rows="2" class="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs focus:outline-none focus:border-emerald-600" placeholder="Записать задачу или нужную запчасть..."></textarea>
                <button onclick="window.addVehicleTask()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-xs font-bold transition shadow-xs">Добавить задачу</button>
            </div>
            <button onclick="document.getElementById('tasksModal').classList.add('hidden')" class="w-full bg-gray-100 text-gray-600 py-1.5 rounded-lg text-xs font-bold transition border border-gray-200">Закрыть</button>
        </div>
    </div>
`;

let vehicles = [];
let tasks = [];
let categories = ["Тракторы", "Автомобили", "Комбайны", "Агрегаты", "Без категории"];
let baseTags = ["Готов", "В ремонте", "На хранении", "Гарантия"];

let searchQuery = "";
let selectedCategory = "all";
let filterProblemsOnly = false;
let currentSort = "name_asc";
let refreshIntervalId = null;

export async function init() {
    const savedCats = localStorage.getItem('fleet_custom_categories');
    if (savedCats) categories = JSON.parse(savedCats);
    if (!categories.includes("Без категории")) categories.push("Без категории");

    const searchInput = document.getElementById('vehicleSearchInput');
    if (searchInput) {
        searchInput.oninput = (e) => {
            searchQuery = e.target.value.toLowerCase();
            renderFleet();
        };
    }

    const form = document.getElementById('vForm');
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            await handleFormSubmit();
        };
    }

    const delBtn = document.getElementById('vDeleteBtn');
    if (delBtn) delBtn.onclick = handleDeleteVehicle;

    window.openVehicleModalForm = (v = null) => openVehicleModal(v);
    window.closeVModal = () => document.getElementById('vFormModal').classList.add('hidden');
    window.openCategoriesModal = () => renderCategoriesModalList();
    
    window.toggleProblemsFilter = () => {
        filterProblemsOnly = !filterProblemsOnly;
        const btn = document.getElementById('showProblemsBtn');
        if (btn) {
            btn.className = filterProblemsOnly 
                ? "bg-amber-600 text-white border border-transparent px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                : "bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs";
        }
        renderFleet();
    };
    
    window.handleSortChange = (val) => {
        currentSort = val;
        renderFleet();
    };

    await loadAllData();
    if (refreshIntervalId) clearInterval(refreshIntervalId);
    refreshIntervalId = setInterval(loadAllData, 5000);
}

async function loadAllData() {
    if (!window._supabase) return;
    try {
        const { data: vData, error: vErr } = await window._supabase.from('vehicles').select('*');
        if (!vErr && vData) {
            vehicles = vData;
            vData.forEach(v => {
                const typeName = v.type || "Без категории";
                if (!categories.map(c => c.toLowerCase()).includes(typeName.toLowerCase())) {
                    categories.push(typeName);
                }
            });
            categories = [...new Set(categories)];
        }

        try {
            const { data: tData, error: tErr } = await window._supabase.from('vehicle_tasks').select('*').eq('is_completed', false);
            if (!tErr && tData) tasks = tData;
        } catch(e) { tasks = []; }

        renderCategoriesBar();
        renderFleet();
    } catch (e) {
        console.error(e);
    }
}

function renderCategoriesBar() {
    const bar = document.getElementById('fleetCategoriesBar');
    if (!bar) return;

    let html = `<button onclick="window.filterCategory('all')" class="px-2.5 py-1 text-xs font-bold rounded-md transition border ${selectedCategory === 'all' ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'}">Все</button>`;
    
    categories.forEach((cat) => {
        const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
        html += `<button onclick="window.filterCategory('${cat}')" class="px-2.5 py-1 text-xs font-bold rounded-md transition border ${isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'}">${cat}</button>`;
    });

    bar.innerHTML = html;

    window.filterCategory = (cat) => {
        selectedCategory = cat;
        renderCategoriesBar();
        renderFleet();
    };
}

function renderFleet() {
    const container = document.getElementById('fleetGridContainer');
    if (!container) return;

    let filtered = vehicles.filter(v => {
        const vType = v.type || "Без категории";
        const modelStr = v.model ? v.model.toLowerCase() : '';
        const plateStr = v.plate ? v.plate.toLowerCase() : '';
        const invStr = v.inv_number ? v.inv_number.toLowerCase() : '';
        const vinStr = v.vin_number ? v.vin_number.toLowerCase() : '';
        const tagsStr = v.tags ? v.tags.toLowerCase() : '';

        const queryMatch = modelStr.includes(searchQuery) || plateStr.includes(searchQuery) || invStr.includes(searchQuery) || vinStr.includes(searchQuery) || tagsStr.includes(searchQuery);
        if (!queryMatch) return false;
        
        if (selectedCategory !== 'all') {
            if (vType.toLowerCase() !== selectedCategory.toLowerCase()) return false;
        }

        if (filterProblemsOnly) {
            let hasProblem = false;
            const now = new Date();
            if (v.inspection_date && (new Date(v.inspection_date) - now) / (1000*60*60*24) <= 30) hasProblem = true;
            if (v.insurance_date && (new Date(v.insurance_date) - now) / (1000*60*60*24) <= 30) hasProblem = true;
            return hasProblem;
        }
        return true;
    });

    filtered.sort((a, b) => {
        if (currentSort === 'name_asc') return (a.model || '').localeCompare(b.model || '');
        if (currentSort === 'name_desc') return (b.model || '').localeCompare(a.model || '');
        if (currentSort === 'hours_desc') return (b.current_hours || 0) - (a.current_hours || 0);
        return 0;
    });

    let html = "";
    const uniqueTypesInFiltered = [...new Set(filtered.map(v => v.type || "Без категории"))];

    uniqueTypesInFiltered.forEach(cat => {
        const catList = filtered.filter(v => (v.type || "Без категории").toLowerCase() === cat.toLowerCase());
        if (catList.length === 0) return;

        html += `
            <div class="space-y-2">
                <h3 class="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-0.5">${cat} — ${catList.length} ед.</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${catList.map(v => {
                        const now = new Date();
                        
                        const formatDocStatus = (dateStr) => {
                            if (!dateStr) return { text: '—', classes: 'text-gray-400 font-normal' };
                            const diffDays = Math.ceil((new Date(dateStr) - now) / (1000 * 60 * 60 * 24));
                            const formattedDate = new Date(dateStr).toLocaleDateString('ru-RU');
                            
                            if (diffDays <= 0) {
                                return { text: `${formattedDate} (Просрочено)`, classes: 'text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded font-bold text-[11px]' };
                            }
                            if (diffDays <= 30) {
                                return { text: `${formattedDate} (${diffDays} дн.)`, classes: 'text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-bold text-[11px]' };
                            }
                            return { text: formattedDate, classes: 'text-gray-800 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded font-medium text-[11px]' };
                        };

                        const toInfo = formatDocStatus(v.inspection_date);
                        const insInfo = formatDocStatus(v.insurance_date);
                        const vehicleTagsArray = v.tags ? v.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
                        const vTasks = tasks.filter(t => t.vehicle_id === v.id);
                        const safeVehicleJson = JSON.stringify(v).replace(/"/g, '&quot;').replace(/'/g, '&#39;');

                        return `
                            <div class="relative bg-white border border-gray-300/90 rounded-xl p-4 shadow-2xs hover:border-emerald-600/60 transition duration-150 flex flex-col justify-between">
                                
                                ${v.inv_number ? `
                                    <div class="absolute top-4 right-4 bg-gray-100 text-[10px] text-gray-700 px-2 py-0.5 rounded border border-gray-300 font-mono font-bold">
                                        Инв. ${v.inv_number}
                                    </div>
                                ` : ''}

                                <div class="space-y-3.5">
                                    <div class="space-y-1 pr-24">
                                        <h4 class="font-bold text-gray-900 text-sm tracking-tight truncate">${v.model}</h4>
                                        <div class="flex flex-wrap gap-1">
                                            ${vehicleTagsArray.map(t => {
                                                let c = "bg-gray-100 text-gray-700 border-gray-300";
                                                if (t === 'Готов') c = "bg-emerald-50 text-emerald-800 border-emerald-200";
                                                if (t === 'В ремонте') c = "bg-red-50 text-red-700 border-red-200";
                                                if (t === 'На хранении') c = "bg-gray-100 text-gray-700 border-gray-300";
                                                if (t === 'Гарантия') c = "bg-blue-50 text-blue-800 border-blue-200";
                                                return `<span class="border ${c} text-[9px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider">${t}</span>`;
                                            }).join('')}
                                        </div>
                                    </div>
                                    
                                    <div class="space-y-1">
                                        <div class="text-sm font-mono font-bold text-gray-950 bg-gray-50 border-2 border-gray-900 inline-block px-3 py-1 rounded-md tracking-wider shadow-2xs">
                                            ${v.plate || 'БЕЗ ГОСНОМЕРА'}
                                        </div>
                                        ${v.vin_number ? `
                                            <div class="text-[10px] font-mono font-medium text-gray-500 truncate" title="${v.vin_number}">
                                                VIN: ${v.vin_number}
                                            </div>
                                        ` : ''}
                                    </div>
                                    
                                    ${vTasks.length > 0 ? `
                                        <div class="space-y-1 border-t border-dashed border-gray-200 pt-2">
                                            ${vTasks.map(t => `
                                                <div class="text-[10px] bg-amber-50 border border-amber-200 text-amber-900 px-2 py-1 rounded flex items-center justify-between">
                                                    <span class="truncate pr-2 font-medium">📌 ${t.text}</span>
                                                    <button onclick="window.completeTask(${t.id})" class="text-emerald-700 font-bold hover:underline shrink-0">Ок</button>
                                                </div>
                                            `).join('')}
                                        </div>
                                    ` : ''}
                                </div>

                                <div class="pt-3 mt-3 border-t border-gray-200 text-[11px] space-y-2.5">
                                    <div class="space-y-1.5">
                                        <div class="flex justify-between items-center">
                                            <span class="text-gray-500 font-medium">Наработка:</span>
                                            <span class="font-bold text-gray-900">${v.current_hours || 0} м/ч</span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <span class="text-gray-500 font-medium">Техосмотр:</span>
                                            <span class="${toInfo.classes}">${toInfo.text}</span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <span class="text-gray-500 font-medium">Страховка:</span>
                                            <span class="${insInfo.classes}">${insInfo.text}</span>
                                        </div>
                                    </div>

                                    <div class="grid grid-cols-2 gap-2 pt-0.5">
                                        <button onclick="window.openVehicleModalForm(${safeVehicleJson})" class="w-full text-[10px] text-center font-bold text-gray-700 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 transition py-1">
                                            Изменить
                                        </button>
                                        <button onclick="window.openTasksModalForm(${v.id}, '${v.model.replace(/'/g, "\\'")}')" class="w-full text-[10px] text-center font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 rounded-md hover:bg-emerald-100 transition py-1">
                                            Задачи (${vTasks.length})
                                        </button>
                                    </div>
                                </div>

                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    });

    container.innerHTML = html || `<div class="text-center text-gray-400 py-10 text-xs">Техника не найдена</div>`;
}

function openVehicleModal(vehicle = null) {
    const modal = document.getElementById('vFormModal');
    const title = document.getElementById('vModalTitle');
    const delBtn = document.getElementById('vDeleteBtn');
    if (!modal) return;

    const catSelect = document.getElementById('vCategory');
    if (catSelect) {
        catSelect.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');
    }

    const tagsBox = document.getElementById('tagsCheckboxContainer');
    if (tagsBox) {
        tagsBox.innerHTML = baseTags.map(t => `
            <label class="flex items-center gap-1.5 bg-white px-2.5 py-0.5 rounded border border-gray-300 text-[11px] font-bold text-gray-700 cursor-pointer select-none">
                <input type="checkbox" name="vTags" value="${t}" onchange="window.handleTagCheckboxLimit(this)" class="rounded text-emerald-600 focus:ring-emerald-500">
                ${t}
            </label>
        `).join('');
    }

    window.handleTagCheckboxLimit = (checkbox) => {
        const checked = document.querySelectorAll('input[name="vTags"]:checked');
        if (checked.length > 2) {
            checkbox.checked = false;
            alert("Можно выбрать не более 2-ух тегов!");
        }
    };

    document.getElementById('vForm').reset();
    modal.classList.remove('hidden');

    if (vehicle) {
        title.innerText = "Редактирование параметров техники";
        document.getElementById('vId').value = vehicle.id;
        document.getElementById('vCategory').value = vehicle.type || 'Без категории';
        document.getElementById('vName').value = vehicle.model || '';
        document.getElementById('vPlate').value = vehicle.plate || '';
        document.getElementById('vInv').value = vehicle.inv_number || '';
        document.getElementById('vHours').value = vehicle.current_hours || 0;
        document.getElementById('vVin').value = vehicle.vin_number || '';
        document.getElementById('vToDate').value = vehicle.inspection_date || '';
        document.getElementById('vInsuranceDate').value = vehicle.insurance_date || '';
        
        if (vehicle.tags) {
            const arr = vehicle.tags.split(',').map(t => t.trim());
            arr.forEach(t => {
                const cb = document.querySelector(`input[name="vTags"][value="${t}"]`);
                if (cb) cb.checked = true;
            });
        }
        if (delBtn) delBtn.classList.remove('hidden');
    } else {
        title.innerText = "Добавление новой техники";
        document.getElementById('vId').value = '';
        document.getElementById('vCategory').value = 'Без категории';
        if (delBtn) delBtn.classList.add('hidden');
    }
}

async function handleFormSubmit() {
    if (!window._supabase) return;
    const id = document.getElementById('vId').value;
    const selectedTags = [];
    document.querySelectorAll('input[name="vTags"]:checked').forEach(cb => selectedTags.push(cb.value));

    const payload = {
        type: document.getElementById('vCategory').value || 'Без категории',
        model: document.getElementById('vName').value,
        plate: document.getElementById('vPlate').value || null,
        inv_number: document.getElementById('vInv').value || null,
        current_hours: parseInt(document.getElementById('vHours').value) || 0,
        vin_number: document.getElementById('vVin').value || null,
        inspection_date: document.getElementById('vToDate').value || null,
        insurance_date: document.getElementById('vInsuranceDate').value || null,
        tags: selectedTags.join(', ')
    };

    try {
        if (id) {
            const { error } = await window._supabase.from('vehicles').update(payload).eq('id', id);
            if (error) throw error;
        } else {
            const { error } = await window._supabase.from('vehicles').insert([payload]);
            if (error) throw error;
        }
        window.closeVModal();
        await loadAllData();
    } catch (e) {
        alert("Ошибка сохранения: " + e.message);
    }
}

async function handleDeleteVehicle() {
    const id = document.getElementById('vId').value;
    if (!id || !window._supabase) return;

    if (confirm("Вы точно хотите безвозвратно удалить данную технику из базы данных филиала?")) {
        try {
            const { error } = await window._supabase.from('vehicles').delete().eq('id', id);
            if (error) throw error;
            window.closeVModal();
            await loadAllData();
        } catch (e) {
            alert("Не удалось удалить: " + e.message);
        }
    }
}

function renderCategoriesModalList() {
    const modal = document.getElementById('categoriesModal');
    const list = document.getElementById('modalCategoriesList');
    if (!modal || !list) return;

    modal.classList.remove('hidden');
    list.innerHTML = categories.map((c, idx) => `
        <div class="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-300 text-xs font-bold">
            <span class="text-gray-700">${c}</span>
            ${c !== 'Без категории' ? `<button onclick="window.deleteCustomCategory(${idx})" class="text-red-600 hover:underline">Удалить</button>` : ''}
        </div>
    `).join('');

    window.addCustomCategory = () => {
        const input = document.getElementById('newCatInput');
        if (input && input.value.trim()) {
            categories.push(input.value.trim());
            localStorage.setItem('fleet_custom_categories', JSON.stringify(categories));
            input.value = "";
            renderCategoriesModalList();
            renderCategoriesBar();
            renderFleet();
        }
    };

    window.deleteCustomCategory = (idx) => {
        if (confirm(`Удалить категорию "${categories[idx]}"?`)) {
            categories.splice(idx, 1);
            localStorage.setItem('fleet_custom_categories', JSON.stringify(categories));
            renderCategoriesModalList();
            renderCategoriesBar();
            renderFleet();
        }
    };
}

window.openTasksModalForm = (vehicleId, vehicleName) => {
    const modal = document.getElementById('tasksModal');
    if (!modal) return;
    modal.classList.remove('hidden');
    document.getElementById('taskVehicleId').value = vehicleId;
    document.getElementById('taskVehicleName').value = vehicleName;
    document.getElementById('tasksModalSubtitle').innerText = `Техника: ${vehicleName}`;
    document.getElementById('newTaskText').value = "";
    renderTasksListInsideModal();
};

function renderTasksListInsideModal() {
    const vId = parseInt(document.getElementById('taskVehicleId').value);
    const list = document.getElementById('vehicleTasksList');
    if (!list) return;
    const vTasks = tasks.filter(t => t.vehicle_id === vId);
    if (vTasks.length === 0) {
        list.innerHTML = `<div class="text-center text-gray-400 py-3 text-xs font-medium">Нет активных задач</div>`;
        return;
    }
    list.innerHTML = vTasks.map(t => `
        <div class="flex items-center justify-between bg-amber-50 border border-amber-200 p-2 rounded-lg text-xs text-amber-950 font-medium">
            <span>${t.text}</span>
            <button onclick="window.completeTask(${t.id})" class="text-emerald-700 font-bold hover:underline">Готово</button>
        </div>
    `).join('');
}

window.addVehicleTask = async () => {
    const vId = document.getElementById('taskVehicleId').value;
    const vName = document.getElementById('taskVehicleName').value;
    const textInput = document.getElementById('newTaskText');
    if (!textInput || !textInput.value.trim() || !window._supabase) return;

    try {
        await window._supabase.from('vehicle_tasks').insert([{ vehicle_id: parseInt(vId), vehicle_name: vName, text: textInput.value.trim(), is_completed: false }]);
        textInput.value = "";
        await loadAllData();
        renderTasksListInsideModal();
    } catch (e) { console.error(e); }
};

window.completeTask = async (taskId) => {
    if (!window._supabase) return;
    try {
        await window._supabase.from('vehicle_tasks').update({ is_completed: true }).eq('id', taskId);
        await loadAllData();
        const modal = document.getElementById('tasksModal');
        if (modal && !modal.classList.contains('hidden')) renderTasksListInsideModal();
    } catch (e) { console.error(e); }
};