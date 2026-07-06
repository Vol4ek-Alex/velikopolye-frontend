// js/docs/absenceAct.js

export const absenceTemplate = `
<div id="subModule_absence_act" class="hidden space-y-4 fade-in-sub">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="bg-white border-2 border-gray-400 p-5 rounded-xl shadow-xs space-y-4">
            <h3 class="text-xs font-black text-gray-700 uppercase tracking-wider mb-2">📋 Параметры акта о прогуле</h3>
            
            <div>
                <label class="block text-[10px] font-bold text-gray-700 mb-1">Дата составления акта</label>
                <input type="date" id="absenceDocDate" oninput="window.updateAbsencePreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-blue-600">
            </div>

            <div class="border-t border-gray-200 pt-3 space-y-3">
                <span class="text-[10px] font-black text-gray-500 uppercase tracking-wider">Данные сотрудника</span>
                <div>
                    <label class="block text-[9px] font-bold text-gray-600 mb-0.5">ФИО сотрудника (в род. падеже)</label>
                    <input type="text" id="absenceEmployeeName" value="Пустельникова А.Ю." oninput="window.updateAbsencePreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-blue-600" placeholder="Пример: Пустельникова А.Ю.">
                </div>
                <div>
                    <label class="block text-[9px] font-bold text-gray-600 mb-0.5">Должность / Профессия</label>
                    <input type="text" id="absenceEmployeeJob" value="тракторист-машинист" oninput="window.updateAbsencePreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-blue-600" placeholder="Пример: тракторист-машинист">
                </div>
            </div>

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
            </div>

            <button onclick="window.printAndSaveAbsence()" class="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-bold transition shadow-xs text-xs flex items-center justify-center gap-2">
                🖨️ Печать и сохранение в архив
            </button>
        </div>

        <div class="lg:col-span-2 bg-gray-100 p-4 rounded-xl border-2 border-gray-300 flex flex-col justify-between">
            <div id="absenceLivePreview" class="bg-white p-8 border border-gray-300 shadow-xs rounded-lg font-serif text-black leading-relaxed" style="font-family: 'Times New Roman', serif; min-height: 500px; font-size: 14px;"></div>
        </div>
    </div>
</div>
`;

export function initAbsenceAct() {
    function formatRusDate(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3) return parts[2] + '.' + parts[1] + '.' + parts[0];
        return dateStr;
    }

    window.generateAbsenceHtmlContent = () => {
        const actDate = formatRusDate(document.getElementById('absenceDocDate')?.value);
        const empName = document.getElementById('absenceEmployeeName')?.value || '';
        const empJob = document.getElementById('absenceEmployeeJob')?.value || '';
        const startDate = formatRusDate(document.getElementById('absenceStartDate')?.value);
        const endDate = formatRusDate(document.getElementById('absenceEndDate')?.value);

        return '<div style="font-family: \'Times New Roman\', serif; color: black; font-size: 14px; line-height: 1.5; max-width: 650px; margin: 0 auto; padding: 10px;">' +
            '<div style="text-align: left; margin-bottom: 30px; font-size: 13px;">' +
                'Филиал СХК «Великополье»<br>ГП «Минсктранс»' +
            '</div>' +
            '<div style="margin-bottom: 25px;">' +
                '<strong>АКТ</strong><br>' +
                actDate + '<br>' +
                'д. Великополье<br>' +
                'Об отсутствии на рабочем месте' +
            '</div>' +
            '<div style="margin-bottom: 35px; text-align: justify;">' +
                '<u>Составил: Волчек</u> А.А. - инженер Э.М.Т.П.<br>' +
                'в присутствии: Маковича М.П. – заместителя директора - главного инженера<br>' +
                '<span style="padding-left: 82px;"><u>Миколенко</u> Ю.С. – заведующего гаражом</span><br>' +
                '<span style="padding-left: 82px;">Ладутько И.И. – техника</span>' +
            '</div>' +
            '<p style="text-align: justify; text-indent: 40px; margin-bottom: 50px;">' +
                'Мы, нижеподписавшиеся, настоящим актом удостоверяем, что ' + empJob + ' <strong>' + empName + '</strong> отсутствовал на рабочем месте с ' + startDate + ' по ' + endDate + 'гг.' +
            '</p>' +
            '<div style="margin-top: 60px; font-size: 14px;">' +
                '<div style="display: flex; justify-content: space-between; margin-bottom: 15px;"><div>Волчек А.А.</div><div>___________________________</div></div>' +
                '<div style="display: flex; justify-content: space-between; margin-bottom: 15px;"><div>Макович М.П.</div><div>___________________________</div></div>' +
                '<div style="display: flex; justify-content: space-between; margin-bottom: 15px;"><div>Миколенко Ю.С.</div><div>___________________________</div></div>' +
                '<div style="display: flex; justify-content: space-between; margin-bottom: 15px;"><div>Ладутько И.И.</div><div>___________________________</div></div>' +
            '</div>' +
        '</div>';
    };

    window.updateAbsencePreview = () => {
        const previewBlock = document.getElementById('absenceLivePreview');
        if (previewBlock) previewBlock.innerHTML = window.generateAbsenceHtmlContent();
    };

    window.printAndSaveAbsence = async () => {
        const htmlContent = window.generateAbsenceHtmlContent();
        
        // Быстрая локальная печать бланка
        const printBlock = document.getElementById('tripPrintBlock');
        if (printBlock) {
            printBlock.innerHTML = htmlContent;
            window.print();
            printBlock.innerHTML = '';
        }

        const supabase = window._supabase || window.supabase;
        if (!supabase) return alert('Ошибка: Клиент Supabase не найден.');

        const docDate = document.getElementById('absenceDocDate')?.value || 'date';
        const fileName = 'absence_' + docDate + '_act.doc';

        try {
            // ФИКС ФОРМАТА WORD: Добавляем валидные заголовки разметки Microsoft Office, 
            // чтобы документ открывался без окон конвертации кодировок!
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
                '</style>\n' +
                '</head>\n' +
                '<body>\n' + 
                htmlContent + 
                '\n</body>\n</html>';

            // Создаем блоб с явным указанием кодировки UTF-8 и MIME-типа Word
            const fileBlob = new Blob([wordContent], { type: 'application/msword;charset=utf-8' });
            
            const { error } = await supabase.storage
                .from('documents-history')
                .upload(fileName, fileBlob, { cacheControl: '3600', upsert: true });

            if (error) throw error;

            alert('Акт о прогуле сохранен в архив и оптимизирован под MS Word!');
            if (typeof window.loadTripStorageHistory === 'function') window.loadTripStorageHistory();

        } catch (err) {
            alert('Ошибка архивации: ' + err.message);
        }
    };
}