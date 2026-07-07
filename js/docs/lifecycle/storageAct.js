// js/docs/lifecycle/storageAct.js

export const storageTemplate = `
<div id="form_block_storage" class="hidden space-y-4 fade-in-sub">
    <div class="grid grid-cols-2 gap-4">
        <div>
            <label class="block text-[10px] font-bold text-gray-700 uppercase">Номер акта</label>
            <input type="text" id="storage_num" value="1" class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1">
        </div>
        <div>
            <label class="block text-[10px] font-bold text-gray-700 uppercase">Дата консервации</label>
            <input type="date" id="storage_date" class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1">
        </div>
    </div>
    <div>
        <label class="block text-[10px] font-bold text-gray-700 uppercase">Состояние консервации (ГОСТ 7751-2009)</label>
        <input type="text" id="storage_gost" value="Полное соответствие требованиям государственного стандарта" class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1">
    </div>
    <div class="grid grid-cols-2 gap-2 pt-2">
        <button onclick="window.printStorageAct()" class="bg-gray-900 hover:bg-gray-800 text-white font-black text-xs py-2.5 rounded-xl transition">🖨️ Распечатать (А4)</button>
        <button onclick="window.generateStorageDoc()" class="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-2.5 rounded-xl transition">💾 В архив (.DOC)</button>
    </div>
</div>
`;

export function initStorageAct() {
    const today = new Date().toISOString().split('T')[0];
    const dInput = document.getElementById('storage_date');
    if (dInput) dInput.value = today;

    function buildHtml(v, num, gost, date) {
        return `
        <div style="font-family: 'Times New Roman', serif; font-size: 13px; line-height: 1.4; padding: 20mm 15mm 20mm 25mm; max-height: 250mm; box-sizing: border-box;">
            <div style="text-align: right; font-weight: bold; font-size: 11px;">ГОСТ 7751-2009</div>
            <table style="width: 100%; margin-bottom: 40px;">
                <tr>
                    <td style="font-size: 13px;">Филиал СХК «Великополье»<br>ГП «Минсктранс»</td>
                    <td style="text-align: right; font-size: 13px;"><b>УТВЕРЖДАЮ</b><br>Директор филиала<br>___________ Д.С. Рунцевич<br>«___» ________ 2026 г.</td>
                </tr>
            </table>
            <div style="text-align: center; margin-bottom: 30px;">
                <h3 style="margin: 0; font-size: 16px;">АКТ № ${num}</h3>
                <b style="font-size: 14px; text-transform: uppercase;">постановки машин на хранение</b><br>
                <span>от ${date}</span>
            </div>
            <p style="text-indent: 25px; text-align: justify;">Ответственный за хранение Инженер по ЭМТП Волчек А.А. принял на долгосрочное/сезонное хранение следующую сельскохозяйственную технику:</p>
            <p style="margin-left: 25px;">Наименование и марка: <b>${v.model}</b><br>Инвентарный номер: <b>${v.inv_number || 'б/н'}</b><br>Государственный знак: <b>${v.plate || 'б/н'}</b></p>
            <p style="text-indent: 25px; text-align: justify;">Проверкой установлена консервация узлов и агрегатов: <b>${gost}</b>. Техника очищена от грязи, установлена на подставки, шины разгружены и покрыты защитным составом, аккумуляторная батарея снята.</p>
            <table style="width: 100%; margin-top: 70px;">
                <tr>
                    <td>Сдал механизатор: __________________</td>
                    <td style="text-align: right;">Принял инженер по ЭМТП: __________________ / Волчек А.А. /</td>
                </tr>
            </table>
        </div>`;
    }

    window.printStorageAct = () => {
        const v = window.getActiveVehicle(); if (!v) return;
        const html = buildHtml(v, document.getElementById('storage_num').value, document.getElementById('storage_gost').value, document.getElementById('storage_date').value);
        window.printLifecycleHtml(html);
    };

    window.generateStorageDoc = () => {
        const v = window.getActiveVehicle(); if (!v) return;
        const num = document.getElementById('storage_num').value;
        const fName = `storage_act_№${num}_инв_${v.inv_number || 'бн'}.doc`;
        const html = buildHtml(v, num, document.getElementById('storage_gost').value, document.getElementById('storage_date').value);
        window.uploadLifecycleWord(fName, html);
    };
}