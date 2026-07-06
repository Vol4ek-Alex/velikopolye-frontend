// Локальная база водителей для быстрого выбора
const DRIVERS_DATABASE = [
    "Синицкий В. А.", "Жданович М. С.", "Любецкий А.С.", "Квятковский А.А.", 
    "Судник М.В.", "Сонич С.В.", "Хроленко И.В.", "Кучеров В.В."
];

// Справочник частых целей командировки (для чего)
const TRIP_PURPOSES = [
    "получения запчастей",
    "доставки сельскохозяйственной продукции",
    "прохождения технического осмотра",
    "ремонта оборудования",
    "доставки товарно-материальных ценностей"
];

// Справочник частых пунктов назначения (куда)
const TRIP_DESTINATIONS = [
    "город Дзержинск",
    "город Минск",
    "город Борисов",
    "город Жодино",
    "город Фаниполь"
];

// Полный реестр всех карточек (на вырост)
const ALL_DOC_CARDS = [
    { id: 'business_trip', title: 'Командировки', desc: 'Оформление приказов, направлений и командировочных удостоверений.', icon: '💼', category: 'personal' },
    { id: 'weekend_memo', title: 'Выходные дни', desc: 'Привлечение персонала к работе в субботу и воскресенье.', icon: '📝', category: 'personal' },
    { id: 'vacation', title: 'График отпусков', desc: 'Заявления на ежегодный отпуск и перенос дат отдыха.', icon: '🌴', category: 'personal' },
    { id: 'inventory_act', title: 'Акт инвентаризации', desc: 'Списание, проверка и учет товарно-материальных ценностей.', icon: '📊', category: 'sklad' }
];

let currentSubModule = "menu";
let currentTripTab = "form"; // "form" или "history"

// Предварительная сборка элементов для разметки, чтобы не ломать шаблонные строки
const driverOptionsHtml = DRIVERS_DATABASE.map(d => '<option value="' + d + '">' + d + '</option>').join('');
const destinationsHtml = TRIP_DESTINATIONS.map(dest => '<option value="' + dest + '">').join('');
const purposesHtml = TRIP_PURPOSES.map(p => '<option value="' + p + '">').join('');

export const template = `
<style>
.fade-in-sub {
    animation: fadeInSub 0.25s ease-out forwards;
}
@keyframes fadeInSub {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
}
@media print {
    body * { visibility: hidden !important; }
    #tripPrintBlock, #tripPrintBlock * { visibility: visible !important; }
    #tripPrintBlock {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
    }
    .no-print-section { display: none !important; }
}
</style>

<div class="space-y-6 no-print-section">
    <div class="bg-white p-5 rounded-xl border-2 border-gray-400/80 shadow-xs flex justify-between items-center">
        <div>
            <h2 class="text-xl font-bold text-gray-950 tracking-tight">📁 Центр документооборота</h2>
            <p class="text-xs text-gray-600 font-medium">Управление внутренней документацией, служебными записками и архив в Supabase Storage</p>
        </div>
        <button id="docBackToMenuBtn" onclick="window.switchDocSubModule('menu')" class="hidden bg-gray-100 hover:bg-gray-200 border border-gray-400 font-bold text-xs text-gray-900 px-3 py-1.5 rounded-lg transition">
            ⬅ Назад в каталог
        </button>
    </div>

    <div id="docSearchPanel" class="bg-white p-4 rounded-xl border-2 border-gray-400/60 shadow-2xs flex gap-3 items-center">
        <div class="relative flex-1">
            <span class="absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm">🔍</span>
            <input type="text" id="docCardsSearchInput" oninput="window.filterDocCards()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:border-blue-600 focus:bg-white transition" placeholder="Поиск среди документов (например: командировки, отпуск)...">
        </div>
    </div>

    <div id="docHubMainMenu" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 fade-in-sub">
        </div>

    <div id="subModule_business_trip" class="hidden space-y-4 fade-in-sub">
        <div class="flex border-b border-gray-300 gap-2">
            <button id="tripTabBtn_form" onclick="window.switchTripTab('form')" class="px-4 py-2 text-xs font-black border-b-2 border-blue-600 text-blue-600">
                📝 Новый документ
            </button>
            <button id="tripTabBtn_history" onclick="window.switchTripTab('history')" class="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 border-b-2 border-transparent">
                🗄️ История в Storage
            </button>
        </div>

        <div id="tripContent_form" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="bg-white border-2 border-gray-400 p-5 rounded-xl shadow-xs space-y-4">
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-[10px] font-bold text-gray-700 mb-1">Дата документа</label>
                        <input type="date" id="tripDocDate" oninput="window.updateTripPreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-blue-600">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-gray-700 mb-1">Дата поездки</label>
                        <input type="date" id="tripTargetDate" oninput="window.updateTripPreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-blue-600">
                    </div>
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-gray-700 mb-1">Водитель автомобиля</label>
                    <select id="tripDriverSelect" onchange="window.handleTripDriverSelect()" class="w-full bg-white border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-blue-600">
                        ${driverOptionsHtml}
                        <option value="CUSTOM">-- Ввести вручную --</option>
                    </select>
                    <input type="text" id="tripDriverCustomInput" oninput="window.updateTripPreview()" class="hidden mt-2 w-full bg-gray-50 border-2 border-blue-400 rounded-lg p-2 text-xs font-bold focus:border-blue-600" placeholder="Введите ФИО">
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-gray-700 mb-1">Куда (Пункт назначения)</label>
                    <input type="text" id="tripDestinationInput" list="destinationsList" oninput="window.updateTripPreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-blue-600">
                    <datalist id="destinationsList">${destinationsHtml}</datalist>
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-gray-700 mb-1">Для чего (Цель)</label>
                    <input type="text" id="tripPurposeInput" list="purposesList" oninput="window.updateTripPreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-blue-600">
                    <datalist id="purposesList">${purposesHtml}</datalist>
                </div>

                <button onclick="window.printAndSaveTrip()" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold transition shadow-xs text-xs flex items-center justify-center gap-2">
                    🖨️ Печать и сохранение в архив
                </button>
            </div>

            <div class="lg:col-span-2 bg-gray-100 p-4 rounded-xl border-2 border-gray-300 flex flex-col justify-between">
                <div id="tripLivePreview" class="bg-white p-8 border border-gray-300 shadow-xs rounded-lg font-serif text-black leading-relaxed" style="font-family: 'Times New Roman', serif; min-height: 400px;"></div>
            </div>
        </div>

        <div id="tripContent_history" class="hidden bg-white border-2 border-gray-400 p-5 rounded-xl shadow-xs">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xs font-black text-gray-500 uppercase tracking-wider">🗄️ Архив сгенерированных файлов (Supa Storage)</h3>
                <button onclick="window.loadTripStorageHistory()" class="text-[11px] font-bold text-blue-600 hover:underline">🔄 Обновить список</button>
            </div>
            
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                    <thead>
                        <tr class="bg-gray-100 border-b border-gray-300 text-gray-700">
                            <th class="p-2.5 font-bold">Имя файла в хранилище</th>
                            <th class="p-2.5 font-bold">Тип</th>
                            <th class="p-2.5 font-bold text-right">Действие</th>
                        </tr>
                    </thead>
                    <tbody id="tripStorageTableBody">
                        </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<div id="tripPrintBlock"></div>
`;

export function init() {
    setupSubModuleNavigation();
    renderDocCards(ALL_DOC_CARDS);
    
    const today = new Date().toISOString().split('T')[0];
    if (document.getElementById('tripDocDate')) document.getElementById('tripDocDate').value = today;
    if (document.getElementById('tripTargetDate')) document.getElementById('tripTargetDate').value = today;

    if (document.getElementById('tripDestinationInput')) document.getElementById('tripDestinationInput').value = "город Дзержинск";
    if (document.getElementById('tripPurposeInput')) document.getElementById('tripPurposeInput').value = "получения запчастей";

    window.switchDocSubModule('menu');
}

// Функция генерации плиток-карточек документов
function renderDocCards(cardsList) {
    const container = document.getElementById('docHubMainMenu');
    if (!container) return;
    
    if (cardsList.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-8 text-xs font-bold text-gray-400">Ничего не найдено</div>';
        return;
    }

    container.innerHTML = cardsList.map(card => {
        // Если модуль еще не готов (не командировки), делаем его полупрозрачным с плашкой "В разработке"
        const isReady = card.id === 'business_trip';
        const clickAction = isReady ? "window.switchDocSubModule('" + card.id + "')" : "alert('Данный тип документа находится в разработке')";
        const opacityClass = isReady ? "border-gray-400 hover:border-blue-600" : "opacity-50 border-gray-300 bg-gray-50 cursor-not-allowed";

        return '<div onclick="' + clickAction + '" class="bg-white border-2 rounded-xl p-5 shadow-2xs cursor-pointer transition flex items-start gap-4 group ' + opacityClass + '">' +
            '<div class="bg-blue-50 text-blue-700 p-3 rounded-lg text-xl font-bold group-hover:bg-blue-600 group-hover:text-white transition">' + card.icon + '</div>' +
            '<div class="flex-1">' +
                '<div class="flex justify-between items-center">' +
                    '<h4 class="font-bold text-gray-950 text-sm">' + card.title + '</h4>' +
                    (!isReady ? '<span class="text-[9px] bg-gray-200 text-gray-600 font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">План</span>' : '') +
                '</div>' +
                '<p class="text-[11px] text-gray-500 mt-1 font-medium">' + card.desc + '</p>' +
            '</div>' +
        '</div>';
    }).join('');
}

// Поиск по картам на лету
window.filterDocCards = () => {
    const query = document.getElementById('docCardsSearchInput')?.value.toLowerCase().trim() || "";
    const filtered = ALL_DOC_CARDS.filter(card => 
        card.title.toLowerCase().includes(query) || 
        card.desc.toLowerCase().includes(query)
    );
    renderDocCards(filtered);
};

function setupSubModuleNavigation() {
    window.switchDocSubModule = (targetModule) => {
        currentSubModule = targetModule;
        const mainMenu = document.getElementById('docHubMainMenu');
        const backBtn = document.getElementById('docBackToMenuBtn');
        const searchPanel = document.getElementById('docSearchPanel');
        
        const subContainers = {
            business_trip: document.getElementById('subModule_business_trip')
        };

        if (mainMenu) mainMenu.classList.add('hidden');
        if (backBtn) backBtn.classList.add('hidden');
        if (searchPanel) searchPanel.classList.add('hidden');
        Object.values(subContainers).forEach(el => { if (el) el.classList.add('hidden'); });

        if (targetModule === 'menu') {
            if (mainMenu) mainMenu.classList.remove('hidden');
            if (searchPanel) searchPanel.classList.remove('hidden');
            // Сбрасываем строку поиска
            const sInput = document.getElementById('docCardsSearchInput');
            if (sInput) { sInput.value = ""; renderDocCards(ALL_DOC_CARDS); }
        } else {
            if (backBtn) backBtn.classList.remove('hidden');
            if (subContainers[targetModule]) subContainers[targetModule].classList.remove('hidden');
            if (targetModule === 'business_trip') {
                window.switchTripTab('form');
                window.updateTripPreview();
            }
        }
    };

    window.switchTripTab = (tab) => {
        currentTripTab = tab;
        const formBlock = document.getElementById('tripContent_form');
        const historyBlock = document.getElementById('tripContent_history');
        const btnForm = document.getElementById('tripTabBtn_form');
        const btnHistory = document.getElementById('tripTabBtn_history');

        formBlock?.classList.add('hidden');
        historyBlock?.classList.add('hidden');
        btnForm?.classList.remove('border-b-2', 'border-blue-600', 'text-blue-600');
        btnHistory?.classList.remove('border-b-2', 'border-blue-600', 'text-blue-600');
        btnForm?.classList.add('text-gray-500');
        btnHistory?.classList.add('text-gray-500');

        if (tab === 'form') {
            formBlock?.classList.remove('hidden');
            btnForm?.classList.add('border-b-2', 'border-blue-600', 'text-blue-600');
        } else {
            historyBlock?.classList.remove('hidden');
            btnHistory?.classList.add('border-b-2', 'border-blue-600', 'text-blue-600');
            window.loadTripStorageHistory();
        }
    };

    window.handleTripDriverSelect = () => {
        const select = document.getElementById('tripDriverSelect');
        const customInput = document.getElementById('tripDriverCustomInput');
        if (select && customInput) {
            if (select.value === 'CUSTOM') {
                customInput.classList.remove('hidden');
                customInput.focus();
            } else {
                customInput.classList.add('hidden');
                customInput.value = '';
            }
        }
        window.updateTripPreview();
    };

    function formatTripDate(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3) return parts[2] + '.' + parts[1] + '.' + parts[0];
        return dateStr;
    }

    window.generateTripHtmlContent = () => {
        const docDate = formatTripDate(document.getElementById('tripDocDate')?.value);
        const targetDate = formatTripDate(document.getElementById('tripTargetDate')?.value);
        
        const selectVal = document.getElementById('tripDriverSelect')?.value;
        const customVal = document.getElementById('tripDriverCustomInput')?.value.trim();
        const driverName = selectVal === 'CUSTOM' ? (customVal || '') : selectVal;

        const destination = document.getElementById('tripDestinationInput')?.value.trim() || '';
        const purpose = document.getElementById('tripPurposeInput')?.value.trim() || '';

        return '<div style="font-family: \'Times New Roman\', serif; color: black; font-size: 15px; line-height: 1.6; max-width: 650px; margin: 0 auto; padding: 10px;">' +
                '<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 60px; font-family: \'Times New Roman\', serif; font-size: 15px;">' +
                    '<div style="padding-top: 0px; font-weight: normal; color: black;">' + docDate + '</div>' +
                    '<div style="width: 280px; text-align: left; line-height: 1.4; padding-left: 15px;">' +
                        'Директору филиала<br>СХК «Великополье»<br>Рунцевичу Д.С.<br>' +
                        'Заместителя директора –<br>главного инженера<br>Маковича М.П.' +
                    '</div>' +
                '</div>' +
                '<h1 style="text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 35px; font-family: \'Times New Roman\', serif; letter-spacing: 0.5px;">Служебная записка</h1>' +
                '<p style="text-align: justify; text-indent: 40px; margin-bottom: 70px; font-family: \'Times New Roman\', serif; font-size: 15px;">' +
                    'Прошу вас, командировать водителя автомобиля ' + driverName + ' в ' + destination + ', по вопросу ' + purpose + ' ' + targetDate + 'г.' +
                '</p>' +
                '<div style="margin-top: 70px; display: flex; justify-content: space-between; font-family: \'Times New Roman\', serif; font-size: 15px;">' +
                    '<div style="text-align: left; width: 60%; line-height: 1.4;">Заместитель директора –<br>Главный инженер</div>' +
                    '<div style="text-align: right; width: 40%; display: flex; align-items: flex-end; justify-content: flex-end;">Макович М.П.</div>' +
                '</div>' +
            '</div>';
    };

    window.updateTripPreview = () => {
        const previewBlock = document.getElementById('tripLivePreview');
        if (previewBlock) previewBlock.innerHTML = window.generateTripHtmlContent();
    };

    // Функция ПЕЧАТИ + ЗАГОТОВКА ПОД ЗАГРУЗКУ В SUPABASE STORAGE
    window.printAndSaveTrip = async () => {
        const htmlContent = window.generateTripHtmlContent();
        
        // 1. Сначала выводим на печать
        const printBlock = document.getElementById('tripPrintBlock');
        if (printBlock) {
            printBlock.innerHTML = htmlContent;
            window.print();
            printBlock.innerHTML = '';
        }

        // 2. Формируем красивое имя файла для архива в Storage
        const docDate = document.getElementById('tripDocDate')?.value || 'unknown-date';
        const selectVal = document.getElementById('tripDriverSelect')?.value;
        const customVal = document.getElementById('tripDriverCustomInput')?.value.trim();
        const driverRaw = selectVal === 'CUSTOM' ? customVal : selectVal;
        const driverTranslit = (driverRaw || 'worker').replace(/\s+/g, '_').replace(/\./g, '');
        
        const fileName = docDate + '_' + driverTranslit + '.html';

        console.log('Отправка файла ' + fileName + ' в бакет Supabase Storage...');
        
        /* ЗДЕСЬ БУДЕТ ВАШ ВЫЗОВ К СЕРВЕРУ ИЛИ НАПРЯМУЮ К SUPABASE:
        
        const fileBlob = new Blob([htmlContent], { type: 'text/html' });
        const { data, error } = await supabase.storage
            .from('documents-history')
            .upload('business_trips/' + fileName, fileBlob);
        */
        
        alert('Документ отправлен на печать и сформирован для архива Storage: ' + fileName);
    };

    // Функция загрузки списка файлов из хранилища (Заглушка имитации ответа от Supabase Storage)
    window.loadTripStorageHistory = async () => {
        const tBody = document.getElementById('tripStorageTableBody');
        if (!tBody) return;

        tBody.innerHTML = '<tr><td colspan="3" class="p-4 text-center text-gray-400 font-medium">Загрузка файлов из Supabase Storage...</td></tr>';

        /*
        В реальном коде это делается так:
        const { data: files, error } = await supabase.storage.from('documents-history').list('business_trips');
        */

        // Имитируем задержку сети и отдаем список сохраненных файлов из S3
        setTimeout(() => {
            const mockStorageFiles = [
                { name: "2026-07-06_Синицкий_ВА.html", type: "HTML (Бланк)" },
                { name: "2026-07-05_Квятковский_АА.html", type: "HTML (Бланк)" },
                { name: "2026-07-01_Судник_МВ.html", type: "HTML (Бланк)" }
            ];

            tBody.innerHTML = mockStorageFiles.map(file => {
                return '<tr class="border-b border-gray-100 hover:bg-gray-50 transition">' +
                    '<td class="p-2.5 font-mono text-gray-900 text-[11px]">📁 business_trips/' + file.name + '</td>' +
                    '<td class="p-2.5 text-gray-500 font-medium">' + file.type + '</td>' +
                    '<td class="p-2.5 text-right">' +
                        '<button onclick="alert(\'Скачивание/Просмотр файла: \' + \'' + file.name + '\')" class="bg-gray-100 hover:bg-blue-50 text-blue-600 font-bold px-2.5 py-1 rounded-md border border-gray-300 hover:border-blue-300 transition text-[11px]">Открыть</button>' +
                    '</td>' +
                '</tr>';
            }).join('');
        }, 400);
    };
}