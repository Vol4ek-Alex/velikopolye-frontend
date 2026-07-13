// js/inspection.js

export const template = `
    <div class="mb-6 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
            <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <span class="bg-amber-100 p-1.5 rounded-lg">📋</span> Инспекционные листы
            </h2>
            <p class="text-sm text-gray-500 font-medium">Создавайте кастомные таблицы для обхода техники</p>
        </div>
        <button onclick="window.openTemplateModal()" class="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-md flex items-center gap-2">
            ➕ Новый шаблон
        </button>
    </div>

    <!-- Список шаблонов -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="templatesGrid">
        <div class="col-span-full text-center py-12 text-sm text-gray-400 font-medium bg-white rounded-2xl border border-gray-200">Загрузка шаблонов...</div>
    </div>

    <!-- Модалка создания/редактирования шаблона -->
    <div id="templateModal" class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm hidden z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl w-full max-w-lg p-6 border border-gray-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto relative">
            <button onclick="window.closeTemplateModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-900 font-bold text-xl transition">✕</button>
            <h3 id="templateModalTitle" class="text-xl font-extrabold text-gray-900 border-b border-gray-100 pb-3">Новый шаблон</h3>
            <form id="templateForm" class="space-y-4 text-sm">
                <input type="hidden" id="templateId">
                <div>
                    <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Название *</label>
                    <input type="text" id="templateTitle" required class="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 font-medium focus:ring-2 focus:ring-amber-400 focus:border-transparent" placeholder="Обход двора 13.07">
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Описание</label>
                    <input type="text" id="templateDescription" class="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 font-medium focus:ring-2 focus:ring-amber-400 focus:border-transparent" placeholder="Краткое описание">
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Колонки (каждая с новой строки)</label>
                    <div class="space-y-2">
                        <div id="columnsContainer" class="space-y-2 max-h-48 overflow-y-auto"></div>
                        <button type="button" onclick="window.addColumn()" class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-xl border border-gray-300 transition">➕ Добавить колонку</button>
                    </div>
                </div>
                <div class="flex gap-3 pt-3 border-t border-gray-100">
                    <button type="button" onclick="window.closeTemplateModal()" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 rounded-xl font-bold transition border border-gray-300">Отмена</button>
                    <button type="submit" class="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-xl font-bold transition shadow-md">Сохранить</button>
                </div>
                <button type="button" id="templateDeleteBtn" class="w-full bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-xl font-bold transition border border-red-300 hidden">Удалить шаблон</button>
            </form>
        </div>
    </div>

    <!-- Модалка заполнения таблицы (с горизонтальным скроллом) -->
    <div id="dataModal" class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm hidden z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl w-full max-w-4xl p-6 border border-gray-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto relative">
            <button onclick="window.closeDataModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-900 font-bold text-xl transition">✕</button>
            <div>
                <h3 id="dataModalTitle" class="text-xl font-extrabold text-gray-900">Название шаблона</h3>
                <p id="dataModalDesc" class="text-sm text-gray-500"></p>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm border-collapse min-w-max">
                    <thead id="dataTableHead" class="bg-gray-50 border-b border-gray-200"></thead>
                    <tbody id="dataTableBody"></tbody>
                </table>
            </div>
            <button onclick="window.addRow()" class="w-full bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-xl font-bold transition shadow-sm text-sm flex items-center justify-center gap-2">
                ➕ Добавить строку
            </button>
        </div>
    </div>
`;

// ===== Глобальные переменные =====
let templates = [];
let currentTemplateId = null;
let currentColumns = [];
let currentRows = [];
let allVehicles = [];
let editingRowId = null;

// ===== Инициализация =====
export async function init() {
    console.log('📋 Модуль "Инспекционные листы" инициализирован');

    window.openTemplateModal = openTemplateModal;
    window.closeTemplateModal = closeTemplateModal;
    window.openDataModal = openDataModal;
    window.closeDataModal = closeDataModal;
    window.addRow = addRow;
    window.addColumn = addColumn;
    window.deleteTemplate = deleteTemplate;
    window.editRow = editRow;
    window.deleteRow = deleteRow;

    await loadVehicles();
    await loadTemplates();
    renderTemplates();

    document.getElementById('templateForm').addEventListener('submit', handleTemplateSubmit);
    document.getElementById('templateDeleteBtn').addEventListener('click', handleDeleteTemplate);
}

// ===== Загрузка техники =====
async function loadVehicles() {
    if (!window._supabase) return;
    try {
        const { data, error } = await window._supabase
            .from('vehicles')
            .select('id, model, plate')
            .order('model');
        if (error) throw error;
        allVehicles = data || [];
    } catch (err) {
        console.error('Ошибка загрузки техники:', err);
    }
}

// ===== Загрузка шаблонов =====
async function loadTemplates() {
    if (!window._supabase) return;
    try {
        const { data, error } = await window._supabase
            .from('inspection_templates')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        templates = data || [];
    } catch (err) {
        console.error('Ошибка загрузки шаблонов:', err);
    }
}

// ===== Рендеринг шаблонов =====
function renderTemplates() {
    const grid = document.getElementById('templatesGrid');
    if (!grid) return;
    if (templates.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-12 text-sm text-gray-400 font-medium bg-white rounded-2xl border border-gray-200">Нет шаблонов. Создайте первый!</div>`;
        return;
    }
    grid.innerHTML = templates.map(t => {
        const date = new Date(t.created_at).toLocaleDateString('ru-RU');
        const cols = t.columns ? JSON.parse(t.columns) : [];
        return `
            <div class="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition cursor-pointer" onclick="window.openDataModal('${t.id}')">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-bold text-gray-900 text-base">${t.title}</h3>
                        ${t.description ? `<p class="text-sm text-gray-500 mt-0.5">${t.description}</p>` : ''}
                        <p class="text-xs text-gray-400 mt-2">Колонки: ${cols.map(c => c.name).join(', ')}</p>
                    </div>
                    <button onclick="event.stopPropagation(); window.openTemplateModal('${t.id}')" class="text-gray-400 hover:text-gray-700 transition text-xs">✏️</button>
                </div>
                <div class="text-xs text-gray-400 mt-3">📅 ${date}</div>
            </div>
        `;
    }).join('');
}

// ===== Модалка шаблона =====
let editingTemplateId = null;

function openTemplateModal(id = null) {
    const modal = document.getElementById('templateModal');
    const title = document.getElementById('templateModalTitle');
    const deleteBtn = document.getElementById('templateDeleteBtn');

    if (id) {
        const t = templates.find(t => t.id === id);
        if (!t) return;
        editingTemplateId = id;
        title.textContent = 'Редактирование шаблона';
        document.getElementById('templateId').value = t.id;
        document.getElementById('templateTitle').value = t.title;
        document.getElementById('templateDescription').value = t.description || '';
        const cols = t.columns ? JSON.parse(t.columns) : [];
        renderColumns(cols);
        deleteBtn.classList.remove('hidden');
    } else {
        editingTemplateId = null;
        title.textContent = 'Новый шаблон';
        document.getElementById('templateForm').reset();
        document.getElementById('templateId').value = '';
        renderColumns([]);
        deleteBtn.classList.add('hidden');
    }
    modal.classList.remove('hidden');
}

function closeTemplateModal() {
    document.getElementById('templateModal').classList.add('hidden');
    editingTemplateId = null;
}

window.closeTemplateModal = closeTemplateModal;
window.openTemplateModal = openTemplateModal;

function renderColumns(cols) {
    const container = document.getElementById('columnsContainer');
    if (!container) return;
    container.innerHTML = cols.map((col, index) => `
        <div class="flex items-center gap-2">
            <input type="text" value="${col.name}" placeholder="Название колонки" class="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-amber-400 focus:border-transparent" data-index="${index}" oninput="window.updateColumn(${index}, this.value)">
            <select class="bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-amber-400 focus:border-transparent" data-index="${index}" onchange="window.updateColumnType(${index}, this.value)">
                <option value="text" ${col.type === 'text' ? 'selected' : ''}>Текст</option>
                <option value="checkbox" ${col.type === 'checkbox' ? 'selected' : ''}>Чекбокс</option>
                <option value="vehicle" ${col.type === 'vehicle' ? 'selected' : ''}>Техника</option>
            </select>
            <button type="button" onclick="window.removeColumn(${index})" class="text-red-500 hover:text-red-700 text-sm">✕</button>
        </div>
    `).join('');
}

window.addColumn = () => {
    const container = document.getElementById('columnsContainer');
    if (!container) return;
    const cols = getColumnsFromDOM();
    cols.push({ name: 'Новая колонка', type: 'text' });
    renderColumns(cols);
};

window.removeColumn = (index) => {
    const cols = getColumnsFromDOM();
    cols.splice(index, 1);
    renderColumns(cols);
};

window.updateColumn = (index, value) => {
    const cols = getColumnsFromDOM();
    cols[index].name = value;
};

window.updateColumnType = (index, value) => {
    const cols = getColumnsFromDOM();
    cols[index].type = value;
};

function getColumnsFromDOM() {
    const container = document.getElementById('columnsContainer');
    if (!container) return [];
    const inputs = container.querySelectorAll('input[type="text"]');
    const selects = container.querySelectorAll('select');
    const cols = [];
    inputs.forEach((input, i) => {
        cols.push({
            name: input.value.trim() || 'Колонка ' + (i+1),
            type: selects[i] ? selects[i].value : 'text'
        });
    });
    return cols;
}

async function handleTemplateSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('templateId').value;
    const title = document.getElementById('templateTitle').value.trim();
    const description = document.getElementById('templateDescription').value.trim() || null;
    const columns = getColumnsFromDOM();

    if (!title) { alert('Название обязательно!'); return; }
    if (columns.length === 0) { alert('Добавьте хотя бы одну колонку!'); return; }

    const payload = { title, description, columns: JSON.stringify(columns) };

    try {
        if (id) {
            await window._supabase.from('inspection_templates').update(payload).eq('id', id);
        } else {
            await window._supabase.from('inspection_templates').insert([payload]);
        }
        closeTemplateModal();
        await loadTemplates();
        renderTemplates();
    } catch (err) {
        alert('Ошибка сохранения: ' + err.message);
    }
}

async function handleDeleteTemplate() {
    const id = document.getElementById('templateId').value;
    if (!id) return;
    if (!confirm('Удалить шаблон и все данные?')) return;
    try {
        await window._supabase.from('inspection_templates').delete().eq('id', id);
        closeTemplateModal();
        await loadTemplates();
        renderTemplates();
    } catch (err) {
        alert('Ошибка удаления: ' + err.message);
    }
}

// ===== Модалка данных (таблица) =====
async function openDataModal(templateId) {
    const t = templates.find(t => t.id === templateId);
    if (!t) return;
    currentTemplateId = templateId;
    currentColumns = JSON.parse(t.columns);
    document.getElementById('dataModalTitle').textContent = t.title;
    document.getElementById('dataModalDesc').textContent = t.description || '';

    await loadRows(templateId);
    renderTable();
    document.getElementById('dataModal').classList.remove('hidden');
}

function closeDataModal() {
    document.getElementById('dataModal').classList.add('hidden');
    currentTemplateId = null;
    currentRows = [];
}

window.closeDataModal = closeDataModal;
window.openDataModal = openDataModal;

async function loadRows(templateId) {
    if (!window._supabase) return;
    try {
        const { data, error } = await window._supabase
            .from('inspection_rows')
            .select('*')
            .eq('template_id', templateId)
            .order('created_at', { ascending: true });
        if (error) throw error;
        currentRows = data || [];
    } catch (err) {
        console.error('Ошибка загрузки строк:', err);
    }
}

function renderTable() {
    const thead = document.getElementById('dataTableHead');
    const tbody = document.getElementById('dataTableBody');
    if (!thead || !tbody) return;

    // Заголовок
    thead.innerHTML = `
        <th class="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b">#</th>
        ${currentColumns.map(col => `<th class="px-3 py-2 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b">${col.name}</th>`).join('')}
        <th class="px-3 py-2 text-center text-xs font-bold text-gray-600 uppercase tracking-wider border-b">Действия</th>
    `;

    // Тело
    if (currentRows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${currentColumns.length + 2}" class="text-center py-6 text-gray-400">Нет данных. Добавьте строку!</td></tr>`;
        return;
    }

    tbody.innerHTML = currentRows.map((row, index) => {
        const rowData = row.row_data || {};
        return `
            <tr class="border-b border-gray-100 hover:bg-gray-50 transition">
                <td class="px-3 py-2 text-sm font-medium text-gray-500">${index + 1}</td>
                ${currentColumns.map(col => {
                    const value = rowData[col.name];
                    let display = '';
                    if (col.type === 'checkbox') {
                        display = value ? '✅' : '❌';
                    } else if (col.type === 'vehicle') {
                        const vehicle = allVehicles.find(v => v.id === value);
                        display = vehicle ? `${vehicle.model} ${vehicle.plate ? '['+vehicle.plate+']' : ''}` : '—';
                    } else {
                        display = value || '—';
                    }
                    return `<td class="px-3 py-2 text-sm text-gray-800">${display}</td>`;
                }).join('')}
                <td class="px-3 py-2 text-center">
                    <button onclick="window.editRow('${row.id}')" class="text-gray-400 hover:text-gray-700 text-xs mr-2">✏️</button>
                    <button onclick="window.deleteRow('${row.id}')" class="text-red-400 hover:text-red-600 text-xs">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');
}

// ===== Добавление строки =====
window.addRow = async () => {
    if (!currentTemplateId) return;
    const rowData = {};
    currentColumns.forEach(col => {
        if (col.type === 'checkbox') rowData[col.name] = false;
        else if (col.type === 'vehicle') rowData[col.name] = null;
        else rowData[col.name] = '';
    });
    try {
        const { data, error } = await window._supabase
            .from('inspection_rows')
            .insert([{ template_id: currentTemplateId, row_data: rowData }])
            .select();
        if (error) throw error;
        await loadRows(currentTemplateId);
        renderTable();
        if (data && data[0]) editRow(data[0].id);
    } catch (err) {
        alert('Ошибка добавления: ' + err.message);
    }
};

// ===== Редактирование строки (inline-модалка) =====
function editRow(rowId) {
    const row = currentRows.find(r => r.id === rowId);
    if (!row) return;
    editingRowId = rowId;
    const rowData = row.row_data || {};

    // Создаём модалку редактирования
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4';
    overlay.id = 'inlineEditOverlay';
    overlay.innerHTML = `
        <div class="bg-white rounded-3xl w-full max-w-md p-6 border border-gray-200 shadow-2xl space-y-4 relative">
            <button onclick="this.closest('#inlineEditOverlay').remove()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-900 font-bold text-xl transition">✕</button>
            <h3 class="text-xl font-extrabold text-gray-900 border-b border-gray-100 pb-3">Редактирование строки</h3>
            <form id="inlineEditForm" class="space-y-4 text-sm">
                ${currentColumns.map(col => {
                    const value = rowData[col.name] !== undefined ? rowData[col.name] : (col.type === 'checkbox' ? false : '');
                    if (col.type === 'checkbox') {
                        return `<div class="flex items-center gap-2">
                            <label class="text-sm font-medium text-gray-700">${col.name}</label>
                            <input type="checkbox" id="edit_${col.name}" ${value ? 'checked' : ''} class="w-4 h-4 rounded text-amber-600 border-gray-300 focus:ring-amber-500">
                        </div>`;
                    } else if (col.type === 'vehicle') {
                        return `<div>
                            <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">${col.name}</label>
                            <select id="edit_${col.name}" class="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 font-medium focus:ring-2 focus:ring-amber-400 focus:border-transparent">
                                <option value="">-- Выберите технику --</option>
                                ${allVehicles.map(v => `<option value="${v.id}" ${v.id === value ? 'selected' : ''}>${v.model} ${v.plate ? '['+v.plate+']' : ''}</option>`).join('')}
                            </select>
                        </div>`;
                    } else {
                        return `<div>
                            <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">${col.name}</label>
                            <input type="text" id="edit_${col.name}" value="${value || ''}" class="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 font-medium focus:ring-2 focus:ring-amber-400 focus:border-transparent">
                        </div>`;
                    }
                }).join('')}
                <div class="flex gap-3 pt-3 border-t border-gray-100">
                    <button type="button" onclick="this.closest('#inlineEditOverlay').remove()" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 rounded-xl font-bold transition border border-gray-300">Отмена</button>
                    <button type="submit" class="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-xl font-bold transition shadow-md">Сохранить</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('inlineEditForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newData = {};
        let hasError = false;
        currentColumns.forEach(col => {
            const el = document.getElementById('edit_' + col.name);
            if (!el) {
                hasError = true;
                return;
            }
            if (col.type === 'checkbox') {
                newData[col.name] = el.checked;
            } else if (col.type === 'vehicle') {
                newData[col.name] = el.value || null;
            } else {
                newData[col.name] = el.value;
            }
        });
        if (hasError) return;
        try {
            const { error } = await window._supabase
                .from('inspection_rows')
                .update({ row_data: newData })
                .eq('id', rowId);
            if (error) throw error;
            overlay.remove();
            await loadRows(currentTemplateId);
            renderTable();
        } catch (err) {
            alert('Ошибка сохранения: ' + err.message);
        }
    });
}

window.editRow = editRow;

// ===== Удаление строки =====
window.deleteRow = async (rowId) => {
    if (!confirm('Удалить строку?')) return;
    try {
        await window._supabase.from('inspection_rows').delete().eq('id', rowId);
        await loadRows(currentTemplateId);
        renderTable();
    } catch (err) {
        alert('Ошибка удаления: ' + err.message);
    }
};

// ===== Удаление шаблона =====
window.deleteTemplate = async (templateId) => {
    if (!confirm('Удалить шаблон и все данные?')) return;
    try {
        await window._supabase.from('inspection_templates').delete().eq('id', templateId);
        await loadTemplates();
        renderTemplates();
    } catch (err) {
        alert('Ошибка удаления: ' + err.message);
    }
};