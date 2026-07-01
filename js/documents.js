export const template = `
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h2 class="text-2xl font-bold text-gray-800">📋 Документооборот</h2>
            <p class="text-sm text-gray-500">Реестр официальной переписки и служебных записок</p>
        </div>
        <button id="addDocBtn" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm self-start sm:self-center">
            ➕ Регистрация письма
        </button>
    </div>

    <div class="flex bg-gray-100 p-1 rounded-xl border border-gray-200 mb-6 max-w-xs">
        <button id="tabIncoming" onclick="window.filterDocs('incoming')" class="flex-1 px-4 py-2 text-xs font-bold rounded-lg transition bg-white text-gray-800 shadow-sm">
            📥 Входящие
        </button>
        <button id="tabOutgoing" onclick="window.filterDocs('outgoing')" class="flex-1 px-4 py-2 text-xs font-bold rounded-lg transition text-gray-500 hover:text-gray-800">
            📤 Исходящие
        </button>
    </div>

    <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <th class="p-4 w-32">Номер</th>
                        <th class="p-4 w-1/4">Организация</th>
                        <th class="p-4">Тема / Краткое содержание</th>
                        <th class="p-4 w-32 text-right">Дата</th>
                    </tr>
                </thead>
                <tbody id="docTableBody" class="divide-y divide-gray-50 text-sm">
                    <tr><td colspan="4" class="text-center text-gray-400 py-10">Загрузка документов...</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <div id="docModal" class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm hidden z-50 flex items-center justify-center p-4">
        <div class="bg-white border border-gray-100 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 class="text-lg font-bold text-gray-800">Регистрация документа</h3>
            <form id="docForm" class="space-y-4">
                <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Тип документа</label>
                    <select id="docDirection" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500">
                        <option value="incoming">📥 Входящее письмо</option>
                        <option value="outgoing">📤 Исходящее / Служебная записка</option>
                    </select>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Номер док.</label>
                        <input type="text" id="docNumber" required class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500" placeholder="№ 01-15/45">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Дата</label>
                        <input type="date" id="docDate" required class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500">
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Корреспондент (Организация)</label>
                    <input type="text" id="docCompany" required class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500" placeholder="ГП Минсктранс">
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Краткое содержание / Тема</label>
                    <textarea id="docSubject" required rows="3" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500" placeholder="Обоснование..."></textarea>
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" id="closeDocModalBtn" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 rounded-xl font-bold transition text-sm">Отмена</button>
                    <button type="submit" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition text-sm shadow-md">Сохранить</button>
                </div>
            </form>
        </div>
    </div>
`;

let currentFilter = 'incoming';
let documents = [];

export async function init() {
    const addBtn = document.getElementById('addDocBtn');
    if (!window.isAdmin()) {
        if (addBtn) addBtn.classList.add('hidden');
    } else {
        if (addBtn) addBtn.onclick = () => document.getElementById('docModal').classList.remove('hidden');
    }

    const closeBtn = document.getElementById('closeDocModalBtn');
    if (closeBtn) closeBtn.onclick = () => document.getElementById('docModal').classList.add('hidden');
    
    const form = document.getElementById('docForm');
    if (form) form.onsubmit = (e) => handleDocSubmit(e);

    window.filterDocs = (dir) => {
        currentFilter = dir;
        const tabInc = document.getElementById('tabIncoming');
        const tabOut = document.getElementById('tabOutgoing');
        if (tabInc && tabOut) {
            tabInc.className = dir === 'incoming' ? 'flex-1 px-4 py-2 text-xs font-bold rounded-lg transition bg-white text-gray-800 shadow-sm' : 'flex-1 px-4 py-2 text-xs font-bold rounded-lg transition text-gray-500 hover:text-gray-800';
            tabOut.className = dir === 'outgoing' ? 'flex-1 px-4 py-2 text-xs font-bold rounded-lg transition bg-white text-gray-800 shadow-sm' : 'flex-1 px-4 py-2 text-xs font-bold rounded-lg transition text-gray-500 hover:text-gray-800';
        }
        renderDocs();
    };

    const docDateInput = document.getElementById('docDate');
    if (docDateInput) docDateInput.value = new Date().toISOString().split('T')[0];

    await loadDocs();
}

async function loadDocs() {
    try {
        if (window._supabase) {
            const { data, error } = await window._supabase
                .from('doc_registry')
                .select('*')
                .order('doc_date', { ascending: false });
                
            if (!error && data) {
                documents = data;
            } else {
                documents = [];
            }
        }
    } catch (err) {
        console.error("Ошибка запроса:", err);
        documents = [];
    } finally {
        renderDocs();
    }
}

function renderDocs() {
    const tbody = document.getElementById('docTableBody');
    if (!tbody) return;

    const filtered = documents.filter(d => d.direction === currentFilter);

    if (filtered.length === 0) {
        let msg = currentFilter === 'incoming' 
            ? '📥 Нет входящих писем. Зарегистрируйте первое!' 
            : '📤 Нет исходящих писем / служебных записок.';
            
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-gray-400 py-10 font-medium bg-gray-50/30">
                    ${msg}
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(d => `
        <tr class="hover:bg-gray-50/50 transition">
            <td class="p-4 font-mono font-bold text-gray-900">${d.doc_number || '—'}</td>
            <td class="p-4 font-semibold text-gray-700 truncate max-w-[180px]">${d.company || '—'}</td>
            <td class="p-4 text-gray-600 font-medium">${d.subject || '(Без темы)'}</td>
            <td class="p-4 text-right text-gray-400 text-xs font-medium">
                ${d.doc_date ? new Date(d.doc_date).toLocaleDateString('ru-RU') : '—'}
            </td>
        </tr>
    `).join('');
}

async function handleDocSubmit(e) {
    e.preventDefault();
    const newDoc = {
        direction: document.getElementById('docDirection').value,
        doc_number: document.getElementById('docNumber').value,
        doc_date: document.getElementById('docDate').value,
        company: document.getElementById('docCompany').value,
        subject: document.getElementById('docSubject').value,
    };

    try {
        if (window._supabase) {
            const { error } = await window._supabase.from('doc_registry').insert([newDoc]);
            if (error) throw error;

            document.getElementById('docModal').classList.add('hidden');
            document.getElementById('docForm').reset();
            document.getElementById('docDate').value = new Date().toISOString().split('T')[0];
            await loadDocs();
        }
    } catch (err) {
        alert("Ошибка сохранения: " + err.message);
    }
}