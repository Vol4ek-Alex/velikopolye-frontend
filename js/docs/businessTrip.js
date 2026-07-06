// js/docs/businessTrip.js

const DRIVERS_DATABASE = [
    "Синицкий В. А.", "Жданович М. С.", "Любецкий А.С.", "Квятковский А.А.", 
    "Судник М.В.", "Сонич С.В.", "Хроленко И.В.", "Кучеров В.В."
];

const TRIP_PURPOSES = [
    "получения запчастей",
    "доставки сельскохозяйственной продукции",
    "прохождения технического осмотра",
    "ремонта оборудования",
    "доставки товарно-материальных ценностей"
];

const TRIP_DESTINATIONS = [
    "город Дзержинск",
    "город Минск",
    "город Борисов",
    "город Жодино",
    "город Фаниполь"
];

// Генерируем опции для селектов
const driverOptionsHtml = DRIVERS_DATABASE.map(d => '<option value="' + d + '">' + d + '</option>').join('') + '<option value="CUSTOM">-- Ввести вручную (Новый сотрудник) --</option>';
const destinationsHtml = TRIP_DESTINATIONS.map(dest => '<option value="' + dest + '">').join('');
const purposesHtml = TRIP_PURPOSES.map(p => '<option value="' + p + '">').join('');

// Экспортируем HTML-шаблон подмодуля
export const tripTemplate = `
<div id="subModule_business_trip" class="hidden space-y-4 fade-in-sub">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    ` + driverOptionsHtml + `
                </select>
                <input type="text" id="tripDriverCustomInput" oninput="window.updateTripPreview()" class="hidden mt-2 w-full bg-gray-50 border-2 border-blue-400 rounded-lg p-2 text-xs font-bold focus:border-blue-600" placeholder="Введите ФИО">
            </div>

            <div>
                <label class="block text-[10px] font-bold text-gray-700 mb-1">Куда (Пункт назначения)</label>
                <input type="text" id="tripDestinationInput" list="destinationsList" oninput="window.updateTripPreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-blue-600">
                <datalist id="destinationsList">` + destinationsHtml + `</datalist>
            </div>

            <div>
                <label class="block text-[10px] font-bold text-gray-700 mb-1">Для чего (Цель)</label>
                <input type="text" id="tripPurposeInput" list="purposesList" oninput="window.updateTripPreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-blue-600">
                <datalist id="purposesList">` + purposesHtml + `</datalist>
            </div>

            <button onclick="window.printAndSaveTrip()" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold transition shadow-xs text-xs flex items-center justify-center gap-2">
                🖨️ Печать и сохранение в архив
            </button>
        </div>

        <div class="lg:col-span-2 bg-gray-100 p-4 rounded-xl border-2 border-gray-300 flex flex-col justify-between">
            <div id="tripLivePreview" class="bg-white p-8 border border-gray-300 shadow-xs rounded-lg font-serif text-black leading-relaxed" style="font-family: 'Times New Roman', serif; min-height: 400px;"></div>
        </div>
    </div>
</div>
`;

// Экспортируем функции инициализации и работы подмодуля
export function initBusinessTrip() {
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

    window.printAndSaveTrip = async () => {
        const htmlContent = window.generateTripHtmlContent();
        
        const printBlock = document.getElementById('tripPrintBlock');
        if (printBlock) {
            printBlock.innerHTML = htmlContent;
            window.print();
            printBlock.innerHTML = '';
        }

        const supabase = window._supabase || window.supabase;
        if (!supabase) return alert('Ошибка: Клиент Supabase не найден.');

        const docDate = document.getElementById('tripDocDate')?.value || 'unknown-date';
        const selectVal = document.getElementById('tripDriverSelect')?.value;
        const customVal = document.getElementById('tripDriverCustomInput')?.value.trim();
        const driverRaw = selectVal === 'CUSTOM' ? customVal : selectVal;
        
        const translit = (str) => {
            const ru = {
                'а':'a', 'б':'b', 'в':'v', 'г':'g', 'д':'d', 'е':'e', 'ё':'e', 'ж':'zh', 'з':'z',
                'и':'i', 'й':'y', 'к':'k', 'л':'l', 'м':'m', 'н':'n', 'о':'o', 'п':'p', 'р':'r',
                'с':'s', 'т':'t', 'у':'u', 'ф':'f', 'х':'h', 'ц':'c', 'ч':'ch', 'ш':'sh', 'щ':'shch',
                'ы':'y', 'э':'e', 'ю':'yu', 'я':'ya', ' ': '_', '.': ''
            };
            return str.toLowerCase().split('').map(c => ru[c] || (/[a-z0-9_-]/.test(c) ? c : '')).join('');
        };

        const driverSafe = translit(driverRaw || 'worker');
        const fileName = 'trip_' + docDate + '_' + driverSafe + '.doc';

        try {
            const wordContent = 
                'xmlns:o="urn:schemas-microsoft-com:office:office"\n' +
                'xmlns:w="urn:schemas-microsoft-com:office:word"\n' +
                'xmlns="http://www.w3.org/TR/REC-html40">\n' +
                '<head>\n' +
                '\n' +
                '<meta charset="utf-8">\n' +
                '</head>\n' +
                '<body>\n' + 
                htmlContent + 
                '\n</body>\n</html>';

            const fileBlob = new Blob([wordContent], { type: 'application/msword;charset=utf-8' });
            
            const { error } = await supabase.storage
                .from('documents-history')
                .upload(fileName, fileBlob, { cacheControl: '3600', upsert: true });

            if (error) throw error;

            alert('Документ успешно распечатан и сохранен в общий архив как WORD (.doc)!');
            if (typeof window.loadTripStorageHistory === 'function') window.loadTripStorageHistory();

        } catch (err) {
            console.error('Ошибка архивации:', err);
            alert('Печать выполнена, но не удалось сохранить в Storage: ' + err.message);
        }
    };
}