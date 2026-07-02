export const template = `
    <div class="mb-5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 bg-white p-5 rounded-xl border-2 border-gray-400/80 shadow-xs">
    <div class="space-y-0.5">
        <h2 class="text-xl font-bold text-gray-950 tracking-tight">Управление автопарком</h2>
        <p class="text-xs text-gray-600 font-medium">Учет техники, закрепление водителей, контроль документов и логов ремонта</p>
    </div>
    
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full xl:w-auto">
        <button id="manageDriversBtn" onclick="window.openDriversModal()" class="bg-white hover:bg-gray-50 border-2 border-gray-400 text-gray-800 px-3 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition shadow-2xs whitespace-nowrap">
            👤 Водители
        </button>
        <button id="manageTagsBtn" onclick="window.openTagsModal()" class="bg-white hover:bg-gray-50 border-2 border-gray-400 text-gray-800 px-3 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition shadow-2xs whitespace-nowrap">
            🏷️ Теги
        </button>
        <button id="manageCatsBtn" onclick="window.openCategoriesModal()" class="bg-white hover:bg-gray-50 border-2 border-gray-400 text-gray-800 px-3 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition shadow-2xs whitespace-nowrap">
            Категории
        </button>
        <button id="addVehicleBtn" onclick="window.openVehicleModalForm()" class="bg-emerald-600 hover:bg-emerald-700 border-2 border-emerald-700 text-white px-3 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition shadow-sm whitespace-nowrap">
            + карта
        </button>
    </div>
</div>

    <div class="bg-white p-4 rounded-xl border-2 border-gray-400/80 shadow-xs space-y-3 mb-5">
        <div class="flex flex-col sm:flex-row gap-3">
            <input type="text" id="vehicleSearchInput" class="flex-1 bg-gray-50 border-2 border-gray-400 rounded-lg p-2.5 text-xs text-gray-950 placeholder-gray-500 focus:outline-none focus:border-emerald-600 focus:bg-white font-bold transition" placeholder="Поиск по модели, госномеру, инвентарному, VIN, водителю или тегу...">
            <select id="sortSelect" onchange="window.handleSortChange(this.value)" class="bg-white border-2 border-gray-400 rounded-lg p-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-emerald-600">
                <option value="name_asc">По названию (А-Я)</option>
                <option value="name_desc">По названию (Я-А)</option>
                <option value="hours_desc">По наработке (сначала max)</option>
            </select>
        </div>
        
        <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200" id="fleetCategoriesBar">
            <div class="text-xs text-gray-400 font-bold">Загрузка категорий...</div>
        </div>
    </div>

    <div id="fleetGridContainer" class="space-y-6">
        <div class="text-center text-gray-500 py-10 text-xs font-bold">Загрузка данных автопарка...</div>
    </div>

    <div id="vFormModal" class="fixed inset-0 bg-gray-900/40 backdrop-blur-xs hidden z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl w-full max-w-md p-6 border-2 border-gray-400 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 id="vModalTitle" class="text-sm font-bold text-gray-950 border-b-2 border-gray-200 pb-2">Карточка техники</h3>
            <form id="vForm" class="space-y-3.5 text-xs">
                <input type="hidden" id="vId">
                
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-gray-700 mb-1 font-bold">Категория</label>
                        <select id="vCategory" required class="w-full bg-gray-50 border-2 border-gray-400 rounded-lg p-2 font-bold focus:outline-none focus:border-emerald-600"></select>
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-1 font-bold">Модель / Название</label>
                        <input type="text" id="vName" required class="w-full bg-gray-50 border-2 border-gray-400 rounded-lg p-2 font-bold focus:outline-none focus:border-emerald-600" placeholder="МТЗ-3522">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-gray-700 mb-1 font-bold">Закрепленный водитель</label>
                        <select id="vDriver" class="w-full bg-gray-50 border-2 border-gray-400 rounded-lg p-2 font-bold focus:outline-none focus:border-emerald-600"></select>
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-1 font-bold">Наработка (м/ч)</label>
                        <input type="number" id="vHours" required class="w-full bg-gray-50 border-2 border-gray-400 rounded-lg p-2 font-bold focus:outline-none focus:border-emerald-600" placeholder="0">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-2.5">
                    <div>
                        <label class="block text-gray-700 mb-1 font-bold">Госномер</label>
                        <input type="text" id="vPlate" class="w-full bg-gray-50 border-2 border-gray-400 rounded-lg p-2 font-mono font-bold focus:border-emerald-600" placeholder="1234 AB-7">
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-1 font-bold">Инвентарный №</label>
                        <input type="text" id="vInv" class="w-full bg-gray-50 border-2 border-gray-400 rounded-lg p-2 font-mono font-bold focus:border-emerald-600" placeholder="00125">
                    </div>
                </div>

                <div>
                    <label class="block text-gray-700 mb-1 font-bold">VIN / Заводской номер</label>
                    <input type="text" id="vVin" class="w-full bg-gray-50 border-2 border-gray-400 rounded-lg p-2 font-mono font-bold focus:border-emerald-600" placeholder="Номер рамы или кузова">
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-gray-700 mb-1 font-bold">Техосмотр (до)</label>
                        <input type="date" id="vToDate" class="w-full bg-gray-50 border-2 border-gray-400 rounded-lg p-2 font-bold focus:border-emerald-600">
                    </div>
                    <div>
                        <label class="block text-gray-700 mb-1 font-bold">Страховка (до)</label>
                        <input type="date" id="vInsuranceDate" class="w-full bg-gray-50 border-2 border-gray-400 rounded-lg p-2 font-bold focus:border-emerald-600">
                    </div>
                </div>

                <div>
                    <label class="block text-gray-700 mb-1 font-bold">Теги статусов (Неограниченно)</label>
                    <div id="tagsCheckboxContainer" class="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg border-2 border-gray-300 max-h-32 overflow-y-auto"></div>
                </div>

                <div class="flex gap-2.5 pt-3 border-t border-gray-200">
                    <button type="button" onclick="window.closeVModal()" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg font-bold transition border border-gray-300">Отмена</button>
                    <button type="submit" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-bold transition shadow-xs">Сохранить</button>
                </div>
                <button type="button" id="vDeleteBtn" class="w-full bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg font-bold transition hidden border border-red-300">Удалить из базы данных</button>
            </form>
        </div>
    </div>

    <div id="driversManagementModal" class="fixed inset-0 bg-gray-900/40 backdrop-blur-xs hidden z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl w-full max-w-xs p-5 border-2 border-gray-400 shadow-2xl space-y-4">
            <h3 class="text-xs font-bold text-gray-950 border-b-2 border-gray-200 pb-1.5">👤 Список водителей предприятия</h3>
            <div class="space-y-1.5 max-h-44 overflow-y-auto" id="modalDriversList"></div>
            <div class="pt-2 border-t border-gray-200 space-y-2">
                <input type="text" id="newDriverNameInput" class="w-full bg-gray-50 border-2 border-gray-400 rounded-lg p-2 text-xs font-bold focus:outline-none focus:border-emerald-600" placeholder="ФИО водителя (например, Ладутько И.И.)...">
                <button onclick="window.addCustomDriver()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-lg text-xs font-bold transition">Добавить водителя</button>
            </div>
            <button onclick="document.getElementById('driversManagementModal').classList.add('hidden')" class="w-full bg-gray-100 text-gray-700 py-1.5 rounded-lg text-xs font-bold transition border border-gray-300">Закрыть</button>
        </div>
    </div>

    <div id="tagsManagementModal" class="fixed inset-0 bg-gray-900/40 backdrop-blur-xs hidden z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl w-full max-w-xs p-5 border-2 border-gray-400 shadow-2xl space-y-4">
            <h3 class="text-xs font-bold text-gray-950 border-b-2 border-gray-200 pb-1.5">🏷️ Управление тегами статусов</h3>
            <div class="space-y-1.5 max-h-44 overflow-y-auto" id="modalTagsList"></div>
            <div class="pt-2 border-t border-gray-200 space-y-2">
                <input type="text" id="newTagNameInput" class="w-full bg-gray-50 border-2 border-gray-400 rounded-lg p-2 text-xs font-bold focus:outline-none focus:border-emerald-600" placeholder="Название статуса (например, В ремонте)...">
                <div class="flex items-center gap-2">
                    <label class="text-[10px] text-gray-500 font-bold uppercase">Цвет метки:</label>
                    <input type="color" id="newTagColorInput" value="#e2e8f0" class="w-8 h-8 rounded border border-gray-300 cursor-pointer">
                </div>
                <button onclick="window.addCustomTag()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-lg text-xs font-bold transition">Создать тег</button>
            </div>
            <button onclick="document.getElementById('tagsManagementModal').classList.add('hidden')" class="w-full bg-gray-100 text-gray-700 py-1.5 rounded-lg text-xs font-bold transition border border-gray-300">Закрыть</button>
        </div>
    </div>

    <div id="categoriesModal" class="fixed inset-0 bg-gray-900/40 backdrop-blur-xs hidden z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl w-full max-w-xs p-5 border-2 border-gray-400 shadow-2xl space-y-4">
            <h3 class="text-xs font-bold text-gray-950 border-b-2 border-gray-200 pb-1.5">Настройка категорий</h3>
            <div class="space-y-1.5 max-h-40 overflow-y-auto" id="modalCategoriesList"></div>
            <div class="pt-2 border-t border-gray-200 space-y-1.5">
                <input type="text" id="newCatInput" class="w-full bg-gray-50 border-2 border-gray-400 rounded-lg p-2 text-xs font-bold focus:outline-none focus:border-emerald-600" placeholder="Новая категория...">
                <button onclick="window.addCustomCategory()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-lg text-xs font-bold transition">Добавить</button>
            </div>
            <button onclick="document.getElementById('categoriesModal').classList.add('hidden')" class="w-full bg-gray-100 text-gray-700 py-1.5 rounded-lg text-xs font-bold transition border border-gray-300">Закрыть</button>
        </div>
    </div>

    <div id="tasksModal" class="fixed inset-0 bg-gray-900/40 backdrop-blur-xs hidden z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl w-full max-w-sm p-5 border-2 border-gray-400 shadow-2xl space-y-4">
            <div class="space-y-0.5">
                <h3 id="tasksModalTitle" class="text-sm font-bold text-gray-950">Задачи по технике</h3>
                <p class="text-xs text-gray-600 font-medium" id="tasksModalSubtitle"></p>
            </div>
            <input type="hidden" id="taskVehicleId">
            <input type="hidden" id="taskVehicleName">
            <div class="space-y-2 max-h-44 overflow-y-auto" id="vehicleTasksList"></div>
            <div class="pt-2 border-t border-gray-200 space-y-1.5">
                <textarea id="newTaskText" rows="2" class="w-full bg-gray-50 border-2 border-gray-400 rounded-lg p-2 text-xs font-bold focus:outline-none focus:border-emerald-600" placeholder="Записать задачу..."></textarea>
                <button onclick="window.addVehicleTask()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-xs font-bold transition shadow-xs">Добавить задачу</button>
            </div>
            <button onclick="document.getElementById('tasksModal').classList.add('hidden')" class="w-full bg-gray-100 text-gray-700 py-1.5 rounded-lg text-xs font-bold transition border border-gray-300">Закрыть</button>
        </div>
    </div>
`;

// Динамические массивы данных синхронизируются напрямую с Supabase
let vehicles = [];
let tasks = [];
let categories = [];
let drivers = [];
let baseTags = [];

let searchQuery = "";
let selectedCategory = "all";
let currentSort = "name_asc";
let refreshIntervalId = null;

export async function init() {
    const searchInput = document.getElementById('vehicleSearchInput');
    if (searchInput) {
        searchInput.value = searchQuery;
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
    window.openTagsModal = () => renderTagsModalList();
    window.openDriversModal = () => renderDriversModalList();
    
    window.handleSortChange = (val) => {
        currentSort = val;
        renderFleet();
    };

    // Первая жесткая загрузка данных
    await loadAllData(true);

    // Полный цикл синхронизации каждые 5 секунд
    if (refreshIntervalId) clearInterval(refreshIntervalId);
    refreshIntervalId = setInterval(() => loadAllData(false), 5000);
}

async function loadAllData(isFirstLoad = false) {
    if (!window._supabase) return;
    try {
        // Запрашиваем все связанные таблицы параллельно (быстрее и эффективнее)
        const [resVehicles, resTasks, resDrivers, resCategories, resTags] = await Promise.all([
            window._supabase.from('vehicles').select('*'),
            window._supabase.from('vehicle_tasks').select('*').eq('is_completed', false),
            window._supabase.from('fleet_drivers').select('*'),
            window._supabase.from('fleet_categories').select('*'),
            window._supabase.from('fleet_tags').select('*')
        ]);

        if (!resVehicles.error && resVehicles.data) vehicles = resVehicles.data;
        if (!resTasks.error && resTasks.data) tasks = resTasks.data;
        
        // Маппинг данных из новых таблиц
        if (!resDrivers.error && resDrivers.data) {
            drivers = resDrivers.data.map(d => d.name);
        }
        if (!resCategories.error && resCategories.data) {
            categories = resCategories.data.map(c => c.name);
        }
        // Гарантируем наличие дефолтной категории
        if (!categories.includes("Без категории")) categories.push("Без категории");

        if (!resTags.error && resTags.data) {
            baseTags = resTags.data.map(t => ({ id: t.id, name: t.name, color: t.color || '#e2e8f0' }));
        }

        // Если в процессе работы у ТС в БД прописана категория, которой нет в списке fleet_categories, добавляем её
        vehicles.forEach(v => {
            const typeName = v.type || "Без категории";
            if (!categories.map(c => c.toLowerCase()).includes(typeName.toLowerCase())) {
                categories.push(typeName);
            }
        });

        if (isFirstLoad) {
            renderCategoriesBar();
        } else {
            // Мягко обновляем бары и открытые модалки, чтобы не сбивать фокус пользователя
            renderCategoriesBar();
            if (!document.getElementById('driversManagementModal').classList.contains('hidden')) updateDriversDOMList();
            if (!document.getElementById('tagsManagementModal').classList.contains('hidden')) updateTagsDOMList();
            if (!document.getElementById('categoriesModal').classList.contains('hidden')) updateCategoriesDOMList();
        }
        renderFleet();
    } catch (e) {
        console.error("Ошибка синхронизации данных автопарка:", e);
    }
}

function renderCategoriesBar() {
    const bar = document.getElementById('fleetCategoriesBar');
    if (!bar) return;

    const isAllActive = selectedCategory === 'all';
    const isNoCatActive = selectedCategory.toLowerCase() === 'без категории';
    const isOtherActive = !isAllActive && !isNoCatActive;

    const otherCats = categories.filter(c => c !== 'Без категории');

    let html = `
        <button onclick="window.filterCategory('all')" class="px-3 py-1 text-xs font-bold rounded-md transition border-2 ${isAllActive ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-gray-50 border-gray-400 text-gray-900 hover:bg-gray-100'}">Все</button>
        <button onclick="window.filterCategory('Без категории')" class="px-3 py-1 text-xs font-bold rounded-md transition border-2 ${isNoCatActive ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-gray-50 border-gray-400 text-gray-900 hover:bg-gray-100'}">Без категории</button>
        
        <div class="relative inline-block">
            <select onchange="window.filterCategory(this.value)" class="px-2 py-1 text-xs font-bold rounded-md transition border-2 bg-gray-50 ${isOtherActive ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-black' : 'border-gray-400 text-gray-900 hover:bg-gray-100'}">
                <option value="" disabled ${!isOtherActive ? 'selected' : ''}>— Другие категории (${otherCats.length}) —</option>
                ${otherCats.map(c => `<option value="${c}" ${selectedCategory === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
        </div>
    `;

    bar.innerHTML = html;

    window.filterCategory = (cat) => {
        if (!cat) return;
        selectedCategory = cat;
        renderCategoriesBar();
        renderFleet();
    };
}

function renderFleet() {
    const container = document.getElementById('fleetGridContainer');
    if (!container) return;

    const searchInput = document.getElementById('vehicleSearchInput');
    if (searchInput) {
        searchQuery = searchInput.value.toLowerCase().trim();
    }

    let filtered = vehicles.filter(v => {
        const vType = v.type || "Без категории";
        const modelStr = v.model ? v.model.toLowerCase() : '';
        const plateStr = v.plate ? v.plate.toLowerCase() : '';
        const invStr = v.inv_number ? v.inv_number.toLowerCase() : '';
        const vinStr = v.vin_number ? v.vin_number.toLowerCase() : '';
        const tagsStr = v.tags ? v.tags.toLowerCase() : '';
        const driverStr = v.notes ? v.notes.toLowerCase() : ''; 

        const queryMatch = modelStr.includes(searchQuery) || plateStr.includes(searchQuery) || invStr.includes(searchQuery) || vinStr.includes(searchQuery) || tagsStr.includes(searchQuery) || driverStr.includes(searchQuery);
        if (!queryMatch) return false;
        
        if (selectedCategory !== 'all') {
            if (vType.toLowerCase() !== selectedCategory.toLowerCase()) return false;
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
                <h3 class="text-xs font-black text-gray-600 uppercase tracking-wider pl-0.5">${cat} — ${catList.length} ед.</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${catList.map(v => {
                        const now = new Date();
                        
                        const formatDocStatus = (dateStr) => {
                            if (!dateStr) return { text: '—', classes: 'text-gray-500 font-bold' };
                            const diffDays = Math.ceil((new Date(dateStr) - now) / (1000 * 60 * 60 * 24));
                            const formattedDate = new Date(dateStr).toLocaleDateString('ru-RU');
                            
                            if (diffDays <= 0) {
                                return { text: `${formattedDate} (Просрочено)`, classes: 'text-red-700 bg-red-50 border-2 border-red-300 px-2 py-0.5 rounded font-black text-[11px]' };
                            }
                            if (diffDays <= 30) {
                                return { text: `${formattedDate} (${diffDays} дн.)`, classes: 'text-amber-900 bg-amber-50 border-2 border-amber-400 px-2 py-0.5 rounded font-black text-[11px]' };
                            }
                            return { text: formattedDate, classes: 'text-gray-900 bg-gray-50 border-2 border-gray-300 px-2 py-0.5 rounded font-bold text-[11px]' };
                        };

                        const toInfo = formatDocStatus(v.inspection_date);
                        const insInfo = formatDocStatus(v.insurance_date);
                        const vehicleTagsArray = v.tags ? v.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
                        const vTasks = tasks.filter(t => t.vehicle_id === v.id);
                        const safeVehicleJson = JSON.stringify(v).replace(/"/g, '&quot;').replace(/'/g, '&#39;');

                        return `
                            <div class="relative bg-white border-2 border-gray-400 rounded-xl p-4 shadow-2xs hover:border-emerald-600 transition flex flex-col justify-between">
                                
                                ${v.inv_number ? `
                                    <div class="absolute top-4 right-4 bg-gray-100 text-[11px] text-gray-900 px-2 py-0.5 rounded border-2 border-gray-400 font-mono font-bold">
                                        Инв. №: ${v.inv_number}
                                    </div>
                                ` : ''}

                                <div class="space-y-3.5">
                                    <div class="space-y-1 pr-28">
                                        <h4 class="font-bold text-gray-950 text-sm tracking-tight truncate">${v.model}</h4>
                                        
                                        <div class="text-[11px] text-gray-600 font-bold flex items-center gap-1.5 mt-0.5">
                                            <span>👤 Водитель:</span>
                                            <span class="text-gray-950 font-black">${v.notes || 'Не закреплен'}</span>
                                        </div>

                                        <div class="flex flex-wrap gap-1 mt-1.5">
                                            ${vehicleTagsArray.map(t => {
                                                const knownTag = baseTags.find(bt => bt.name.toLowerCase() === t.toLowerCase());
                                                const badgeBg = knownTag ? knownTag.color : '#e2e8f0';
                                                return `<span style="background-color: ${badgeBg}" class="border-2 border-gray-400 text-gray-900 text-[9px] font-black px-1.5 py-0.2 rounded uppercase tracking-wider shadow-3xs">${t}</span>`;
                                            }).join('')}
                                        </div>
                                    </div>
                                    
                                    <div class="space-y-1">
                                        <div class="text-sm font-mono font-black text-gray-950 bg-gray-50 border-2 border-gray-900 inline-block px-3 py-1 rounded-md tracking-wider">
                                            ${v.plate || 'БЕЗ ГОСНОМЕРА'}
                                        </div>
                                        ${v.vin_number ? `
                                            <div class="text-[10px] font-mono font-bold text-gray-600 truncate" title="${v.vin_number}">
                                                VIN: ${v.vin_number}
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>

                                <div class="pt-3 mt-3 border-t-2 border-gray-200 text-[11px] space-y-2.5">
                                    <div class="space-y-1.5">
                                        <div class="flex justify-between items-center">
                                            <span class="text-gray-600 font-bold">Наработка:</span>
                                            <span class="font-black text-gray-950">${v.current_hours || 0} м/ч</span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <span class="text-gray-600 font-bold">Техосмотр:</span>
                                            <span class="${toInfo.classes}">${toInfo.text}</span>
                                        </div>
                                        <div class="flex justify-between items-center">
                                            <span class="text-gray-600 font-bold">Страховка:</span>
                                            <span class="${insInfo.classes}">${insInfo.text}</span>
                                        </div>
                                    </div>

                                    <div class="grid grid-cols-2 gap-2 pt-0.5">
                                        <button onclick="window.openVehicleModalForm(${safeVehicleJson})" class="w-full text-[11px] text-center font-bold text-gray-800 bg-gray-50 border-2 border-gray-400 rounded-md hover:bg-gray-100 transition py-1">
                                            Изменить
                                        </button>
                                        <button onclick="window.openTasksModalForm(${v.id}, '${v.model.replace(/'/g, "\\'")}')" class="w-full text-[11px] text-center font-bold text-emerald-800 bg-emerald-50 border-2 border-emerald-400 rounded-md hover:bg-emerald-100 transition py-1">
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

    container.innerHTML = html || `<div class="text-center text-gray-500 py-10 text-xs font-bold">Техника не найдена</div>`;
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

    const driverSelect = document.getElementById('vDriver');
    if (driverSelect) {
        driverSelect.innerHTML = `<option value="">— Не закреплен —</option>` + 
            drivers.map(d => `<option value="${d}">${d}</option>`).join('');
    }

    const tagsBox = document.getElementById('tagsCheckboxContainer');
    if (tagsBox) {
        tagsBox.innerHTML = baseTags.map(t => `
            <label style="background-color: ${t.color}" class="flex items-center gap-1.5 px-2.5 py-1 rounded border-2 border-gray-400 text-[11px] font-black text-gray-900 cursor-pointer select-none shadow-3xs">
                <input type="checkbox" name="vTags" value="${t.name}" class="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5">
                ${t.name}
            </label>
        `).join('');
    }

    document.getElementById('vForm').reset();
    modal.classList.remove('hidden');

    if (vehicle) {
        title.innerText = "Редактирование параметров техники";
        document.getElementById('vId').value = vehicle.id;
        document.getElementById('vCategory').value = vehicle.type || 'Без категории';
        document.getElementById('vName').value = vehicle.model || '';
        document.getElementById('vDriver').value = vehicle.notes || ''; 
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
        document.getElementById('vDriver').value = '';
        if (delBtn) delBtn.classList.add('hidden');
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
        notes: document.getElementById('vDriver').value, 
        plate: document.getElementById('vPlate').value,
        inv_number: document.getElementById('vInv').value,
        current_hours: parseInt(document.getElementById('vHours').value) || 0,
        vin_number: document.getElementById('vVin').value || null,
        inspection_date: document.getElementById('vToDate').value || null,
        insurance_date: document.getElementById('vInsuranceDate').value || null,
        tags: selectedTags.join(', ')
    };

    try {
        if (id) {
            await window._supabase.from('vehicles').update(payload).eq('id', id);
        } else {
            await window._supabase.from('vehicles').insert([payload]);
        }
        window.closeVModal();
        await loadAllData(true);
    } catch (e) { alert(e.message); }
}

async function handleDeleteVehicle() {
    const id = document.getElementById('vId').value;
    if (!id || !window._supabase) return;
    if (confirm("Вы точно хотите удалить технику?")) {
        try {
            await window._supabase.from('vehicles').delete().eq('id', id);
            window.closeVModal();
            await loadAllData(true);
        } catch (e) { alert(e.message); }
    }
}

// === УПРАВЛЕНИЕ СТАТУСНЫМИ ТЕГАМИ (SUPABASE) ===
function renderTagsModalList() {
    document.getElementById('tagsManagementModal').classList.remove('hidden');
    updateTagsDOMList();

    window.addCustomTag = async () => {
        const nameInput = document.getElementById('newTagNameInput');
        const colorInput = document.getElementById('newTagColorInput');
        if (!window._supabase || !nameInput || !nameInput.value.trim()) return;

        try {
            await window._supabase.from('fleet_tags').insert([{
                name: nameInput.value.trim(),
                color: colorInput.value
            }]);
            nameInput.value = "";
            await loadAllData(false);
        } catch (e) { console.error(e); }
    };

    window.deleteCustomTag = async (tagId) => {
        if (!window._supabase) return;
        const target = baseTags.find(t => t.id === tagId);
        if (target && confirm(`Удалить тег "${target.name}" из базы данных?`)) {
            try {
                await window._supabase.from('fleet_tags').delete().eq('id', tagId);
                await loadAllData(false);
            } catch (e) { console.error(e); }
        }
    };
}

function updateTagsDOMList() {
    const list = document.getElementById('modalTagsList');
    if (!list) return;
    list.innerHTML = baseTags.map(t => `
        <div class="flex items-center justify-between p-2 rounded-lg border-2 border-gray-300 text-xs font-bold bg-white shadow-3xs">
            <div class="flex items-center gap-2">
                <span class="w-3.5 h-3.5 rounded-full border border-gray-400" style="background-color: ${t.color}"></span>
                <span class="text-gray-900">${t.name}</span>
            </div>
            <button onclick="window.deleteCustomTag(${t.id})" class="text-red-600 hover:underline">Удалить</button>
        </div>
    `).join('');
}


// === УПРАВЛЕНИЕ ВОДИТЕЛЯМИ (SUPABASE) ===
function renderDriversModalList() {
    document.getElementById('driversManagementModal').classList.remove('hidden');
    updateDriversDOMList();

    window.addCustomDriver = async () => {
        const input = document.getElementById('newDriverNameInput');
        if (!window._supabase || !input || !input.value.trim()) return;

        try {
            await window._supabase.from('fleet_drivers').insert([{ name: input.value.trim() }]);
            input.value = "";
            await loadAllData(false);
        } catch (e) { console.error(e); }
    };

    window.deleteCustomDriver = async (driverName) => {
        if (!window._supabase) return;
        if (confirm(`Удалить водителя "${driverName}" из базы данных?`)) {
            try {
                await window._supabase.from('fleet_drivers').delete().eq('name', driverName);
                await loadAllData(false);
            } catch (e) { console.error(e); }
        }
    };
}

function updateDriversDOMList() {
    const list = document.getElementById('modalDriversList');
    if (!list) return;
    list.innerHTML = drivers.map(d => `
        <div class="flex items-center justify-between p-2 rounded-lg border-2 border-gray-300 text-xs font-bold bg-white shadow-3xs">
            <span class="text-gray-900">👤 ${d}</span>
            <button onclick="window.deleteCustomDriver('${d.replace(/'/g, "\\'")}')" class="text-red-600 hover:underline">Удалить</button>
        </div>
    `).join('');
}


// === УПРАВЛЕНИЕ КАТЕГОРИЯМИ (SUPABASE) ===
function renderCategoriesModalList() {
    document.getElementById('categoriesModal').classList.remove('hidden');
    updateCategoriesDOMList();

    window.addCustomCategory = async () => {
        const input = document.getElementById('newCatInput');
        if (!window._supabase || !input || !input.value.trim()) return;

        try {
            await window._supabase.from('fleet_categories').insert([{ name: input.value.trim() }]);
            input.value = "";
            await loadAllData(false);
        } catch (e) { console.error(e); }
    };

    window.deleteCustomCategory = async (catName) => {
        if (!window._supabase) return;
        if (confirm(`Удалить категорию "${catName}"? Все машины из неё будут переведены в "Без категории".`)) {
            try {
                // Переводим технику каскадом, затем удаляем саму категорию
                await window._supabase.from('vehicles').update({ type: 'Без категории' }).eq('type', catName);
                await window._supabase.from('fleet_categories').delete().eq('name', catName);
                await loadAllData(false);
            } catch(err) { console.error("Ошибка удаления категории:", err); }
        }
    };
}

function updateCategoriesDOMList() {
    const list = document.getElementById('modalCategoriesList');
    if (!list) return;
    list.innerHTML = categories.map(c => `
        <div class="flex items-center justify-between bg-gray-50 p-2 rounded-lg border-2 border-gray-300 text-xs font-bold">
            <span class="text-gray-900">${c}</span>
            ${c !== 'Без категории' ? `<button onclick="window.deleteCustomCategory('${c.replace(/'/g, "\\'")}')" class="text-red-600 hover:underline">Удалить</button>` : ''}
        </div>
    `).join('');
}


// === РАБОТА С ЗАДАЧАМИ ===
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
        list.innerHTML = `<div class="text-center text-gray-500 py-3 text-xs font-bold">Нет активных задач</div>`;
        return;
    }
    list.innerHTML = vTasks.map(t => `
        <div class="flex items-center justify-between bg-amber-50 border-2 border-amber-300 p-2 rounded-lg text-xs text-amber-950 font-bold">
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
        await loadAllData(true);
        renderTasksListInsideModal();
    } catch (e) { console.error(e); }
};

window.completeTask = async (taskId) => {
    if (!window._supabase) return;
    try {
        await window._supabase.from('vehicle_tasks').update({ is_completed: true }).eq('id', taskId);
        await loadAllData(true);
        const modal = document.getElementById('tasksModal');
        if (modal && !modal.classList.contains('hidden')) renderTasksListInsideModal();
    } catch (e) { console.error(e); }
};