// js/docs/machineryLifecycle.js

import { storageTemplate } from './lifecycle/storageAct.js';
import { defectTemplate } from './lifecycle/defectAct.js';
import { repairOutTemplate } from './lifecycle/repairOutAct.js';
import { toTemplate } from './lifecycle/toReport.js';

let allVehicles = [];
let allDrivers = []; 
let selectedVehicle = null;
let currentCategory = 'all';

// СОВРЕМЕННЫЙ ИНТЕРФЕЙС: Категории, Сетка Карточек и Модальное Окно
export const machineryLifecycleTemplate = '<div id="subModule_machinery_lifecycle" class="hidden space-y-6 fade-in-sub">' +
'    ' +
'    <div class="flex flex-wrap gap-2 border-b border-gray-200 pb-4" id="lifecycleCategoryFilters">' +
'        <button data-cat="all" class="lifecycle-cat-btn bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm">📋 Все подряд</button>' +
'        <button data-cat="Трактор" class="lifecycle-cat-btn bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs px-4 py-2.5 rounded-xl border border-gray-300 transition">🚜 Тракторы</button>' +
'        <button data-cat="Комбайн" class="lifecycle-cat-btn bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs px-4 py-2.5 rounded-xl border border-gray-300 transition">🌾 Комбайны</button>' +
'        <button data-cat="Автомобиль" class="lifecycle-cat-btn bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs px-4 py-2.5 rounded-xl border border-gray-300 transition">🚚 Автомобили</button>' +
'        <button data-cat="Агрегат" class="lifecycle-cat-btn bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs px-4 py-2.5 rounded-xl border border-gray-300 transition">🔧 Агрегаты</button>' +
'    </div>' +
'' +
'    ' +
'    <div class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">' +
'        <div>' +
'            <h2 class="text-base font-bold text-gray-900 tracking-tight">🚜 Жизненный цикл и архив актов техники</h2>' +
'            <p class="text-xs text-gray-500 mt-0.5">Кликните на карточку машины для генерации или просмотра документов</p>' +
'        </div>' +
'        <div class="flex items-center gap-2 w-full md:w-auto">' +
'            <input type="text" id="lifecycleSearch" placeholder="Поиск по модели, гос. № или инв. №..." class="w-full md:w-72 border border-gray-300 rounded-xl px-4 py-2 text-xs font-medium focus:outline-none focus:border-blue-500 transition placeholder-gray-400">' +
'            <button id="btnRefreshLifecycle" class="bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition">🔄 Обновить</button>' +
'         </div>' +
'    </div>' +
'' +
'    ' +
'    <div id="lifecycleVehiclesGrid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">' +
'        <div class="col-span-full text-center py-12 text-sm text-gray-400 font-medium">Загрузка автопарка...</div>' +
'    </div>' +
'' +
'    ' +
'    <div id="lifecycleModal" class="hidden fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">' +
'        <div class="bg-white w-full max-w-3xl rounded-2xl shadow-xl border border-gray-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">' +
'            ' +
'            <div class="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-start">' +
'                <div>' +
'                    <h3 id="selectedVehicleTitle" class="text-base font-bold text-gray-900">Выбранная техника</h3>' +
'                    <p class="text-xs text-gray-500 mt-0.5">Выберите тип бланка, заполните поля и сохраните документ</p>' +
'                </div>' +
'                <button onclick="window.closeLifecycleModal()" class="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition">&times;</button>' +
'            </div>' +
'            ' +
'            <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">' +
'                <div class="flex items-center gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100">' +
'                    <label class="text-xs font-bold text-blue-900 uppercase whitespace-nowrap">Тип документа:</label>' +
'                    <select id="lifecycleDocType" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold bg-white focus:outline-none focus:border-blue-500">' +
'                        <option value="defect">🛠️ Дефектный акт</option>' +
'                        <option value="to_report">⚙️ Рапорт проведения ТО</option>' +
'                        <option value="repair_out">🟢 Акт приемки из ремонта</option>' +
'                        <option value="storage">❄️ Акт постановки на хранение (ГОСТ)</option>' +
'                    </select>' +
'                </div>' +
'                <div id="lifecycleSubFormContainer" class="mt-2">' +
                     defectTemplate +
                     toTemplate +
                     repairOutTemplate +
                     storageTemplate +
'                </div>' +
'            </div>' +
'        </div>' +
'    </div>' +
'</div>';

export async function initMachineryLifecycle(storageFiles) {
    const supabase = window._supabase || window.supabase;
    if (!supabase) return;

    const cardsGrid = document.getElementById('lifecycleVehiclesGrid');
    const searchInput = document.getElementById('lifecycleSearch');
    const docTypeSelect = document.getElementById('lifecycleDocType');
    const modal = document.getElementById('lifecycleModal');

    // Переключение форм внутри модалки
    docTypeSelect?.addEventListener('change', function(e) {
        const types = ['defect', 'to_report', 'repair_out', 'storage'];
        types.forEach(function(t) {
            document.getElementById('form_block_' + t)?.classList.add('hidden');
        });
        document.getElementById('form_block_' + e.target.value)?.classList.remove('hidden');
    });

    // Экспортируем функцию открытия модалки глобально (чтобы карточки кликались)
    window.selectVehicleForLifecycle = function(id) {
        selectedVehicle = allVehicles.find(v => v.id == id);
        if (!selectedVehicle) return;

        const plateStr = selectedVehicle.plate ? ' • Гос.номер: ' + selectedVehicle.plate : '';
        const vehicleTitle = (selectedVehicle.model || 'Техника') + plateStr;

        if (modal) modal.classList.remove('hidden');
        
        const titleElem = document.getElementById('selectedVehicleTitle');
        if (titleElem) {
            titleElem.innerText = vehicleTitle + ' (Инв. № ' + (selectedVehicle.inv_number || 'б/н') + ')';
        }
        
        // Сброс полей ввода водителей для заполнения заново
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

    window.closeLifecycleModal = function() {
        if (modal) modal.classList.add('hidden');
    };

    window.getActiveVehicle = function() { return selectedVehicle; };

    function applyFilters() {
        const query = searchInput?.value.toLowerCase() || '';
        
        const filtered = allVehicles.filter(function(v) {
            if (currentCategory !== 'all') {
                const vehicleType = (v.type || '').toLowerCase();
                const targetCat = currentCategory.toLowerCase();
                if (!vehicleType.includes(targetCat)) return false;
            }
            return (v.model && v.model.toLowerCase().includes(query)) || 
                   (v.plate && v.plate.toLowerCase().includes(query)) || 
                   (v.inv_number && v.inv_number.toLowerCase().includes(query));
        });

        renderGrid(filtered);
    }

    // Отрисовка современных карточек техники вместо скучной таблицы
    function renderGrid(vehiclesList) {
        if (!cardsGrid) return;
        if (vehiclesList.length === 0) {
            cardsGrid.innerHTML = '<div class="col-span-full text-center py-12 text-xs text-gray-400 font-medium">Техника не найдена</div>';
            return;
        }

        cardsGrid.innerHTML = vehiclesList.map(function(v) {
            const inv = v.inv_number || 'б/н';
            const plateStr = v.plate ? ' ' + v.plate : 'Без гос. знака';
            const vehicleTitle = v.model || 'Неизвестная модель';
            
            // Проверяем акты в хранилище по инвентарнику
            const hasDefect = storageFiles.some(f => f.name.includes('defect_') && f.name.includes(inv));
            const hasTo = storageFiles.some(f => f.name.includes('to_report_') && f.name.includes(inv));
            const hasRepair = storageFiles.some(f => f.name.includes('repair_out_') && f.name.includes(inv));
            const hasStorage = storageFiles.some(f => f.name.includes('storage_') && f.name.includes(inv));

            return '<div onclick="window.selectVehicleForLifecycle(\'' + v.id + '\')" class="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-blue-500 transition cursor-pointer flex flex-col justify-between space-y-4">' +
                '    <div>' +
                '        <div class="flex items-center justify-between">' +
                '            <span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 rounded-md">' + (v.type || 'Техника') + '</span>' +
                '            <span class="text-[10px] font-mono text-gray-400">Инв: ' + inv + '</span>' +
                '        </div>' +
                '        <h4 class="text-sm font-bold text-gray-900 mt-2 line-clamp-2">' + vehicleTitle + '</h4>' +
                '        <p class="text-[11px] font-medium text-gray-500 mt-1">💳 ' + plateStr + '</p>' +
                '    </div>' +
                '    ' +
                '    <div class="pt-3 border-t border-gray-100 grid grid-cols-2 gap-1.5 text-[10px] font-bold">' +
                '        <div class="flex items-center gap-1 p-1 rounded-lg ' + (hasDefect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600') + '"><span>' + (hasDefect ? '🟢' : '🔴') + '</span> Дефект.</div>' +
                '        <div class="flex items-center gap-1 p-1 rounded-lg ' + (hasTo ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600') + '"><span>' + (hasTo ? '🟢' : '🔴') + '</span> Рапорт ТО</div>' +
                '        <div class="flex items-center gap-1 p-1 rounded-lg ' + (hasRepair ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600') + '"><span>' + (hasRepair ? '🟢' : '🔴') + '</span> Ремонт</div>' +
                '        <div class="flex items-center gap-1 p-1 rounded-lg ' + (hasStorage ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600') + '"><span>' + (hasStorage ? '🟢' : '🔴') + '</span> Хранение</div>' +
                '    </div>' +
                '</div>';
        }).join('');
    }

    // Табы переключения категорий
    const catButtons = document.querySelectorAll('.lifecycle-cat-btn');
    catButtons.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            catButtons.forEach(b => {
                b.classList.remove('bg-blue-600', 'text-white', 'font-bold');
                b.classList.add('bg-white', 'text-gray-700', 'font-semibold', 'border-gray-300');
            });
            
            btn.classList.remove('bg-white', 'text-gray-700', 'font-semibold', 'border-gray-300');
            btn.classList.add('bg-blue-600', 'text-white', 'font-bold');
            
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
            if (cardsGrid) cardsGrid.innerHTML = '<div class="col-span-full text-center py-6 text-xs text-red-500 font-bold">Ошибка загрузки: ' + err.message + '</div>';
        }
    }

    await loadData();
}

// ГЛОБАЛЬНЫЙ МЕТОД: Исправляет проблему негенерирующихся документов
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
        alert('Файл ' + fileName + ' успешно сгенерирован и сохранен в архив Storage!');
        window.closeLifecycleModal(); // Закрываем модалку после генерации
        
        if (typeof window.loadTripStorageHistory === 'function') {
            await window.loadTripStorageHistory();
        }
    } catch (err) {
        alert('Ошибка сохранения документа: ' + err.message);
    }
};