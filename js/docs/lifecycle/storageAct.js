// js/docs/lifecycle/storageAct.js

export const storageTemplate = `
<div id="form_block_storage" class="hidden space-y-4 pt-4 fade-in-sub">
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
    <div class="flex justify-end">
        <button onclick="window.generateStorageDoc()" class="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition">💾 Сгенерировать Акт Хранения ГОСТ</button>
    </div>
</div>
`;

window.generateStorageDoc = () => {
    const vehicle = window.getActiveVehicle();
    if (!vehicle) return;

    const num = document.getElementById('storage_num').value;
    const gost = document.getElementById('storage_gost').value;

    const htmlContent = `
        <div class="print-page-a4">
            <p align="center"><b>ГОСТ 7751-2009</b></p>
            <h2 align="center">АКТ № ${num} постановки машин на хранение</h2>
            <p>Ответственный за хранение Инженер по ЭМТП Волчек А.А. принял на хранение технику <b>${vehicle.brand} ${vehicle.model}</b>, инв. № <b>${vehicle.inv_num}</b>.</p>
            <p>Качество подготовки и консервации: <b>${gost}</b></p>
            <br>
            <p>Сдал: __________________</p>
            <p>Принял Инженер по ЭМТП: _________ А.А. Волчек</p>
        </div>
    `;
    if (typeof window.uploadLifecycleToStorage === 'function') {
        window.uploadLifecycleToStorage(`storage_${vehicle.inv_num}.doc`, htmlContent);
    }
};