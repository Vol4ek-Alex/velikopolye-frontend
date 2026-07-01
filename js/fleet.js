export const template = `
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
            <h2 class="text-2xl font-bold text-gray-800">Сельхозтехника</h2>
            <p class="text-sm text-gray-500">Редактирование, добавление, сроки документов и удаление</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button id="filterDatesBtn" class="w-full sm:w-auto bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-semibold px-5 py-3 rounded-xl transition shadow-sm flex justify-center items-center gap-2">
                ⚠️ Контроль сроков
            </button>
            <button id="addVehicleBtn" class="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-3 rounded-xl transition shadow-md flex justify-center items-center gap-2">
                ➕ Добавить технику
            </button>
        </div>
    </div>

    <div id="fleetGrid" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div class="col-span-full text-center text-gray-400 py-12">Загрузка машин из Supabase...</div>
    </div>

    <div id="vehicleModal" class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm hidden items-center justify-center p-4 z-50">
        <div class="bg-white border border-gray-100 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <div class="flex justify-between items-center mb-4">
                <h3 id="modalTitle" class="text-xl font-bold text-gray-800">Добавить технику</h3>
                <button type="button" id="deleteVehicleBtn" class="hidden text-sm font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition">
                    🗑️ Удалить
                </button>
            </div>
            
            <form id="vehicleForm">
                <input type="hidden" id="vehicleId">
                <div class="mb-4">
                    <label class="block text-gray-600 text-sm font-medium mb-1">Марка / Модель</label>
                    <input type="text" id="modalModel" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 focus:outline-none focus:border-emerald-500 transition" placeholder="Например, МТЗ-82">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-600 text-sm font-medium mb-1">Госномер</label>
                    <input type="text" id="modalPlate" required class="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 focus:outline-none focus:border-emerald-500 transition" placeholder="Например, 1234 АВ-7">
                </div>
                <div class="mb-4">
                    <label class="block text-gray-600 text-sm font-medium mb-1">📅 Техосмотр (годен до)</label>
                    <input type="date" id="modalInspection" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 focus:outline-none focus:border-emerald-500 transition">
                </div>
                <div class="mb-6">
                    <label class="block text-gray-600 text-sm font-medium mb-1">📜 Страховка (годна до)</label>
                    <input type="date" id="modalInsurance" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 focus:outline-none focus:border-emerald-500 transition">
                </div>
                <div class="flex gap-3">
                    <button type="button" id="closeModalBtn" class="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition">Отмена</button>
                    <button type="submit" class="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition shadow-md">Сохранить</button>
                </div>
            </form>
        </div>
    </div>
`;

// Переменные для хранения состояния фильтра
let allVehicles = [];
let isFilterActive = false;

export function init() {
    isFilterActive = false; // сбрасываем при перезаходе в модуль
    loadFleetData();

    document.getElementById('addVehicleBtn').onclick = () => openVehicleModal();
    document.getElementById('closeModalBtn').onclick = () => closeVehicleModal();
    document.getElementById('vehicleForm').onsubmit = (e) => handleFormSubmit(e);
    document.getElementById('deleteVehicleBtn').onclick = () => handleDeleteVehicle();
    
    // Клик по кнопке контроля сроков
    document.getElementById('filterDatesBtn').onclick = () => toggleDateFilter();
}

// Функция подсчета дней и генерации нужного цвета
function getDateBadge(dateString) {
    if (!dateString) return { text: '—', classes: 'text-gray-700' };
    
    const targetDate = new Date(dateString);
    const today = new Date();
    
    // Считаем разницу в днях
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const formattedDate = targetDate.toLocaleDateString('ru-RU');

    if (diffDays <= 0) {
        // Срок вышел — красный цвет
        return { text: `${formattedDate} (Просрочено)`, classes: 'text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded' };
    } else if (diffDays <= 30) {
        // Осталось меньше 30 дней — оранжевый
        return { text: `${formattedDate} (Осталось ${diffDays} дн.)`, classes: 'text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.5 rounded' };
    } else {
        // Всё отлично — обычный серый
        return { text: formattedDate, classes: 'text-gray-700 font-medium' };
    }
}

// Проверка: подходят ли сроки под проблемные (<= 30 дней)
function hasUrgentDates(v) {
    const today = new Date();
    
    const checkUrgency = (dateStr) => {
        if (!dateStr) return false;
        const diffDays = Math.ceil((new Date(dateStr) - today) / (1000 * 60 * 60 * 24));
        return diffDays <= 30; // Вернет true, если осталось меньше 30 дней или уже просрочено
    };

    return checkUrgency(v.inspection) || checkUrgency(v.insurance);
}

async function loadFleetData() {
    const grid = document.getElementById('fleetGrid');
    if (!grid) return;

    try {
        const { data, error } = await window._supabase.from('vehicles').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        allVehicles = data || [];
        renderFleetGrid(allVehicles);

    } catch (e) {
        grid.innerHTML = `<div class="col-span-full text-red-500 p-4 bg-red-50 rounded-xl border border-red-200">Ошибка: ${e.message}</div>`;
    }
}

// Отдельная функция отрисовки сетки (чтобы вызывать её при фильтрации)
function renderFleetGrid(vehiclesList) {
    const grid = document.getElementById('fleetGrid');
    if (!grid) return;

    if (vehiclesList.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center text-gray-400 py-12">${isFilterActive ? 'Техники с истекающими сроками не найдено.' : 'В базе нет техники.'}</div>`;
        return;
    }

    grid.innerHTML = vehiclesList.map(v => {
        const inspectionBadge = getDateBadge(v.inspection);
        const insuranceBadge = getDateBadge(v.insurance);

        return `
            <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-start mb-3">
                        <h3 class="font-bold text-lg text-gray-800">${v.model || 'Без названия'}</h3>
                        <button id="btn-edit-${v.id}" class="text-gray-400 hover:text-emerald-600 transition text-sm font-medium">✏️ Изменить</button>
                    </div>
                    
                    <div class="space-y-2 text-sm text-gray-600">
                        <p>Госномер: <span class="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-semibold">${v.plate || '—'}</span></p>
                        <div class="border-t border-gray-100 my-2 pt-2 space-y-1.5 text-xs">
                            <p class="flex justify-between items-center">
                                <span class="text-gray-400">📅 Техосмотр:</span> 
                                <span class="${inspectionBadge.classes}">${inspectionBadge.text}</span>
                            </p>
                            <p class="flex justify-between items-center">
                                <span class="text-gray-400">📜 Страховка:</span> 
                                <span class="${insuranceBadge.classes}">${insuranceBadge.text}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Навешиваем клики
    vehiclesList.forEach(v => {
        const btn = document.getElementById(`btn-edit-${v.id}`);
        if (btn) btn.onclick = () => openVehicleModal(v.id, v.model, v.plate, v.inspection, v.insurance);
    });
}

// Логика переключения фильтра
function toggleDateFilter() {
    const btn = document.getElementById('filterDatesBtn');
    isFilterActive = !isFilterActive;

    if (isFilterActive) {
        // Активируем фильтр: берем только проблемные машины
        btn.classList.replace('bg-amber-50', 'bg-amber-600');
        btn.classList.replace('text-amber-700', 'text-white');
        btn.innerHTML = '✅ Все машины';

        const filtered = allVehicles.filter(v => hasUrgentDates(v));
        renderFleetGrid(filtered);
    } else {
        // Выключаем фильтр: показываем всех
        btn.classList.replace('bg-amber-600', 'bg-amber-50');
        btn.classList.replace('text-white', 'text-amber-700');
        btn.innerHTML = '⚠️ Контроль сроков';

        renderFleetGrid(allVehicles);
    }
}

function openVehicleModal(id = '', model = '', plate = '', inspection = '', insurance = '') {
    document.getElementById('vehicleId').value = id;
    document.getElementById('modalModel').value = model;
    document.getElementById('modalPlate').value = plate;
    document.getElementById('modalInspection').value = inspection || '';
    document.getElementById('modalInsurance').value = insurance || '';
    
    const deleteBtn = document.getElementById('deleteVehicleBtn');

    if (id) {
        document.getElementById('modalTitle').innerText = 'Редактировать технику';
        deleteBtn.classList.remove('hidden');
    } else {
        document.getElementById('modalTitle').innerText = 'Добавить технику';
        deleteBtn.classList.add('hidden');
    }
    
    const modal = document.getElementById('vehicleModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closeVehicleModal() {
    const modal = document.getElementById('vehicleModal');
    if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('vehicleId').value;
    const model = document.getElementById('modalModel').value;
    const plate = document.getElementById('modalPlate').value;
    const inspection = document.getElementById('modalInspection').value || null;
    const insurance = document.getElementById('modalInsurance').value || null;

    try {
        if (id) {
            const { error } = await window._supabase.from('vehicles').update({ model, plate, inspection, insurance }).eq('id', id);
            if (error) throw error;
        } else {
            const { error } = await window._supabase.from('vehicles').insert([{ model, plate, inspection, insurance }]);
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
    
    const confirmDelete = confirm(`Вы уверены, что хотите НАВСЕГДА удалить из базы технику "${model}"?`);
    if (!confirmDelete) return;

    try {
        const { error } = await window._supabase.from('vehicles').delete().eq('id', id);
        if (error) throw error;
        
        closeVehicleModal();
        loadFleetData();
    } catch (err) {
        alert(`Ошибка при удалении: ${err.message}`);
    }
}