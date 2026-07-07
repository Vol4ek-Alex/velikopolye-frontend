// js/docs/lifecycle/repairOutAct.js

export const repairOutTemplate = `
<div id="form_block_repair_out" class="hidden space-y-4 pt-4 fade-in-sub">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label class="block text-[10px] font-bold text-gray-700 uppercase">Дата приемки</label>
            <input type="date" id="repair_date" class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1">
        </div>
        <div>
            <label class="block text-[10px] font-bold text-gray-700 uppercase">Заключение комиссии</label>
            <input type="text" id="repair_conclusion" value="Техника отремонтирована в полном объеме, соответствует требованиям ТБ." class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1">
        </div>
    </div>
    <div class="flex justify-end">
        <button onclick="window.generateRepairOutDoc()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition">💾 Сгенерировать Акт выхода из ремонта</button>
    </div>
</div>
`;

window.generateRepairOutDoc = () => {
    const vehicle = window.getActiveVehicle();
    if (!vehicle) return;

    const date = document.getElementById('repair_date').value;
    const conclusion = document.getElementById('repair_conclusion').value;

    const htmlContent = `
        <div class="print-page-a4">
            <p align="right">УТВЕРЖДАЮ<br>Директор филиала СХК «Великополье»<br>________________ Д.С. Рунцевич</p>
            <h2 align="center">АКТ приема техники из ремонта</h2>
            <p>Комиссия в составе агронома Глотовой В.А., главного инженера Маковича М.П. составила настоящий акт о приеме отремонтированной машины <b>${vehicle.brand} ${vehicle.model}</b>, инв. № <b>${vehicle.inv_num}</b>.</p>
            <p><b>Заключение:</b> ${conclusion}</p>
            <br>
            <p>Главный инженер: _________ М.П. Макович</p>
            <p>Агроном: _________ В.А. Глотова</p>
        </div>
    `;
    if (typeof window.uploadLifecycleToStorage === 'function') {
        window.uploadLifecycleToStorage(`repair_out_${vehicle.inv_num}.doc`, htmlContent);
    }
};