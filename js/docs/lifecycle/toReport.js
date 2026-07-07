// js/docs/lifecycle/toReport.js

export const toTemplate = `
<div id="form_block_to_report" class="hidden space-y-4 fade-in-sub">
    <div class="grid grid-cols-3 gap-4">
        <div>
            <label class="block text-[10px] font-bold text-gray-700 uppercase">Вид ТО</label>
            <select id="to_kind" class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1">
                <option value="ТО-1">ТО-1</option>
                <option value="ТО-2">ТО-2</option>
                <option value="ТО-3">ТО-3</option>
            </select>
        </div>
        <div>
            <label class="block text-[10px] font-bold text-gray-700 uppercase">Наработка (м/ч или км)</label>
            <input type="number" id="to_hours" value="250" class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1">
        </div>
        <div>
            <label class="block text-[10px] font-bold text-gray-700 uppercase">Дата проведения</label>
            <input type="date" id="to_date" class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1">
        </div>
    </div>
    <div class="grid grid-cols-2 gap-2 pt-2">
        <button onclick="window.printToReportAct()" class="bg-gray-900 hover:bg-gray-800 text-white font-black text-xs py-2.5 rounded-xl transition">🖨️ Распечатать (А4)</button>
        <button onclick="window.generateToDoc()" class="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-2.5 rounded-xl transition">💾 В архив (.DOC)</button>
    </div>
</div>
`;

export function initToReport() {
    const today = new Date().toISOString().split('T')[0];
    const dInput = document.getElementById('to_date');
    if (dInput) dInput.value = today;

    function buildHtml(v, kind, hours, date) {
        return `
        <div style="font-family: 'Times New Roman', serif; font-size: 13px; line-height: 1.4; padding: 20mm 15mm 20mm 25mm; max-height: 250mm; box-sizing: border-box;">
            <div style="text-align: center; margin-bottom: 40px;">
                <h3 style="margin: 0; font-size: 16px; uppercase; tracking-spacing: 0.5px;">РАПОРТ</h3>
                <b style="font-size: 13px; text-transform: uppercase;">о проведении технического обслуживания</b><br>
                <span>от ${date}</span>
            </div>
            <p style="text-indent: 25px; text-align: justify;">Докладываю, что на машине марки <b>${v.model}</b>, инвентарный номер <b>${v.inv_number || 'б/н'}</b>, плановое техническое обслуживание выполнено в полном объёме согласно регламенту.</p>
            <p style="text-indent: 25px;">Вид технического обслуживания: <b>${kind}</b></p>
            <p style="text-indent: 25px;">Фактическая наработка на момент проведения: <b>${hours}</b></p>
            <p style="text-indent: 25px; text-align: justify;">В ходе обслуживания произведена полная замена смазочных материалов, масляного, топливного и воздушного фильтрующих элементов. Проведена регулировка зазоров и проверка давления в гидросистеме. Машина технически исправна.</p>
            <table style="width: 100%; margin-top: 80px;">
                <tr>
                    <td>Инженер по ЭМТП: __________________ / Волчек А.А. /</td>
                    <td style="text-align: right;">Исполнитель (экипаж): __________________</td>
                </tr>
            </table>
        </div>`;
    }

    window.printToReportAct = () => {
        const v = window.getActiveVehicle(); if (!v) return;
        const html = buildHtml(v, document.getElementById('to_kind').value, document.getElementById('to_hours').value, document.getElementById('to_date').value);
        window.printLifecycleHtml(html);
    };

    window.generateToDoc = () => {
        const v = window.getActiveVehicle(); if (!v) return;
        const kind = document.getElementById('to_kind').value;
        const fName = `to_report_${kind}_инв_${v.inv_number || 'бн'}.doc`;
        const html = buildHtml(v, kind, document.getElementById('to_hours').value, document.getElementById('to_date').value);
        window.uploadLifecycleWord(fName, html);
    };
}