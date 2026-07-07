// js/docs/lifecycle/defectAct.js

export const defectTemplate = `
<div id="form_block_defect" class="hidden space-y-4 pt-2">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
            <label class="block text-[10px] font-bold text-gray-700 uppercase">Номер акта</label>
            <input type="text" id="defect_num" value="1" class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1">
        </div>
        <div>
            <label class="block text-[10px] font-bold text-gray-700 uppercase">Дата осмотра</label>
            <input type="date" id="defect_date" class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1">
        </div>
        <div>
            <label class="block text-[10px] font-bold text-gray-700 uppercase">Механизатор / Водитель</label>
            <input type="text" id="defect_driver" value="Иванов И.И." class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1">
        </div>
    </div>
    <div>
        <label class="block text-[10px] font-bold text-gray-700 uppercase">Выявленные дефекты</label>
        <textarea id="defect_faults" class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1 h-16">Требуется замена приводных ремней генератора, износ рабочих органов агрегата.</textarea>
    </div>
    <div class="flex justify-end gap-2">
        <button onclick="window.printDefectDoc()" class="bg-gray-900 hover:bg-gray-800 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition">🖨️ Распечатать Акт</button>
        <button onclick="window.generateDefectDoc()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition">💾 Сохранить в архив (.DOC)</button>
    </div>
</div>
`;

function buildDefectHtml(vehicle, num, date, driver, faults) {
    return `
    <div class="print-page-a4" style="font-family: 'Times New Roman', serif; font-size: 13px; color: #000; line-height: 1.4; max-width: 210mm; box-sizing: border-box;">
        <table style="width: 100%; border: none; margin-bottom: 40px;">
            <tr>
                <td style="border:none; text-align: left; font-size: 13px;">Филиал СХК «Великополье»<br>ГП «Минсктранс»</td>
                <td style="border:none; text-align: right; font-size: 13px;"><b>УТВЕРЖДАЮ</b><br>Директор филиала<br>________________ Д.С. Рунцевич<br>«___» ____________ 2026 г.</td>
            </tr>
        </table>
        <h3 align="center" style="font-size: 16px; margin: 0 0 5px 0;">ДЕФЕКТНЫЙ АКТ № ${num}</h3>
        <p align="center" style="margin: 0 0 25px 0;">от ${date}</p>
        <p style="text-indent: 25px; text-align: justify; margin-bottom: 15px;">Комиссия в составе председателя главного инженера Маковича М.П., члена комиссии — инженера по ЭМТП Волчка А.А., составила настоящий акт о том, что в ходе осмотра техники <b>${vehicle.model}</b>, инв. № <b>${vehicle.inv_number || 'б/н'}</b> под управлением механизатора <b>${driver}</b> выявлено:</p>
        <div style="border:1px solid black; padding:12px; min-height:80px; font-family:'Times New Roman'; font-size:13px; text-align: justify; margin-bottom: 20px;">${faults || 'Неисправностей не обнаружено.'}</div>
        <p style="text-indent: 25px; margin-bottom: 40px;">Заключение комиссии: Направить вышеуказанную технику в ремонтный бокс для проведения восстановительных работ силами мастерской филиала.</p>
        <table style="width: 100%; border: none; margin-top: 60px; line-height: 2;">
            <tr><td style="border:none; text-align: left;">Председатель комиссии (главный инженер):</td><td style="border:none; text-align: right;">___________ / М.П. Макович /</td></tr>
            <tr><td style="border:none; text-align: left;">Член комиссии (инженер по ЭМТП):</td><td style="border:none; text-align: right;">___________ / А.А. Волчек /</td></tr>
        </table>
    </div>`;
}

window.printDefectDoc = () => {
    const vehicle = window.getActiveVehicle();
    if (!vehicle) return alert('Ошибка: машина не выбрана!');
    const html = buildDefectHtml(vehicle, document.getElementById('defect_num').value, document.getElementById('defect_date').value, document.getElementById('defect_driver').value, document.getElementById('defect_faults').value);
    window.printDirectLifecycleHtml(html);
};

window.generateDefectDoc = async () => {
    const vehicle = window.getActiveVehicle();
    if (!vehicle) return alert('Сначала выберите машину из таблицы!');

    const num = document.getElementById('defect_num').value;
    const date = document.getElementById('defect_date').value;
    const driver = document.getElementById('defect_driver').value;
    const faults = document.getElementById('defect_faults').value;

    const htmlContent = buildDefectHtml(vehicle, num, date, driver, faults);
    const fileName = `defect_act_№${num}_инв_${vehicle.inv_number || 'бн'}.doc`;
    const wordWrap = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><style>@page { size: 21cm 29.7cm; margin: 2cm 1.5cm 2cm 2.5cm; } body { font-family: "Times New Roman", serif; font-size: 11pt; }</style></head><body>${htmlContent}</body></html>`;

    try {
        const fileBlob = new Blob([wordWrap], { type: 'application/msword;charset=utf-8' });
        const { error } = await window._supabase.storage.from('documents-history').upload(fileName, fileBlob, { cacheControl: '3600', upsert: true });
        if (error) throw error;
        alert('Дефектный акт сохранен в архив: ' + fileName);
        if (typeof window.loadTripStorageHistory === 'function') window.loadTripStorageHistory();
    } catch (err) {
        alert('Ошибка при сохранении: ' + err.message);
    }
};