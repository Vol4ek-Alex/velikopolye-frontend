// js/docs/lifecycle/toReport.js

export const toTemplate = `
<div id="form_block_to_report" class="hidden space-y-4 pt-2">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
            <label class="block text-[10px] font-bold text-gray-700 uppercase">Вид ТО</label>
            <select id="to_kind" class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1 bg-white">
                <option value="ТО-1">ТО-1</option>
                <option value="ТО-2">ТО-2</option>
                <option value="ТО-3">ТО-3</option>
            </select>
        </div>
        <div>
            <label class="block text-[10px] font-bold text-gray-700 uppercase">Наработка (м/ч)</label>
            <input type="number" id="to_hours" value="250" class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1">
        </div>
        <div>
            <label class="block text-[10px] font-bold text-gray-700 uppercase">Водитель</label>
            <input type="text" id="to_driver" value="Иванов И.И." class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1">
        </div>
    </div>
    <div class="flex justify-end gap-2">
        <button onclick="window.printToReportDoc()" class="bg-gray-900 hover:bg-gray-800 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition">🖨️ Печать А4</button>
        <button onclick="window.generateToDoc()" class="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition">💾 В архив (.DOC)</button>
    </div>
</div>
`;

window.getToReportHtml = (forWord = false) => {
    const vehicle = window.getActiveVehicle();
    if (!vehicle) return '<p>Ошибка: Техника не выбрана.</p>';

    const kind = document.getElementById('to_kind')?.value || 'ТО-1';
    const hours = document.getElementById('to_hours')?.value || '0';
    const driver = document.getElementById('to_driver')?.value || '';
    const today = new Date().toLocaleDateString('ru-RU');

    return `
    <div class="print-page-a4" style="font-family: 'Times New Roman', serif; font-size: 13px; color: #000; line-height: 1.5; max-width: 210mm; box-sizing: border-box;">
        <br><br>
        <h3 align="center" style="font-size: 16px; margin: 0 0 5px 0; font-family: 'Times New Roman'; letter-spacing:1px;">РАПОРТ</h3>
        <h4 align="center" style="font-size: 13px; text-transform: uppercase; margin: 0 0 35px 0; font-family: 'Times New Roman';">о проведении технического обслуживания</h4>
        <p align="center" style="margin-top:-30px; margin-bottom:40px; font-family: 'Times New Roman';">от ${today}</p>
        <p style="text-indent: 25px; text-align: justify; margin-bottom: 15px; font-family: 'Times New Roman';">Докладываю, что на машине марки <b>${vehicle.model || '—'}</b>, инв. № <b>${vehicle.inv_number || 'б/н'}</b> под управлением механизатора <b>${driver}</b> успешно выполнено плановое обслуживание.</p>
        <p style="text-indent: 25px; margin-bottom: 15px; font-family: 'Times New Roman';">Вид обслуживания: <b>${kind}</b></p>
        <p style="text-indent: 25px; margin-bottom: 15px; font-family: 'Times New Roman';">Наработка на момент проведения: <b>${hours} м/ч</b></p>
        <p style="text-indent: 25px; text-align: justify; margin-bottom: 40px; font-family: 'Times New Roman';">Произведена замена смазочных материалов и фильтрующих элементов. Техническое состояние соответствует нормам.</p>
        <table style="width: 100%; border: none; margin-top: 80px;">
            <tr>
                <td style="border:none; text-align: left; font-size: 13px; font-family: 'Times New Roman';">Инженер по ЭМТП: ________________ / Волчек А.А. /</td>
                <td style="border:none; text-align: right; font-size: 13px; font-family: 'Times New Roman';">Исполнитель: ________________</td>
            </tr>
        </table>
    </div>`;
};

window.printToReportDoc = () => {
    const printBlock = document.getElementById('tripPrintBlock');
    if (!printBlock) return;
    printBlock.innerHTML = window.getToReportHtml(false);
    window.print();
    printBlock.innerHTML = '';
};

window.generateToDoc = async () => {
    const vehicle = window.getActiveVehicle();
    if (!vehicle) return alert('Сначала выберите технику!');

    const kind = document.getElementById('to_kind')?.value || 'ТО-1';
    const fileName = `to_report_${kind}_${vehicle.inv_number || 'бн'}.doc`;
    const htmlContent = window.getToReportHtml(true);

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