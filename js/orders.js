// База сотрудников, перенесенная из вашего Python-скрипта
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

// Подключаем docx CDN
if (!window.docx && !window.Docx) {
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.js";
    script.onload = () => { console.log("Библиотека DOCX готова."); };
    document.head.appendChild(script);
}

let currentDraftItems = [];
let savedMemosArchive = [];

export const template = `
<style>
@media print {
    body * {
        visibility: hidden !important;
    }
    #cleanPrintBlock, #cleanPrintBlock * {
        visibility: visible !important;
    }
    #cleanPrintBlock {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
    }
    aside, nav, header, footer, .no-print-section, button {
        display: none !important;
        opacity: 0 !important;
    }
}
</style>

<div class="space-y-6 no-print-section">
    <div class="bg-white p-5 rounded-xl border-2 border-gray-400/80 shadow-xs">
        <h2 class="text-xl font-bold text-gray-950 tracking-tight">📁 Электронный документооборот</h2>
        <p class="text-xs text-gray-600 font-medium">Создание, архивация, выгрузка в Word и прямая печать служебной документации</p>
    </div>

    <div class="flex bg-gray-200/70 p-1 rounded-lg max-w-md">
        <button id="subTabBtnCatalog" onclick="window.switchDocsSection('catalog')" class="flex-1 text-center py-2 text-xs font-bold rounded-md bg-white text-gray-950 shadow-2xs transition">
            🗂️ Каталог бланков
        </button>
        <button id="subTabBtnArchive" onclick="window.switchDocsSection('archive')" class="flex-1 text-center py-2 text-xs font-bold rounded-md text-gray-600 hover:text-gray-950 transition">
            📂 Общий архив документов
        </button>
    </div>

    <div id="docsSectionCatalog" class="space-y-6">
        <div id="memosGridMenu" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div onclick="window.openMemoFormDesigner()" class="bg-white border-2 border-gray-400 rounded-xl p-5 shadow-2xs hover:border-emerald-600 cursor-pointer transition flex items-start gap-4">
                <div class="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-xl font-bold">📝</div>
                <div>
                    <h4 class="font-bold text-gray-950 text-sm">Служебная записка / выходные дни</h4>
                    <p class="text-[11px] text-gray-500 mt-1 font-medium">Привлечение персонала к работе в субботу/воскресенье.</p>
                </div>
            </div>
        </div>

        <div id="memoDesignerContainer" class="hidden grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            <div class="bg-white border-2 border-gray-400 p-5 rounded-xl shadow-xs space-y-4">
                <div class="flex justify-between items-center border-b border-gray-200 pb-2">
                    <h3 class="text-xs font-black text-gray-800 uppercase tracking-wider">⚙️ Конструктор записки</h3>
                    <button onclick="document.getElementById('memoDesignerContainer').classList.add('hidden')" class="text-[10px] text-gray-400 font-bold hover:text-gray-600">❌ Свернуть</button>
                </div>
                
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-[10px] font-bold text-gray-700 mb-1">Дата 1 (Обяз.)</label>
                        <input type="date" id="orderMemoDate1" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-emerald-600">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-gray-700 mb-1">Дата 2 (Опц.)</label>
                        <input type="date" id="orderMemoDate2" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-emerald-600">
                    </div>
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-gray-700 mb-1">Категория / Профессия</label>
                    <select id="orderCategorySelect" onchange="window.handleOrderCategoryChange()" class="w-full bg-white border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-emerald-600">
                        ${Object.keys(STAFF_DATABASE).map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                    </select>
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-gray-700 mb-1">Сотрудник</label>
                    <select id="orderEmployeeSelect" class="w-full bg-white border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-emerald-600"></select>
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-gray-700 mb-1">Марка техники</label>
                    <select id="orderTechSelect" class="w-full bg-white border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-emerald-600">
                        ${VEHICLES_LIST.map(t => `<option value="${t}">${t}</option>`).join('')}
                    </select>
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-gray-700 mb-1">Вид работы</label>
                    <input type="text" id="orderWorkInput" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-emerald-600" placeholder="Укажите вид работы">
                </div>

                <button onclick="window.addWorkerToDraft()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-bold transition shadow-xs text-xs">
                    ＋ Включить сотрудника в документ
                </button>
            </div>

            <div class="lg:col-span-2 bg-white border-2 border-gray-400 p-5 rounded-xl shadow-xs flex flex-col justify-between">
                <div class="space-y-3">
                    <div class="flex justify-between items-center border-b border-gray-200 pb-1.5">
                        <h3 class="text-xs font-black text-gray-800 uppercase tracking-wider">📋 Состав формируемой служебной записки</h3>
                        <button onclick="window.clearDraft()" class="text-[11px] font-bold text-red-600 hover:underline">Очистить список</button>
                    </div>

                    <div class="overflow-x-auto border border-gray-200 rounded-lg max-h-[300px] overflow-y-auto">
                        <table class="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr class="bg-gray-50 text-gray-500 font-bold border-b border-gray-200 text-[10px] uppercase">
                                    <th class="p-2.5">Даты вызова</th>
                                    <th class="p-2.5">ФИО / Категория</th>
                                    <th class="p-2.5">Техника</th>
                                    <th class="p-2.5">Выполняемая работа</th>
                                    <th class="p-2.5 text-right">Удалить</th>
                                </tr>
                            </thead>
                            <tbody id="orderDraftTableBody" class="divide-y divide-gray-200 font-bold text-gray-800">
                                <tr>
                                    <td colspan="5" class="text-center p-8 text-gray-400">Список пуст. Заполните форму слева и добавьте людей.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="pt-4 border-t border-gray-200 flex justify-end">
                    <button onclick="window.saveMemoToSupabase()" class="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-bold transition shadow-xs text-xs">
                        💾 Сформировать и отправить в архив
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div id="docsSectionArchive" class="bg-white border-2 border-gray-400 p-5 rounded-xl shadow-xs hidden space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-2">
            <h3 class="text-xs font-black text-gray-800 uppercase tracking-wider">📂 Реестр документов</h3>
            <select id="archiveDocTypeFilter" onchange="window.renderArchiveRows()" class="bg-white border border-gray-300 rounded-lg p-1 text-xs font-bold focus:outline-none">
                <option value="all">Все категории документов</option>
                <option value="weekend_memo">Служебные записки (Выходные)</option>
            </select>
        </div>
        <div class="overflow-x-auto rounded-lg border border-gray-300">
            <table class="w-full text-left border-collapse text-xs">
                <thead>
                    <tr class="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-300">
                        <th class="p-3">ID записи</th>
                        <th class="p-3">Категория</th>
                        <th class="p-3">Даты выхода</th>
                        <th class="p-3">Задействовано</th>
                        <th class="p-3">Составил / Подпись</th>
                        <th class="p-3 text-right">Действия с документом</th>
                    </tr>
                </thead>
                <tbody id="orderArchiveTableBody" class="divide-y divide-gray-200 font-bold text-gray-800">
                    <tr>
                        <td colspan="6" class="text-center p-8 text-gray-400">Служебные записки отсутствуют.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<div id="cleanPrintBlock"></div>
`;

export async function init() {
    setupWindowFunctions();
    window.handleOrderCategoryChange();
    
    const d1 = document.getElementById('orderMemoDate1');
    if (d1) d1.value = new Date().toISOString().split('T')[0];
    
    await loadArchiveFromSupabase();
}

function setupWindowFunctions() {
    window.switchDocsSection = async (section) => {
        const cSec = document.getElementById('docsSectionCatalog');
        const aSec = document.getElementById('docsSectionArchive');
        const cBtn = document.getElementById('subTabBtnCatalog');
        const aBtn = document.getElementById('subTabBtnArchive');

        if (section === 'catalog') {
            if(cSec) cSec.classList.remove('hidden'); 
            if(aSec) aSec.classList.add('hidden');
            if(cBtn) cBtn.className = "flex-1 text-center py-2 text-xs font-bold rounded-md bg-white text-gray-950 shadow-2xs transition";
            if(aBtn) aBtn.className = "flex-1 text-center py-2 text-xs font-bold rounded-md text-gray-600 hover:text-gray-950 transition";
        } else {
            if(cSec) cSec.classList.add('hidden'); 
            if(aSec) aSec.classList.remove('hidden');
            if(aBtn) aBtn.className = "flex-1 text-center py-2 text-xs font-bold rounded-md bg-white text-gray-950 shadow-2xs transition";
            if(cBtn) cBtn.className = "flex-1 text-center py-2 text-xs font-bold rounded-md text-gray-600 hover:text-gray-950 transition";
            
            await loadArchiveFromSupabase();
        }
    };

    window.openMemoFormDesigner = () => {
        const container = document.getElementById('memoDesignerContainer');
        if(container) container.classList.remove('hidden');
    };

    window.handleOrderCategoryChange = () => {
        const cat = document.getElementById('orderCategorySelect').value;
        const empSelect = document.getElementById('orderEmployeeSelect');
        const workInput = document.getElementById('orderWorkInput');

        if(empSelect) empSelect.innerHTML = STAFF_DATABASE[cat].map(fio => `<option value="${fio}">${fio}</option>`).join('');
        if(workInput) workInput.value = DEFAULT_WORKS[cat] || "";
    };

    window.addWorkerToDraft = () => {
        const date1 = document.getElementById('orderMemoDate1').value;
        const date2 = document.getElementById('orderMemoDate2').value;
        const category = document.getElementById('orderCategorySelect').value;
        const fio = document.getElementById('orderEmployeeSelect').value;
        const tech = document.getElementById('orderTechSelect').value;
        const work = document.getElementById('orderWorkInput').value.trim();

        if (!date1 || !fio || !work) {
            alert("Заполните базовую дату (Дата 1), ФИО сотрудника и выполняемую работу!");
            return;
        }

        let datesArray = [date1];
        if (date2 && date2 !== date1) {
            datesArray.push(date2);
        }

        currentDraftItems.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            dates: datesArray,
            category,
            fio,
            tech,
            work
        });
        renderDraftTable();
    };

    window.removeWorkerFromDraft = (id) => {
        currentDraftItems = currentDraftItems.filter(item => item.id !== id);
        renderDraftTable();
    };

    window.clearDraft = () => {
        if (confirm("Сбросить текущий список наполнения?")) {
            currentDraftItems = [];
            renderDraftTable();
        }
    };

    window.saveMemoToSupabase = async () => {
        if (currentDraftItems.length === 0) {
            alert("Документ пуст! Добавьте людей.");
            return;
        }

        const authorRole = localStorage.getItem('user_role') || 'Инженер по ЭМТП';
        const authorName = localStorage.getItem('user_name') || 'Волчек А.А.';
        const allDates = [...new Set(currentDraftItems.flatMap(i => i.dates))].sort();
        const formattedDatesStr = allDates.map(d => formatDate(d)).join(', ');

        const generatedId = Date.now();
        const documentPayload = {
            id: generatedId,
            doc_type: 'weekend_memo',
            weekend_date: formattedDatesStr, 
            reason: 'производственная необходимость',
            signatory: `${authorRole} ${authorName}`,
            items_data: currentDraftItems
        };

        // 1. Сначала сохраняем в локальный бэкап браузера (ГАРАНТИЯ от исчезновения)
        let archiveBackup = JSON.parse(localStorage.getItem('local_memos_backup') || '[]');
        archiveBackup.unshift(documentPayload);
        localStorage.setItem('local_memos_backup', JSON.stringify(archiveBackup));

        // 2. Добавляем в текущую оперативную память отображения
        if (!savedMemosArchive.some(m => m.id === generatedId)) {
            savedMemosArchive.unshift(documentPayload);
        }
        
        // Очищаем черновик формы
        currentDraftItems = [];
        renderDraftTable();

        // Сбрасываем фильтр, чтобы точно отобразить всё
        const filterSelect = document.getElementById('archiveDocTypeFilter');
        if (filterSelect) filterSelect.value = 'all';

        // Мгновенно рендерим таблицу (пользователь видит запись сразу!)
        window.renderArchiveRows();

        // Переключаемся на вкладку архива
        await window.switchDocsSection('archive');

        // 3. Асинхронно в фоне отправляем в Supabase без блокировки UI
        try {
            if (window._supabase) {
                await window._supabase.from('weekend_orders_json').insert([documentPayload]);
                console.log("Документ успешно синхронизирован с Supabase.");
            }
        } catch (err) {
            console.warn("Ошибка связи с сервером, документ остался в локальной памяти:", err);
        }
    };

    window.deleteOrderDocument = async (memoId) => {
        if (!confirm("Вы уверены, что хотите безвозвратно удалить этот документ из архива?")) return;

        savedMemosArchive = savedMemosArchive.filter(m => String(m.id) !== String(memoId));
        window.renderArchiveRows();

        try {
            if (window._supabase) {
                await window._supabase.from('weekend_orders_json').delete().eq('id', memoId);
            }
        } catch (e) {
            console.log("Ошибка удаления из СУБД");
        }

        let localData = JSON.parse(localStorage.getItem('local_memos_backup') || '[]');
        localData = localData.filter(m => String(m.id) !== String(memoId));
        localStorage.setItem('local_memos_backup', JSON.stringify(localData));
    };

    window.printOrderDocument = (memoId, mode) => {
        const memo = savedMemosArchive.find(m => String(m.id) === String(memoId));
        if (!memo) {
            alert("Не удалось найти документ.");
            return;
        }

        const printBlock = document.getElementById('cleanPrintBlock');
        let htmlContent = '';

        if (mode === 'text') {
            const grouped = {};
            memo.items_data.forEach(item => {
                if (!grouped[item.category]) grouped[item.category] = [];
                grouped[item.category].push(item);
            });

            let currentNum = 1;
            let itemsHtml = '';
            for (const cat in grouped) {
                itemsHtml += `<p style="margin-top: 10px; margin-bottom: 2px; font-weight: bold; font-family: 'Times New Roman', serif; font-size: 14px;">${cat}:</p>`;
                grouped[cat].forEach(row => {
                    const techStr = (row.tech && row.tech !== 'Без техники') ? ` – <b>${row.tech}</b>` : '';
                    itemsHtml += `<p style="margin-left: 25px; margin-top: 1px; margin-bottom: 1px; font-family: 'Times New Roman', serif; font-size: 14px;"><b>${currentNum}. ${row.fio}</b>${techStr} - (${row.work});</p>`;
                    currentNum++;
                });
            }

            htmlContent = `
                <div style="font-family: 'Times New Roman', serif; color: black; font-size: 14px; line-height: 1.4; max-width: 700px; margin: 0 auto; padding: 20px;">
                    <div style="margin-left: auto; width: 280px; margin-bottom: 40px; line-height: 1.3;">
                        Директору филиала СХК<br>«Великополье»<br>Рунцевичу Д.С.<br><br>
                        ${memo.signatory.split(' ')[0]}<br><b>${memo.signatory.split(' ').slice(1).join(' ')}</b>
                    </div>
                    <h1 style="text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 25px; font-family: 'Times New Roman', serif;">СЛУЖЕБНАЯ ЗАПИСКА</h1>
                    <p style="text-indent: 30px; text-align: justify; margin-bottom: 15px;">
                        В связи с производственной необходимостью, прошу Вас привлечь к работе в выходные дни 
                        <b>(${memo.weekend_date})</b> следующих работников филиала:
                    </p>
                    ${itemsHtml}
                    <div style="margin-top: 50px; display: flex; justify-content: space-between; font-weight: bold;">
                        <div>${memo.signatory.split(' ')[0]}</div>
                        <div>${memo.signatory.split(' ').slice(1).join(' ')}</div>
                    </div>
                </div>
            `;
        } else {
            let rowsHtml = '';
            let idx = 1;

            memo.items_data.forEach(item => {
                let prof = item.category;
                if (prof.includes("Трактористов")) prof = "Тракторист-машинист";
                else if (prof.includes("Водителей")) prof = "Водитель";
                else if (prof.includes("Слесарей")) prof = "Слесарь по ремонту";

                const workerDates = item.dates.map(d => formatDate(d)).join(', ');

                rowsHtml += `
                    <tr style="border: 1px solid black;">
                        <td style="border: 1px solid black; padding: 5px; text-align: center;">${idx}</td>
                        <td style="border: 1px solid black; padding: 5px;">${item.fio}</td>
                        <td style="border: 1px solid black; padding: 5px;">${prof}</td>
                        <td style="border: 1px solid black; padding: 5px; text-align: center;">${workerDates}</td>
                        <td style="border: 1px solid black; padding: 5px; width: 160px;"></td>
                    </tr>
                `;
                idx++;
            });

            htmlContent = `
                <div style="font-family: 'Times New Roman', serif; color: black; font-size: 13px; max-width: 750px; margin: 0 auto; padding: 10px;">
                    <h2 style="text-align: center; font-size: 14px; font-weight: bold; line-height: 1.4; margin-bottom: 20px;">
                        Список работников, привлеченных к работе в выходные дни<br>на ${memo.weekend_date}гг.
                    </h2>
                    <table style="width: 100%; border-collapse: collapse; font-family: 'Times New Roman', serif;">
                        <thead>
                            <tr style="background-color: #f3f4f6; border: 1px solid black;">
                                <th style="border: 1px solid black; padding: 6px; text-align: center; width: 40px;">№ п/п</th>
                                <th style="border: 1px solid black; padding: 6px; text-align: center;">Фамилия, имя, отчество (полностью)</th>
                                <th style="border: 1px solid black; padding: 6px; text-align: center;">Профессия</th>
                                <th style="border: 1px solid black; padding: 6px; text-align: center; width: 120px;">Дата привлечения</th>
                                <th style="border: 1px solid black; padding: 6px; text-align: center;">Согласие, подпись, дата ознакомления</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>
            `;
        }

        if(printBlock) {
            printBlock.innerHTML = htmlContent;
            window.print();
            printBlock.innerHTML = '';
        }
    };

    window.downloadOrderDocx = (memoId) => {
        const memo = savedMemosArchive.find(m => String(m.id) === String(memoId));
        if (!memo) return;

        const docxLib = window.docx || window.Docx;
        if (!docxLib || !docxLib.Document) {
            alert("Экспорт инициализируется. Попробуйте еще раз.");
            return;
        }

        const { Document, Packer, Paragraph, TextRun, AlignmentType } = docxLib;
        const sigParts = memo.signatory.split(' ');
        const roleStr = sigParts[0] || 'Инженер по ЭМТП';
        const nameStr = sigParts.slice(1).join(' ') || 'Волчек А.А.';

        const children = [
            new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { after: 200 },
                children: [
                    new TextRun({ text: "Директору филиала СХК\n«Великополье»\nРунцевичу Д.С.\n\n" + roleStr + "\n", font: "Times New Roman", size: 28 }),
                    new TextRun({ text: nameStr, bold: true, font: "Times New Roman", size: 28 })
                ]
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 300, after: 300 },
                children: [
                    new TextRun({ text: "СЛУЖЕБНАЯ ЗАПИСКА", bold: true, size: 32, font: "Times New Roman" })
                ]
            }),
            new Paragraph({
                indent: { firstLine: 500 },
                spacing: { after: 200 },
                alignment: AlignmentType.JUSTIFY,
                children: [
                    new TextRun({ text: `В связи с производственной необходимостью, прошу Вас привлечь к работе в выходные дни `, font: "Times New Roman", size: 28 }),
                    new TextRun({ text: `(${memo.weekend_date})`, bold: true, font: "Times New Roman", size: 28 }),
                    new TextRun({ text: ` следующих работников филиала:`, font: "Times New Roman", size: 28 })
                ]
            })
        ];

        const grouped = {};
        memo.items_data.forEach(item => {
            if (!grouped[item.category]) grouped[item.category] = [];
            grouped[item.category].push(item);
        });

        let currentNum = 1;
        for (const cat in grouped) {
            children.push(new Paragraph({ 
                spacing: { before: 150, after: 50 },
                children: [new TextRun({ text: `${cat}:`, bold: true, font: "Times New Roman", size: 28 })] 
            }));
            
            grouped[cat].forEach(row => {
                const techStr = (row.tech && row.tech !== 'Без техники') ? ` – ${row.tech}` : '';
                children.push(new Paragraph({
                    indent: { left: 400 },
                    spacing: { after: 40 },
                    children: [
                        new TextRun({ text: `${currentNum}. ${row.fio}`, bold: true, font: "Times New Roman", size: 28 }),
                        new TextRun({ text: `${techStr} - (${row.work});`, font: "Times New Roman", size: 28 })
                    ]
                }));
                currentNum++;
            });
        }

        children.push(new Paragraph({
            spacing: { before: 600 },
            children: [
                new TextRun({ text: roleStr, font: "Times New Roman", size: 28 }),
                new TextRun({ text: "\t\t\t\t\t\t" + nameStr, bold: true, font: "Times New Roman", size: 28 })
            ]
        }));

        const doc = new Document({ sections: [{ children: children }] });
        Packer.toBlob(doc).then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Служебная_записка_${memoId}.docx`;
            a.click();
            window.URL.revokeObjectURL(url);
        });
    };
}

function renderDraftTable() {
    const tbody = document.getElementById('orderDraftTableBody');
    if (!tbody) return;

    if (currentDraftItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center p-8 text-gray-400">Список пуст. Заполните форму слева и добавьте людей.</td></tr>`;
        return;
    }

    tbody.innerHTML = currentDraftItems.map(item => {
        const datesLabel = item.dates.map(d => formatDate(d)).join('<br>');
        return `
            <tr class="hover:bg-gray-50 transition">
                <td class="p-2.5 font-bold text-emerald-700 leading-tight">${datesLabel}</td>
                <td class="p-2.5">
                    <div class="font-black text-gray-950">${item.fio}</div>
                    <div class="text-[10px] text-gray-500 font-semibold">${item.category}</div>
                </td>
                <td class="p-2.5"><span class="bg-gray-100 text-gray-800 border border-gray-300 px-2 py-0.5 rounded-md font-bold text-[10px]">${item.tech}</span></td>
                <td class="p-2.5 text-gray-600 font-medium italic">${item.work}</td>
                <td class="p-2.5 text-right">
                    <button onclick="window.removeWorkerFromDraft(${item.id})" class="text-red-600 hover:text-red-800 font-bold">❌</button>
                </td>
            </tr>
        `;
    }).join('');
}

async function loadArchiveFromSupabase() {
    // Получаем то, что сохранено локально в браузере
    const localBackup = JSON.parse(localStorage.getItem('local_memos_backup') || '[]');
    
    try {
        if (!window._supabase) throw new Error("Нет СУБД");
        const { data, error } = await window._supabase.from('weekend_orders_json').select('*').order('id', { ascending: false });
        if (error) throw error;
        
        // УМНОЕ ОБЪЕДИНЕНИЕ: Берем данные из сервера, но если в локальном бэкапе есть записи,
        // которых сервер еще не знает (они новые), мы принудительно добавляем их в начало списка.
        const serverData = data || [];
        const combined = [...localBackup];
        
        serverData.forEach(sDoc => {
            if (!combined.some(cDoc => String(cDoc.id) === String(sDoc.id))) {
                combined.push(sDoc);
            }
        });
        
        savedMemosArchive = combined.sort((a, b) => b.id - a.id);
    } catch (e) {
        // Если сервер недоступен или выдал ошибку — берем локальный бэкап
        savedMemosArchive = localBackup.sort((a, b) => b.id - a.id);
    }
    window.renderArchiveRows();
}

window.renderArchiveRows = () => {
    const tbody = document.getElementById('orderArchiveTableBody');
    if (!tbody) return;

    const filterVal = document.getElementById('archiveDocTypeFilter').value;
    
    let filtered = (filterVal === 'all') 
        ? savedMemosArchive 
        : savedMemosArchive.filter(m => m.doc_type === filterVal);

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center p-8 text-gray-400">Служебные записки отсутствуют.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(memo => {
        const docCategoryName = memo.doc_type === 'weekend_memo' ? '📄 Служебная записка' : '📁 Документ';
        return `
            <tr class="hover:bg-gray-50 transition text-xs font-bold text-gray-800">
                <td class="p-3 text-gray-400 font-mono">#${memo.id || 'L'}</td>
                <td class="p-3 text-gray-600">${docCategoryName}</td>
                <td class="p-3 text-gray-950">${memo.weekend_date}</td>
                <td class="p-3"><span class="bg-emerald-50 text-emerald-700 border border-emerald-300 px-2.5 py-0.5 rounded-full text-[11px] font-black">${memo.items_data ? memo.items_data.length : 0} чел.</span></td>
                <td class="p-3 text-gray-500 text-[11px] font-medium">${memo.signatory}</td>
                <td class="p-3 text-right space-x-1 whitespace-nowrap">
                    <button onclick="window.printOrderDocument('${memo.id}', 'text')" class="bg-gray-50 hover:bg-gray-100 border border-gray-400 text-gray-800 px-2 py-1 rounded-md text-[11px] font-bold transition">👁 Текст</button>
                    <button onclick="window.printOrderDocument('${memo.id}', 'table')" class="bg-emerald-50 hover:bg-emerald-100 border border-emerald-400 text-emerald-800 px-2 py-1 rounded-md text-[11px] font-bold transition">📊 Ознакомление</button>
                    <button onclick="window.downloadOrderDocx('${memo.id}')" class="bg-blue-50 hover:bg-blue-100 border border-blue-400 text-blue-700 px-2 py-1 rounded-md text-[11px] font-bold transition">💾 Word</button>
                    <button onclick="window.deleteOrderDocument('${memo.id}')" class="bg-red-50 hover:bg-red-100 border border-red-400 text-red-600 px-2 py-1 rounded-md text-[11px] font-bold transition">❌</button>
                </td>
            </tr>
        `;
    }).join('');
};

function formatDate(dateStr) {
    if (!dateStr) return '';
    if (dateStr.includes('.')) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`;
    return dateStr;
}