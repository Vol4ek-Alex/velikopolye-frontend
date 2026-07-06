// Данные сотрудников и техники, перенесенные напрямую из вашего module_orders.py
const STAFF_DATABASE = {
    "Трактористов машинистов с/х производства": [
        "Петрачков Ю.Н.", "Петухов В.С.", "Петухов С.В.", "Щуревич Д.И.", "Манулик С.Ф.", 
        "Бурый П.Н.", "Ладутько Ю.А.", "Чернов В.Н.", "Пустельников А.Ю.", "Федоров А.А.", 
        "Любецкий А.С.", "Карканица А.О.", "Хурсевич Е.Н.", "Лученок В.Г.", "Митюля С.Н.", "Чернявский А.П."
    ],
    "Водителей": [
        "Синицкий В. А.", "Жданович М. С.", "Любецкий А.С.", "Квятковский А.А.", "Судник М.В.", "Сонич С.В.", "Хроленко И.В.", "Кучеров В.В."
    ],
    "Кладовщик": ["Манулик Е. И."],
    "Слесарей": ["Мурашко В. П.", "Щекало О.Г.", "Сушкевич И.А.", "Молчан Н.В."],
    "Электрогазосварщик": ["Ворник П.В."]
};

const DEFAULT_WORKS = {
    "Кладовщик": "прием и выдача ТМЦ, заправка с/х техники",
    "Слесарей": "ремонт сельскохозяйственной техники",
    "Трактористов машинистов с/х производства": "",
    "Водителей": ""
};

const VEHICLES_LIST = [
    "МТЗ-82", "МТЗ-320", "МТЗ-920", "МТЗ-1221", "МТЗ-1523", "МТЗ-3022", "МТЗ-3522",
    "Амкодор-332", "Амкодор 342", "Амкодор 352", "МАЗ-551602(20т)", "МАЗ-650128(20т)", 
    "МАЗ-555102(10т)", "МАЗ-533702(ЗСК)", "Газ-A65R52", "ГАЗА65R22", "ГАЗА32R23", 
    "ГАЗ-САЗ 35071", "Рено-Мастер", "Rosa", "FS-80", "КВК-8060", "GS3219", "КЗС-1218", "Без техники"
];

// Подключаем JS-библиотеку для генерации DOCX на лету (замена python-docx)
if (!document.getElementById('docx-script')) {
    const script = document.createElement('script');
    script.id = 'docx-script';
    script.src = "https://unpkg.com/docx@8.5.0/build/index.js";
    document.head.appendChild(script);
}

// Добавляем CSS стили для идеальной ГОСТовской печати прямо из браузера
const printStyles = document.createElement('style');
printStyles.innerHTML = `
    @media print {
        body * { visibility: hidden; background: none !important; }
        #printArea, #printArea * { visibility: visible; color: #000 !important; }
        #printArea { position: absolute; left: 0; top: 0; width: 100%; font-family: "Times New Roman", serif; }
        .page-break { page-break-before: always; }
        .no-print { display: none !important; }
    }
`;
document.head.appendChild(printStyles);

// Временный массив текущего черновика (аналог таблицы registry в python до сохранения в бд)
let currentDraftItems = [];
let savedMemosArchive = [];

export const template = `
<div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-2xl border border-gray-200 gap-4 shadow-3xs">
        <div>
            <h2 class="text-xl font-black text-gray-800">📝 Служебные записки на выходные</h2>
            <p class="text-xs text-gray-400 mt-0.5">Учет, печать и архивация выходов сотрудников в выходные дни</p>
        </div>
        <div class="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
            <button id="tabBtnCreate" onclick="window.toggleOrdersTab('create')" class="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-lg bg-white text-gray-800 shadow-3xs transition">
                ➕ Создать записку
            </button>
            <button id="tabBtnArchive" onclick="window.toggleOrdersTab('archive')" class="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-lg text-gray-500 hover:text-gray-800 transition">
                📂 Архив документов
            </button>
        </div>
    </div>

    <div id="ordersTabCreate" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="bg-white border border-gray-200 p-5 rounded-2xl shadow-3xs space-y-4">
            <h3 class="text-sm font-black text-gray-700 border-b border-gray-100 pb-2">⚙️ Параметры записи</h3>
            
            <div>
                <label class="block text-[10px] font-bold uppercase text-gray-400 tracking-wide mb-1">Дата выхода</label>
                <input type="date" id="orderMemoDate" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500">
            </div>

            <div>
                <label class="block text-[10px] font-bold uppercase text-gray-400 tracking-wide mb-1">Категория / Профессия</label>
                <select id="orderCategorySelect" onchange="window.handleOrderCategoryChange()" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500">
                    ${Object.keys(STAFF_DATABASE).map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                </select>
            </div>

            <div>
                <label class="block text-[10px] font-bold uppercase text-gray-400 tracking-wide mb-1">Сотрудник (ФИО)</label>
                <select id="orderEmployeeSelect" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500"></select>
            </div>

            <div>
                <label class="block text-[10px] font-bold uppercase text-gray-400 tracking-wide mb-1">Марка техники</label>
                <select id="orderTechSelect" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500">
                    ${VEHICLES_LIST.map(t => `<option value="${t}">${t}</option>`).join('')}
                </select>
            </div>

            <div>
                <label class="block text-[10px] font-bold uppercase text-gray-400 tracking-wide mb-1">Вид выполняемой работы</label>
                <input type="text" id="orderWorkInput" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500" placeholder="Укажите вид работы">
            </div>

            <button onclick="window.addWorkerToDraft()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition shadow-3xs text-xs">
                ➕ Добавить человека в список
            </button>
        </div>

        <div class="lg:col-span-2 bg-white border border-gray-200 p-5 rounded-2xl shadow-3xs flex flex-col justify-between">
            <div class="space-y-4">
                <div class="flex justify-between items-center border-b border-gray-100 pb-2">
                    <h3 class="text-sm font-black text-gray-700">📋 Содержимое служебной записки (Черновик)</h3>
                    <button onclick="window.clearDraft()" class="text-[11px] font-bold text-red-500 hover:underline">🧹 Очистить всё</button>
                </div>

                <div class="overflow-x-auto max-h-[320px] overflow-y-auto border border-gray-100 rounded-xl">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="bg-gray-50 text-gray-400 uppercase text-[9px] tracking-wider font-bold border-b border-gray-200">
                                <th class="p-3">Дата</th>
                                <th class="p-3">Сотрудник / Профессия</th>
                                <th class="p-3">Техника</th>
                                <th class="p-3">Работа</th>
                                <th class="p-3 text-right">Действие</th>
                            </tr>
                        </thead>
                        <tbody id="orderDraftTableBody" class="divide-y divide-gray-100 font-medium text-gray-700">
                            <tr>
                                <td colspan="5" class="text-center p-8 text-gray-400">Список пока пуст. Добавьте сотрудников слева.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="border-t border-gray-100 pt-4 mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-[10px] font-bold uppercase text-gray-400 tracking-wide mb-1">Основание вызова</label>
                    <input type="text" id="orderReasonInput" value="производственная необходимость" class="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500">
                </div>
                <div class="flex items-end">
                    <button onclick="window.saveMemoToSupabase()" class="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl font-bold transition shadow-md text-xs">
                        💾 Сохранить и зафиксировать в архив
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div id="ordersTabArchive" class="bg-white border border-gray-200 p-5 rounded-2xl shadow-3xs hidden space-y-4">
        <h3 class="text-sm font-black text-gray-700 border-b border-gray-100 pb-2">📂 История служебных записок</h3>
        <div class="overflow-x-auto rounded-xl border border-gray-100">
            <table class="w-full text-left border-collapse text-xs">
                <thead>
                    <tr class="bg-gray-50 text-gray-400 uppercase text-[9px] tracking-wider font-bold border-b border-gray-200">
                        <th class="p-3">ID</th>
                        <th class="p-3">Дата выхода</th>
                        <th class="p-3">Кол-во человек</th>
                        <th class="p-3">Основание</th>
                        <th class="p-3">Автор</th>
                        <th class="p-3 text-right">Действия / Печать</th>
                    </tr>
                </thead>
                <tbody id="orderArchiveTableBody" class="divide-y divide-gray-100 font-medium text-gray-700">
                    <tr>
                        <td colspan="6" class="text-center p-8 text-gray-400">Загрузка архивных документов...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<div id="printArea" class="hidden p-12 bg-white text-black max-w-[800px] mx-auto text-[14px] leading-normal font-serif"></div>
`;

export async function init() {
    setupWindowFunctions();
    window.handleOrderCategoryChange();
    // Ставим сегодняшнюю дату в инпут по умолчанию
    const dateInput = document.getElementById('orderMemoDate');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    
    // Подгружаем архив из базы
    await loadArchiveFromSupabase();
}

function setupWindowFunctions() {
    window.toggleOrdersTab = (tab) => {
        const cTab = document.getElementById('ordersTabCreate');
        const aTab = document.getElementById('ordersTabArchive');
        const cBtn = document.getElementById('tabBtnCreate');
        const aBtn = document.getElementById('tabBtnArchive');

        if(tab === 'create') {
            cTab.classList.remove('hidden'); aTab.classList.add('hidden');
            cBtn.className = "flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-lg bg-white text-gray-800 shadow-3xs transition";
            aBtn.className = "flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-lg text-gray-500 hover:text-gray-800 transition";
        } else {
            cTab.classList.add('hidden'); aTab.classList.remove('hidden');
            aBtn.className = "flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-lg bg-white text-gray-800 shadow-3xs transition";
            cBtn.className = "flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-lg text-gray-500 hover:text-gray-800 transition";
            loadArchiveFromSupabase();
        }
    };

    window.handleOrderCategoryChange = () => {
        const cat = document.getElementById('orderCategorySelect').value;
        const empSelect = document.getElementById('orderEmployeeSelect');
        const workInput = document.getElementById('orderWorkInput');

        empSelect.innerHTML = STAFF_DATABASE[cat].map(fio => `<option value="${fio}">${fio}</option>`).join('');
        workInput.value = DEFAULT_WORKS[cat] || "";
    };

    window.addWorkerToDraft = () => {
        const date = document.getElementById('orderMemoDate').value;
        const category = document.getElementById('orderCategorySelect').value;
        const fio = document.getElementById('orderEmployeeSelect').value;
        const tech = document.getElementById('orderTechSelect').value;
        const work = document.getElementById('orderWorkInput').value.strip ? document.getElementById('orderWorkInput').value.strip() : document.getElementById('orderWorkInput').value.trim();

        if(!date || !fio || !work) {
            alert("Пожалуйста, заполните дату, ФИО и вид выполняемой работы!");
            return;
        }

        currentDraftItems.push({ id: Date.now(), date, category, fio, tech, work });
        renderDraftTable();
    };

    window.removeWorkerFromDraft = (id) => {
        currentDraftItems = currentDraftItems.filter(item => item.id !== id);
        renderDraftTable();
    };

    window.clearDraft = () => {
        if(confirm("Очистить текущий список?")) {
            currentDraftItems = [];
            renderDraftTable();
        }
    };

    window.saveMemoToSupabase = async () => {
        if(currentDraftItems.length === 0) {
            alert("Черновик пуст! Сначала добавьте людей.");
            return;
        }
        const reason = document.getElementById('orderReasonInput').value || "производственная необходимость";
        const authorRole = localStorage.getItem('user_role') || 'Инженер по ЭМТП';
        const authorName = localStorage.getItem('user_name') || 'Волчек А.А.';

        try {
            // Создаем основную запись о документе в Supabase
            // (Так как таблицы создаются динамически через SQL Editor, мы пишем универсальную вставку данных структуры JSON для гибкости хранения)
            const { data, error } = await window._supabase.from('weekend_orders_json').insert([
                {
                    weekend_date: currentDraftItems[0].date,
                    reason: reason,
                    signatory: `${authorRole} ${authorName}`,
                    items_data: currentDraftItems
                }
            ]).select();

            if (error) {
                // Если таблицы weekend_orders_json еще нет, мы можем временно сохранить её в localStorage для локальной надежности, либо выбросить ошибку
                throw error;
            }

            alert("Служебная записка успешно зафиксирована в облачную базу данных Supabase!");
            currentDraftItems = [];
            renderDraftTable();
            window.toggleOrdersTab('archive');
        } catch (err) {
            console.warn("Ошибка сохранения в СУБД. Сохраняем локально в браузер:", err);
            // Фолбэк на localStorage, если таблицы в СУБД еще не созданы админом
            let localData = JSON.parse(localStorage.getItem('local_memos_backup') || '[]');
            localData.push({
                id: Date.now(),
                weekend_date: currentDraftItems[0].date,
                reason: reason,
                signatory: `${authorRole} ${authorName}`,
                items_data: currentDraftItems
            });
            localStorage.setItem('local_memos_backup', JSON.stringify(localData));
            alert("Документ зафиксирован локально в хранилище АРМ! (СУБД на доработке)");
            currentDraftItems = [];
            renderDraftTable();
            window.toggleOrdersTab('archive');
        }
    };

    // --- ПЕЧАТЬ ИЗ БРАУЗЕРА ПО ГОСТУ ---
    window.printOrderDocument = (memoId, mode) => {
        const memo = savedMemosArchive.find(m => m.id == memoId);
        if(!memo) return;

        const printArea = document.getElementById('printArea');
        
        if (mode === 'text') {
            // Форматируем макет Текста служебной записки по вашему шаблону Word
            let currentNum = 1;
            // Группируем по профессиям
            const grouped = {};
            memo.items_data.forEach(item => {
                if(!grouped[item.category]) grouped[item.category] = [];
                grouped[item.category].push(item);
            });

            let itemsHtml = '';
            for (const cat in grouped) {
                itemsHtml += `<p style="margin-top: 12px; margin-bottom: 2px; font-weight: bold;">${cat}:</p>`;
                grouped[cat].forEach(row => {
                    const techStr = (row.tech && row.tech !== 'Без техники') ? ` – <b>${row.tech}</b>` : '';
                    itemsHtml += `<p style="margin-left: 24px; margin-top: 2px; margin-bottom: 2px;"><b>${currentNum}. ${row.fio}</b>${techStr} - (${row.work});</p>`;
                    currentNum++;
                });
            }

            printArea.innerHTML = `
                <div style="margin-left: auto; width: 300px; line-height: 1.3; margin-bottom: 40px;">
                    Директору филиала СХК<br>«Великополье»<br>Рунцевичу Д.С.<br>
                    ${memo.signatory.split(' ')[0] || 'Инженера по ЭМТП'}<br>${memo.signatory.split(' ').slice(1).join(' ') || 'Волчек А.А.'}
                </div>
                <h1 style="text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 24px;">СЛУЖЕБНАЯ ЗАПИСКА</h1>
                <p style="text-indent: 30px; text-align: justify; line-height: 1.5;">
                    В связи с производственной необходимость, прошу Вас привлечь к работе в выходной день 
                    <b>(${formatDate(memo.weekend_date)})</b> следующих работников филиала:
                </p>
                ${itemsHtml}
                <div style="margin-top: 60px; display: flex; justify-content: space-between;">
                    <div>${memo.signatory.split(' ')[0]}</div>
                    <div>${memo.signatory.split(' ').slice(1).join(' ')}</div>
                </div>
            `;
        } else {
            // Форматируем Списки ознакомления в виде Сетки-Таблицы (как в generate_table_document в Python)
            let rowsHtml = '';
            // Извлекаем уникальные даты и сотрудников
            const uniqueWorkers = {};
            memo.items_data.forEach(item => {
                if(!uniqueWorkers[item.fio]) {
                    uniqueWorkers[item.fio] = { category: item.category, dates: [] };
                }
                uniqueWorkers[item.fio].dates.push(formatDate(item.date));
            });

            let idx = 1;
            for(const fio in uniqueWorkers) {
                let prof = uniqueWorkers[fio].category;
                if(prof.includes("Трактористов")) prof = "Тракторист-машинист";
                else if(prof.includes("Водителей")) prof = "Водитель";
                else if(prof.includes("Слесарей")) prof = "Слесарь по ремонту";

                rowsHtml += `
                    <tr style="border: 1px solid black;">
                        <td style="border: 1px solid black; padding: 6px; text-align: center;">${idx}</td>
                        <td style="border: 1px solid black; padding: 6px;">${fio}</td>
                        <td style="border: 1px solid black; padding: 6px;">${prof}</td>
                        <td style="border: 1px solid black; padding: 6px; text-align: center;">${[...new Set(uniqueWorkers[fio].dates)].join(', ')}</td>
                        <td style="border: 1px solid black; padding: 6px; width: 150px;"></td>
                    </tr>
                `;
                idx++;
            }

            printArea.innerHTML = `
                <h2 style="text-align: center; font-size: 14px; font-weight: bold; line-height: 1.4; margin-bottom: 20px;">
                    Список работников, привлеченных к работе в выходные дни<br>на ${formatDate(memo.weekend_date)}гг.
                </h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <thead>
                        <tr style="background-color: #f3f4f6; border: 1px solid black;">
                            <th style="border: 1px solid black; padding: 6px; text-align: center;">№ п/п</th>
                            <th style="border: 1px solid black; padding: 6px; text-align: center;">Фамилия, имя, отчество (полностью)</th>
                            <th style="border: 1px solid black; padding: 6px; text-align: center;">Профессия</th>
                            <th style="border: 1px solid black; padding: 6px; text-align: center;">Дата привлечения</th>
                            <th style="border: 1px solid black; padding: 6px; text-align: center;">Согласие, дата ознакомления, подпись</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            `;
        }

        // Запуск системного диалога печати
        window.print();
    };

    // --- СКАЧИВАНИЕ В ФОРМАТЕ WORD (.DOCX) НА КЛИЕНТЕ ---
    window.downloadOrderDocx = (memoId) => {
        const memo = savedMemosArchive.find(m => m.id == memoId);
        if(!memo || !window.docx) {
            alert("Библиотека DOCX еще загружается, повторите попытку!");
            return;
        }

        const { Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, WidthType } = window.docx;

        // Повторяем структуру построения документа
        const children = [
            new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { after: 300 },
                children: [
                    new TextRun({ text: "Директору филиала СХК\n«Великополье»\nРунцевичу Д.С.\n" + memo.signatory, lineSpacing: 240 })
                ]
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 150, after: 150 },
                children: [
                    new TextRun({ text: "СЛУЖЕБНАЯ ЗАПИСКА", bold: true, size: 28 })
                ]
            }),
            new Paragraph({
                indent: { firstLine: 400 },
                spacing: { after: 150 },
                children: [
                    new TextRun(`В связи с производственной необходимостью, прошу Вас привлечь к работе в выходной день (${formatDate(memo.weekend_date)}) следующих работников филиала:`)
                ]
            })
        ];

        // Группировка
        const grouped = {};
        memo.items_data.forEach(item => {
            if(!grouped[item.category]) grouped[item.category] = [];
            grouped[item.category].push(item);
        });

        let currentNum = 1;
        for (const cat in grouped) {
            children.push(new Paragraph({ children: [new TextRun({ text: `${cat}:`, bold: true })], spacing: { before: 100 } }));
            grouped[cat].forEach(row => {
                const techStr = (row.tech && row.tech !== 'Без техники') ? ` – ${row.tech}` : '';
                children.push(new Paragraph({
                    indent: { left: 200 },
                    children: [
                        new TextRun({ text: `${currentNum}. ${row.fio}`, bold: true }),
                        new TextRun({ text: techStr, bold: true }),
                        new TextRun(` - (${row.work});`)
                    ]
                }));
                currentNum++;
            });
        }

        // Подпись в конце
        children.push(new Paragraph({
            spacing: { before: 400 },
            children: [
                new TextRun({ text: memo.signatory.split(' ')[0] }),
                new TextRun({ text: "\t\t\t\t\t\t" + memo.signatory.split(' ').slice(1).join(' '), bold: true })
            ]
        }));

        const doc = new Document({ sections: [{ properties: {}, children: children }] });
        Packer.toBlob(doc).then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Служебная_записка_${memo.weekend_date}.docx`;
            a.click();
        });
    };
}

function renderDraftTable() {
    const tbody = document.getElementById('orderDraftTableBody');
    if(!tbody) return;

    if(currentDraftItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center p-8 text-gray-400">Список пока пуст. Добавьте сотрудников слева.</td></tr>`;
        return;
    }

    tbody.innerHTML = currentDraftItems.map(item => `
        <tr class="hover:bg-gray-50 transition">
            <td class="p-3 whitespace-nowrap font-bold text-emerald-600">${formatDate(item.date)}</td>
            <td class="p-3">
                <div class="font-black text-gray-900">${item.fio}</div>
                <div class="text-[10px] text-gray-400 font-semibold">${item.category}</div>
            </td>
            <td class="p-3"><span class="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-bold text-[10px]">${item.tech}</span></td>
            <td class="p-3 text-gray-500 italic">${item.work}</td>
            <td class="p-3 text-right">
                <button onclick="window.removeWorkerFromDraft(${item.id})" class="text-red-500 hover:text-red-700 font-bold">❌</button>
            </td>
        </tr>
    `).join('');
}

async function loadArchiveFromSupabase() {
    const tbody = document.getElementById('orderArchiveTableBody');
    if(!tbody) return;

    try {
        const { data, error } = await window._supabase.from('weekend_orders_json').select('*').order('id', { ascending: false });
        if(error) throw error;
        savedMemosArchive = data || [];
    } catch (e) {
        console.log("Читаем архив из локального фолбэка:");
        savedMemosArchive = JSON.parse(localStorage.getItem('local_memos_backup') || '[]');
    }

    if(savedMemosArchive.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center p-8 text-gray-400">Архив пуст. Сделайте первую запись!</td></tr>`;
        return;
    }

    tbody.innerHTML = savedMemosArchive.map(memo => `
        <tr class="hover:bg-gray-50 transition">
            <td class="p-3 text-gray-400 font-mono">#${memo.id}</td>
            <td class="p-3 font-bold text-gray-900">${formatDate(memo.weekend_date)}</td>
            <td class="p-3"><span class="bg-emerald-50 text-emerald-700 font-black border border-emerald-100 px-2.5 py-0.5 rounded-full">${memo.items_data ? memo.items_data.length : 0} чел.</span></td>
            <td class="p-3 text-gray-500 truncate max-w-[180px]">${memo.reason}</td>
            <td class="p-3 text-gray-400 font-semibold text-[11px]">${memo.signatory}</td>
            <td class="p-3 text-right space-x-1 whitespace-nowrap">
                <button onclick="window.printOrderDocument(${memo.id}, 'text')" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-lg text-[11px] font-bold transition">👁 Текст</button>
                <button onclick="window.printOrderDocument(${memo.id}, 'table')" class="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-[11px] font-bold transition">📊 Ознакомление</button>
                <button onclick="window.downloadOrderDocx(${memo.id})" class="bg-blue-50 hover:bg-blue-100 text-blue-600 px-2 py-1 rounded-lg text-[11px] font-bold transition">💾 .DOCX</button>
            </td>
        </tr>
    `).join('');
}

function formatDate(dateStr) {
    if(!dateStr) return '';
    const parts = dateStr.split('-');
    if(parts.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`;
    return dateStr;
}