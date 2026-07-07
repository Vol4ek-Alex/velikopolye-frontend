// js/docs/machineryLifecycle.js

import { storageTemplate } from './lifecycle/storageAct.js';
import { defectTemplate } from './lifecycle/defectAct.js';
import { repairOutTemplate } from './lifecycle/repairOutAct.js';
import { toTemplate } from './lifecycle/toReport.js';

let allVehicles = [];
let allDrivers = []; 
let selectedVehicle = null;
let currentCategory = 'all'; // Переменная для хранения выбранной категории

export const machineryLifecycleTemplate = '<div id="subModule_machinery_lifecycle" class="hidden space-y-6 fade-in-sub">' +
'    ' +
'    <div class="flex flex-wrap gap-2" id="lifecycleCategoryFilters">' +
'        <button data-cat="all" class="lifecycle-cat-btn bg-gray-900 text-white font-black text-xs px-4 py-2 rounded-xl border-2 border-gray-900 transition shadow-xs">📋 Все подряд</button>' +
'        <button data-cat="Трактор" class="lifecycle-cat-btn bg-white hover:bg-gray-50 text-gray-900 font-bold text-xs px-4 py-2 rounded-xl border-2 border-gray-900 transition shadow-xs">🚜 Тракторы</button>' +
'        <button data-cat="Комбайн" class="lifecycle-cat-btn bg-white hover:bg-gray-50 text-gray-900 font-bold text-xs px-4 py-2 rounded-xl border-2 border-gray-900 transition shadow-xs">🌾 Комбайны</button>' +
'        <button data-cat="Автомобиль" class="lifecycle-cat-btn bg-white hover:bg-gray-50 text-gray-900 font-bold text-xs px-4 py-2 rounded-xl border-2 border-gray-900 transition shadow-xs">🚚 Автомобили</button>' +
'        <button data-cat="Агрегат" class="lifecycle-cat-btn bg-white hover:bg-gray-50 text-gray-900 font-bold text-xs px-4 py-2 rounded-xl border-2 border-gray-900 transition shadow-xs">🔧 Агрегаты / Плуги</button>' +
'    </div>' +
'' +
'    ' +
'    <div class="bg-white border-2 border-gray-900 rounded-2xl shadow-xs overflow-hidden">' +
'        <div class="p-4 bg-gray-50 border-b-2 border-gray-900 flex justify-between items-center flex-wrap gap-2">' +
'            <div>' +
'                <h2 class="text-sm font-black text-gray-900 uppercase tracking-wider">🚜 Мониторинг жизненного цикла и наличия актов по технике</h2>' +
'                <p class="text-[10px] text-gray-500 font-medium mt-0.5">Сверка базы данных "vehicles" с файловым хранилищем документов</p>' +
'            </div>' +
'            <div class="flex items-center gap-2">' +
'                <input type="text" id="lifecycleSearch" placeholder="Поиск по модели/гос. №/инв. №..." class="border-2 border-gray-900 rounded-xl px-3 py-1 text-xs font-semibold focus:outline-none placeholder-gray-400">' +
'                <button id="btnRefreshLifecycle" class="bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition">🔄 Обновить</button>' +
'            </div>' +
'        </div>' +
'        <div class="overflow-x-auto">' +
'            <table class="w-full text-left border-collapse">' +
'                <thead>' +
'                    <tr class="bg-gray-100 text-[10px] font-black text-gray-600 uppercase tracking-wider border-b-2 border-gray-900">' +
'                        <th class="p-3">Техника / Гос. Номер / Инв. №</th>' +
'                        <th class="p-3">Тип</th>' +
'                        <th class="p-3 text-center">🛠️ Дефектный</th>' +
'                        <th class="p-3 text-center">⚙️ Рапорт ТО</th>' +
'                        <th class="p-3 text-center">🟢 Из ремонта</th>' +
'                        <th class="p-3 text-center">❄️ Хранение ГОСТ</th>' +
'                        <th class="p-3 text-right">Действие</th>' +
'                    </tr>' +
'                </thead>' +
'                <tbody id="lifecycleVehiclesTable">' +
'                    <tr><td colspan="7" class="p-4 text-center text-xs text-gray-400 font-medium">Загрузка данных автопарка...</td></tr>' +
'                </tbody>' +
'            </table>' +
'        </div>' +
'    </div>' +
'    ' +
'    <div id="lifecycleFormsBlock" class="hidden bg-white border-2 border-gray-900 rounded-2xl shadow-xs p-6 space-y-6">' +
'        <div class="border-b border-gray-200 pb-3 flex justify-between items-center">' +
'            <div>' +
'                <h3 id="selectedVehicleTitle" class="text-sm font-black text-gray-900">Выбрана машина: —</h3>' +
'                <p class="text-[10px] text-gray-500 font-medium">Выберите тип формируемого бланка и внесите недостающие данные</p>' +
'            </div>' +
'            <select id="lifecycleDocType" class="border-2 border-gray-900 rounded-xl px-3 py-1.5 text-xs font-bold bg-amber-50">' +
'                <option value="defect">🛠️ Дефектный акт</option>' +
'                <option value="to_report">⚙️ Рапорт проведения ТО</option>' +
'                <option value="repair_out">🟢 Акт приемки из ремонта</option>' +
'                <option value="storage">❄️ Акт постановки на хранение (ГОСТ)</option>' +
'            </select>' +
'        </div>' +
'        <div id="lifecycleSubFormContainer">' +
             defectTemplate +
             toTemplate +
             repairOutTemplate +
             storageTemplate +
'        </div>' +
'    </div>' +
'</div>';

export async function initMachineryLifecycle(storageFiles) {
    const supabase = window._supabase || window.supabase;
    if (!supabase) return;

    const tableBody = document.getElementById('lifecycleVehiclesTable');
    const searchInput = document.getElementById('lifecycleSearch');
    const docTypeSelect = document.getElementById('lifecycleDocType');

    // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ СКОУПА: Регистрируем метод ДО отрисовки таблицы
    window.selectVehicleForLifecycle = function(id) {
        selectedVehicle = allVehicles.find(v => v.id == id);
        if (!selectedVehicle) return;

        const plateStr = selectedVehicle.plate ? ' [' + selectedVehicle.plate + ']' : '';
        const vehicleTitle = (selectedVehicle.model || 'Техника') + plateStr;

        const formsBlock = document.getElementById('lifecycleFormsBlock');
        if (formsBlock) formsBlock.classList.remove('hidden');
        
        const titleElem = document.getElementById('selectedVehicleTitle');
        if (titleElem) {
            titleElem.innerText = '🚜 Выбрана машина: ' + vehicleTitle + ' (Инв. № ' + (selectedVehicle.inv_number || 'б/н') + ')';
        }
        
        const driverInputs = ['defect_driver', 'to_driver', 'repair_driver', 'storage_driver'];
        driverInputs.forEach(function(i) {
            const input = document.getElementById(i);
            if (input) input.value = ''; 
        });

        if (docTypeSelect) {
            docTypeSelect.value = 'defect';
            docTypeSelect.dispatchEvent(new Event('change'));
        }
    };

    window.getActiveVehicle = function() { return selectedVehicle; };

    docTypeSelect?.addEventListener('change', function(e) {
        const types = ['defect', 'to_report', 'repair_out', 'storage'];
        types.forEach(function(t) {
            document.getElementById('form_block_' + t)?.classList.add('hidden');
        });
        document.getElementById('form_block_' + e.target.value)?.classList.remove('hidden');
    });

    // Функция фильтрации и вывода объединенных критериев (Категории + Поиск)
    function applyFilters() {
        const query = searchInput?.value.toLowerCase() || '';
        
        const filtered = allVehicles.filter(function(v) {
            // 1. Проверка по категории кнопки
            if (currentCategory !== 'all') {
                const vehicleType = (v.type || '').toLowerCase();
                const targetCat = currentCategory.toLowerCase();
                if (!vehicleType.includes(targetCat)) return false;
            }
            // 2. Проверка по поисковой строке
            return (v.model && v.model.toLowerCase().includes(query)) || 
                   (v.plate && v.plate.toLowerCase().includes(query)) || 
                   (v.inv_number && v.inv_number.toLowerCase().includes(query));
        });

        renderTable(filtered);
    }

    function renderTable(vehiclesList) {
        if (!tableBody) return;
        if (vehiclesList.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-xs text-gray-400 font-medium">Техника в данной категории не найдена</td></tr>';
            return;
        }

        tableBody.innerHTML = vehiclesList.map(function(v) {
            const inv = v.inv_number || 'б/н';
            const plateStr = v.plate ? ' [' + v.plate + ']' : '';
            const vehicleTitle = (v.model || 'Техника') + plateStr;
            
            const hasDefect = storageFiles.some(f => f.name.includes('defect_') && f.name.includes(inv));
            const hasTo = storageFiles.some(f => f.name.includes('to_report_') && f.name.includes(inv));
            const hasRepair = storageFiles.some(f => f.name.includes('repair_out_') && f.name.includes(inv));
            const hasStorage = storageFiles.some(f => f.name.includes('storage_') && f.name.includes(inv));

            return '<tr class="border-b border-gray-200 hover:bg-gray-50 transition text-xs font-medium text-gray-800">' +
                '<td class="p-3 font-bold text-gray-900">' + vehicleTitle + ' <span class="block text-[10px] text-gray-400 font-mono">Инв: ' + inv + '</span></td>' +
                '<td class="p-3 text-[11px] text-gray-500">' + (v.type || '—') + '</td>' +
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

    // Инициализация кнопок переключения категорий
    const catButtons = document.querySelectorAll('.lifecycle-cat-btn');
    catButtons.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            catButtons.forEach(b => {
                b.classList.remove('bg-gray-900', 'text-white', 'font-black');
                b.classList.add('bg-white', 'text-gray-900', 'font-bold');
            });
            
            btn.classList.remove('bg-white', 'text-gray-900', 'font-bold');
            btn.classList.add('bg-gray-900', 'text-white', 'font-black');
            
            currentCategory = btn.getAttribute('data-cat');
            applyFilters();
        });
    });

    searchInput?.addEventListener('input', applyFilters);
    document.getElementById('btnRefreshLifecycle')?.addEventListener('click', loadData);

    async function loadData() {
        try {
            const { data: vData, error: vError } = await supabase.from('vehicles').select('id, model, plate, inv_number, type');
            if (vError) throw vError;
            allVehicles = vData || [];

            const { data: dData, error: dError } = await supabase.from('fleet_drivers').select('id, name');
            if (!dError && dData) {
                allDrivers = dData;
                window.getFleetDriversList = function() { return allDrivers; };
            }

            applyFilters();
        } catch (err) {
            if (tableBody) tableBody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-xs text-red-500 font-bold">Ошибка: ' + err.message + '</td></tr>';
        }
    }

    await loadData();
}

window.uploadLifecycleToStorage = async function(fileName, bodyContent) {
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
        alert('Файл ' + fileName + ' успешно сгенерирован и добавлен в историю!');
        
        if (typeof window.loadTripStorageHistory === 'function') {
            await window.loadTripStorageHistory();
        }
    } catch (err) {
        alert('Ошибка сохранения файла в Storage: ' + err.message);
    }
};