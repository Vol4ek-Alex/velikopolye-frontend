export const template = `
    <div class="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 backdrop-blur-md bg-white/60 p-4 rounded-2xl border border-white/40 shadow-sm">
        <div class="space-y-1">
            <h2 class="text-2xl font-black text-gray-800 tracking-tight">🚜 Управление автопарком</h2>
            <p class="text-xs text-gray-500 font-medium">Динамический учет, контроль ТО, страховки и логов запчастей</p>
        </div>
        <div class="flex flex-wrap gap-2">
            <button id="showProblemsBtn" onclick="window.toggleProblemsFilter()" class="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5">
                ⚠️ Проблемная техника
            </button>
            <button id="manageCatsBtn" onclick="window.openCategoriesModal()" class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2.5 rounded-xl text-xs font-bold transition shadow-sm hidden">
                ⚙️ Категории
            </button>
            <button id="addVehicleBtn" onclick="window.openVehicleModalForm()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm hidden">
                ➕ Добавить технику
            </button>
        </div>
    </div>

    <div class="space-y-4 mb-6 backdrop-blur-md bg-white/40 p-4 rounded-2xl border border-white/20 shadow-xs">
        <div class="flex flex-col sm:flex-row gap-3">
            <input type="text" id="vehicleSearchInput" class="flex-1 bg-white/80 border border-gray-200/60 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500 shadow-xs transition" placeholder="Поиск по модели, госномеру, инвентарному, VIN или тегам...">
            <select id="sortSelect" onchange="window.handleSortChange(this.value)" class="bg-white/80 border border-gray-200/60 rounded-xl p-3 text-sm font-bold text-gray-600 focus:outline-none">
                <option value="name_asc">🔤 По названию (А-Я)</option>
                <option value="name_desc">🔤 По названию (Я-А)</option>
                <option value="hours_desc">⏳ По наработке (max)</option>
            </select>
        </div>
        
        <div class="flex flex-wrap gap-1.5" id="fleetCategoriesBar">
            <div class="text-xs text-gray-400">Загрузка категорий...</div>
        </div>
    </div>

    <div id="fleetGridContainer" class="space-y-6">
        <div class="text-center text-gray-400 py-10 font-medium">Загрузка данных автопарка...</div>
    </div>

    <div id="vFormModal" class="fixed inset-0 bg-gray-900/40 backdrop-blur-xs hidden z-50 flex items-center justify-center p-4">
        <div class="bg-white/95 border border-white rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <h3 id="vModalTitle" class="text-lg font-black text-gray-800">Карточка техники</h3>
            <form id="vForm" class="space-y-4 text-sm">
                <input type="hidden" id="vId">
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Категория</label>
                        <select id="vCategory" required class="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none"></select>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Название / Модель</label>
                        <input type="text" id="vName" required class="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none" placeholder="МТЗ-3522">
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-3">
                    <div>
                        <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Госномер</label>
                        <input type="text" id="vPlate" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none" placeholder="1234 AB-7">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Инвентарный №</label>
                        <input type="text" id="vInv" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none" placeholder="00125">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Наработка (м/ч)</label>
                        <input type="number" id="vHours" required class="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none" placeholder="0">
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase mb-1">VIN / Заводской номер</label>
                    <input type="text" id="vVin" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none" placeholder="XTA210700...">
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Гостехосмотр (до)</label>
                        <input type="date" id="vToDate" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Страховка (до)</label>
                        <input type="date" id="vInsuranceDate" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 focus:outline-none">
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Теги состояния (выбери до 2-ух)</label>
                    <div id="tagsCheckboxContainer" class="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-xl border border-gray-100">
                        </div>
                </div>

                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="window.closeVModal()" class="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold text-xs">Отмена</button>
                    <button type="submit" class="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold text-xs shadow-md">Сохранить</button>
                </div>
                <button type="button" id="vDeleteBtn" class="w-full bg-red-50 text-red-600 py-2 rounded-xl text-xs font-bold hidden">🗑️ Полностью удалить технику</button>
            </form>
        </div>
    </div>

    <div id="categoriesModal" class="fixed inset-0 bg-gray-900/40 backdrop-blur-xs hidden z-50 flex items-center justify-center p-4">
        <div class="bg-white border border-gray-100 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <h3 class="text-base font-black text-gray-800">⚙️ Управление категориями</h3>
            <div class="space-y-2 max-h-48 overflow-y-auto" id="modalCategoriesList"></div>
            <div class="pt-2 border-t border-gray-100 space-y-2">
                <input type="text" id="newCatInput" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none" placeholder="Название новой категории...">
                <button onclick="window.addCustomCategory()" class="w-full bg-gray-800 text-white py-2 rounded-xl text-xs font-bold">➕ Добавить категорию</button>
            </div>
            <button onclick="document.getElementById('categoriesModal').classList.add('hidden')" class="w-full bg-gray-100 text-gray-500 py-2 rounded-xl text-xs font-bold mt-2">Закрыть</button>
        </div>
    </div>

    <div id="tasksModal" class="fixed inset-0 bg-gray-900/40 backdrop-blur-xs hidden z-50 flex items-center justify-center p-4">
        <div class="bg-white border border-gray-100 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div class="space-y-1">
                <h3 id="tasksModalTitle" class="text-base font-black text-gray-800">Задачи и запчасти</h3>
                <p class="text-xs text-gray-400 font-medium" id="tasksModalSubtitle"></p>
            </div>
            <input type="hidden" id="taskVehicleId">
            <input type="hidden" id="taskVehicleName">
            
            <div class="space-y-2 max-h-48 overflow-y-auto" id="vehicleTasksList"></div>
            
            <div class="pt-2 border-t border-gray-100 space-y-2">
                <textarea id="newTaskText" rows="2" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none" placeholder="Например: Заказать заднее стекло и комплект прокладок..."></textarea>
                <button onclick="window.addVehicleTask()" class="w-full bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold shadow-xs">📌 Добавить задачу на Главную</button>
            </div>
            <button onclick="document.getElementById('tasksModal').classList.add('hidden')" class="w-full bg-gray-100 text-gray-500 py-2 rounded-xl text-xs font-bold">Закрыть</button>
        </div>
    </div>
`;

let vehicles = [];
let tasks = [];
let categories = ["Тракторы", "Автомобили", "Комбайны", "Агрегаты"];
let baseTags = ["Готов", "В ремонте", "На хранении", "Гарантия"];

let searchQuery = "";
let selectedCategory = "all";
let filterProblemsOnly = false;
let currentSort = "name_asc";
let refreshIntervalId = null;

export async function init() {
    const savedCats = localStorage.getItem('fleet_custom_categories');
    if (savedCats) categories = JSON.parse(savedCats);

    const isAdmin = typeof window.isAdmin === 'function' && window.isAdmin();
    const addBtn = document.getElementById('addVehicleBtn');
    const manageCatsBtn = document.getElementById('manageCatsBtn');
    if (addBtn && isAdmin) addBtn.classList.remove('hidden');
    if (manageCatsBtn && isAdmin) manageCatsBtn.classList.remove('hidden');

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
                ? "bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                : "bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5";
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
        if (!vErr && vData) vehicles = vData;

        const { data: tData, error: tErr } = await window._supabase.from('vehicle_tasks').select('*').eq('is_completed', false);
        if (!tErr && tData) tasks = tData;

        renderCategoriesBar();
        renderFleet();
    } catch (e) {
        console.error("Сбой авто-синхронизации:", e);
    }
}

function renderCategoriesBar() {
    const bar = document.getElementById('fleetCategoriesBar');
    if (!bar) return;

    let html = `<button onclick="window.filterCategory('all')" id="cat_all" class="px-3.5 py-2 text-xs font-bold rounded-xl transition ${selectedCategory === 'all' ? 'bg-gray-800 text-white shadow-xs' : 'bg-white/80 border border-gray-200/50 text-gray-600 hover:bg-gray-50'}">Все</button>`;
    
    categories.forEach((cat, idx) => {
        const id = `cat_custom_${idx}`;
        html += `<button onclick="window.filterCategory('${cat}')" id="${id}" class="px-3.5 py-2 text-xs font-bold rounded-xl transition ${selectedCategory === cat ? 'bg-gray-800 text-white shadow-xs' : 'bg-white/80 border border-gray-200/50 text-gray-600 hover:bg-gray-50'}">${cat}</button>`;
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
        const queryMatch = v.model?.toLowerCase().includes(searchQuery) || 
                           v.plate?.toLowerCase().includes(searchQuery) || 
                           v.inv_number?.toLowerCase().includes(searchQuery) || 
                           v.vin_number?.toLowerCase().includes(searchQuery) ||
                           v.tags?.toLowerCase().includes(searchQuery);
        
        if (!queryMatch) return false;
        if (selectedCategory !== 'all' && v.type !== selectedCategory) return false;

        if (filterProblemsOnly) {
            let hasProblem = false;
            if (v.tags?.includes('Гарантия')) hasProblem = true;
            const now = new Date();
            if (v.inspection_date && (new Date(v.inspection_date) - now) / (1000*60*60*24) <= 15) hasProblem = true;
            if (v.insurance_date && (new Date(v.insurance_date) - now) / (1000*60*60*24) <= 15) hasProblem = true;
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

    if (filtered.length === 0) {
        container.innerHTML = `<div class="text-center text-gray-400 py-10 font-medium backdrop-blur-md bg-white/40 rounded-2xl border border-dashed border-gray-200">Техника не найдена</div>`;
        return;
    }

    let html = "";
    const activeCategories = selectedCategory === 'all' ? categories : [selectedCategory];

    activeCategories.forEach(cat => {
        const catList = filtered.filter(v => v.type === cat);
        if (catList.length === 0) return;

        html += `
            <div class="space-y-3">
                <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider pl-1">${cat} (${catList.length})</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${catList.map(v => {
                        const isAdmin = typeof window.isAdmin === 'function' && window.isAdmin();
                        const now = new Date();
                        
                        let toClass = "text-gray-800";
                        if (v.inspection_date) {
                            const days = (new Date(v.inspection_date) - now) / (1000*60*60*24);
                            if (days < 0) toClass = "text-red-600 font-black";
                            else if (days <= 15) toClass = "text-amber-600 font-black";
                        }

                        let insClass = "text-gray-800";
                        if (v.insurance_date) {
                            const days = (new Date(v.insurance_date) - now) / (1000*60*60*24);
                            if (days < 0) insClass = "text-red-600 font-black";
                            else if (days <= 15) insClass = "text-amber-600 font-black";
                        }

                        // Парсим теги из плоской строки базы данных
                        const vehicleTagsArray = v.tags ? v.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
                        const vTasks = tasks.filter(t => t.vehicle_id === v.id);

                        return `
                            <div class="backdrop-blur-md bg-white/70 border border-white/40 rounded-2xl p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4">
                                <div class="space-y-2">
                                    <div class="flex items-start justify-between gap-2">
                                        <div onclick="${isAdmin ? `window.openVehicleModalForm(${JSON.stringify(v).replace(/"/g, '&quot;')})` : ''}" class="${isAdmin ? 'cursor-pointer group' : ''}">
                                            <h4 class="font-black text-gray-900 text-base tracking-tight leading-tight ${isAdmin ? 'group-hover:text-emerald-600' : ''}">${v.model}</h4>
                                            <div class="text-[11px] text-gray-400 font-bold mt-0.5 tracking-wider uppercase">
                                                ${v.plate || 'б/н'} ${v.inv_number ? `• Инв. ${v.inv_number}` : ''}
                                            </div>
                                        </div>
                                        <div class="flex flex-col items-end gap-1">
                                            ${vehicleTagsArray.map(t => {
                                                let c = "bg-gray-100 text-gray-700";
                                                if (t === 'Готов') c = "bg-emerald-50 text-emerald-700 border border-emerald-100";
                                                if (t === 'В ремонте') c = "bg-red-50 text-red-700 border border-red-100";
                                                if (t === 'На хранении') c = "bg-amber-50 text-amber-700 border border-amber-100";
                                                if (t === 'Гарантия') c = "bg-blue-50 text-blue-700 border border-blue-100";
                                                return `<span class="${c} text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide">${t}</span>`;
                                            }).join('')}
                                        </div>
                                    </div>
                                    
                                    ${v.vin_number ? `<div class="text-[10px] font-mono bg-gray-50/60 p-1.5 rounded-lg border border-gray-100 text-gray-500 truncate" title="VIN: ${v.vin_number}">⚙️ VIN: ${v.vin_number}</div>` : ''}
                                    
                                    <div class="space-y-1">
                                        ${vTasks.map(t => `
                                            <div class="text-xs bg-amber-50/50 border border-amber-100 text-amber-900 p-2 rounded-xl flex items-center justify-between">
                                                <span class="font-medium line-clamp-2">📌 ${t.text}</span>
                                                ${isAdmin ? `<button onclick="window.completeTask(${t.id})" class="text-[10px] text-emerald-600 font-bold ml-1 hover:underline">Ок</button>` : ''}
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>

                                <div class="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-xs">
                                    <div>
                                        <span class="text-gray-400 block font-medium">Наработка:</span>
                                        <span class="font-bold text-gray-800">${v.current_hours || 0} м/ч</span>
                                    </div>
                                    <div>
                                        <span class="text-gray-400 block font-medium">Гостехосмотр:</span>
                                        <span class="${toClass}">${v.inspection_date ? new Date(v.inspection_date).toLocaleDateString('ru-RU') : '—'}</span>
                                    </div>
                                    <div class="pt-1">
                                        <span class="text-gray-400 block font-medium">Страховка:</span>
                                        <span class="${insClass}">${v.insurance_date ? new Date(v.insurance_date).toLocaleDateString('ru-RU') : '—'}</span>
                                    </div>
                                    <div class="pt-1 flex items-end justify-end">
                                        <button onclick="window.openTasksModalForm(${v.id}, '${v.model.replace(/'/g, "\\'")}')" class="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg hover:bg-emerald-100 transition">
                                            📝 Задачи (${vTasks.length})
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

    container.innerHTML = html;
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
            <label class="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 cursor-pointer select-none">
                <input type="checkbox" name="vTags" value="${t}" onchange="window.handleTagCheckboxLimit(this)" class="rounded text-emerald-600 focus:ring-emerald-500">
                ${t}
            </label>
        `).join('');
    }

    window.handleTagCheckboxLimit = (checkbox) => {
        const checked = document.querySelectorAll('input[name="vTags"]:checked');
        if (checked.length > 2) {
            checkbox.checked = false;
            alert("Можно выбрать не более 2-ух тегов одновременно!");
        }
    };

    document.getElementById('vForm').reset();
    modal.classList.remove('hidden');

    if (vehicle) {
        title.innerText = "✏️ Изменить параметры техники";
        document.getElementById('vId').value = vehicle.id;
        document.getElementById('vCategory').value = vehicle.type || '';
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
        title.innerText = "➕ Добавление новой техники";
        document.getElementById('vId').value = '';
        if (delBtn) delBtn.add ? delBtn.classList.add('hidden') : delBtn.className += ' hidden';
    }
}

async function handleFormSubmit() {
    if (!window._supabase) return;
    const id = document.getElementById('vId').value;
    
    const selectedTags = [];
    document.querySelectorAll('input[name="vTags"]:checked').forEach(cb => selectedTags.push(cb.value));

    const payload = {
        type: document.getElementById('vCategory').value,
        model: document.getElementById('vName').value,
        plate: document.getElementById('vPlate').value || null,
        inv_number: document.getElementById('vInv').value || null,
        current_hours: parseInt(document.getElementById('vHours').value) || 0,
        vin_number: document.getElementById('vVin').value || null,
        inspection_date: document.getElementById('vToDate').value || null,
        insurance_date: document.getElementById('vInsuranceDate').value || null,
        tags: selectedTags.join(', ') // Сохраняем как плоскую строку с запятыми под твой тип text
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
        alert("Ошибка работы с базой: " + e.message);
    }
}

async function handleDeleteVehicle() {
    const id = document.getElementById('vId').value;
    if (!id || !window._supabase) return;

    if (confirm("Вы точно хотите безвозвратно удалить данную машину из базы данных филиала?")) {
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
        <div class="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-xs font-bold">
            <span class="text-gray-800">${c}</span>
            <button onclick="window.deleteCustomCategory(${idx})" class="text-red-500 hover:underline">Удалить</button>
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
        list.innerHTML = `<div class="text-center text-gray-400 py-4 text-xs font-medium">Нет активных задач для этой машины</div>`;
        return;
    }

    list.innerHTML = vTasks.map(t => `
        <div class="flex items-center justify-between bg-amber-50 border border-amber-100 p-2.5 rounded-xl text-xs text-amber-900">
            <span class="font-semibold">${t.text}</span>
            <button onclick="window.completeTask(${t.id})" class="text-emerald-700 font-bold hover:underline">Выполнено</button>
        </div>
    `).join('');
}

window.addVehicleTask = async () => {
    const vId = document.getElementById('taskVehicleId').value;
    const vName = document.getElementById('taskVehicleName').value;
    const textInput = document.getElementById('newTaskText');
    
    if (!textInput || !textInput.value.trim() || !window._supabase) return;

    const newTask = {
        vehicle_id: parseInt(vId),
        vehicle_name: vName,
        text: textInput.value.trim(),
        is_completed: false
    };

    try {
        const { error } = await window._supabase.from('vehicle_tasks').insert([newTask]);
        if (error) throw error;
        textInput.value = "";
        await loadAllData();
        renderTasksListInsideModal();
    } catch (e) {
        alert("Ошибка сохранения задачи: " + e.message);
    }
};

window.completeTask = async (taskId) => {
    if (!window._supabase) return;
    try {
        const { error } = await window._supabase.from('vehicle_tasks').update({ is_completed: true }).eq('id', taskId);
        if (error) throw error;
        await loadAllData();
        const modal = document.getElementById('tasksModal');
        if (modal && !modal.classList.contains('hidden')) {
            renderTasksListInsideModal();
        }
    } catch (e) {
        console.error("Не удалось закрыть задачу:", e);
    }
};