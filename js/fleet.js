export const template = `
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
            <h2 class="text-2xl font-bold text-gray-800">Сельхозтехника</h2>
            <p class="text-sm text-gray-500">Поиск, категории, контроль сроков, тегов и наработки (ТО)</p>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-stretch sm:items-center">
            <div class="relative flex-1 sm:w-64">
                <input type="text" id="fleetSearchInput" class="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 transition shadow-sm" placeholder="Поиск (модель, госномер, тег)...">
                <span class="absolute left-3.5 top-3 text-gray-400 text-sm">🔍</span>
            </div>
            
            <button id="filterDatesBtn" class="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-semibold px-4 py-2.5 rounded-xl text-sm transition shadow-sm flex justify-center items-center gap-2">
                ⚠️ Контроль сроков
            </button>
            <button id="addVehicleBtn" class="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition shadow-md flex justify-center items-center gap-2">
                ➕ Добавить технику
            </button>
        </div>
    </div>

    <div id="fleetCategoriesContainer" class="space-y-10">
        <div class="text-center text-gray-400 py-12">Загрузка машин из Supabase...</div>
    </div>

    <div id="vehicleModal" class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm hidden items-center justify-center p-4 z-50 overflow-y-auto">
        <div class="bg-white border border-gray-100 p-6 rounded-2xl w-full max-w-md shadow-2xl my-8">
            <div class="flex justify-between items-center mb-4">
                <h3 id="modalTitle" class="text-xl font-bold text-gray-800">Добавить технику</h3>
                <button type="button" id="deleteVehicleBtn" class="hidden text-sm font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition">
                    🗑️ Удалить
                </button>
            </div>
            
            <form id="vehicleForm" class="space-y-4">
                <input type="hidden" id="vehicleId">
                
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-gray-600 text-sm font-medium mb-1">Тип техники</label>
                        <select id="modalType" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 transition">
                            <option value="Тракторы">Трактор</option>
                            <option value="Погрузчики">Погрузчик</option>
                            <option value="Комбайны">Комбайн</option>
                            <option value="Грузовые автомобили">Грузовой автомобиль</option>
                            <option value="Легковые автомобили">Легковой автомобиль</option>
                            <option value="Агрегаты / Прицепы">Агрегат / Прицеп</option>
                            <option value="Прочее">Прочее</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-600 text-sm font-medium mb-1">Основной статус (Тег)</label>
                        <select id="vehicleStatus" required class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500">
                            <option value="Готов">🟢 Готов к работе</option>
                            <option value="В ремонте">🔴 В ремонте</option>
                            <option value="Консервация">🟡 На консервации</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label class="block text-gray-600 text-sm font-medium mb-1">Марка / Модель</label>
                    <input type="text" id="modalModel" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 focus:outline-none focus:border-emerald-500 transition" placeholder="Например, МТЗ-3522">
                </div>
                
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-gray-600 text-sm font-medium mb-1">Госномер</label>
                        <input type="text" id="modalPlate" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 focus:outline-none focus:border-emerald-500 transition" placeholder="1234 АВ-7">
                    </div>
                    <div>
                        <label class="block text-gray-600 text-sm font-medium mb-1">Инв. номер</label>
                        <input type="text" id="modalInvNumber" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 focus:outline-none focus:border-emerald-500 transition" placeholder="001024">
                    </div>
                </div>

                <div>
                    <label class="block text-gray-600 text-sm font-medium mb-1">VIN / Заводской номер</label>
                    <input type="text" id="modalVinNumber" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 focus:outline-none focus:border-emerald-500 transition" placeholder="Укажите VIN">
                </div>

                <div id="warrantyHoursBlock" class="hidden p-4 bg-orange-50 border border-orange-200 rounded-xl grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-orange-800 text-xs font-bold mb-1">Текущая наработка (м/ч)</label>
                        <input type="number" id="modalCurrentHours" class="w-full bg-white border border-orange-300 rounded-lg p-2 text-sm text-gray-900 focus:outline-none focus:border-orange-500">
                    </div>
                    <div>
                        <label class="block text-orange-800 text-xs font-bold mb-1">Следующее ТО при (м/ч)</label>
                        <input type="number" id="modalNextToHours" class="w-full bg-white border border-orange-300 rounded-lg p-2 text-sm text-gray-900 focus:outline-none focus:border-orange-500" placeholder="Например, 250">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-gray-600 text-sm font-medium mb-1">📅 Техосмотр до</label>
                        <input type="date" id="modalInspection" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 transition">
                    </div>
                    <div>
                        <label class="block text-gray-600 text-sm font-medium mb-1">📜 Страховка до</label>
                        <input type="date" id="modalInsurance" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 transition">
                    </div>
                </div>
                
                <div class="flex gap-3 pt-2">
                    <button type="button" id="closeModalBtn" class="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition">Отмена</button>
                    <button type="submit" class="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition shadow-md">Сохранить</button>
                </div>
            </form>
        </div>
    </div>
`;

let allVehicles = [];
let isFilterActive = false;
let searchQuery = "";

export function init() {
    isFilterActive = false;
    searchQuery = "";
    loadFleetData();

    // БЕЗОПАСНАЯ ПРОВЕРКА: Вешаем события только если элементы есть на экране
    const searchInput = document.getElementById('vehicleSearchInput');
    if (searchInput) {
        searchInput.oninput = (e) => {
            searchQuery = e.target.value;
            renderCategorizedGrid();
        };
    }

    const statusSelect = document.getElementById('vehicleStatusSelect'); // или твой селект
    if (statusSelect) {
        statusSelect.onchange = (e) => {
            // Твоя логика фильтрации по статусу
            renderCategorizedGrid();
        };
    }

    const addBtn = document.getElementById('addVehicleBtn');
    if (addBtn) {
        if (typeof window.isAdmin === 'function' && window.isAdmin()) {
            addBtn.onclick = () => openVehicleModal();
        } else {
            addBtn.classList.add('hidden');
        }
    }

    // Проверяем остальные кнопки модального окна
    const closeBtn = document.getElementById('closeModalBtn');
    if (closeBtn) closeBtn.onclick = () => closeVehicleModal();

    const form = document.getElementById('vehicleForm');
    if (form) form.onsubmit = (e) => handleFormSubmit(e);

    const deleteBtn = document.getElementById('deleteVehicleBtn');
    if (deleteBtn) deleteBtn.onclick = () => handleDeleteVehicle();
}

function toggleWarrantyInputs(status) {
    const block = document.getElementById('warrantyHoursBlock');
    if (status === 'Гарантия') {
        block.classList.remove('hidden');
    } else {
        block.classList.add('hidden');
    }
}

function formatDate(dateString) {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU');
}

function getDateBadge(dateString) {
    if (!dateString) return { text: '—', classes: 'text-gray-700' };
    const diffDays = Math.ceil((new Date(dateString) - new Date()) / (1000 * 60 * 60 * 24));
    const formattedDate = new Date(dateString).toLocaleDateString('ru-RU');

    if (diffDays <= 0) return { text: `${formattedDate} (Истек)`, classes: 'text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded' };
    if (diffDays <= 30) return { text: `${formattedDate} (${diffDays} дн.)`, classes: 'text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.5 rounded' };
    return { text: formattedDate, classes: 'text-gray-700 font-medium' };
}

// Рендеринг тегов-бейджников на карточке техники
function getStatusTagMarkup(tag) {
    if (!tag) return '';
    let classes = "bg-gray-100 text-gray-700";
    if (tag === 'Готов') classes = "bg-green-50 text-green-700 border border-green-200 font-semibold";
    if (tag === 'В работе') classes = "bg-blue-50 text-blue-700 border border-blue-200";
    if (tag === 'В ремонте') classes = "bg-red-50 text-red-700 border border-red-200 font-bold";
    if (tag === 'Гарантия') classes = "bg-orange-50 text-orange-700 border border-orange-200 font-bold animate-pulse";
    
    return `<span class="text-[11px] px-2 py-0.5 rounded-full ${classes}">${tag}</span>`;
}

async function loadFleetData() {
    const container = document.getElementById('fleetCategoriesContainer');
    if (!container) return;
    try {
        const { data, error } = await window._supabase.from('vehicles').select('*');
        if (error) throw error;
        allVehicles = data || [];
        filterAndRender();
    } catch (e) {
        container.innerHTML = `<div class="text-red-500 p-4 bg-red-50 rounded-xl border border-red-200">Ошибка: ${e.message}</div>`;
    }
}

function filterAndRender() {
    let filtered = [...allVehicles];
    if (isFilterActive) {
        const today = new Date();
        filtered = filtered.filter(v => {
            const check = d => d && Math.ceil((new Date(d) - today) / (1000 * 60 * 60 * 24)) <= 30;
            return check(v.inspection_date) || check(v.insurance_date);
        });
    }
    if (searchQuery) {
        filtered = filtered.filter(v => 
            (v.model && v.model.toLowerCase().includes(searchQuery)) ||
            (v.plate && v.plate.toLowerCase().includes(searchQuery)) ||
            (v.inv_number && v.inv_number.toLowerCase().includes(searchQuery)) ||
            (v.tags && v.tags.toLowerCase().includes(searchQuery)) ||
            (v.type && v.type.toLowerCase().includes(searchQuery))
        );
    }
    renderCategorizedGrid(filtered);
}

function renderCategorizedGrid(vehiclesList) {
    const container = document.getElementById('fleetCategoriesContainer');
    if (!container) return;

    if (vehiclesList.length === 0) {
        container.innerHTML = `<div class="text-center text-gray-400 py-12">Техники по заданным критериям не найдено.</div>`;
        return;
    }

    const categories = {};
    vehiclesList.forEach(v => {
        // Если у техники тег "Гарантия", переносим её в выделенную скрытую/нижнюю категорию
        const catName = v.tags === 'Гарантия' ? '📋 Гарантийная техника (Контроль наработки)' : (v.type || "Прочее");
        if (!categories[catName]) categories[catName] = [];
        categories[catName].push(v);
    });

    container.innerHTML = Object.keys(categories).sort((a,b) => b.includes('Гарантийная') ? -1 : a.localeCompare(b)).map(catName => {
        const list = categories[catName];
        return `
            <div class="space-y-4">
                <div class="border-b border-gray-200 pb-2 flex justify-between items-center">
                    <h3 class="text-lg font-bold text-gray-700 flex items-center gap-2">${catName}</h3>
                    <span class="text-xs font-semibold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">${list.length} шт.</span>
                </div>
                
                <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    ${list.map(v => {
                        const inspectionBadge = getDateBadge(v.inspection_date);
                        const insuranceBadge = getDateBadge(v.insurance_date);
                        
                        // Логика расчета остатка моточасов до ТО
                        let hoursMarkup = '';
                        if (v.tags === 'Гарантия' && v.current_hours) {
                            const nextTo = v.next_to_hours || 0;
                            const left = nextTo - v.current_hours;
                            const leftColor = left <= 80 ? 'text-red-600 font-bold bg-red-50' : 'text-emerald-600 font-bold bg-emerald-50';
                            hoursMarkup = `
                                <div class="mt-2 p-2 bg-orange-50/60 rounded-xl border border-orange-100 text-xs space-y-1">
                                    <p class="flex justify-between"><span>Наработка:</span> <span class="font-mono text-gray-700 font-semibold">${v.current_hours} м/ч</span></p>
                                    <p class="flex justify-between"><span>До ТО (${nextTo}):</span> <span class="font-mono px-1 rounded ${leftColor}">${left > 0 ? left + ' м/ч' : 'Срочно ТО!'}</span></p>
                                </div>
                            `;
                        }

                        return `
                            <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between relative overflow-hidden">
                                <div class="absolute top-0 right-0 bg-gray-50 text-gray-400 text-[10px] font-mono px-2.5 py-1 rounded-bl-xl border-l border-b border-gray-200">
                                    Инв. № ${v.inv_number || '—'}
                                </div>
                                
                                <div class="mt-1">
                                    <div class="flex items-center gap-2 mb-2 flex-wrap">
                                        <h4 class="font-bold text-base text-gray-800 truncate">${v.model || 'Без названия'}</h4>
                                        ${getStatusTagMarkup(v.tags)}
                                    </div>
                                    
                                    <div class="space-y-2 text-sm text-gray-600">
                                        <p class="flex items-center gap-1.5">
                                            <span class="text-xs text-gray-400">Госномер:</span> 
                                            <span class="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-semibold text-xs">${v.plate || '—'}</span>
                                        </p>
                                        
                                        ${hoursMarkup}

                                        <div class="border-t border-gray-100 my-2 pt-2 space-y-1.5 text-xs">
                                            <p class="flex justify-between items-center"><span class="text-gray-400">📅 Техосмотр:</span> <span class="${inspectionBadge.classes}">${inspectionBadge.text}</span></p>
                                            <p class="flex justify-between items-center"><span class="text-gray-400">📜 Страховка:</span> <span class="${insuranceBadge.classes}">${insuranceBadge.text}</span></p>
                                        </div>
                                    </div>
                                </div>
                                <div class="border-t border-gray-50 mt-3 pt-2.5 flex justify-end">
                                    <button id="btn-edit-${v.id}" class="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition">✏️ Изменить</button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');

    vehiclesList.forEach(v => {
        const btn = document.getElementById(`btn-edit-${v.id}`);
        if (btn) btn.onclick = () => openVehicleModal(v.id, v.model, v.plate, v.inspection_date, v.insurance_date, v.type, v.inv_number, v.vin_number, v.tags, v.current_hours, v.next_to_hours);
    });
}

function toggleDateFilter() {
    const btn = document.getElementById('filterDatesBtn');
    isFilterActive = !isFilterActive;
    if (isFilterActive) {
        btn.classList.replace('bg-amber-50', 'bg-amber-600');
        btn.classList.replace('text-amber-700', 'text-white');
        btn.innerHTML = '✅ Все машины';
    } else {
        btn.classList.replace('bg-amber-600', 'bg-amber-50');
        btn.classList.replace('text-white', 'text-amber-700');
        btn.innerHTML = '⚠️ Контроль сроков';
    }
    filterAndRender();
}

function openVehicleModal(id='', model='', plate='', inspection='', insurance='', type='Тракторы', inv='', vin='', tags='Готов', current_h='', next_h='') {
    document.getElementById('vehicleId').value = id;
    document.getElementById('modalType').value = type || 'Тракторы';
    document.getElementById('modalStatusTag').value = tags || 'Готов';
    document.getElementById('modalModel').value = model;
    document.getElementById('modalPlate').value = plate;
    document.getElementById('modalInvNumber').value = inv;
    document.getElementById('modalVinNumber').value = vin;
    document.getElementById('modalInspection').value = inspection || '';
    document.getElementById('modalInsurance').value = insurance || '';
    document.getElementById('modalCurrentHours').value = current_h || '';
    document.getElementById('modalNextToHours').value = next_h || '';
    
    toggleWarrantyInputs(tags || 'Готов');

    const deleteBtn = document.getElementById('deleteVehicleBtn');
    if (id) {
        document.getElementById('modalTitle').innerText = 'Редактировать технику';
        deleteBtn.classList.remove('hidden');
    } else {
        document.getElementById('modalTitle').innerText = 'Добавить технику';
        deleteBtn.classList.add('hidden');
    }
    
    const modal = document.getElementById('vehicleModal');
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
}

function closeVehicleModal() {
    const modal = document.getElementById('vehicleModal');
    if (modal) { modal.classList.remove('flex'); modal.classList.add('hidden'); }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('vehicleId').value;
    const status = document.getElementById('modalStatusTag').value;
    
    const payload = {
        type: document.getElementById('modalType').value,
        tags: status,
        model: document.getElementById('modalModel').value,
        plate: document.getElementById('modalPlate').value,
        inv_number: document.getElementById('modalInvNumber').value,
        vin_number: document.getElementById('modalVinNumber').value || null,
        inspection_date: document.getElementById('modalInspection').value || null,
        insurance_date: document.getElementById('modalInsurance').value || null,
        current_hours: status === 'Гарантия' ? parseInt(document.getElementById('modalCurrentHours').value) || 0 : null,
        next_to_hours: status === 'Гарантия' ? parseInt(document.getElementById('modalNextToHours').value) || 0 : null
    };

    try {
        if (id) {
            const { error } = await window._supabase.from('vehicles').update(payload).eq('id', id);
            if (error) throw error;
        } else {
            const { error } = await window._supabase.from('vehicles').insert([payload]);
            if (error) throw error;
        }
        closeVehicleModal();
        loadFleetData();
    } catch (err) {
        alert(`Ошибка при сохранении: ${err.message}`);
    }
}

async function handleDeleteVehicle() {
    const id = document.getElementById('vehicleId').value;
    const model = document.getElementById('modalModel').value;
    if (!id) return;
    if (!confirm(`Вы уверены, что хотите НАВСЕГДА удалить технику "${model}"?`)) return;
    try {
        const { error } = await window._supabase.from('vehicles').delete().eq('id', id);
        if (error) throw error;
        closeVehicleModal();
        loadFleetData();
    } catch (err) { alert(`Ошибка при удалении: ${err.message}`); }
}