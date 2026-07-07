// js/docs/machineryLifecycle.js

import { storageTemplate } from './lifecycle/storageAct.js';
import { defectTemplate } from './lifecycle/defectAct.js';
import { repairOutTemplate } from './lifecycle/repairOutAct.js';
import { toTemplate } from './lifecycle/toReport.js';

let allVehicles = [];
let selectedVehicle = null;

export const machineryLifecycleTemplate = '\n' +
'<div id="subModule_machinery_lifecycle" class="hidden space-y-6 fade-in-sub">\n' +
'    \n' +
'    <div class="bg-white border-2 border-gray-900 rounded-2xl shadow-xs overflow-hidden">\n' +
'        <div class="p-4 bg-gray-50 border-b-2 border-gray-900 flex justify-between items-center flex-wrap gap-2">\n' +
'            <div>\n' +
'                <h2 class="text-sm font-black text-gray-900 uppercase tracking-wider">🚜 Мониторинг жизненного цикла и наличия актов по технике</h2>\n' +
'                <p class="text-[10px] text-gray-500 font-medium mt-0.5">Сверка базы данных "vehicles" с файловым хранилищем документов</p>\n' +
'            </div>\n' +
'            <div class="flex items-center gap-2">\n' +
'                <input type="text" id="lifecycleSearch" placeholder="Поиск по марке/инв. №..." class="border-2 border-gray-900 rounded-xl px-3 py-1 text-xs font-semibold focus:outline-none placeholder-gray-400">\n' +
'                <button id="btnRefreshLifecycle" class="bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition">🔄 Обновить</button>\n' +
'            </div>\n' +
'        </div>\n' +
'        \n' +
'        <div class="overflow-x-auto">\n' +
'            <table class="w-full text-left border-collapse">\n' +
'                <thead>\n' +
'                    <tr class="bg-gray-100 text-[10px] font-black text-gray-600 uppercase tracking-wider border-b-2 border-gray-900">\n' +
'                        <th class="p-3">Техника / Инв. Номер</th>\n' +
'                        <th class="p-3">Тип</th>\n' +
'                        <th class="p-3">Закрепленный сотрудник</th>\n' +
'                        <th class="p-3 text-center">🛠️ Дефектный</th>\n' +
'                        <th class="p-3 text-center">⚙️ Рапорт ТО</th>\n' +
'                        <th class="p-3 text-center">🟢 Из ремонта</th>\n' +
'                        <th class="p-3 text-center">❄️ Хранение ГОСТ</th>\n' +
'                        <th class="p-3 text-right">Действие</th>\n' +
'                    </tr>\n' +
'                </thead>\n' +
'                <tbody id="lifecycleVehiclesTable">\n' +
'                    <tr><td colspan="8" class="p-4 text-center text-xs text-gray-400 font-medium">Загрузка данных автопарка...</td></tr>\n' +
'                </tbody>\n' +
'            </table>\n' +
'        </div>\n' +
'    </div>\n' +
'\n' +
'    \n' +
'    <div id="lifecycleFormsBlock" class="hidden bg-white border-2 border-gray-900 rounded-2xl shadow-xs p-6 space-y-6">\n' +
'        <div class="border-b border-gray-200 pb-3 flex justify-between items-center">\n' +
'            <div>\n' +
'                <h3 id="selectedVehicleTitle" class="text-sm font-black text-gray-900">Выбрана машина: —</h3>\n' +
'                <p class="text-[10px] text-gray-500 font-medium">Выберите тип формируемого бланка и внесите недостающие данные</p>\n' +
'            </div>\n' +
'            <select id="lifecycleDocType" class="border-2 border-gray-900 rounded-xl px-3 py-1.5 text-xs font-bold bg-amber-50">\n' +
'                <option value="defect">🛠️ Дефектный акт</option>\n' +
'                <option value="to_report">⚙️ Рапорт проведения ТО</option>\n' +
'                <option value="repair_out">🟢 Акт приемки из ремонта</option>\n' +
'                <option value="storage">❄️ Акт постановки на хранение (ГОСТ)</option>\n' +
'            </select>\n' +
'        </div>\n' +
'\n' +
'        <div id="lifecycleSubFormContainer">\n' +
'            ' + defectTemplate + '\n' +
'            ' + toTemplate + '\n' +
'            ' + repairOutTemplate + '\n' +
'            ' + storageTemplate + '\n' +
'        </div>\n' +
'    </div>\n' +
'</div>\n' +
'';

export async function initMachineryLifecycle(storageFiles) {
    const supabase = window._supabase || window.supabase;
    if (!supabase) return;

    const tableBody = document.getElementById('lifecycleVehiclesTable');
    const searchInput = document.getElementById('lifecycleSearch');
    const docTypeSelect = document.getElementById('lifecycleDocType');

    docTypeSelect?.addEventListener('change', (e) => {
        const types = ['defect', 'to_report', 'repair_out', 'storage'];
        types.forEach(t => document.getElementById('form_block_' + t)?.classList.add('hidden'));
        document.getElementById('form_block_' + e.target.value)?.classList.remove('hidden');
    });

    async function loadData() {
        try {
            // Исключили brand, добавили name (для совместимости с твоей структурой)
            const { data, error } = await supabase.from('vehicles').select('id, name, model, inv_num, type, driver_name');
            if (error) throw error;
            allVehicles = data || [];
            renderTable(allVehicles);
        } catch (err) {
            if (tableBody) tableBody.innerHTML = '<tr><td colspan="8" class="p-4 text-center text-xs text-red-500 font-bold">Ошибка: ' + err.message + '</td></tr>';
        }
    }

    function renderTable(vehiclesList) {
        if (!tableBody) return;
        if (vehiclesList.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" class="p-4 text-center text-xs text-gray-400 font-medium">Техника не найдена</td></tr>';
            return;
        }

        tableBody.innerHTML = vehiclesList.map(v => {
            const inv = v.inv_num || 'б/н';
            
            // Безопасное определение названия: если name пустой, берем model
            const vehicleTitle = v.name || v.model || 'Техника';
            
            const hasDefect = storageFiles.some(f => f.name.includes('defect_') && f.name.includes(inv));
            const hasTo = storageFiles.some(f => f.name.includes('to_report_') && f.name.includes(inv));
            const hasRepair = storageFiles.some(f => f.name.includes('repair_out_') && f.name.includes(inv));
            const hasStorage = storageFiles.some(f => f.name.includes('storage_') && f.name.includes(inv));

            return '<tr class="border-b border-gray-200 hover:bg-gray-50 transition text-xs font-medium text-gray-800">' +
                '<td class="p-3 font-bold text-gray-900">' + vehicleTitle + ' <span class="block text-[10px] text-gray-400 font-mono">Инв: ' + inv + '</span></td>' +
                '<td class="p-3 text-[11px] text-gray-500">' + (v.type || '—') + '</td>' +
                '<td class="p-3 font-semibold text-gray-700">' + (v.driver_name || '❌ Не назначен') + '</td>' +
                '<td class="p-3 text-center text-sm">' + (hasDefect ? '🟢' : '🔴') + '</td>' +
                '<td class="p-3 text-center text-sm">' + (hasTo ? '🟢' : '🔴') + '</td>' +
                '<td class="p-3 text-center text-sm">' + (hasRepair ? '🟢' : '🔴') + '</td>' +
                '<td class="p-3 text-center text-sm">' + (hasStorage ? '🟢' : '🔴') + '</td>' +
                '<td class="p-3 text-right">' +
                    '<button onclick="window.selectVehicleForLifecycle(\'' + v.id + '\')" class="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg shadow-2xs transition">Выбрать</button>' +
                '</td>' +
            '</tr>';
        }).join('');
    }

    searchInput?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = allVehicles.filter(v => 
            (v.name && v.name.toLowerCase().includes(query)) || 
            (v.model && v.model.toLowerCase().includes(query)) || 
            (v.inv_num && v.inv_num.toLowerCase().includes(query))
        );
        renderTable(filtered);
    });

    document.getElementById('btnRefreshLifecycle')?.addEventListener('click', loadData);

    window.selectVehicleForLifecycle = (id) => {
        selectedVehicle = allVehicles.find(v => v.id == id);
        if (!selectedVehicle) return;

        const vehicleTitle = selectedVehicle.name || selectedVehicle.model || 'Техника';

        document.getElementById('lifecycleFormsBlock').classList.remove('hidden');
        document.getElementById('selectedVehicleTitle').innerText = '🚜 Выбрана машина: ' + vehicleTitle + ' (Инв. № ' + (selectedVehicle.inv_num || 'б/н') + ')';
        
        const driverInputs = ['defect_driver', 'to_driver', 'repair_driver', 'storage_driver'];
        driverInputs.forEach(i => {
            const input = document.getElementById(i);
            if (input) input.value = selectedVehicle.driver_name || '';
        });

        if (docTypeSelect) {
            docTypeSelect.value = 'defect';
            docTypeSelect.dispatchEvent(new Event('change'));
        }
    };

    window.getActiveVehicle = () => selectedVehicle;

    await loadData();
}

window.uploadLifecycleToStorage = async (fileName, bodyContent) => {
    const supabase = window._supabase || window.supabase;
    if (!supabase) return;

    try {
        const wordContent = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
            '<head><meta charset="utf-8"><style>' +
            '@page { size: 21cm 29.7cm; margin: 2cm 1.5cm 2cm 2.5cm; }' +
            'body { font-family: "Times New Roman", serif; font-size: 11pt; }' +
            '</style></head>' +
            '<body>' + bodyContent + '</body></html>';

        const fileBlob = new Blob([wordContent], { type: 'application/msword;charset=utf-8' });
        const { error } = await supabase.storage.from('documents-history').upload(fileName, fileBlob, { cacheControl: '3600', upsert: true });
        
        if (error) throw error;
        alert('Файл ' + fileName + ' успешно сгенерирован и загружен в архив!');
        
        if (typeof window.loadTripStorageHistory === 'function') {
            await window.loadTripStorageHistory();
        }
    } catch (err) {
        alert('Ошибка сохранения файла: ' + err.message);
    }
};