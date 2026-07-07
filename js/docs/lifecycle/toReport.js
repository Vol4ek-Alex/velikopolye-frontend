// js/docs/lifecycle/toReport.js

export const toTemplate = `
<div id="form_block_to_report" class="hidden space-y-4 pt-2">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
            <label class="block text-[10px] font-bold text-gray-700 uppercase">Вид ТО</label>
            <select id="to_kind" class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1">
                <option value="ТО-1">ТО-1</option>
                <option value="ТО-2">ТО-2</option>
                <option value="ТО-3">ТО-3</option>
            </select>
        </div>
        <div>
            <label class="block text-[10px] font-bold text-gray-700 uppercase">Текущая наработка (м/ч или км)</label>
            <input type="number" id="to_hours" value="250" class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1">
        </div>
        <div>
            <label class="block text-[10px] font-bold text-gray-700 uppercase">Дата проведения</label>
            <input type="date" id="to_date" class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1">
        </div>
        <div>
            <label class="block text-[10px] font-bold text-gray-700 uppercase">Водитель</label>
            <input type="text" id="to_driver" value="Иванов И.И." class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1">
        </div>
    </div>
    <div class="flex justify-end gap-2">
        <button onclick="window.printToReportDoc()" class="bg-gray-900 hover:bg-gray-800 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition">🖨️ Распечатать Рапорт</button>
        <button onclick="window.generateToDoc()" class="bg-cyan-600 hover:bg-cyan-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition">💾 Сохранить в архив (.DOC)</button>
    </div>
</div>
`;

function buildToHtml(vehicle, kind, hours, date, driver) {
    return `
    <div class="print-page-a4" style="font-family: 'Times New Roman', serif; font-size: 13px; color: #000; line-height: 1.4; max-width: 210mm; box-sizing: border-box;">
        <h3 align="center" style="font-size: 16px; margin: 0 0 5px 0; letter-spacing:1px;">РАПОРТ</h3>
        <h4 align="center" style="font-size: 13px; text-transform: uppercase; margin: 0 0 35px 0;">о проведении технического обслуживания техники</h4>
        <p style="text-indent: 25px; text-align: justify; margin-bottom: 15px;">По состоянию на <b>${date}</b> на машине марки <b>${vehicle.model}</b>, инв. № <b>${vehicle.inv_number || 'б/н'}</b> наработка составляет <b>${hours}</b>.</p>
        <p style="text-indent: 25px; margin-bottom: 15px;">Водитель/Тракторист: <b>${driver}</b></p>
        <p style="text-indent: 25px; text-align: justify; margin-bottom: 40px;">Выполнено плановое регламентированное обслуживание: <b>${kind}</b>. Произведена замена моторного масла, масляного фильтра, фильтра воздушного, осуществлена проверка уровней технических жидкостей в агрегатах. Машина полностью исправна.</p>
        <table style="width: 100%; border: none; margin-top: 80px;">
            <tr>
                <td style="border:none; text-align: left; font-size: 13px;">Инженер по ЭМТП: ________________ / Волчек А.А. /</td>
                <td style="border:none; text-align: right; font-size: 13px;">Исполнитель (экипаж): ________________</td>
            </tr>
        </table>
    </div>`;
}

window.printToReportDoc = () => {
    const vehicle = window.getActiveVehicle();
    if (!vehicle) return alert('Ошибка: машина не выбрана!');
    const html = buildToHtml(vehicle, document.getElementById('to_kind').value, document.getElementById('to_hours').value, document.getElementById('to_date').value, document.getElementById('to_driver').value);
    window.printDirectLifecycleHtml(html);
};

window.generateToDoc = async () => {
    const vehicle = window.getActiveVehicle();
    if (!vehicle) return alert('Выберите машину!');

    const kind = document.getElementById('to_kind').value;
    const hours = document.getElementById('to_hours').value;
    const date = document.getElementById('to_date').value;
    const driver = document.getElementById('to_driver').value;

    const htmlContent = buildToHtml(vehicle, kind, hours, date, driver);
    const fileName = `to_report_${kind}_инв_${vehicle.inv_number || 'бн'}.doc`;
    const wordWrap = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><style>@page { size: 21cm 29.7cm; margin: 2cm 1.5cm 2cm 2.5cm; } body { font-family: "Times New Roman", serif; font-size: 11pt; }</style></head><body>${htmlContent}</body></html>`;

    try {
        const fileBlob = new Blob([wordWrap], { type: 'application/msword;charset=utf-8' });
        const { error } = await window._supabase.storage.from('documents-history').upload(fileName, fileBlob, { cacheControl: '3600', upsert: true });
        if (error) throw error;
        alert('Рапорт ТО успешно добавлен в архив: ' + fileName);
        if (typeof window.loadTripStorageHistory === 'function') window.loadTripStorageHistory();
    } catch (err) {
        alert('Ошибка при сохранении: ' + err.message);
    }
};