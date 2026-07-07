// js/docs/lifecycle/toReport.js

export const toTemplate = `
<div id="form_block_to_report" class="hidden space-y-4 pt-4 fade-in-sub">
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
            <input type="number" id="to_hours" class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1">
        </div>
        <div>
            <label class="block text-[10px] font-bold text-gray-700 uppercase">Дата проведения</label>
            <input type="date" id="to_date" class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1">
        </div>
        <div>
            <label class="block text-[10px] font-bold text-gray-700 uppercase">Механизатор</label>
            <input type="text" id="to_driver" class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1">
        </div>
    </div>
    <div class="flex justify-end">
        <button onclick="window.generateToDoc()" class="bg-cyan-600 hover:bg-cyan-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition">💾 Сгенерировать Рапорт ТО Word</button>
    </div>
</div>
`;

window.generateToDoc = () => {
    const vehicle = window.getActiveVehicle();
    if (!vehicle) return alert('Выберите машину!');

    const kind = document.getElementById('to_kind').value;
    const hours = document.getElementById('to_hours').value;
    const date = document.getElementById('to_date').value;
    const driver = document.getElementById('to_driver').value;

    const htmlContent = `
        <div class="print-page-a4">
            <h2 align="center">РАПОРТ о проведении технического обслуживания</h2>
            <p>По состоянию на ${date} на машине марки <b>${vehicle.brand} ${vehicle.model}</b>, инв. № <b>${vehicle.inv_num}</b> наработка составляет <b>${hours}</b>.</p>
            <p>Водитель/Тракторист: <b>${driver}</b></p>
            <p>Выполнено регламентированное обслуживание: <b>${kind}</b>. Произведена замена масла 10W40, фильтра масляного, фильтра воздушного.</p>
            <br><br>
            <p>Инженер по ЭМТП: _________ А.А. Волчек</p>
        </div>
    `;
    if (typeof window.uploadLifecycleToStorage === 'function') {
        window.uploadLifecycleToStorage(`to_report_${kind}_${vehicle.inv_num}.doc`, htmlContent);
    }
};