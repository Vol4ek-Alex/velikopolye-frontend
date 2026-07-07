// js/docs/machineryLifecycle.js

export const machineryLifecycleTemplate = `
<div id="subModule_machinery_lifecycle" class="hidden space-y-4 fade-in-sub">
    <style>
        @media print {
            body * { 
                visibility: hidden; 
            }
            #tripPrintBlock, #tripPrintBlock * { 
                visibility: visible; 
            }
            #tripPrintBlock { 
                position: absolute; 
                left: 0; 
                top: 0; 
                width: 100%; 
            }
            .print-page-a4 {
                visibility: visible !important;
                page-break-after: always !important;
                page-break-inside: avoid !important;
                font-family: "Times New Roman", serif !important;
                font-size: 11pt !important;
                line-height: 1.4 !important;
                width: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
                border: none !important;
                box-shadow: none !important;
                background: transparent !important;
            }
            @page { 
                size: A4 portrait; 
                margin: 2cm 1.5cm 2cm 2.5cm; 
            }
            .no-print { 
                display: none !important; 
            }
        }
        .storage-table th, .storage-table td {
            border: 1px solid black !important;
            padding: 5px 6px;
            font-size: 12px;
            text-align: center;
        }
    </style>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="bg-white border-2 border-gray-400 p-5 rounded-xl shadow-xs space-y-4 no-print">
            <h3 class="text-xs font-black text-gray-700 uppercase tracking-wider mb-2">❄️ Постановка на хранение (ГОСТ 7751-2009)</h3>
            
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="block text-[9px] font-bold text-gray-600 mb-0.5">Дата акта</label>
                    <input type="date" id="storageActDate" oninput="window.updateStoragePreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-blue-600">
                </div>
                <div>
                    <label class="block text-[9px] font-bold text-gray-600 mb-0.5">Номер акта</label>
                    <input type="text" id="storageActNumber" value="1" oninput="window.updateStoragePreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-blue-600">
                </div>
            </div>

            <div class="border-t border-gray-200 pt-3 space-y-2">
                <span class="text-[10px] font-black text-gray-500 uppercase tracking-wider">Ответственные лица</span>
                <div>
                    <label class="block text-[9px] font-bold text-gray-600 mb-0.5">Сдал (Должность, ФИО)</label>
                    <input type="text" id="storageWorker" value="Тракторист Чернов В.Н." oninput="window.updateStoragePreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-blue-600">
                </div>
            </div>

            <div class="border-t border-gray-200 pt-3 space-y-2">
                <span class="text-[10px] font-black text-gray-500 uppercase tracking-wider">Состояние и консервация</span>
                <div>
                    <label class="block text-[9px] font-bold text-gray-600 mb-0.5">Техническое состояние</label>
                    <input type="text" id="storageCondition" value="на ходу" oninput="window.updateStoragePreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-blue-600">
                </div>
                <div>
                    <label class="block text-[9px] font-bold text-gray-600 mb-0.5">Качество консервации</label>
                    <input type="text" id="storageQuality" value="соответствует требованиям стандартов" oninput="window.updateStoragePreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-blue-600">
                </div>
            </div>

            <button onclick="window.printAndSaveStorageAct()" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold transition shadow-xs text-xs flex items-center justify-center gap-2🖨️">
                🖨️ Печать Акта хранения
            </button>
        </div>

        <div class="lg:col-span-2 bg-gray-100 p-4 rounded-xl border-2 border-gray-300 flex flex-col justify-between max-h-[80vh] overflow-y-auto no-print">
            <div id="storageLivePreview">
                </div>
        </div>
    </div>
</div>
`;

export function initMachineryLifecycle(selectedVehicle = null) {
    // Если машина не передана из таблицы, используем тестовую заглушку
    const vehicle = selectedVehicle || {
        model: "Плуг ППО (4+1)-40 КЗ",
        inv_number: "у-374"
    };

    function formatRusDate(dateStr) {
        if (!dateStr) return '«___» ____________ 20___ г.';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
            return `«${parts[2]}» ${months[parseInt(parts[1])-1]} 20${parts[0].substring(2)} г.`;
        }
        return dateStr;
    }

    window.generateStorageHtmlContent = (isForWord = false) => {
        const actDateRaw = document.getElementById('storageActDate')?.value || '';
        const actNumber = document.getElementById('storageActNumber')?.value || '______';
        const worker = document.getElementById('storageWorker')?.value || '';
        const condition = document.getElementById('storageCondition')?.value || 'на ходу';
        const quality = document.getElementById('storageQuality')?.value || '';
        const formattedDate = formatRusDate(actDateRaw);

        return `
        <div class="print-page-a4 bg-white p-8 border border-gray-300 text-black font-serif text-justify" style="font-family: 'Times New Roman', serif; font-size: 14px; line-height: 1.4; box-sizing: border-box;">
            
            <div style="text-align: center; font-size: 11px; margin-bottom: 10px; font-weight: bold; font-family: 'Times New Roman', serif;">ГОСТ 7751-2009</div>

            <table style="width: 100%; border-collapse: collapse; border: none; margin-bottom: 30px;">
                <tr>
                    <td style="width: 50%; vertical-align: top; border: none; padding: 0; font-family: 'Times New Roman', serif; font-size: 14px; line-height: 1.3;">
                        Филиал СХК «Великополье»<br>
                        ГП «Минсктранс»<br>
                        <span style="font-size: 11px; color: #555;">(наименование с/х предприятия)</span>
                    </td>
                    <td style="width: 50%; vertical-align: top; border: none; padding: 0; padding-left: 40px; font-family: 'Times New Roman', serif; font-size: 14px; line-height: 1.3; text-align: left;">
                        <strong>УТВЕРЖДАЮ</strong><br>
                        Директор филиала СХК «Великополье»<br>
                        __________________ Д.С. Рунцевич<br>
                        ${formattedDate}
                    </td>
                </tr>
            </table>

            <div style="text-align: center; margin-bottom: 25px; font-family: 'Times New Roman', serif;">
                <strong style="font-size: 16px; uppercase tracking-wide">АКТ № ${actNumber}</strong><br>
                <strong style="font-size: 15px;">постановки машин на хранение</strong><br>
                <span style="font-size: 14px;">${formattedDate}</span>
            </div>

            <p style="margin-bottom: 15px; text-indent: 0px; font-family: 'Times New Roman', serif; font-size: 14px;">
                Мы, нижеподписавшиеся, составили настоящий акт о том, что ${worker} сдал, а ответственный за хранение инженер по ЭМТП Волчек А.А. принял:
            </p>

            <div style="margin-bottom: 20px; font-family: 'Times New Roman', serif; font-size: 14px; line-height: 1.5; padding-left: 20px;">
                <strong>Наименование (марка):</strong> ${vehicle.model}<br>
                <strong>Инвентарный номер:</strong> инв. № ${vehicle.inv_number}<br>
                <strong>Техническое состояние:</strong> ${condition}
            </div>

            <div style="font-weight: bold; margin-bottom: 6px; font-family: 'Times New Roman', serif; font-size: 14px;">Характеристика основных сборочных единиц и деталей:</div>
            <table class="storage-table" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-family: 'Times New Roman', serif;">
                <thead>
                    <tr style="background-color: #fafafa;">
                        <th rowspan="2" style="width: 45%; font-weight: bold;">Наименование</th>
                        <th rowspan="2" style="font-weight: bold;">Подлежит замене</th>
                        <th colspan="2" style="font-weight: bold;">Требует</th>
                        <th rowspan="2" style="width: 25%; font-weight: bold;">Примечание</th>
                    </tr>
                    <tr style="background-color: #fafafa;">
                        <th style="width: 12%; font-weight: bold;">ремонт</th>
                        <th style="width: 12%; font-weight: bold;">ТО</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td style="text-align: left;">Двигатель / Рама</td><td>нет</td><td>нет</td><td>нет</td><td>исправен</td></tr>
                    <tr><td style="text-align: left;">Ходовая часть / Рабочие органы</td><td>нет</td><td>нет</td><td>нет</td><td>очищены, консервация</td></tr>
                    <tr><td style="text-align: left;">Электрооборудование</td><td>нет</td><td>нет</td><td>нет</td><td>аккумулятор снят</td></tr>
                </tbody>
            </table>

            <div style="font-weight: bold; margin-bottom: 8px; font-family: 'Times New Roman', serif; font-size: 14px;">При постановке машины на хранение:</div>
            
            <div style="padding-left: 15px; margin-bottom: 20px; font-family: 'Times New Roman', serif;">
                <div style="font-style: italic; margin-bottom: 5px; font-size: 14px;">а) сданы на склад:</div>
                <table class="storage-table" style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                    <thead>
                        <tr style="background-color: #fafafa;"><th style="text-align: left; width: 75%; font-weight: bold;">Наименование сборочных единиц и деталей, инструмента</th><th style="width: 25%; font-weight: bold;">Количество</th></tr>
                    </thead>
                    <tbody>
                        <tr><td style="text-align: left;">Инструментальный ящик, аккумуляторная батарея</td><td>1 компл.</td></tr>
                    </tbody>
                </table>

                <div style="font-style: italic; margin-bottom: 5px; font-size: 14px;">б) отсутствует:</div>
                <table class="storage-table" style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                    <thead>
                        <tr style="background-color: #fafafa;"><th style="text-align: left; width: 75%; font-weight: bold;">Наименование сборочных единиц и деталей, инструмента</th><th style="width: 25%; font-weight: bold;">Количество</th></tr>
                    </thead>
                    <tbody>
                        <tr><td style="text-align: left;">Не обнаружено</td><td>—</td></tr>
                    </tbody>
                </table>
            </div>

            <p style="margin-bottom: 40px; font-family: 'Times New Roman', serif; font-size: 14px;">
                <strong>Качество подготовки, установки машин и ее консервации:</strong><br>
                ${quality}
            </p>

            <table style="width: 100%; border-collapse: collapse; border: none; margin-top: 50px; font-family: 'Times New Roman', serif; font-size: 14px;">
                <tr>
                    <td style="width: 50%; border: none; padding: 0; text-align: left;">
                        Сдал: ___________________ / ______________ /
                    </td>
                    <td style="width: 50%; border: none; padding: 0; text-align: right;">
                        Принял: ___________________ / Волчек А.А. /
                    </td>
                </tr>
            </table>
        </div>`;
    };

    window.updateStoragePreview = () => {
        const preview = document.getElementById('storageLivePreview');
        if (preview) preview.innerHTML = window.generateStorageHtmlContent(false);
    };

    window.printAndSaveStorageAct = async () => {
        const printBlock = document.getElementById('tripPrintBlock');
        if (printBlock) {
            printBlock.innerHTML = window.generateStorageHtmlContent(false);
            window.print();
            printBlock.innerHTML = '';
        }

        const supabase = window._supabase || window.supabase;
        if (!supabase) return;

        const actNumber = document.getElementById('storageActNumber')?.value || '1';
        const fileName = `storage_act_№${actNumber}_${vehicle.inv_number}.doc`;

        try {
            const wordContent = 
                '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">\n' +
                '<head><meta charset="utf-8">\n' +
                '<style>\n' +
                '@page { size: 21cm 29.7cm; margin: 2cm 1.5cm 2cm 2.5cm; }\n' +
                'body { font-family: "Times New Roman", serif; font-size: 11pt; }\n' +
                'table { width:100%; border-collapse:collapse; }\n' +
                'td, th { border: 1px solid black; padding: 4px; text-align: center; }\n' +
                '</style></head>\n' +
                '<body>\n' + window.generateStorageHtmlContent(true) + '\n</body></html>';

            const fileBlob = new Blob([wordContent], { type: 'application/msword;charset=utf-8' });
            await supabase.storage.from('documents-history').upload(fileName, fileBlob, { upsert: true });
        } catch (err) {
            console.error('Ошибка автоматического сохранения:', err.message);
        }
    };

    setTimeout(window.updateStoragePreview, 50);
}