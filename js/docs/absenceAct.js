// js/docs/absenceAct.js

export const absenceTemplate = `
<div id="subModule_absence_act" class="hidden space-y-4 fade-in-sub">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Ввод параметров -->
        <div class="bg-white border-2 border-gray-400 p-5 rounded-xl shadow-xs space-y-4">
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

        <!-- Предпросмотр -->
        <div class="lg:col-span-2 bg-gray-100 p-4 rounded-xl border-2 border-gray-300 flex flex-col justify-between max-h-[80vh] overflow-y-auto">
            <div id="absenceLivePreview" class="space-y-6">
                <!-- Сюда сгенерируются Акты по дням + Докладная -->
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
        
        // Предотвращаем бесконечный цикл при некорректном вводе
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

        const pageBreakWord = '<br clear="all" style="page-break-before: always; mso-break-type: section-break;">';
        const pageBreakScreen = '<hr class="my-6 border-t-2 border-dashed border-gray-400 no-print">';
        const separator = isForWord ? pageBreakWord : pageBreakScreen;

        // 1. ГЕНЕРИРУЕМ МАССИВ АКТОВ (ПО ОДНОМУ НА КАЖДЫЙ ДЕНЬ)
        const actsArrayHtml = dateList.map(dateStr => {
            const formattedCurrentDate = formatRusDate(dateStr);
            return `
            <div class="bg-white p-8 border border-gray-300 shadow-xs rounded-lg text-black font-serif text-justify" style="font-family: 'Times New Roman', serif; font-size: 14px; line-height: 1.5; margin-bottom: 10px;">
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
                    <u>Составил: Волчек</u> А.А. - инженер Э.М.Т.П.<br>
                    в присутствии: Маковича М.П. – заместителя директора - главного инженера<br>
                    <span style="padding-left: 82px;"><u>Миколенко</u> Ю.С. – заведующего гаражом</span><br>
                    <span style="padding-left: 82px;">Ладутько И.И. – техника</span>
                </div>
                <p style="text-indent: 40px; margin-bottom: 50px;">
                    Мы, нижеподписавшиеся, настоящим актом удостоверяем, что ${empJob} <strong>${empName}</strong> отсутствовал на рабочем месте ${formattedCurrentDate}г.
                </p>
                <div style="margin-top: 60px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px;"><div>Волчек А.А.</div><div>___________________________</div></div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px;"><div>Макович М.П.</div><div>___________________________</div></div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px;"><div>Миколенко Ю.С.</div><div>___________________________</div></div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px;"><div>Ладутько И.И.</div><div>___________________________</div></div>
                </div>
            </div>`;
        });

        // 2. ГЕНЕРИРУЕМ ОДНУ ОБЩУЮ ДОКЛАДНУЮ ЗАПИСКУ ЗА ВЕСЬ ПЕРИОД
        // Дата докладной ставится по последнему дню прогула (дню обнаружения/оформления пакета)
        const reportDate = formattedEnd; 

        const reportHtml = `
        <div class="bg-white p-8 border border-gray-300 shadow-xs rounded-lg text-black font-serif text-justify" style="font-family: 'Times New Roman', serif; font-size: 14px; line-height: 1.5;">
            <div style="text-align: right; margin-left: auto; width: 280px; margin-bottom: 40px; font-size: 14px; line-height: 1.3;">
                <u>Зам. директору-<br>гл. инженеру</u><br>
                филиала СХК<br>«Великополье»<br>
                Маковичу М.П.<br>
                Инженера по ЭМТП<br>
                Волчка А.А.
            </div>
            <div style="margin-bottom: 10px; font-size: 14px;">
                ${reportDate}г.
            </div>
            <div style="text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 25px; uppercase tracking-wide">
                Докладная записка
            </div>
            <p style="text-indent: 40px; margin-bottom: 60px;">
                Довожу до Вашего сведения, что тракторист-машинист <u>Пустельников</u> ${empNameIm} отсутствовал на рабочем месте с ${formattedStart} по ${formattedEnd}гг., что повлияло на рабочий процесс. Прошу признать его отсутствие, как отсутствие без уважительной причины, и принять соответствующие меры.
            </p>
            <div style="display: flex; justify-content: space-between; margin-top: 50px;">
                <div>Инженер по ЭМТП</div>
                <div>Волчек А.А.</div>
            </div>
        </div>`;

        // Собираем всё воедино: сначала все акты через разделитель, затем докладная
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
            printBlock.innerHTML = fullWordHtml;
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
                '<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]-->\n' +
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