// js/docs/machineryLifecycle.js

import { storageTemplate } from './lifecycle/storageAct.js';
import { defectTemplate } from './lifecycle/defectAct.js';
import { repairOutTemplate } from './lifecycle/repairOutAct.js';
import { toTemplate } from './lifecycle/toReport.js';

let allVehicles = [];
let selectedVehicle = null;

export const machineryLifecycleTemplate = `
<div id="subModule_machinery_lifecycle" class="hidden space-y-4 fade-in-sub">
    <style>
        @media print {
            body * { visibility: hidden; }
            #tripPrintBlock, #tripPrintBlock * { visibility: visible; }
            #tripPrintBlock { position: absolute; left: 0; top: 0; width: 100%; }
            .print-page-a4 {
                visibility: visible !important;
                page-break-after: always !important;
                page-break-inside: avoid !important;
                font-family: "Times New Roman", serif !important;
                font-size: 12pt !important;
                line-height: 1.4 !important;
                width: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
                border: none !important;
                box-shadow: none !important;
                background: transparent !important;
            }
            @page { size: A4 portrait; margin: 2cm 1.5cm 2cm 2.5cm; }
            .no-print { display: none !important; }
        }
    </style>

    <div class="flex items-center justify-between bg-white p-4 rounded-xl border-2 border-gray-900 shadow-xs">
        <div>
            <h2 class="text-xs font-black text-gray-900 uppercase tracking-wider">🚜 Жизненный цикл и акты техники</h2>
            <p class="text-[11px] text-gray-500 font-medium">Выберите технику из таблицы для формирования документов</p>
        </div>
    </div>

    <div class="bg-white border-2 border-gray-900 rounded-2xl overflow-hidden shadow-xs">
        <div class="overflow-x-auto max-h-[350px]">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-gray-100 border-b-2 border-gray-900 text-[10px] font-black uppercase text-gray-700 tracking-wider font-mono">
                        <th class="p-3">Модель</th>
                        <th class="p-3">Гос. Номер</th>
                        <th class="p-3">Инв. Номер</th>
                        <th class="p-3 text-right">Действие</th>
                    </tr>
                </thead>
                <tbody id="lifecycleTableBody" class="divide-y divide-gray-200 text-xs font-medium text-gray-900">
                    <tr><td colspan="4" class="p-4 text-center text-gray-400 font-bold">Загрузка автопарка...</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <div id="lifecycleFormBlock" class="hidden bg-white border-2 border-gray-900 rounded-2xl p-6 shadow-xs space-y-6">
        <div class="border-b border-gray-200 pb-3 flex justify-between items-center">
            <div>
                <h3 id="lifecycleSelectedTitle" class="text-sm font-black text-gray-900 uppercase"></h3>
                <p class="text-[11px] text-gray-500">Выберите вкладку ниже для заполнения конкретного акта</p>
            </div>
        </div>

        <div class="flex gap-2 border-b border-gray-200 pb-2">
            <button onclick="window.switchLifecycleTab('storage')" id="tab_btn_storage" class="lifecycle-tab-btn bg-gray-900 text-white font-bold text-xs px-4 py-2 rounded-xl transition">❄️ Хранение ГОСТ</button>
            <button onclick="window.switchLifecycleTab('defect')" id="tab_btn_defect" class="lifecycle-tab-btn bg-white text-gray-700 border border-gray-300 font-bold text-xs px-4 py-2 rounded-xl transition">🛠️ Дефектный акт</button>
            <button onclick="window.switchLifecycleTab('repair_out')" id="tab_btn_repair_out" class="lifecycle-tab-btn bg-white text-gray-700 border border-gray-300 font-bold text-xs px-4 py-2 rounded-xl transition">🟢 Из ремонта</button>
            <button onclick="window.switchLifecycleTab('to_report')" id="tab_btn_to_report" class="lifecycle-tab-btn bg-white text-gray-700 border border-gray-300 font-bold text-xs px-4 py-2 rounded-xl transition">⚙️ Рапорт ТО</button>
        </div>

        <div class="bg-gray-50 p-4 rounded-xl border border-gray-200">
            ${storageTemplate}
            ${defectTemplate}
            ${repairOutTemplate}
            ${toTemplate}
        </div>
    </div>
</div>
`;

window.getActiveVehicle = () => selectedVehicle;

window.switchLifecycleTab = (tabName) => {
    document.querySelectorAll('.lifecycle-tab-btn').forEach(btn => {
        btn.className = "lifecycle-tab-btn bg-white text-gray-700 border border-gray-300 font-bold text-xs px-4 py-2 rounded-xl transition";
    });
    document.getElementById(`tab_btn_${tabName}`).className = "lifecycle-tab-btn bg-gray-900 text-white font-bold text-xs px-4 py-2 rounded-xl transition";

    ['storage', 'defect', 'repair_out', 'to_report'].forEach(t => {
        document.getElementById(`form_block_${t}`).classList.add('hidden');
    });
    document.getElementById(`form_block_${tabName}`).classList.remove('hidden');
};

window.selectVehicleForLifecycle = (id) => {
    selectedVehicle = allVehicles.find(v => v.id == id);
    if (!selectedVehicle) return;

    const titleBlock = document.getElementById('lifecycleSelectedTitle');
    if (titleBlock) {
        titleBlock.innerText = `⚙️ Выбрана техника: ${selectedVehicle.model} (Инв. №: ${selectedVehicle.inv_number || 'б/н'})`;
    }
    document.getElementById('lifecycleFormBlock').classList.remove('hidden');
    window.switchLifecycleTab('storage');
};

// Универсальный хелпер прямой печати HTML
window.printDirectLifecycleHtml = (html) => {
    const printBlock = document.getElementById('tripPrintBlock');
    if (!printBlock) return alert('Критическая ошибка: отсутствует #tripPrintBlock в DOM.');
    printBlock.innerHTML = html;
    window.print();
    printBlock.innerHTML = '';
};

export async function initMachineryLifecycle() {
    const supabase = window._supabase || window.supabase;
    if (!supabase) return;

    const tbody = document.getElementById('lifecycleTableBody');

    async function loadVehicles() {
        try {
            const { data, error } = await supabase.from('vehicles').select('id, model, plate, inv_number, type');
            if (error) throw error;
            allVehicles = data || [];

            if (allVehicles.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-gray-400 font-bold">В базе данных автопарка нет записей</td></tr>`;
                return;
            }

            tbody.innerHTML = allVehicles.map(v => `
                <tr class="hover:bg-gray-50 border-b border-gray-100 transition text-xs font-mono">
                    <td class="p-3 font-bold text-gray-900 uppercase">${v.model}</td>
                    <td class="p-3 font-semibold text-gray-600">${v.plate || '—'}</td>
                    <td class="p-3 font-semibold text-gray-600">${v.inv_number || '—'}</td>
                    <td class="p-3 text-right">
                        <button onclick="window.selectVehicleForLifecycle('${v.id}')" class="bg-gray-900 hover:bg-gray-800 text-white text-[11px] font-black px-3 py-1.5 rounded-xl transition">выбрать</button>
                    </td>
                </tr>
            `).join('');

        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-red-500 font-bold">Ошибка загрузки: ${err.message}</td></tr>`;
        }
    }

    await loadVehicles();
}