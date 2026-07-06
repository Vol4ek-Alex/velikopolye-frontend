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

let currentSubModule = "menu";

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
            <p class="text-xs text-gray-600 font-medium">Управление внутренней документацией, служебными записками и заявлениями</p>
        </div>
        <button id="docBackToMenuBtn" onclick="window.switchDocSubModule('menu')" class="hidden bg-gray-100 hover:bg-gray-200 border border-gray-400 font-bold text-xs text-gray-900 px-3 py-1.5 rounded-lg transition">
            ⬅ Назад в каталог
        </button>
    </div>

    <div id="docHubMainMenu" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 fade-in-sub">
        <div onclick="window.switchDocSubModule('business_trip')" class="bg-white border-2 border-gray-400 rounded-xl p-5 shadow-2xs hover:border-blue-600 cursor-pointer transition flex items-start gap-4 group">
            <div class="bg-blue-50 text-blue-700 p-3 rounded-lg text-xl font-bold group-hover:bg-blue-600 group-hover:text-white transition">💼</div>
            <div>
                <h4 class="font-bold text-gray-950 text-sm">Командировки</h4>
                <p class="text-[11px] text-gray-500 mt-1 font-medium">Оформление приказов, направлений и командировочных удостоверений.</p>
            </div>
        </div>
    </div>

    <div id="subModule_business_trip" class="hidden grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in-sub">
        <div class="bg-white border-2 border-gray-400 p-5 rounded-xl shadow-xs space-y-4">
            <div class="border-b border-gray-200 pb-2">
                <h3 class="text-xs font-black text-blue-800 uppercase tracking-wider">📋 Параметры командировки</h3>
            </div>
            
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
                    ${DRIVERS_DATABASE.map(d => `<option value="${d}">${d}</option>`).join('')}
                    <option value="CUSTOM">-- Ввести вручную (Новый сотрудник) --</option>
                </select>
                <input type="text" id="tripDriverCustomInput" oninput="window.updateTripPreview()" class="hidden mt-2 w-full bg-gray-50 border-2 border-blue-400 rounded-lg p-2 text-xs font-bold focus:border-blue-600" placeholder="Введите ФИО (например, Иванов И.И.)">
            </div>

            <div>
                <label class="block text-[10px] font-bold text-gray-700 mb-1">Куда (Пункт назначения)</label>
                <input type="text" id="tripDestinationInput" list="destinationsList" oninput="window.updateTripPreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-blue-600" placeholder="Например, город Дзержинск">
                <datalist id="destinationsList">
                    ${TRIP_DESTINATIONS.map(dest => `<option value="${dest}">`).join('')}
                </datalist>
            </div>

            <div>
                <label class="block text-[10px] font-bold text-gray-700 mb-1">Для чего (Цель командировки)</label>
                <input type="text" id="tripPurposeInput" list="purposesList" oninput="window.updateTripPreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-blue-600" placeholder="Например, получения запчастей">
                <datalist id="purposesList">
                    ${TRIP_PURPOSES.map(p => `<option value="${p}">`).join('')}
                </datalist>
            </div>

            <button onclick="window.printTripDocument()" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold transition shadow-xs text-xs flex items-center justify-center gap-2">
                🖨️ Распечатать служебную записку
            </button>
        </div>

        <div class="lg:col-span-2 bg-gray-100 p-4 rounded-xl border-2 border-gray-300 flex flex-col justify-between">
            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">📄 Живой предпросмотр бланка (Times New Roman)</span>
            <div id="tripLivePreview" class="bg-white p-8 border border-gray-300 shadow-xs rounded-lg font-serif text-sm text-black leading-relaxed" style="font-family: 'Times New Roman', serif; min-height: 400px;">
                </div>
        </div>
    </div>
</div>

<div id="tripPrintBlock"></div>
`;

export function init() {
    setupSubModuleNavigation();
    
    // Выставляем текущую дату по умолчанию
    const today = new Date().toISOString().split('T')[0];
    const docDateInput = document.getElementById('tripDocDate');
    const targetDateInput = document.getElementById('tripTargetDate');
    if (docDateInput) docDateInput.value = today;
    if (targetDateInput) targetDateInput.value = today;

    // Предустановка дефолтных значений для полей назначения и цели
    const destInput = document.getElementById('tripDestinationInput');
    const purpInput = document.getElementById('tripPurposeInput');
    if (destInput) destInput.value = "город Дзержинск";
    if (purpInput) purpInput.value = "получения запчастей";

    window.switchDocSubModule('menu');
    window.updateTripPreview();
}

function setupSubModuleNavigation() {
    window.switchDocSubModule = (targetModule) => {
        currentSubModule = targetModule;
        const mainMenu = document.getElementById('docHubMainMenu');
        const backBtn = document.getElementById('docBackToMenuBtn');
        
        const subContainers = {
            business_trip: document.getElementById('subModule_business_trip')
        };

        if (mainMenu) mainMenu.classList.add('hidden');
        if (backBtn) backBtn.classList.add('hidden');
        Object.values(subContainers).forEach(el => { if (el) el.classList.add('hidden'); });

        if (targetModule === 'menu') {
            if (mainMenu) mainMenu.classList.remove('hidden');
        } else {
            if (backBtn) backBtn.classList.remove('hidden');
            if (subContainers[targetModule]) subContainers[targetModule].classList.remove('hidden');
            if (targetModule === 'business_trip') window.updateTripPreview();
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
        if (!dateStr) return '__.__.____';
        const parts = dateStr.split('-');
        if (parts.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`;
        return dateStr;
    }

    window.generateTripHtmlContent = () => {
        const docDate = formatTripDate(document.getElementById('tripDocDate')?.value);
        const targetDate = formatTripDate(document.getElementById('tripTargetDate')?.value);
        
        const selectVal = document.getElementById('tripDriverSelect')?.value;
        const customVal = document.getElementById('tripDriverCustomInput')?.value.trim();
        const driverName = selectVal === 'CUSTOM' ? (customVal || '_________________') : selectVal;

        const destination = document.getElementById('tripDestinationInput')?.value.trim() || '_________________';
        const purpose = document.getElementById('tripPurposeInput')?.value.trim() || '_________________';

        return `
            <div style="font-family: 'Times New Roman', serif; color: black; font-size: 14px; line-height: 1.5; max-width: 650px; margin: 0 auto; padding: 10px;">
                <div style="margin-left: auto; width: 260px; margin-bottom: 45px; font-size: 14px; text-align: left; font-family: 'Times New Roman', serif;">
                    Директору филиала<br>СХК «Великополье»<br><span style="border-bottom: 1px dashed black;">Рунцевичу</span> Д.С.<br>
                    Заместителя директора –<br>главного инженера<br>Маковича М.П.
                </div>

                <div style="margin-bottom: 30px; font-family: 'Times New Roman', serif; font-size: 14px; padding-left: 40px;">
                    ${docDate}
                </div>

                <h1 style="text-align: center; font-size: 15px; font-weight: bold; margin-bottom: 25px; font-family: 'Times New Roman', serif; letter-spacing: 0.5px;">
                    Служебная записка
                </h1>
                
                <p style="text-align: justify; text-indent: 40px; margin-bottom: 50px; font-family: 'Times New Roman', serif; font-size: 14px;">
                    Прошу вас, командировать водителя автомобиля <span style="border-bottom: 1px dashed black;">${driverName}</span> в <span style="border-bottom: 1px dashed black;">${destination}</span>, по вопросу <span style="border-bottom: 1px dashed black;">${purpose}</span> <span style="border-bottom: 1px dashed black;">${targetDate}г.</span>
                </p>
                
                <div style="margin-top: 60px; display: flex; justify-content: space-between; font-family: 'Times New Roman', serif; font-size: 14px;">
                    <div style="text-align: left; width: 60%;">
                        Заместитель директора –<br>Главный инженер
                    </div>
                    <div style="text-align: right; width: 40%; display: flex; align-items: flex-end; justify-content: flex-end;">
                        Макович М.П.
                    </div>
                </div>
            </div>
        `;
    };

    window.updateTripPreview = () => {
        const previewBlock = document.getElementById('tripLivePreview');
        if (previewBlock) {
            previewBlock.innerHTML = window.generateTripHtmlContent();
        }
    };

    window.printTripDocument = () => {
        const printBlock = document.getElementById('tripPrintBlock');
        if (printBlock) {
            printBlock.innerHTML = window.generateTripHtmlContent();
            window.print();
            printBlock.innerHTML = '';
        }
    };
}