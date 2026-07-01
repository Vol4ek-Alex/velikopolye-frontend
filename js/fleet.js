export const template = `
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h2 class="text-2xl font-bold text-gray-800">🚜 Автопарк филиала</h2>
            <p class="text-sm text-gray-500">Учет техники, наработки моточасов и статусов готовности</p>
        </div>
        <button id="addVehicleBtn" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm self-start sm:self-center hidden">
            ➕ Добавить технику
        </button>
    </div>

    <div class="space-y-4 mb-6">
        <input type="text" id="vehicleSearchInput" class="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500 shadow-sm" placeholder="Поиск по названию или госномеру (например, МТЗ, МАЗ, 1234)...">
        
        <div class="flex flex-wrap gap-2" id="categoryFilters">
            <button onclick="window.filterCategory('all')" id="cat_all" class="px-4 py-2 text-xs font-bold rounded-xl transition bg-gray-800 text-white shadow-sm">Все</button>
            <button onclick="window.filterCategory('Тракторы')" id="cat_tractors" class="px-4 py-2 text-xs font-bold rounded-xl transition bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">Тракторы</button>
            <button onclick="window.filterCategory('Автомобили')" id="cat_cars" class="px-4 py-2 text-xs font-bold rounded-xl transition bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">Автомобили</button>
            <button onclick="window.filterCategory('Комбайны')" id="cat_harvesters" class="px-4 py-2 text-xs font-bold rounded-xl transition bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">Комбайны</button>
            <button onclick="window.filterCategory('Агрегаты')" id="cat_implements" class="px-4 py-2 text-xs font-bold rounded-xl transition bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">Прицепные агрегаты</button>
        </div>
    </div>

    <div id="fleetContainer" class="space-y-8">
        <div class="text-center text-gray-400 py-10">Загрузка автопарка...</div>
    </div>

    <div id="vehicleModal" class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm hidden z-50 flex items-center justify-center p-4">
        <div class="bg-white border border-gray-100 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 id="modalTitle" class="text-lg font-bold text-gray-800">Техника</h3>
            <form id="vehicleForm" class="space-y-4">
                <input type="hidden" id="vehicleId">
                
                <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Категория техники</label>
                    <select id="vehicleCategory" required class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500">
                        <option value="Тракторы">Тракторы</option>
                        <option value="Автомобили">Автомобили / Погрузчики</option>
                        <option value="Комбайны">Комбайны</option>
                        <option value="Агрегаты">Прицепные агрегаты</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Название / Модель</label>
                    <input type="text" id="vehicleName" required class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500" placeholder="МТЗ-3522">
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Госномер</label>
                        <input type="text" id="vehiclePlate" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500" placeholder="1234 AB-7">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Инвентарный №</label>
                        <input type="text" id="vehicleInv" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500" placeholder="012345">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Наработка (м/ч или км)</label>
                        <input type="number" id="vehicleHours" required class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500" placeholder="4500">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Статус</label>
                        <select id="vehicleStatus" required class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500">
                            <option value="Готов">🟢 Готов</option>
                            <option value="В ремонте">🔴 В ремонте</option>
                            <option value="Консервация">🟡 Консервация</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Год выпуска</label>
                        <input type="number" id="vehicleYear" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500" placeholder="2022">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Дата Гостехосмотра</label>
                        <input type="date" id="vehicleToDate" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500">
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Закрепленный механизатор / Водитель</label>
                    <input type="text" id="vehicleDriver" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500" placeholder="Иванов И.И.">
                </div>

                <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Примечание (Ремонтный лог / Запчасти)</label>
                    <textarea id="vehicleNotes" rows="2" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500" placeholder="Замена поршневой, требуется техосмотр..."></textarea>
                </div>

                <div class="flex gap-3 pt-2">
                    <button type="button" id="closeModalBtn" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 rounded-xl font-bold transition text-sm">Отмена</button>
                    <button type="submit" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition text-sm shadow-md">Сохранить</button>
                </div>
                
                <button type="button" id="deleteVehicleBtn" class="w-full bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-xl text-xs font-bold transition hidden">
                    🗑️ Удалить единицу техники
                </button>
            </form>
        </div>
    </div>
`;

let vehicles = [];
let searchQuery = "";
let selectedCategory = "all";

export async function init() {
    searchQuery = "";
    selectedCategory = "all";
    
    // Безопасная инициализация кнопки добавления техники
    const addBtn = document.getElementById('addVehicleBtn');
    if (addBtn) {
        if (typeof window.isAdmin === 'function' && window.isAdmin()) {
            addBtn.classList.remove('hidden');
            addBtn.onclick = () => openModal();
        } else {
            addBtn.classList.add('hidden');
        }
    }

    // Безопасный поиск
    const searchInput = document.getElementById('vehicleSearchInput');
    if (searchInput) {
        searchInput.oninput = (e) => {
            searchQuery = e.target.value.toLowerCase();
            renderFleet();
        };
    }

    // Глобальные табы фильтрации
    window.filterCategory = (cat) => {
        selectedCategory = cat;
        const cats = ['all', 'Тракторы', 'Автомобили', 'Комбайны', 'Агрегаты'];
        const ids = ['cat_all', 'cat_tractors', 'cat_cars', 'cat_harvesters', 'cat_implements'];
        
        cats.forEach((c, idx) => {
            const btn = document.getElementById(ids[idx]);
            if (btn) {
                if (c === cat) {
                    btn.className = "px-4 py-2 text-xs font-bold rounded-xl transition bg-gray-800 text-white shadow-sm";
                } else {
                    btn.className = "px-4 py-2 text-xs font-bold rounded-xl transition bg-white border border-gray-200 text-gray-600 hover:bg-gray-50";
                }
            }
        });
        renderFleet();
    };

    // Привязка кнопок модального окна
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) closeModalBtn.onclick = closeModal;

    const form = document.getElementById('vehicleForm');
    if (form) form.onsubmit = handleFormSubmit;

    const deleteBtn = document.getElementById('deleteVehicleBtn');
    if (deleteBtn) deleteBtn.onclick = handleDelete;

    await loadData();
}

async function loadData() {
    try {
        if (!window._supabase) return;
        const { data, error } = await window._supabase
            .from('vehicles')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        vehicles = data || [];
    } catch (err) {
        console.error("Ошибка автопарка:", err.message);
    } finally {
        renderFleet();
    }
}

function renderFleet() {
    const container = document.getElementById('fleetContainer');
    if (!container) return;

    // Сначала фильтруем по строке поиска и выбранной категории
    const filtered = vehicles.filter(v => {
        const nameMatch = v.name?.toLowerCase().includes(searchQuery);
        const plateMatch = v.plate_number?.toLowerCase().includes(searchQuery);
        const invMatch = v.inventory_number?.toLowerCase().includes(searchQuery);
        const driverMatch = v.driver?.toLowerCase().includes(searchQuery);
        const matchesSearch = nameMatch || plateMatch || invMatch || driverMatch;

        if (selectedCategory === 'all') return matchesSearch;
        return matchesSearch && v.category === selectedCategory;
    });

    if (filtered.length === 0) {
        container.innerHTML = `<div class="text-center text-gray-400 py-10 font-medium">Техника не найдена</div>`;
        return;
    }

    // Группируем по категориям для красивого вывода
    const categories = ["Тракторы", "Автомобили", "Комбайны", "Агрегаты"];
    let htmlOutput = "";

    categories.forEach(cat => {
        const catVehicles = filtered.filter(v => v.category === cat);
        if (catVehicles.length === 0) return;

        htmlOutput += `
            <div class="space-y-3">
                <h3 class="text-sm font-black text-gray-400 uppercase tracking-wider pl-1">${cat} (${catVehicles.length})</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${catVehicles.map(v => {
                        let statusBadge = '';
                        if (v.status === 'В ремонте') statusBadge = '<span class="bg-red-50 text-red-700 border border-red-100 text-[11px] font-bold px-2 py-0.5 rounded-md">🔴 В ремонте</span>';
                        else if (v.status === 'Консервация') statusBadge = '<span class="bg-amber-50 text-amber-700 border border-amber-100 text-[11px] font-bold px-2 py-0.5 rounded-md">🟡 Консервация</span>';
                        else statusBadge = '<span class="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-bold px-2 py-0.5 rounded-md">🟢 Готов</span>';

                        // Рассчитываем предупреждение по техосмотру (если осталось меньше 15 дней)
                        let toWarning = '';
                        if (v.to_date) {
                            const daysLeft = Math.ceil((new Date(v.to_date) - new Date()) / (1000 * 60 * 60 * 24));
                            if (daysLeft < 0) toWarning = 'text-red-600 font-black';
                            else if (daysLeft <= 15) toWarning = 'text-amber-600 font-black';
                        }

                        const isClickable = typeof window.isAdmin === 'function' && window.isAdmin();

                        return `
                            <div ${isClickable ? `onclick="window.editVehicle(${v.id})"` : ''} class="${isClickable ? 'cursor-pointer hover:border-emerald-300 hover:shadow-md' : ''} bg-white border border-gray-200 rounded-2xl p-5 shadow-sm transition flex flex-col justify-between space-y-4">
                                <div class="flex items-start justify-between gap-2">
                                    <div>
                                        <h4 class="font-black text-gray-900 text-base tracking-tight leading-tight">${v.name}</h4>
                                        <div class="text-xs text-gray-400 font-bold mt-1 tracking-wider uppercase">${v.plate_number || 'б/н'} ${v.inventory_number ? `• Инв. ${v.inventory_number}` : ''}</div>
                                    </div>
                                    ${statusBadge}
                                </div>
                                
                                ${v.notes ? `<p class="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg line-clamp-2">${v.notes}</p>` : ''}

                                <div class="grid grid-cols-2 gap-2 pt-2 border-t border-gray-50 text-xs">
                                    <div>
                                        <span class="text-gray-400 block font-medium">Наработка:</span>
                                        <span class="font-bold text-gray-800 text-sm">${v.hours || 0} м/ч</span>
                                    </div>
                                    <div>
                                        <span class="text-gray-400 block font-medium">Гостехосмотр:</span>
                                        <span class="font-bold text-gray-800 ${toWarning}">${v.to_date ? new Date(v.to_date).toLocaleDateString('ru-RU') : '—'}</span>
                                    </div>
                                    <div class="col-span-full text-[11px] text-gray-400 font-medium truncate pt-1">
                                        👤 Экипаж: <span class="text-gray-600 font-semibold">${v.driver || 'Не закреплен'}</span> ${v.year ? `• ${v.year} г.в.` : ''}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    });

    container.innerHTML = htmlOutput;

    // Глобальный обработчик карточек
    window.editVehicle = (id) => {
        const target = vehicles.find(v => v.id === id);
        if (target) openModal(target);
    };
}

function openModal(vehicle = null) {
    const modal = document.getElementById('vehicleModal');
    const form = document.getElementById('vehicleForm');
    const title = document.getElementById('modalTitle');
    const delBtn = document.getElementById('deleteVehicleBtn');

    if (!modal || !form) return;

    form.reset();
    modal.classList.remove('hidden');

    if (vehicle) {
        title.innerText = "✏️ Редактировать технику";
        document.getElementById('vehicleId').value = vehicle.id;
        document.getElementById('vehicleCategory').value = vehicle.category || 'Тракторы';
        document.getElementById('vehicleName').value = vehicle.name || '';
        document.getElementById('vehiclePlate').value = vehicle.plate_number || '';
        document.getElementById('vehicleInv').value = vehicle.inventory_number || '';
        document.getElementById('vehicleHours').value = vehicle.hours || 0;
        
        // Перебиваем старый статус "В работе" на "Готов"
        document.getElementById('vehicleStatus').value = (vehicle.status === 'В работе' ? 'Готов' : vehicle.status) || 'Готов';
        
        document.getElementById('vehicleYear').value = vehicle.year || '';
        document.getElementById('vehicleToDate').value = vehicle.to_date || '';
        document.getElementById('vehicleDriver').value = vehicle.driver || '';
        document.getElementById('vehicleNotes').value = vehicle.notes || '';
        
        if (delBtn) delBtn.classList.remove('hidden');
    } else {
        title.innerText = "➕ Добавить технику";
        document.getElementById('vehicleId').value = '';
        document.getElementById('vehicleStatus').value = 'Готов';
        if (delBtn) delBtn.classList.add('hidden');
    }
}

function closeModal() {
    const modal = document.getElementById('vehicleModal');
    if (modal) modal.classList.add('hidden');
}

async function handleFormSubmit(e) {
    e.preventDefault();
    if (!window._supabase) return;

    const id = document.getElementById('vehicleId').value;
    const payload = {
        category: document.getElementById('vehicleCategory').value,
        name: document.getElementById('vehicleName').value,
        plate_number: document.getElementById('vehiclePlate').value,
        inventory_number: document.getElementById('vehicleInv').value,
        hours: parseInt(document.getElementById('vehicleHours').value) || 0,
        status: document.getElementById('vehicleStatus').value,
        year: parseInt(document.getElementById('vehicleYear').value) || null,
        to_date: document.getElementById('vehicleToDate').value || null,
        driver: document.getElementById('vehicleDriver').value,
        notes: document.getElementById('vehicleNotes').value
    };

    try {
        if (id) {
            const { error } = await window._supabase.from('vehicles').update(payload).eq('id', id);
            if (error) throw error;
        } else {
            const { error } = await window._supabase.from('vehicles').insert([payload]);
            if (error) throw error;
        }
        closeModal();
        await loadData();
    } catch (err) {
        alert("Ошибка сохранения: " + err.message);
    }
}

async function handleDelete() {
    const id = document.getElementById('vehicleId').value;
    if (!id || !window._supabase) return;

    if (confirm("Вы уверены, что хотите НАВСЕГДА удалить эту единицу техники?")) {
        try {
            const { error } = await window._supabase.from('vehicles').delete().eq('id', id);
            if (error) throw error;
            closeModal();
            await loadData();
        } catch (err) {
            alert("Ошибка удаления: " + err.message);
        }
    }
}