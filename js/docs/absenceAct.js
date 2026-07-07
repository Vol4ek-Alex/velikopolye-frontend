// js/docs/absenceAct.js

export const absenceTemplate = `
<div id="subModule_absence_act" class="hidden space-y-4 fade-in-sub">
    <style>
        @media print {
            /* Прячем весь интерфейс сайта, кроме блока печати */
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
            /* Превращаем каждую карточку в полноценную страницу А4 */
            .print-page-a4 {
                visibility: visible !important;
                page-break-after: always !important;
                page-break-inside: avoid !important;
                font-family: "Times New Roman", serif !important;
                font-size: 14pt !important;
                line-height: 1.5 !important;
                width: 100% !important;
                max-width: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
                border: none !important;
                box-shadow: none !important;
                background: transparent !important;
            }
            /* Настройки полей страницы */
            @page {
                size: A4 portrait;
                margin: 2.5cm 2cm 2.5cm 2.5cm;
            }
            .no-print {
                display: none !important;
            }
        }
    </style>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="bg-white border-2 border-gray-400 p-5 rounded-xl shadow-xs space-y-4 no-print">
            <h3 class="text-xs font-black text-gray-700 uppercase tracking-wider mb-2">📋 Параметры актов (Подневный расчет)</h3>
            
            <div class="border-t border-gray-200 pt-3 space-y-3">
                <span class="text-[10px] font-black text-gray-500 uppercase tracking-wider">Период отсутствия</span>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-[9px] font-bold text-gray-600 mb-0.5">С какого числа</label>
                        <input type="date" id="absenceStartDate" oninput="window.updateAbsencePreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-blue-600">
                    </div>
                    <div>
                        <label class="block text-[9px] font-bold text-gray-600 mb-0.5">По какое число</label>
                        <input type="date" id="absenceEndDate" oninput="window.updateAbsencePreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-blue-600">
                    </div>
                </div>
                <p class="text-[10px] text-amber-600 font-bold">💡 Будет автоматически сгенерировано по одному акту на каждый день из этого диапазона!</p>
            </div>

            <div class="border-t border-gray-200 pt-3 space-y-3">
                <span class="text-[10px] font-black text-gray-500 uppercase tracking-wider">Данные сотрудника</span>
                <div>
                    <label class="block text-[9px] font-bold text-gray-600 mb-0.5">ФИО (в род. падеже) — для Актов</label>
                    <input type="text" id="absenceEmployeeName" value="Пустельникова А.Ю." oninput="window.updateAbsencePreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-blue-600" placeholder="Пример: Пустельникова А.Ю.">
                </div>
                <div>
                    <label class="block text-[9px] font-bold text-gray-600 mb-0.5">ФИО (в им. падеже) — для Докладной</label>
                    <input type="text" id="absenceEmployeeNameIm" value="Алексей Юрьевич" oninput="window.updateAbsencePreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-blue-600" placeholder="Имя Отчество (или Фамилия И.О.)">
                </div>
                <div>
                    <label class="block text-[9px] font-bold text-gray-600 mb-0.5">Должность / Профессия</label>
                    <input type="text" id="absenceEmployeeJob" value="тракторист-машинист" oninput="window.updateAbsencePreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-blue-600" placeholder="Пример: тракторист-машинист">
                </div>
            </div>

            <button onclick="window.printAndSaveAbsence()" class="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-bold transition shadow-xs text-xs flex items-center justify-center gap-2">
                🖨️ Печать пакета документов
            </button>
        </div>

        <div class="lg:col-span-2 bg-gray-100 p-4 rounded-xl border-2 border-gray-300 flex flex-col justify-between max-h-[80vh] overflow-y-auto no-print">
            <div id="absenceLivePreview" class="space-y-6">
                </div>
        </div>
    </div>
</div>
`;

export function initAbsenceAct() {
    function getDatesInRange(startStr, endStr) {
        const dates = [];
        if (!startStr || !endStr) return dates;
        
        let current = new Date(startStr);
        const end = new Date(endStr);
        
        if (current > end) return dates;
        
        while (current <= end) {
            dates.push(new Date(current).toISOString().split('T')[0]);
            current.setDate(current.getDate() + 1);
        }
        return dates;
    }

    function formatRusDate(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3) return parts[2] + '.' + parts[1] + '.' + parts[0];
        return dateStr;
    }

    window.generateAbsenceHtmlContent = (isForWord = false) => {
        const empName = document.getElementById('absenceEmployeeName')?.value || '';
        const empNameIm = document.getElementById('absenceEmployeeNameIm')?.value || '';
        const empJob = document.getElementById('absenceEmployeeJob')?.value || '';
        const startRaw = document.getElementById('absenceStartDate')?.value;
        const endRaw = document.getElementById('absenceEndDate')?.value;

        const dateList = getDatesInRange(startRaw, endRaw);
        if (dateList.length === 0) {
            return isForWord ? '' : { combinedHtml: '<div class="p-4 text-center text-gray-400 font-bold">Выберите корректный диапазон дат</div>' };
        }

        const formattedStart = formatRusDate(startRaw);
        const formattedEnd = formatRusDate(endRaw);

        const separator = isForWord 
            ? '<br clear="all" style="page-break-before: always; mso-break-type: section-break;">' 
            : '';

        // 1. ГЕНЕРИРУЕМ МАССИВ АКТОВ
        const actsArrayHtml = dateList.map(dateStr => {
            const formattedCurrentDate = formatRusDate(dateStr);
            return `
            <div class="print-page-a4 bg-white p-8 border border-gray-300 shadow-xs rounded-lg text-black font-serif text-justify" style="font-family: 'Times New Roman', serif; font-size: 14px; line-height: 1.5; box-sizing: border-box;">
                <div style="text-align: left; margin-bottom: 30px; font-size: 13px;">
                    Филиал СХК «Великополье»<br>ГП «Минсктранс»
                </div>
                <div style="margin-bottom: 25px;">
                    <strong>АКТ</strong><br>
                    ${formattedCurrentDate}г.<br>
                    д. Великополье<br>
                    Об отсутствии на рабочем месте
                </div>
                <div style="margin-bottom: 35px; text-align: left;">
                    Составил: Волчек А.А. - инженер Э.М.Т.П.<br>
                    в присутствии: Маковича М.П. – заместителя директора - главного инженера<br>
                    <span style="padding-left: 82px;">Миколенко Ю.С. – заведующего гаражом</span><br>
                    <span style="padding-left: 82px;">Ладутько И.И. – техника</span>
                </div>
                <p style="text-indent: 40px; margin-bottom: 50px;">
                    Мы, нижеподписавшиеся, настоящим актом удостоверяем, что ${empJob} <strong>${empName}</strong> отсутствовал на рабочем месте ${formattedCurrentDate}г.
                </p>
                
                <table style="width: 100%; border-collapse: collapse; border: none; margin-top: 60px; font-family: 'Times New Roman', serif; font-size: 14px;">
                    <tr style="height: 35px;">
                        <td style="width: 40%; text-align: left; border: none; padding: 0;">Волчек А.А.</td>
                        <td style="width: 60%; text-align: right; border: none; padding: 0;">___________________________</td>
                    </tr>
                    <tr style="height: 35px;">
                        <td style="width: 40%; text-align: left; border: none; padding: 0;">Макович М.П.</td>
                        <td style="width: 60%; text-align: right; border: none; padding: 0;">___________________________</td>
                    </tr>
                    <tr style="height: 35px;">
                        <td style="width: 40%; text-align: left; border: none; padding: 0;">Миколенко Ю.С.</td>
                        <td style="width: 60%; text-align: right; border: none; padding: 0;">___________________________</td>
                    </tr>
                    <tr style="height: 35px;">
                        <td style="width: 40%; text-align: left; border: none; padding: 0;">Ладутько И.И.</td>
                        <td style="width: 60%; text-align: right; border: none; padding: 0;">___________________________</td>
                    </tr>
                </table>
            </div>`;
        });

        // 2. ГЕНЕРИРУЕМ СЛУЖЕБКУ / ДОКЛАДНУЮ (С исправленной шапкой для Директора Рунцевича Д.С. в одну линию)
        const reportDate = formattedEnd; 
        const reportHtml = `
        <div class="print-page-a4 bg-white p-8 border border-gray-300 shadow-xs rounded-lg text-black font-serif text-justify" style="font-family: 'Times New Roman', serif; font-size: 14px; line-height: 1.5; box-sizing: border-box;">
            
            <table style="width: 100%; border-collapse: collapse; border: none; margin-bottom: 40px;">
                <tr>
                    <td style="width: 45%; border: none;"></td>
                    <td style="width: 55%; text-align: left; font-family: 'Times New Roman', serif; font-size: 14px; line-height: 1.3; border: none; padding: 0;">
                        Директору филиала СХК<br>
                        «Великополье»<br>
                        Рунцевичу Д.С.<br>
                        Инженера по ЭМТП<br>
                        Волчка А.А.
                    </td>
                </tr>
            </table>

            <div style="margin-bottom: 15px; font-size: 14px;">
                ${reportDate}г.
            </div>
            <div style="text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 25px; uppercase tracking-wide">
                Докладная записка
            </div>
            <p style="text-indent: 40px; margin-bottom: 60px;">
                Довожу до Вашего сведения, что тракторист-машинист Пустельников ${empNameIm} отсутствовал на рабочем месте с ${formattedStart} по ${formattedEnd}гг., что повлияло на рабочий процесс. Прошу признать его отсутствие, как отсутствие без уважительной причины, и принять соответствующие меры.
            </p>
            
            <table style="width: 100%; border-collapse: collapse; border: none; margin-top: 50px; font-family: 'Times New Roman', serif; font-size: 14px;">
                <tr>
                    <td style="width: 50%; text-align: left; border: none; padding: 0;">Инженер по ЭМТП</td>
                    <td style="width: 50%; text-align: right; border: none; padding: 0;">Волчек А.А.</td>
                </tr>
            </table>
        </div>`;

        const allActsCombined = actsArrayHtml.join(separator);
        const finalContent = allActsCombined + separator + reportHtml;

        return isForWord ? finalContent : { combinedHtml: finalContent };
    };

    window.updateAbsencePreview = () => {
        const previewBlock = document.getElementById('absenceLivePreview');
        if (!previewBlock) return;
        
        const { combinedHtml } = window.generateAbsenceHtmlContent(false);
        previewBlock.innerHTML = combinedHtml;
    };

    window.printAndSaveAbsence = async () => {
        const fullWordHtml = window.generateAbsenceHtmlContent(true);
        if (!fullWordHtml) return alert('Нет данных для печати.');
        
        const printBlock = document.getElementById('tripPrintBlock');
        if (printBlock) {
            printBlock.innerHTML = window.generateAbsenceHtmlContent(false).combinedHtml;
            window.print();
            printBlock.innerHTML = '';
        }

        const supabase = window._supabase || window.supabase;
        if (!supabase) return alert('Ошибка: Клиент Supabase не найден.');

        const startRaw = document.getElementById('absenceStartDate')?.value || 'date';
        const fileName = 'absence_packet_' + startRaw + '.doc';

        try {
            const wordContent = 
                '<html xmlns:o="urn:schemas-microsoft-com:office:office" \n' +
                'xmlns:w="urn:schemas-microsoft-com:office:word" \n' +
                'xmlns="http://www.w3.org/TR/REC-html40">\n' +
                '<head>\n' +
                '<meta charset="utf-8">\n' +
                '\n' +
                '<style>\n' +
                '@page { size: 21cm 29.7cm; margin: 2.5cm 2cm 2.5cm 2.5cm; }\n' +
                'body { font-family: "Times New Roman", serif; font-size: 14pt; }\n' +
                'p { text-align: justify; text-indent: 40px; }\n' +
                '</style>\n' +
                '</head>\n' +
                '<body>\n' + 
                fullWordHtml + 
                '\n</body>\n</html>';

            const fileBlob = new Blob([wordContent], { type: 'application/msword;charset=utf-8' });
            
            const { error } = await supabase.storage
                .from('documents-history')
                .upload(fileName, fileBlob, { cacheControl: '3600', upsert: true });

            if (error) throw error;

            alert('Подневный пакет документов успешно сформирован и сохранен в архив!');
            if (typeof window.loadTripStorageHistory === 'function') window.loadTripStorageHistory();

        } catch (err) {
            alert('Ошибка архивации: ' + err.message);
        }
    };
}