// js/docs/machineryLifecycle.js

import { storageTemplate, initStorageAct } from './lifecycle/storageAct.js';
import { defectTemplate, initDefectAct } from './lifecycle/defectAct.js';
import { repairOutTemplate, initRepairOutAct } from './lifecycle/repairOutAct.js';
import { toTemplate, initToReport } from './lifecycle/toReport.js';

let allVehicles = [];
let currentCategory = 'all';
let currentStorageFiles = [];
let activeVehicle = null;

export const machineryLifecycleTemplate = `
<div id="subModule_machinery_lifecycle" class="hidden space-y-6 fade-in-sub">
    <div class="flex flex-wrap gap-2 border-b border-gray-200 pb-3" id="lifecycleCategoryFilters">
        <button data-cat="all" class="lifecycle-cat-btn bg-gray-950 text-white font-bold text-xs px-4 py-2 rounded-xl transition">📋 Все машины</button>
        <button data-cat="Трактор" class="lifecycle-cat-btn bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs px-4 py-2 rounded-xl border border-gray-300 transition">🚜 Тракторы</button>
        <button data-cat="Комбайн" class="lifecycle-cat-btn bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs px-4 py-2 rounded-xl border border-gray-300 transition">🌾 Комбайны</button>
        <button data-cat="Автомобиль" class="lifecycle-cat-btn bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs px-4 py-2 rounded-xl border border-gray-300 transition">🚚 Автомобили</button>
        <button data-cat="Агрегат" class="lifecycle-cat-btn bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs px-4 py-2 rounded-xl border border-gray-300 transition">🔧 Агрегаты</button>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border-2 border-gray-900 shadow-xs">
        <div>
            <h2 class="text-sm font-black text-gray-900 uppercase tracking-wider">🚜 Жизненный цикл и акты техники</h2>
            <p class="text-[11px] text-gray-500 font-medium">Нажмите на карту для заполнения или используйте быстрые кнопки</p>
        </div>
        <div class="flex items-center gap-2 w-full md:w-auto">
            <input type="text" id="lifecycleSearch" placeholder="Поиск по модели, инв. №..." class="border-2 border-gray-900 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none w-72">
            <button id="btnRefreshLifecycle" class="bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition">🔄 Обновить</button>
        </div>
    </div>

    <div id="lifecycleVehiclesGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"></div>

    <div id="lifecycleModal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-xl rounded-2xl shadow-2xl border-2 border-gray-900 overflow-hidden">
            <div class="bg-gray-50 px-6 py-4 border-b-2 border-gray-900 flex justify-between items-center">
                <div>
                    <h3 id="selectedVehicleTitle" class="text-sm font-black text-gray-900 uppercase">Параметры документа</h3>
                    <p class="text-[10px] text-gray-500">Заполните поля ниже для генерации официального бланка</p>
                </div>
                <button onclick="window.closeLifecycleModal()" class="text-gray-500 hover:text-gray-900 font-black text-lg">&times;</button>
            </div>
            
            <div class="p-6 space-y-4">
                <div>
                    <label class="block text-[10px] font-black text-gray-700 uppercase mb-1">Выберите необходимый акт</label>
                    <select id="lifecycleDocTypeSelect" class="w-full bg-gray-50 border-2 border-gray-900 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none">
                        <option value="storage">❄️ Акт постановки на хранение (ГОСТ)</option>
                        <option value="defect">🛠️ Дефектный акт комиссии</option>
                        <option value="repair_out">🟢 Акт приема из ремонта</option>
                        <option value="to_report">⚙️ Рапорт проведения ТО</option>
                    </select>
                </div>

                <div id="lifecycleSubFormsContainer" class="border-t border-gray-100 pt-2">
                    ${storageTemplate}
                    ${defectTemplate}
                    ${repairOutTemplate}
                    ${toTemplate}
                </div>
            </div>
        </div>
    </div>
</div>

<div id="lifecyclePrintZone" class="hidden"></div>
`;

export async function initMachineryLifecycle(storageFiles = []) {
    const supabase = window._supabase || window.supabase;
    if (!supabase) return;

    currentStorageFiles = storageFiles || [];
    const grid = document.getElementById('lifecycleVehiclesGrid');
    const search = document.getElementById('lifecycleSearch');
    const typeSelect = document.getElementById('lifecycleDocTypeSelect');

    window.getActiveVehicle = () => activeVehicle;

    window.openLifecycleModalFor = (id, targetTab = 'storage') => {
        activeVehicle = allVehicles.find(v => v.id == id);
        if (!activeVehicle) return;

        document.getElementById('selectedVehicleTitle').innerText = `${activeVehicle.model} (Инв: ${activeVehicle.inv_number || 'б/н'})`;
        document.getElementById('lifecycleModal').classList.remove('hidden');

        if (typeSelect) {
            typeSelect.value = targetTab;
            typeSelect.dispatchEvent(new Event('change'));
        }
    };

    window.closeLifecycleModal = () => {
        document.getElementById('lifecycleModal').classList.add('hidden');
    };

    typeSelect?.addEventListener('change', (e) => {
        ['storage', 'defect', 'repair_out', 'to_report'].forEach(t => {
            document.getElementById(`form_block_${t}`)?.classList.add('hidden');
        });
        document.getElementById(`form_block_${e.target.value}`)?.classList.remove('hidden');
    });

    // Прямая печать готового HTML-контента
    window.printLifecycleHtml = (html) => {
        const zone = document.getElementById('lifecyclePrintZone');
        if (!zone) return;
        zone.innerHTML = html;
        
        // Временный стиль для качественного вывода на печать одной страницы
        const style = document.createElement('style');
        style.innerHTML = `@media print { body * { visibility: hidden; } #lifecyclePrintZone, #lifecyclePrintZone * { visibility: visible; } #lifecyclePrintZone { position: absolute; left: 0; top: 0; width: 210mm; height: 297mm; background: white; } } @page { size: A4 portrait; margin: 0; }`;
        document.head.appendChild(style);
        
        window.print();
        
        document.head.removeChild(style);
        zone.innerHTML = '';
    };

    // Общая функция отправки в архив документов
    window.uploadLifecycleWord = async (fileName, rawHtml) => {
        const wordContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="utf-8"><style>@page { size: 21cm 29.7cm; margin: 2cm 1.5cm 2cm 2.5cm; } body { font-family: "Times New Roman", serif; font-size: 11pt; }</style></head>
        <body>${rawHtml}</body></html>`;

        try {
            const blob = new Blob([wordContent], { type: 'application/msword;charset=utf-8' });
            const { error } = await supabase.storage.from('documents-history').upload(fileName, blob, { cacheControl: '3600', upsert: true });
            if (error) throw error;
            alert(`Документ успешно добавлен в архив:\n${fileName}`);
            window.closeLifecycleModal();
            if (typeof window.loadTripStorageHistory === 'function') await window.loadTripStorageHistory();
        } catch (err) {
            alert('Ошибка отправки файла в Storage: ' + err.message);
        }
    };

    function applyFilters() {
        const query = search?.value.toLowerCase() || '';
        const filtered = allVehicles.filter(v => {
            if (currentCategory !== 'all' && !v.type?.toLowerCase().includes(currentCategory.toLowerCase())) return false;
            return (v.model?.toLowerCase().includes(query)) || (v.inv_number?.toLowerCase().includes(query));
        });
        renderCards(filtered);
    }

    function renderCards(list) {
        if (!grid) return;
        if (!list.length) {
            grid.innerHTML = '<div class="col-span-full text-center py-8 text-xs font-bold text-gray-400">Техника не найдена</div>';
            return;
        }

        grid.innerHTML = list.map(v => {
            const inv = v.inv_number || 'б/н';
            const hasStorage = currentStorageFiles.some(f => f.name.startsWith('storage_') && f.name.includes(inv));
            const hasDefect = currentStorageFiles.some(f => f.name.startsWith('defect_') && f.name.includes(inv));
            const hasRepair = currentStorageFiles.some(f => f.name.startsWith('repair_out_') && f.name.includes(inv));
            const hasTo = currentStorageFiles.some(f => f.name.startsWith('to_report_') && f.name.includes(inv));

            return `
            <div class="bg-white border-2 border-gray-900 rounded-2xl p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4">
                <div onclick="window.openLifecycleModalFor('${v.id}', 'storage') class="cursor-pointer">
                    <div class="flex items-center justify-between">
                        <span class="px-2 py-0.5 text-[9px] font-black uppercase bg-gray-100 text-gray-800 rounded-md border border-gray-300">${v.type || 'Техника'}</span>
                        <span class="text-[10px] font-mono font-bold text-gray-400">Инв: ${inv}</span>
                    </div>
                    <h4 class="text-xs font-black text-gray-900 mt-2 uppercase tracking-tight">${v.model}</h4>
                    <p class="text-[10px] font-bold text-gray-400 mt-0.5 font-mono">💳 ${v.plate || 'Нет гос. номера'}</p>
                </div>
                
                <div class="pt-2 border-t border-gray-100 space-y-1 text-[10px] font-bold">
                    <div class="flex items-center justify-between p-1 rounded-lg ${hasStorage ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'}">
                        <span>❄️ Акт хранения ГОСТ</span>
                        <button onclick="window.openLifecycleModalFor('${v.id}', 'storage')" class="text-blue-600 underline hover:text-blue-800">Открыть</button>
                    </div>
                    <div class="flex items-center justify-between p-1 rounded-lg ${hasDefect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'}">
                        <span>🛠️ Дефектный акт</span>
                        <button onclick="window.openLifecycleModalFor('${v.id}', 'defect')" class="text-blue-600 underline hover:text-blue-800">Открыть</button>
                    </div>
                    <div class="flex items-center justify-between p-1 rounded-lg ${hasRepair ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'}">
                        <span>🟢 Прием из ремонта</span>
                        <button onclick="window.openLifecycleModalFor('${v.id}', 'repair_out')" class="text-blue-600 underline hover:text-blue-800">Открыть</button>
                    </div>
                    <div class="flex items-center justify-between p-1 rounded-lg ${hasTo ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'}">
                        <span>⚙️ Рапорт проведения ТО</span>
                        <button onclick="window.openLifecycleModalFor('${v.id}', 'to_report')" class="text-blue-600 underline hover:text-blue-800">Открыть</button>
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    const catButtons = document.querySelectorAll('.lifecycle-cat-btn');
    catButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            catButtons.forEach(b => b.className = "lifecycle-cat-btn bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs px-4 py-2 rounded-xl border border-gray-300 transition");
            this.className = "lifecycle-cat-btn bg-gray-950 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs";
            currentCategory = this.getAttribute('data-cat');
            applyFilters();
        });
    });

    search?.addEventListener('input', applyFilters);
    document.getElementById('btnRefreshLifecycle')?.addEventListener('click', loadData);

    async function loadData() {
        try {
            const { data: stFiles } = await supabase.storage.from('documents-history').list('', { sortBy: { column: 'name', order: 'desc' } });
            if (stFiles) currentStorageFiles = stFiles.filter(f => f.name !== '.emptyFolderPlaceholder');

            const { data: vData, error: vErr } = await supabase.from('vehicles').select('id, model, plate, inv_number, type, current_hours');
            if (vErr) throw vErr;
            allVehicles = vData || [];

            applyFilters();
        } catch (err) {
            if (grid) grid.innerHTML = `<div class="col-span-full text-center py-6 text-xs text-red-500 font-bold">Ошибка: ${err.message}</div>`;
        }
    }

    // Инициализация внутренних функций подмодулей
    initStorageAct();
    initDefectAct();
    initRepairOutAct();
    initToReport();

    await loadData();
}