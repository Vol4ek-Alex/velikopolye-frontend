// js/docs/lifecycle/storageAct.js

export const storageTemplate = `
<div id="form_block_storage" class="space-y-4 pt-2">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label class="block text-[10px] font-bold text-gray-700 uppercase">Номер акта хранения</label>
            <input type="text" id="storage_num" value="1" class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1">
        </div>
        <div>
            <label class="block text-[10px] font-bold text-gray-700 uppercase">Состояние консервации (ГОСТ 7751-2009)</label>
            <input type="text" id="storage_gost" value="Полное соответствие требованиям стандарта" class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1">
        </div>
    </div>
    <div class="flex justify-end gap-2">
        <button onclick="window.printStorageDoc()" class="bg-gray-900 hover:bg-gray-800 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition">🖨️ Распечатать Акт</button>
        <button onclick="window.generateStorageDoc()" class="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition">💾 Сохранить в архив (.DOC)</button>
    </div>
</div>
`;

function buildStorageHtml(vehicle, num, gost) {
    return `
    <div class="print-page-a4" style="font-family: 'Times New Roman', serif; font-size: 13px; color: #000; line-height: 1.4; max-width: 210mm; box-sizing: border-box;">
        <p align="center" style="font-size: 11px; margin: 0; font-weight: bold;">ГОСТ 7751-2009</p>
        <table style="width: 100%; border: none; margin-bottom: 40px;">
            <tr>
                <td style="border:none; text-align: left; font-size: 13px;">Филиал СХК «Великополье»<br>ГП «Минсктранс»</td>
                <td style="border:none; text-align: right; font-size: 13px;"><b>УТВЕРЖДАЮ</b><br>Директор филиала<br>________________ Д.С. Рунцевич<br>«___» ____________ 2026 г.</td>
            </tr>
        </table>
        <h3 align="center" style="font-size: 16px; margin: 0 0 5px 0;">АКТ № ${num}</h3>
        <h4 align="center" style="font-size: 14px; text-transform: uppercase; margin: 0 0 25px 0;">постановки машин на хранение</h4>
        <p style="text-indent: 25px; text-align: justify; margin-bottom: 15px;">Ответственный за хранение Инженер по ЭМТП Волчек А.А. принял на хранение технику <b>${vehicle.model}</b>, инв. № <b>${vehicle.inv_number || 'б/н'}</b>, гос. номер <b>${vehicle.plate || 'б/н'}</b>.</p>
        <p style="text-indent: 25px; text-align: justify; margin-bottom: 40px;">Качество подготовки и консервации: <b>${gost}</b>. Техника очищена от загрязнений, установлена на подставки, узлы трения смазаны, аккумуляторная батарея снята и передана на склад.</p>
        <table style="width: 100%; border: none; margin-top: 80px;">
            <tr>
                <td style="border:none; text-align: left; font-size: 13px;">Сдал механизатор: ________________</td>
                <td style="border:none; text-align: right; font-size: 13px;">Принял инженер по ЭМТП: ________________ / Волчек А.А. /</td>
            </tr>
        </table>
    </div>`;
}

window.printStorageDoc = () => {
    const vehicle = window.getActiveVehicle();
    if (!vehicle) return alert('Ошибка: машина не выбрана!');
    const html = buildStorageHtml(vehicle, document.getElementById('storage_num').value, document.getElementById('storage_gost').value);
    window.printDirectLifecycleHtml(html);
};

window.generateStorageDoc = async () => {
    const vehicle = window.getActiveVehicle();
    if (!vehicle) return alert('Сначала выберите технику из таблицы!');

    const num = document.getElementById('storage_num').value;
    const gost = document.getElementById('storage_gost').value;
    const htmlContent = buildStorageHtml(vehicle, num, gost);

    const fileName = `storage_act_№${num}_инв_${vehicle.inv_number || 'бн'}.doc`;
    const wordWrap = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><style>@page { size: 21cm 29.7cm; margin: 2cm 1.5cm 2cm 2.5cm; } body { font-family: "Times New Roman", serif; font-size: 11pt; }</style></head><body>${htmlContent}</body></html>`;

    try {
        const fileBlob = new Blob([wordWrap], { type: 'application/msword;charset=utf-8' });
        const { error } = await window._supabase.storage.from('documents-history').upload(fileName, fileBlob, { cacheControl: '3600', upsert: true });
        if (error) throw error;
        alert('Акт успешно сохранен в архив: ' + fileName);
        if (typeof window.loadTripStorageHistory === 'function') window.loadTripStorageHistory();
    } catch (err) {
        alert('Ошибка при сохранении: ' + err.message);
    }
};