// js/docs/batteryAct.js

const BATTERY_MODELS = [
    { name: "6СТ-190 АБ-3 URA6AH (40 кг)", leadWeight: 40 },
    { name: "6СТ-90 (20 кг)", leadWeight: 20 },
    { name: "6СТ-60 (12 кг)", leadWeight: 12 }
];

const modelOptionsHtml = BATTERY_MODELS.map(m => '<option value="' + m.name + '">' + m.name + '</option>').join('');

export const batteryTemplate = `
<div id="subModule_battery_act" class="hidden space-y-4 fade-in-sub">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="bg-white border-2 border-gray-400 p-5 rounded-xl shadow-xs space-y-4">
            <h3 class="text-xs font-black text-gray-700 uppercase tracking-wider mb-2">📋 Параметры акта списания</h3>
            
            <div>
                <label class="block text-[10px] font-bold text-gray-700 mb-1">Дата акта</label>
                <input type="date" id="batteryDocDate" oninput="window.updateBatteryPreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-blue-600">
            </div>

            <div>
                <label class="block text-[10px] font-bold text-gray-700 mb-1">Тип/Марка АКБ</label>
                <select id="batteryModelSelect" onchange="window.handleBatteryModelChange()" class="w-full bg-white border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-blue-600">
                    ` + modelOptionsHtml + `
                </select>
            </div>

            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="block text-[10px] font-bold text-gray-700 mb-1">Количество (шт)</label>
                    <input type="number" id="batteryCountInput" value="2" min="1" oninput="window.updateBatteryPreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-blue-600">
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-gray-700 mb-1">Срок экспл. (мес)</label>
                    <input type="number" id="batteryPeriodInput" value="30" oninput="window.updateBatteryPreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-blue-600">
                </div>
            </div>

            <div>
                <label class="block text-[10px] font-bold text-gray-700 mb-1">Автомобиль (Гос. номер)</label>
                <input type="text" id="batteryCarDoc" value="МАЗ-533702" oninput="window.updateBatteryPreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-blue-600">
            </div>

            <div>
                <label class="block text-[10px] font-bold text-gray-700 mb-1">Инвентарный номер</label>
                <input type="text" id="batteryInvNo" value="№ 347" oninput="window.updateBatteryPreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-blue-600">
            </div>

            <button onclick="window.printAndSaveBattery()" class="w-full bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-lg font-bold transition shadow-xs text-xs flex items-center justify-center gap-2">
                🖨️ Печать и сохранение в архив
            </button>
        </div>

        <div class="lg:col-span-2 bg-gray-100 p-4 rounded-xl border-2 border-gray-300 flex flex-col justify-between">
            <div id="batteryLivePreview" class="bg-white p-8 border border-gray-300 shadow-xs rounded-lg font-serif text-black leading-relaxed" style="font-family: 'Times New Roman', serif; min-height: 500px; font-size: 14px;"></div>
        </div>
    </div>
</div>
`;

export function initBatteryAct() {
    window.handleBatteryModelChange = () => {
        window.updateBatteryPreview();
    };

    function formatBatteryDate(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3) return parts[2] + '.' + parts[1] + '.' + parts[0];
        return dateStr;
    }

    window.generateBatteryHtmlContent = () => {
        const actDate = formatBatteryDate(document.getElementById('batteryDocDate')?.value);
        const modelName = document.getElementById('batteryModelSelect')?.value || '';
        const count = parseInt(document.getElementById('batteryCountInput')?.value || '1');
        const period = document.getElementById('batteryPeriodInput')?.value || '30';
        const car = document.getElementById('batteryCarDoc')?.value || '';
        const invNo = document.getElementById('batteryInvNo')?.value || '';

        // Вычисляем вес свинца
        const selectedModel = BATTERY_MODELS.find(m => m.name === modelName) || BATTERY_MODELS[0];
        const totalWeight = selectedModel.leadWeight * count;

        return '<div style="font-family: \'Times New Roman\', serif; color: black; font-size: 14px; line-height: 1.4; max-width: 650px; margin: 0 auto; padding: 10px;">' +
            '<div style="text-align: left; margin-bottom: 30px; font-size: 13px;">' +
                'Филиал СХК «Великополье»<br>ГП «Минсктранс»' +
            '</div>' +
            '<div style="margin-bottom: 25px;">' +
                '<strong>АКТ</strong><br>' +
                actDate + 'г.<br>' +
                'д. Великополье<br>' +
                'О списании аккумуляторной батареи' +
            '</div>' +
            '<div style="margin-bottom: 20px; text-align: justify;">' +
                '<u>Составил: Волчек</u> А.А. – Инженер по ЭМТП<br>' +
                'в присутствии: Макович М.П. – Заместитель директора – главный инженер<br>' +
                '<span style="padding-left: 82px;">Манулик Е.И. - Кладовщик</span><br>' +
                '<span style="padding-left: 82px;">Ладутько И.И. - Техник</span>' +
            '</div>' +
            '<p style="text-align: justify; text-indent: 40px; margin-bottom: 20px;">' +
                'Мы, <u>нижеподписавшиеся</u>, настоящим актом удостоверяем, что следующие аккумуляторная батарея в количестве ' + count + ' шт. в процессе эксплуатации (' + period + ' месяцев) пришла в негодность и подлежит списанию с последующим <u>оприходованием</u> на склад в качестве лома свинца суммарным весом ' + totalWeight + ' кг:' +
            '</p>' +
            '<div style="margin-bottom: 40px; padding-left: 40px; font-weight: bold;">' +
                modelName + ' - ' + count + ' шт. (' + totalWeight + ' кг);<br>' +
                'Автомобиль: ' + car + ', инв. ' + invNo +
            '</div>' +
            '<div style="margin-top: 50px; space-y-3">' +
                '<div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><div>Волчек А.А.</div><div>___________________________</div></div>' +
                '<div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><div>Макович М.П.</div><div>___________________________</div></div>' +
                '<div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><div>Манулик Е.И.</div><div>___________________________</div></div>' +
                '<div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><div>Ладутько И.И.</div><div>___________________________</div></div>' +
                '</div>' +
            '</div>';
    };

    window.updateBatteryPreview = () => {
        const previewBlock = document.getElementById('batteryLivePreview');
        if (previewBlock) previewBlock.innerHTML = window.generateBatteryHtmlContent();
    };

    window.printAndSaveBattery = async () => {
        const htmlContent = window.generateBatteryHtmlContent();
        
        const printBlock = document.getElementById('tripPrintBlock');
        if (printBlock) {
            printBlock.innerHTML = htmlContent;
            window.print();
            printBlock.innerHTML = '';
        }

        const supabase = window._supabase || window.supabase;
        if (!supabase) return alert('Ошибка: Клиент Supabase не найден.');

        const docDate = document.getElementById('batteryDocDate')?.value || 'unknown-date';
        const fileName = 'battery_' + docDate + '_act.doc';

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

            alert('Акт успешно распечатан и сохранен в общий архив как WORD (.doc)!');
            if (typeof window.loadTripStorageHistory === 'function') window.loadTripStorageHistory();

        } catch (err) {
            alert('Ошибка сохранения в архив: ' + err.message);
        }
    };
}