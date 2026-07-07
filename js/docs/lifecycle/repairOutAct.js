// js/docs/lifecycle/repairOutAct.js

export const repairOutTemplate = `
<div id="form_block_repair_out" class="hidden space-y-4 fade-in-sub">
    <div class="grid grid-cols-2 gap-4">
        <div>
            <label class="block text-[10px] font-bold text-gray-700 uppercase">Дата приемки</label>
            <input type="date" id="repair_date" class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1">
        </div>
        <div>
            <label class="block text-[10px] font-bold text-gray-700 uppercase">Номер документа</label>
            <input type="text" id="repair_num" value="1" class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1">
        </div>
    </div>
    <div>
        <label class="block text-[10px] font-bold text-gray-700 uppercase">Заключение комиссии</label>
        <input type="text" id="repair_conclusion" value="Техника отремонтирована в полном объеме, полностью исправна и соответствует требованиям ТБ." class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1">
    </div>
    <div class="grid grid-cols-2 gap-2 pt-2">
        <button onclick="window.printRepairOutAct()" class="bg-gray-900 hover:bg-gray-800 text-white font-black text-xs py-2.5 rounded-xl transition">🖨️ Распечатать (А4)</button>
        <button onclick="window.generateRepairOutDoc()" class="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-2.5 rounded-xl transition">💾 В архив (.DOC)</button>
    </div>
</div>
`;

export function initRepairOutAct() {
    const today = new Date().toISOString().split('T')[0];
    const dInput = document.getElementById('repair_date');
    if (dInput) dInput.value = today;

    function buildHtml(v, num, conclusion, date) {
        return `
        <div style="font-family: 'Times New Roman', serif; font-size: 13px; line-height: 1.4; padding: 20mm 15mm 20mm 25mm; max-height: 250mm; box-sizing: border-box;">
            <table style="width: 100%; margin-bottom: 40px;">
                <tr>
                    <td style="font-size: 13px;">Филиал СХК «Великополье»<br>ГП «Минсктранс»</td>
                    <td style="text-align: right; font-size: 13px;"><b>УТВЕРЖДАЮ</b><br>Директор филиала<br>___________ Д.С. Рунцевич<br>«___» ________ 2026 г.</td>
                </tr>
            </table>
            <div style="text-align: center; margin-bottom: 35px;">
                <h3 style="margin: 0; font-size: 16px;">АКТ № ${num}</h3>
                <b style="font-size: 13px; text-transform: uppercase;">приема техники из ремонта</b><br>
                <span>от ${date}</span>
            </div>
            <p style="text-indent: 25px; text-align: justify;">Комиссия в составе агронома Глотовой В.А., главного инженера Маковича М.П., инженера по ЭМТП Волчека А.А. составила настоящий акт о приеме отремонтированной машины <b>${v.model}</b>, инвентарный номер <b>${v.inv_number || 'б/н'}</b>.</p>
            <p style="text-indent: 25px; text-align: justify;"><b>Заключение комиссии по результатам обкатки:</b> ${conclusion}</p>
            <p style="text-indent: 25px;">Техника признана готовой к выполнению полевых и транспортных работ и передана экипажу.</p>
            <table style="width: 100%; margin-top: 65px; line-height: 2;">
                <tr><td>Главный инженер:</td><td style="text-align: right;">___________ / М.П. Макович /</td></tr>
                <tr><td>Инженер по ЭМТП:</td><td style="text-align: right;">___________ / А.А. Волчек /</td></tr>
            </table>
        </div>`;
    }

    window.printRepairOutAct = () => {
        const v = window.getActiveVehicle(); if (!v) return;
        const html = buildHtml(v, document.getElementById('repair_num').value, document.getElementById('repair_conclusion').value, document.getElementById('repair_date').value);
        window.printLifecycleHtml(html);
    };

    window.generateRepairOutDoc = () => {
        const v = window.getActiveVehicle(); if (!v) return;
        const num = document.getElementById('repair_num').value;
        const fName = `repair_out_act_№${num}_инв_${v.inv_number || 'бн'}.doc`;
        const html = buildHtml(v, num, document.getElementById('repair_conclusion').value, document.getElementById('repair_date').value);
        window.uploadLifecycleWord(fName, html);
    };
}