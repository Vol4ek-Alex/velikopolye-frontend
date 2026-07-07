// js/docs/lifecycle/defectAct.js

export const defectTemplate = `
<div id="form_block_defect" class="hidden space-y-4 pt-2">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label class="block text-[10px] font-bold text-gray-700 uppercase">Механизатор / Водитель</label>
            <input type="text" id="defect_driver" value="Иванов И.И." class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1">
        </div>
        <div>
            <label class="block text-[10px] font-bold text-gray-700 uppercase">Выявленные дефекты</label>
            <input type="text" id="defect_faults" value="Износ приводных ремней, подтекание масла ГУР." class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1">
        </div>
    </div>
    <div class="flex justify-end gap-2">
        <button onclick="window.printDefectDoc()" class="bg-gray-900 hover:bg-gray-800 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition">🖨️ Печать А4</button>
        <button onclick="window.generateDefectDoc()" class="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition">💾 В архив (.DOC)</button>
    </div>
</div>
`;

window.getDefectHtml = (forWord = false) => {
    const vehicle = window.getActiveVehicle();
    if (!vehicle) return '<p>Ошибка: Техника не выбрана.</p>';

    const num = document.getElementById('lifecycleNum')?.value || '1';
    const driver = document.getElementById('defect_driver')?.value || '';
    const faults = document.getElementById('defect_faults')?.value || '';
    const today = new Date().toLocaleDateString('ru-RU');

    return `
    <div class="print-page-a4" style="font-family: 'Times New Roman', serif; font-size: 13px; color: #000; line-height: 1.5; max-width: 210mm; box-sizing: border-box;">
        <table style="width: 100%; border: none; margin-bottom: 35px;">
            <tr>
                <td style="border:none; text-align: left; font-size: 13px; font-family: 'Times New Roman';">Филиал СХК «Великополье»<br>ГП «Минсктранс»</td>
                <td style="border:none; text-align: right; font-size: 13px; font-family: 'Times New Roman';"><b>УТВЕРЖДАЮ</b><br>Директор филиала<br>________________ Д.С. Рунцевич<br>«___» ____________ 2026 г.</td>
            </tr>
        </table>
        <h3 align="center" style="font-size: 16px; margin: 0 0 5px 0; font-family: 'Times New Roman';">ДЕФЕКТНЫЙ АКТ № ${num}</h3>
        <p align="center" style="margin-top:0; margin-bottom:30px; font-family: 'Times New Roman';">от ${today}</p>
        <p style="text-indent: 25px; text-align: justify; margin-bottom: 15px; font-family: 'Times New Roman';">Комиссия в составе председателя главного инженера Маковича М.П., инженера по ЭМТП Волчка А.А., составила настоящий акт о том, что в ходе осмотра техники <b>${vehicle.model || '—'}</b>, инв. № <b>${vehicle.inv_number || 'б/н'}</b> под управлением <b>${driver}</b> выявлено:</p>
        <div style="border:1px solid black; padding:12px; min-height:90px; font-family:'Times New Roman'; font-size:13px; text-align: justify; margin-bottom: 20px;">${faults || 'Неисправностей не обнаружено.'}</div>
        <p style="text-indent: 25px; margin-bottom: 40px; font-family: 'Times New Roman';">Заключение комиссии: Направить технику в ремонтную мастерскую для устранения дефектов.</p>
        <table style="width: 100%; border: none; margin-top: 60px; line-height: 2;">
            <tr><td style="border:none; text-align: left; font-family: 'Times New Roman';">Председатель комиссии:</td><td style="border:none; text-align: right; font-family: 'Times New Roman';">___________ / М.П. Макович /</td></tr>
            <tr><td style="border:none; text-align: left; font-family: 'Times New Roman';">Инженер по ЭМТП:</td><td style="border:none; text-align: right; font-family: 'Times New Roman';">___________ / А.А. Волчек /</td></tr>
        </table>
    </div>`;
};

window.printDefectDoc = () => {
    const printBlock = document.getElementById('tripPrintBlock');
    if (!printBlock) return;
    printBlock.innerHTML = window.getDefectHtml(false);
    window.print();
    printBlock.innerHTML = '';
};

window.generateDefectDoc = async () => {
    const vehicle = window.getActiveVehicle();
    if (!vehicle) return alert('Сначала выберите технику!');

    const num = document.getElementById('lifecycleNum')?.value || '1';
    const fileName = `defect_act_№${num}_${vehicle.inv_number || 'бн'}.doc`;
    const htmlContent = window.getDefectHtml(true);

    const wordWrap = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><style>@page { size: 21cm 29.7cm; margin: 2cm 1.5cm 2cm 2.5cm; } body { font-family: "Times New Roman", serif; font-size: 11pt; }</style></head><body>${htmlContent}</body></html>`;

    try {
        const fileBlob = new Blob([wordWrap], { type: 'application/msword;charset=utf-8' });
        const { error } = await window._supabase.storage.from('documents-history').upload(fileName, fileBlob, { cacheControl: '3600', upsert: true });
        if (error) throw error;
        alert('Документ добавлен в архив:\n' + fileName);
        if (typeof window.loadTripStorageHistory === 'function') window.loadTripStorageHistory();
    } catch (err) {
        alert('Ошибка сохранения: ' + err.message);
    }
};