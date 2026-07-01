export const template = `
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
            <h2 class="text-2xl font-bold text-gray-800">Сельхозтехника</h2>
            <p class="text-sm text-gray-500">Редактирование, добавление, сроки документов и удаление</p>
        </div>
        <button id="addVehicleBtn" class="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-3 rounded-xl transition shadow-md flex justify-center items-center gap-2">
            ➕ Добавить технику
        </button>
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

export function init() {
    loadFleetData();

    document.getElementById('addVehicleBtn').onclick = () => openVehicleModal();
    document.getElementById('closeModalBtn').onclick = () => closeVehicleModal();
    document.getElementById('vehicleForm').onsubmit = (e) => handleFormSubmit(e);
    document.getElementById('deleteVehicleBtn').onclick = () => handleDeleteVehicle();
}

// Хелпер для красивого форматирования дат (ДД.ММ.ГГГГ)
function formatDate(dateString) {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

async function loadFleetData() {
    const grid = document.getElementById('fleetGrid');
    if (!grid) return;

    try {
        const { data, error } = await window._supabase.from('vehicles').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        if (!data || data.length === 0) {
            grid.innerHTML = `<div class="col-span-full text-center text-gray-400 py-12">В базе нет техники.</div>`;
            return;
        }

        grid.innerHTML = data.map(v => `
            <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-start mb-3">
                        <h3 class="font-bold text-lg text-gray-800">${v.model || 'Без названия'}</h3>
                        <button id="btn-edit-${v.id}" class="text-gray-400 hover:text-emerald-600 transition text-sm font-medium">✏️ Изменить</button>
                    </div>
                    
                    <div class="space-y-2 text-sm text-gray-600">
                        <p>Госномер: <span class="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-semibold">${v.plate || '—'}</span></p>
                        <div class="border-t border-gray-100 my-2 pt-2 space-y-1 text-xs">
                            <p class="flex justify-between">
                                <span class="text-gray-400">📅 Техосмотр:</span> 
                                <span class="font-medium text-gray-700">${formatDate(v.inspection_date)}</span>
                            </p>
                            <p class="flex justify-between">
                                <span class="text-gray-400">📜 Страховка:</span> 
                                <span class="font-medium text-gray-700">${formatDate(v.insurance_date)}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        data.forEach(v => {
            const btn = document.getElementById(`btn-edit-${v.id}`);
            if (btn) btn.onclick = () => openVehicleModal(v.id, v.model, v.plate, v.inspection_date, v.insurance_date);
        });

    } catch (e) {
        grid.innerHTML = `<div class="col-span-full text-red-500 p-4 bg-red-50 rounded-xl border border-red-200">Ошибка: ${e.message}</div>`;
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
        deleteBtn.classList.remove('hidden'); // Показываем кнопку удаления
    } else {
        document.getElementById('modalTitle').innerText = 'Добавить технику';
        deleteBtn.classList.add('hidden'); // Скрываем её при создании
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
    const inspection_date = document.getElementById('modalInspection').value || null;
    const insurance_date = document.getElementById('modalInsurance').value || null;

    try {
        if (id) {
            const { error } = await window._supabase.from('vehicles').update({ model, plate, inspection_date, insurance_date }).eq('id', id);
            if (error) throw error;
        } else {
            const { error } = await window._supabase.from('vehicles').insert([{ model, plate, inspection_date, insurance_date }]);
            if (error) throw error;
        }
        closeVehicleModal();
        loadFleetData();
    } catch (err) {
        alert(`Ошибка при сохранении: ${err.message}`);
    }
}

// Новая функция: Удаление
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