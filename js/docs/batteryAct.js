// js/docs/batteryAct.js

export const batteryTemplate = `
<div id="subModule_battery_act" class="hidden space-y-4 fade-in-sub">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="bg-white border-2 border-gray-400 p-5 rounded-xl shadow-xs space-y-4">
            <h3 class="text-xs font-black text-gray-700 uppercase tracking-wider mb-2">📋 Параметры акта списания</h3>
            
            <div>
                <label class="block text-[10px] font-bold text-gray-700 mb-1">Дата акта</label>
                <input type="date" id="batteryDocDate" oninput="window.updateBatteryPreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-blue-600">
            </div>

            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="block text-[10px] font-bold text-gray-700 mb-1">Автомобиль / Техника</label>
                    <input type="text" id="batteryCarDoc" value="МАЗ-533702" oninput="window.updateBatteryPreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-blue-600" placeholder="Марка машины">
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-gray-700 mb-1">Инвентарный номер</label>
                    <input type="text" id="batteryInvNo" value="№ 347" oninput="window.updateBatteryPreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-blue-600">
                </div>
            </div>

            <div class="border-t border-b border-gray-200 py-3 space-y-3">
                <div class="flex justify-between items-center">
                    <span class="text-[11px] font-black text-gray-600 uppercase tracking-wider">Список АКБ в акте:</span>
                    <button onclick="window.addBatteryRow()" class="text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-300 px-2 py-0.5 rounded font-bold transition">
                        ➕ Добавить АКБ
                    </button>
                </div>
                
                <div id="batteryRowsContainer" class="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    </div>
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
    // Внутренний массив для хранения списка добавленных АКБ
    let batteryItems = [
        { id: Date.now(), name: "6СТ-190 АБ-3 URA6AH", count: 2, period: 30, weight: 80 }
    ];

    window.addBatteryRow = () => {
        batteryItems.push({
            id: Date.now(),
            name: "6СТ-190",
            count: 1,
            period: 24,
            weight: 40
        });
        window.renderBatteryInputs();
        window.updateBatteryPreview();
    };

    window.removeBatteryRow = (id) => {
        if (batteryItems.length <= 1) {
            alert("В акте должна быть как минимум одна аккумуляторная батарея!");
            return;
        }
        batteryItems = batteryItems.filter(item => item.id !== id);
        window.renderBatteryInputs();
        window.updateBatteryPreview();
    };

    window.handleBatteryInputChange = (id, field, value) => {
        const item = batteryItems.find(i => i.id === id);
        if (item) {
            if (field === 'name') item.name = value;
            if (field === 'count') item.count = parseInt(value) || 0;
            if (field === 'period') item.period = value;
            if (field === 'weight') item.weight = parseFloat(value) || 0;
        }
        window.updateBatteryPreview();
    };

    window.renderBatteryInputs = () => {
        const container = document.getElementById('batteryRowsContainer');
        if (!container) return;

        container.innerHTML = batteryItems.map((item, index) => `
            <div class="p-2.5 bg-gray-50 border border-gray-300 rounded-lg space-y-2 relative">
                <div class="flex justify-between items-center">
                    <span class="text-[10px] font-bold text-gray-500">Батарея #${index + 1}</span>
                    <button onclick="window.removeBatteryRow(${item.id})" class="text-red-500 hover:text-red-700 text-[10px] font-bold">Удалить</button>
                </div>
                <div>
                    <label class="block text-[9px] font-bold text-gray-600 mb-0.5">Наименование АКБ (вручную)</label>
                    <input type="text" value="${item.name}" oninput="window.handleBatteryInputChange(${item.id}, 'name', this.value)" class="w-full bg-white border border-gray-300 rounded p-1 text-xs font-semibold focus:border-blue-500">
                </div>
                <div class="grid grid-cols-3 gap-1.5">
                    <div>
                        <label class="block text-[9px] font-bold text-gray-600 mb-0.5">Кол-во (шт)</label>
                        <input type="number" value="${item.count}" min="1" oninput="window.handleBatteryInputChange(${item.id}, 'count', this.value)" class="w-full bg-white border border-gray-300 rounded p-1 text-xs font-semibold focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-[9px] font-bold text-gray-600 mb-0.5">Срок (мес)</label>
                        <input type="number" value="${item.period}" oninput="window.handleBatteryInputChange(${item.id}, 'period', this.value)" class="w-full bg-white border border-gray-300 rounded p-1 text-xs font-semibold focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-[9px] font-bold text-gray-600 mb-0.5">Общий вес (кг)</label>
                        <input type="number" value="${item.weight}" oninput="window.handleBatteryInputChange(${item.id}, 'weight', this.value)" class="w-full bg-white border border-gray-300 rounded p-1 text-xs font-semibold focus:border-blue-500">
                    </div>
                </div>
            </div>
        `).join('');
    };

    function formatBatteryDate(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3) return parts[2] + '.' + parts[1] + '.' + parts[0];
        return dateStr;
    }

    window.generateBatteryHtmlContent = () => {
        const actDate = formatBatteryDate(document.getElementById('batteryDocDate')?.value);
        const car = document.getElementById('batteryCarDoc')?.value || '';
        const invNo = document.getElementById('batteryInvNo')?.value || '';

        // Вычисляем суммарный вес и формируем текстовые блоки для каждой АКБ
        let totalWeightAll = 0;
        
        const linesHtml = batteryItems.map(item => {
            totalWeightAll += item.weight;
            return `<strong>${item.name}</strong> в количестве ${item.count} шт. в процессе эксплуатации (${item.period} месяцев) пришла в негодность`;
        }).join(', а также ');

        const listDetailsHtml = batteryItems.map(item => {
            return `• ${item.name} - ${item.count} шт. (${item.weight} кг);`;
        }).join('<br>');

        return '<div style="font-family: \'Times New Roman\', serif; color: black; font-size: 14px; line-height: 1.5; max-width: 650px; margin: 0 auto; padding: 10px;">' +
            '<div style="text-align: left; margin-bottom: 30px; font-size: 13px;">' +
                'Филиал СХК «Великополье»<br>ГП «Минсктранс»' +
            '</div>' +
            '<div style="margin-bottom: 25px;">' +
                '<strong>АКТ</strong><br>' +
                actDate + 'г.<br>' +
                'д. Великополье<br>' +
                'О списании аккумуляторной батареи' +
            '</div>' +
            '<div style="margin-bottom: 25px; text-align: justify;">' +
                '<u>Составил: Волчек</u> А.А. – Инженер по ЭМТП<br>' +
                'в присутствии: Макович М.П. – Заместитель директора – главный инженер<br>' +
                '<span style="padding-left: 82px;">Манулик Е.И. - Кладовщик</span><br>' +
                '<span style="padding-left: 82px;">Ладутько И.И. - Техник</span>' +
            '</div>' +
            '<p style="text-align: justify; text-indent: 40px; margin-bottom: 20px;">' +
                'Мы, <u>нижеподписавшиеся</u>, настоящим актом удостоверяем, что следующие аккумуляторная батарея: ' + linesHtml + ' и подлежит списанию с последующим <u>оприходованием</u> на склад в качестве лома свинца суммарным весом ' + totalWeightAll + ' кг:' +
            '</p>' +
            '<div style="margin-bottom: 40px; padding-left: 40px; font-weight: bold; line-height: 1.6;">' +
                listDetailsHtml + '<br>' +
                'Автомобиль: ' + car + ', инв. ' + invNo +
            '</div>' +
            '<div style="margin-top: 50px; font-size: 14px;">' +
                '<div style="display: flex; justify-content: space-between; margin-bottom: 12px;"><div>Волчек А.А.</div><div>___________________________</div></div>' +
                '<div style="display: flex; justify-content: space-between; margin-bottom: 12px;"><div>Макович М.П.</div><div>___________________________</div></div>' +
                '<div style="display: flex; justify-content: space-between; margin-bottom: 12px;"><div>Манулик Е.И.</div><div>___________________________</div></div>' +
                '<div style="display: flex; justify-content: space-between; margin-bottom: 12px;"><div>Ладутько И.И.</div><div>___________________________</div></div>' +
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

            alert('Множественный акт успешно сохранен в архив как WORD (.doc)!');
            if (typeof window.loadTripStorageHistory === 'function') window.loadTripStorageHistory();

        } catch (err) {
            alert('Ошибка архивации: ' + err.message);
        }
    };

    // Первичный запуск интерфейса ввода
    setTimeout(() => {
        window.renderBatteryInputs();
        window.updateBatteryPreview();
    }, 50);
}