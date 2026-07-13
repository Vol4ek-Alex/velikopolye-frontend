// js/repair.js

export const template = `
    <!-- Верхняя панель -->
    <div class="mb-6 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
            <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <span class="bg-orange-100 p-1.5 rounded-lg">🔧</span> Заявки на ремонт
            </h2>
            <p class="text-sm text-gray-500 font-medium">Учёт заявок на ремонт и обслуживание техники</p>
        </div>
        <button onclick="window.openRepairModal()" class="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-md flex items-center gap-2">
            ➕ Создать заявку
        </button>
    </div>

    <!-- Статистика -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div class="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm">
            <p class="text-xs text-gray-500 font-medium">Всего</p>
            <p id="statTotal" class="text-2xl font-black text-gray-900">0</p>
        </div>
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center shadow-sm">
            <p class="text-xs text-blue-600 font-medium">Новые</p>
            <p id="statNew" class="text-2xl font-black text-blue-700">0</p>
        </div>
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center shadow-sm">
            <p class="text-xs text-amber-600 font-medium">В работе</p>
            <p id="statInProgress" class="text-2xl font-black text-amber-700">0</p>
        </div>
        <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center shadow-sm">
            <p class="text-xs text-emerald-600 font-medium">Выполнено</p>
            <p id="statCompleted" class="text-2xl font-black text-emerald-700">0</p>
        </div>
        <div class="bg-red-50 border border-red-200 rounded-xl p-3 text-center shadow-sm">
            <p class="text-xs text-red-600 font-medium">Закрыто</p>
            <p id="statClosed" class="text-2xl font-black text-red-700">0</p>
        </div>
    </div>

    <!-- Фильтры -->
    <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6">
        <div class="flex flex-wrap items-center gap-3">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Статус:</span>
            <button onclick="window.filterRepairs('all')" id="repairFilter_all" class="px-3 py-1.5 text-xs font-bold rounded-xl transition border-2 border-orange-600 bg-orange-600 text-white">Все</button>
            <button onclick="window.filterRepairs('new')" id="repairFilter_new" class="px-3 py-1.5 text-xs font-bold rounded-xl transition border-2 border-gray-300 text-gray-700 hover:border-orange-400">Новые</button>
            <button onclick="window.filterRepairs('assigned')" id="repairFilter_assigned" class="px-3 py-1.5 text-xs font-bold rounded-xl transition border-2 border-gray-300 text-gray-700 hover:border-orange-400">Назначены</button>
            <button onclick="window.filterRepairs('in_progress')" id="repairFilter_in_progress" class="px-3 py-1.5 text-xs font-bold rounded-xl transition border-2 border-gray-300 text-gray-700 hover:border-orange-400">В работе</button>
            <button onclick="window.filterRepairs('completed')" id="repairFilter_completed" class="px-3 py-1.5 text-xs font-bold rounded-xl transition border-2 border-gray-300 text-gray-700 hover:border-orange-400">Выполнено</button>
            <button onclick="window.filterRepairs('closed')" id="repairFilter_closed" class="px-3 py-1.5 text-xs font-bold rounded-xl transition border-2 border-gray-300 text-gray-700 hover:border-orange-400">Закрыто</button>
        </div>
        <div class="mt-3 flex flex-wrap gap-3">
            <input type="text" id="repairSearchInput" placeholder="🔍 Поиск по названию или описанию..." class="flex-1 min-w-[200px] bg-gray-50 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent">
            <button onclick="window.openRepairModal()" class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition shadow-sm">+ Новая</button>
        </div>
    </div>

    <!-- Список заявок -->
    <div id="repairList" class="space-y-3">
        <div class="text-center text-gray-400 py-12 text-sm font-medium bg-white rounded-2xl border border-gray-200">Загрузка заявок...</div>
    </div>

    <!-- Модалка создания/редактирования -->
    <div id="repairFormModal" class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm hidden z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl w-full max-w-lg p-6 border border-gray-200 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button onclick="window.closeRepairModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-900 font-bold text-xl transition">✕</button>
            <h3 id="repairModalTitle" class="text-xl font-extrabold text-gray-900 border-b border-gray-100 pb-3">Создание заявки</h3>
            <form id="repairForm" class="space-y-4 text-sm">
                <input type="hidden" id="repairId">
                <div>
                    <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Краткое описание *</label>
                    <input type="text" id="repairTitle" required class="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 font-medium focus:ring-2 focus:ring-orange-400 focus:border-transparent" placeholder="Например: Замена масла в двигателе">
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Техника *</label>
                    <select id="repairVehicle" required class="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 font-medium focus:ring-2 focus:ring-orange-400 focus:border-transparent">
                        <option value="">-- Выберите технику --</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Приоритет</label>
                    <select id="repairPriority" class="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 font-medium focus:ring-2 focus:ring-orange-400 focus:border-transparent">
                        <option value="low">🟢 Низкий</option>
                        <option value="medium" selected>🟡 Средний</option>
                        <option value="high">🟠 Высокий</option>
                        <option value="critical">🔴 Критический</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Подробное описание</label>
                    <textarea id="repairDescription" rows="3" class="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 font-medium focus:ring-2 focus:ring-orange-400 focus:border-transparent" placeholder="Опишите проблему подробно..."></textarea>
                </div>
                <div id="repairAdminFields" class="hidden border-t border-gray-100 pt-4 space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Статус</label>
                        <select id="repairStatus" class="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 font-medium focus:ring-2 focus:ring-orange-400 focus:border-transparent">
                            <option value="new">🆕 Новая</option>
                            <option value="assigned">👤 Назначена</option>
                            <option value="in_progress">⚙️ В работе</option>
                            <option value="completed">✅ Выполнена</option>
                            <option value="closed">🚫 Закрыта</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Назначить исполнителю</label>
                        <input type="text" id="repairAssignedTo" class="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 font-medium focus:ring-2 focus:ring-orange-400 focus:border-transparent" placeholder="ФИО механика или водителя">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Предварительная стоимость</label>
                            <input type="number" id="repairCostEstimate" step="0.01" class="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 font-medium focus:ring-2 focus:ring-orange-400 focus:border-transparent" placeholder="0.00">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Фактическая стоимость</label>
                            <input type="number" id="repairActualCost" step="0.01" class="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 font-medium focus:ring-2 focus:ring-orange-400 focus:border-transparent" placeholder="0.00">
                        </div>
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Заметки</label>
                        <textarea id="repairNotes" rows="2" class="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 font-medium focus:ring-2 focus:ring-orange-400 focus:border-transparent" placeholder="Дополнительная информация..."></textarea>
                    </div>
                </div>
                <div class="flex gap-3 pt-3 border-t border-gray-100">
                    <button type="button" onclick="window.closeRepairModal()" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 rounded-xl font-bold transition border border-gray-300">Отмена</button>
                    <button type="submit" class="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-xl font-bold transition shadow-md">Сохранить</button>
                </div>
                <button type="button" id="repairDeleteBtn" class="w-full bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-xl font-bold transition border border-red-300 hidden">Удалить заявку</button>
            </form>
        </div>
    </div>
`;

// ===== Глобальные переменные =====
let repairs = [];
let vehicles = [];
let currentFilter = 'all';
let searchQuery = '';
let refreshIntervalId = null;
let editingRepairId = null;

// ===== Вспомогательные функции =====
const STATUS_LABELS = {
    'new': { label: 'Новая', color: 'bg-blue-100 text-blue-800' },
    'assigned': { label: 'Назначена', color: 'bg-amber-100 text-amber-800' },
    'in_progress': { label: 'В работе', color: 'bg-amber-100 text-amber-800' },
    'completed': { label: 'Выполнена', color: 'bg-emerald-100 text-emerald-800' },
    'closed': { label: 'Закрыта', color: 'bg-gray-100 text-gray-800' }
};

const PRIORITY_LABELS = {
    'low': { label: '🟢 Низкий', color: 'bg-green-100 text-green-800' },
    'medium': { label: '🟡 Средний', color: 'bg-yellow-100 text-yellow-800' },
    'high': { label: '🟠 Высокий', color: 'bg-orange-100 text-orange-800' },
    'critical': { label: '🔴 Критический', color: 'bg-red-100 text-red-800' }
};

// ===== Инициализация =====
export async function init() {
    console.log('🔧 Модуль "Заявки на ремонт" инициализирован');

    // Глобальные функции
    window.openRepairModal = openRepairModal;
    window.closeRepairModal = closeRepairModal;
    window.filterRepairs = filterRepairs;

    // Привязка формы
    const form = document.getElementById('repairForm');
    if (form) {
        form.removeEventListener('submit', handleFormSubmit);
        form.addEventListener('submit', handleFormSubmit);
    }

    const deleteBtn = document.getElementById('repairDeleteBtn');
    if (deleteBtn) {
        deleteBtn.removeEventListener('click', handleDelete);
        deleteBtn.addEventListener('click', handleDelete);
    }

    // Поиск
    const searchInput = document.getElementById('repairSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            renderRepairs();
        });
    }

    // Загрузка данных
    await loadVehicles();
    await loadRepairs();
    renderStats();
    renderRepairs();

    // Автообновление
    if (refreshIntervalId) clearInterval(refreshIntervalId);
    refreshIntervalId = setInterval(async () => {
        await loadRepairs();
        renderStats();
        renderRepairs();
    }, 10000);
}

// ===== Загрузка данных =====
async function loadVehicles() {
    if (!window._supabase) return;
    try {
        const { data, error } = await window._supabase
            .from('vehicles')
            .select('id, model, plate, inv_number')
            .order('model', { ascending: true });
        if (error) throw error;
        vehicles = data || [];
        // Обновить селект
        populateVehicleSelect();
    } catch (e) {
        console.error('Ошибка загрузки техники:', e);
    }
}

async function loadRepairs() {
    if (!window._supabase) return;
    try {
        const { data, error } = await window._supabase
            .from('repair_requests')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        repairs = data || [];
    } catch (e) {
        console.error('Ошибка загрузки заявок:', e);
    }
}

function populateVehicleSelect() {
    const select = document.getElementById('repairVehicle');
    if (!select) return;
    select.innerHTML = '<option value="">-- Выберите технику --</option>' +
        vehicles.map(v => `<option value="${v.id}">${v.model} ${v.plate ? '['+v.plate+']' : ''} ${v.inv_number ? '('+v.inv_number+')' : ''}</option>`).join('');
}

function getVehicleName(id) {
    const v = vehicles.find(v => v.id === id);
    return v ? `${v.model} ${v.plate ? '['+v.plate+']' : ''}` : 'Неизвестная техника';
}

// ===== Рендеринг статистики =====
function renderStats() {
    const total = repairs.length;
    const stats = {
        'statNew': repairs.filter(r => r.status === 'new').length,
        'statInProgress': repairs.filter(r => r.status === 'assigned' || r.status === 'in_progress').length,
        'statCompleted': repairs.filter(r => r.status === 'completed').length,
        'statClosed': repairs.filter(r => r.status === 'closed').length
    };
    document.getElementById('statTotal').textContent = total;
    for (const [id, value] of Object.entries(stats)) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }
}

// ===== Фильтрация =====
function filterRepairs(status) {
    currentFilter = status;
    // Обновить активную кнопку
    document.querySelectorAll('[id^="repairFilter_"]').forEach(btn => {
        btn.classList.remove('border-orange-600', 'bg-orange-600', 'text-white');
        btn.classList.add('border-gray-300', 'text-gray-700');
    });
    const activeBtn = document.getElementById('repairFilter_' + status);
    if (activeBtn) {
        activeBtn.classList.remove('border-gray-300', 'text-gray-700');
        activeBtn.classList.add('border-orange-600', 'bg-orange-600', 'text-white');
    }
    renderRepairs();
}
window.filterRepairs = filterRepairs;

// ===== Рендеринг списка заявок =====
function renderRepairs() {
    const container = document.getElementById('repairList');
    if (!container) return;

    let filtered = repairs;
    if (currentFilter !== 'all') {
        filtered = filtered.filter(r => r.status === currentFilter);
    }
    if (searchQuery) {
        filtered = filtered.filter(r =>
            (r.title || '').toLowerCase().includes(searchQuery) ||
            (r.description || '').toLowerCase().includes(searchQuery)
        );
    }

    if (filtered.length === 0) {
        container.innerHTML = '<div class="text-center text-gray-400 py-12 text-sm font-medium bg-white rounded-2xl border border-gray-200">Нет заявок</div>';
        return;
    }

    container.innerHTML = filtered.map(r => {
        const statusInfo = STATUS_LABELS[r.status] || STATUS_LABELS['new'];
        const priorityInfo = PRIORITY_LABELS[r.priority] || PRIORITY_LABELS['medium'];
        const vehicleName = getVehicleName(r.vehicle_id);
        const createdDate = r.created_at ? new Date(r.created_at).toLocaleDateString('ru-RU') : '—';
        const isAdmin = localStorage.getItem('user_role') === 'Директор' || localStorage.getItem('user_role') === 'Инженер по ЭМТП';

        return `
            <div class="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-bold text-gray-900 text-sm">${r.title}</span>
                        <span class="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${statusInfo.color}">${statusInfo.label}</span>
                        <span class="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${priorityInfo.color}">${priorityInfo.label}</span>
                    </div>
                    <div class="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                        <span>🚜 ${vehicleName}</span>
                        <span>📅 ${createdDate}</span>
                        ${r.assigned_to ? `<span>👤 ${r.assigned_to}</span>` : ''}
                    </div>
                    ${r.description ? `<p class="text-xs text-gray-600 mt-1 truncate max-w-md">${r.description}</p>` : ''}
                </div>
                <div class="flex gap-2 flex-shrink-0">
                    <button onclick="window.openRepairModal('${r.id}')" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold transition">✏️ Редактировать</button>
                    ${isAdmin ? `<button onclick="window.deleteRepair('${r.id}')" class="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold transition border border-red-200">🗑️</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// ===== Модалка создания/редактирования =====
function openRepairModal(id = null) {
    const modal = document.getElementById('repairFormModal');
    const title = document.getElementById('repairModalTitle');
    const deleteBtn = document.getElementById('repairDeleteBtn');
    const adminFields = document.getElementById('repairAdminFields');

    // Заполняем селект техники
    populateVehicleSelect();

    if (id) {
        // Режим редактирования
        const repair = repairs.find(r => r.id === id);
        if (!repair) return;
        editingRepairId = id;
        title.textContent = 'Редактирование заявки';
        document.getElementById('repairId').value = repair.id;
        document.getElementById('repairTitle').value = repair.title || '';
        document.getElementById('repairVehicle').value = repair.vehicle_id || '';
        document.getElementById('repairPriority').value = repair.priority || 'medium';
        document.getElementById('repairDescription').value = repair.description || '';
        document.getElementById('repairStatus').value = repair.status || 'new';
        document.getElementById('repairAssignedTo').value = repair.assigned_to || '';
        document.getElementById('repairCostEstimate').value = repair.cost_estimate || '';
        document.getElementById('repairActualCost').value = repair.actual_cost || '';
        document.getElementById('repairNotes').value = repair.notes || '';
        deleteBtn.classList.remove('hidden');
        adminFields.classList.remove('hidden');
    } else {
        // Режим создания
        editingRepairId = null;
        title.textContent = 'Создание заявки';
        document.getElementById('repairForm').reset();
        document.getElementById('repairId').value = '';
        document.getElementById('repairPriority').value = 'medium';
        document.getElementById('repairStatus').value = 'new';
        deleteBtn.classList.add('hidden');
        // Для обычных пользователей скрываем админские поля
        const userRole = localStorage.getItem('user_role');
        if (userRole === 'Директор' || userRole === 'Инженер по ЭМТП') {
            adminFields.classList.remove('hidden');
        } else {
            adminFields.classList.add('hidden');
        }
    }

    modal.classList.remove('hidden');
}
window.openRepairModal = openRepairModal;

function closeRepairModal() {
    document.getElementById('repairFormModal').classList.add('hidden');
    editingRepairId = null;
}
window.closeRepairModal = closeRepairModal;

// ===== Обработчик формы =====
async function handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('repairId').value;
    const title = document.getElementById('repairTitle').value.trim();
    const vehicle_id = document.getElementById('repairVehicle').value;
    const priority = document.getElementById('repairPriority').value;
    const description = document.getElementById('repairDescription').value.trim();
    const status = document.getElementById('repairStatus').value;
    const assigned_to = document.getElementById('repairAssignedTo').value.trim();
    const cost_estimate = parseFloat(document.getElementById('repairCostEstimate').value) || null;
    const actual_cost = parseFloat(document.getElementById('repairActualCost').value) || null;
    const notes = document.getElementById('repairNotes').value.trim();

    if (!title || !vehicle_id) {
        alert('Заполните обязательные поля: название и техника!');
        return;
    }

    const userRole = localStorage.getItem('user_role') || 'Сотрудник';
    const userName = localStorage.getItem('user_name') || 'Неизвестный';

    const payload = {
        title,
        vehicle_id,
        priority,
        description,
        status,
        assigned_to,
        cost_estimate,
        actual_cost,
        notes,
        updated_at: new Date().toISOString()
    };

    if (!id) {
        payload.created_by = userName;
        payload.created_at = new Date().toISOString();
    }

    try {
        let result;
        if (id) {
            result = await window._supabase
                .from('repair_requests')
                .update(payload)
                .eq('id', id);
        } else {
            result = await window._supabase
                .from('repair_requests')
                .insert([payload]);
        }
        if (result.error) throw result.error;

        closeRepairModal();
        await loadRepairs();
        renderStats();
        renderRepairs();
    } catch (e) {
        alert('Ошибка сохранения: ' + e.message);
    }
}

// ===== Обработчик удаления =====
async function handleDelete() {
    const id = document.getElementById('repairId').value;
    if (!id) return;
    if (!confirm('Удалить заявку?')) return;
    try {
        const { error } = await window._supabase
            .from('repair_requests')
            .delete()
            .eq('id', id);
        if (error) throw error;
        closeRepairModal();
        await loadRepairs();
        renderStats();
        renderRepairs();
    } catch (e) {
        alert('Ошибка удаления: ' + e.message);
    }
}

// ===== Удаление через кнопку на карточке =====
window.deleteRepair = async (id) => {
    const userRole = localStorage.getItem('user_role');
    if (userRole !== 'Директор' && userRole !== 'Инженер по ЭМТП') {
        alert('Только директор или инженер могут удалять заявки.');
        return;
    }
    if (!confirm('Удалить заявку?')) return;
    try {
        const { error } = await window._supabase
            .from('repair_requests')
            .delete()
            .eq('id', id);
        if (error) throw error;
        await loadRepairs();
        renderStats();
        renderRepairs();
    } catch (e) {
        alert('Ошибка удаления: ' + e.message);
    }
};