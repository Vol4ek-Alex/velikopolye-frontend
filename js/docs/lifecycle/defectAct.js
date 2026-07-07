// js/docs/lifecycle/defectAct.js

export const defectTemplate = `
<div id="form_block_defect" class="hidden space-y-4 fade-in-sub">
    <div class="grid grid-cols-2 gap-4">
        <div>
            <label class="block text-[10px] font-bold text-gray-700 uppercase">Номер акта</label>
            <input type="text" id="defect_num" value="1" class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1">
        </div>
        <div>
            <label class="block text-[10px] font-bold text-gray-700 uppercase">Дата дефектации</label>
            <input type="date" id="defect_date" class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1">
        </div>
    </div>
    <div>
        <label class="block text-[10px] font-bold text-gray-700 uppercase">Выявленные дефекты и неисправности</label>
        <textarea id="defect_faults" class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1 h-16">Критический износ рабочих органов, течь масла соединений гидросистемы.</textarea>
    </div>
    <div class="grid grid-cols-2 gap-2 pt-2">
        <button onclick="window.printDefectAct()" class="bg-gray-900 hover:bg-gray-800 text-white font-black text-xs py-2.5 rounded-xl transition">🖨️ Распечатать (А4)</button>
        <button onclick="window.generateDefectDoc()" class="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-2.5 rounded-xl transition">💾 В архив (.DOC)</button>
    </div>
</div>
`;

export function initDefectAct() {
    const today = new Date().toISOString().split('T')[0];
    const dInput = document.getElementById('defect_date');
    if (dInput) dInput.value = today;

    function buildHtml(v, num, faults, date) {
        return `
        <div style="font-family: 'Times New Roman', serif; font-size: 13px; line-height: 1.4; padding: 20mm 15mm 20mm 25mm; max-height: 250mm; box-sizing: border-box;">
            <table style="width: 100%; margin-bottom: 40px;">
                <tr>
                    <td style="font-size: 13px;">Филиал СХК «Великополье»<br>ГП «Минсктранс»</td>
                    <td style="text-align: right; font-size: 13px;"><b>УТВЕРЖДАЮ</b><br>Директор филиала<br>___________ Д.С. Рунцевич<br>«___» ________ 2026 г.</td>
                </tr>
            </table>
            <div style="text-align: center; margin-bottom: 30px;">
                <h3 style="margin: 0; font-size: 16px;">ДЕФЕКТНЫЙ АКТ № ${num}</h3>
                <span>от ${date}</span>
            </div>
            <p style="text-indent: 25px; text-align: justify;">Комиссия в составе председателя главного инженера Маковича М.П., инженера по ЭМТП Волчка А.А., составила настоящий акт о том, что в ходе технического осмотра узлов машины <b>${v.model}</b>, инвентарный номер <b>${v.inv_number || 'б/н'}</b>, обнаружены следующие неисправности:</p>
            <div style="border: 1px solid black; padding: 10px; margin: 20px 0; min-height: 60px; text-align: left; font-family: 'Times New Roman'; font-size: 13px;">${faults}</div>
            <p>Заключение комиссии: Направить технику в ремонтную мастерскую филиала для устранения дефектов собственными силами.</p>
            <table style="width: 100%; margin-top: 65px; line-height: 2;">
                <tr><td>Председатель комиссии:</td><td style="text-align: right;">___________ / М.П. Макович /</td></tr>
                <tr><td>Член комиссии (инженер по ЭМТП):</td><td style="text-align: right;">___________ / А.А. Волчек /</td></tr>
            </table>
        </div>`;
    }

    window.printDefectAct = () => {
        const v = window.getActiveVehicle(); if (!v) return;
        const html = buildHtml(v, document.getElementById('defect_num').value, document.getElementById('defect_faults').value, document.getElementById('defect_date').value);
        window.printLifecycleHtml(html);
    };

    window.generateDefectDoc = () => {
        const v = window.getActiveVehicle(); if (!v) return;
        const num = document.getElementById('defect_num').value;
        const fName = `defect_act_№${num}_инв_${v.inv_number || 'бн'}.doc`;
        const html = buildHtml(v, num, document.getElementById('defect_faults').value, document.getElementById('defect_date').value);
        window.uploadLifecycleWord(fName, html);
    };
}