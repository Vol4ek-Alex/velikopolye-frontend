// js/orders.js

import { tripTemplate, initBusinessTrip } from './docs/businessTrip.js';
import { batteryTemplate, initBatteryAct } from './docs/batteryAct.js';
import { absenceTemplate, initAbsenceAct } from './docs/absenceAct.js';
import { machineryLifecycleTemplate, initMachineryLifecycle } from './docs/machineryLifecycle.js';

const ALL_DOC_CARDS = [
    { id: 'business_trip', title: 'Командировки', desc: 'Оформление приказов и служебных записок.', icon: '💼', category: 'personal' },
    { id: 'absence_act', title: 'Aкт о прогуле', desc: 'Акт об отсутствии сотрудника на рабочем месте с указанием периода.', icon: '🛑', category: 'acts' },
    { id: 'battery_act', title: 'Списание АКБ', desc: 'Акт на списание аккумуляторных батарей с расчетом лома свинца.', icon: '🔋', category: 'acts' },
    { id: 'machinery_lifecycle', title: 'Жизненный цикл техники', desc: 'Акты хранения (ГОСТ), дефектные акты, рапорты ТО (авто/трактора) и выход из ремонта.', icon: '🚜', category: 'acts' },
    { id: 'inventory_act', title: 'Акт инвентаризации', desc: 'Списание, проверка и учет ТМЦ.', icon: '📊', category: 'sklad' }
];

let currentCategory = 'all';
let currentSubModule = "menu";

export const template = `
<style>
.fade-in-sub { animation: fadeInSub 0.25s ease-out forwards; }
@keyframes fadeInSub { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
@media print {
    body * { visibility: hidden; }
    #tripPrintBlock, #tripPrintBlock * { visibility: visible; }
    #tripPrintBlock { position: absolute; left: 0; top: 0; width: 100%; }
}
</style>

<div class="p-6 max-w-7xl mx-auto space-y-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border-2 border-gray-900 p-5 rounded-2xl shadow-xs gap-4">
        <div>
            <h1 class="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">💼 Документооборот</h1>
            <p class="text-xs text-gray-500 font-medium mt-0.5">Автоматическое заполнение строго по регламентам и бланкам предприятия</p>
        </div>
        <button id="btnBackToMenu" onclick="window.backToDocMenu()" class="hidden bg-gray-900 hover:bg-gray-800 text-white font-bold px-4 py-2 rounded-xl transition text-xs flex items-center gap-2 shadow-xs">
            ⬅️ Назад к выбору бланков
        </button>
    </div>

    <div id="docMenuBlock" class="space-y-6">
        <div class="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
            <button onclick="window.filterDocCategory('all')" id="cat_all" class="px-3 py-1.5 rounded-lg text-xs font-bold transition bg-gray-900 text-white shadow-xs">Все документы</button>
            <button onclick="window.filterDocCategory('personal')" id="cat_personal" class="px-3 py-1.5 rounded-lg text-xs font-bold transition bg-gray-100 text-gray-600 hover:bg-200">Кадры / Личный состав</button>
            <button onclick="window.filterDocCategory('acts')" id="cat_acts" class="px-3 py-1.5 rounded-lg text-xs font-bold transition bg-gray-100 text-gray-600 hover:bg-200">Акты и Рапорты</button>
            <button onclick="window.filterDocCategory('sklad')" id="cat_sklad" class="px-3 py-1.5 rounded-lg text-xs font-bold transition bg-gray-100 text-gray-600 hover:bg-200">Склад / Учет</button>
        </div>

        <div id="docCardsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            </div>

        <div class="bg-white border-2 border-gray-900 rounded-2xl shadow-xs overflow-hidden mt-8">
            <div class="p-4 bg-gray-50 border-b-2 border-gray-900 flex justify-between items-center">
                <div>
                    <h3 class="text-xs font-black text-gray-900 uppercase tracking-wider">🗄️ Архив сохраненных документов (Storage)</h3>
                    <p class="text-[10px] text-gray-500 font-medium mt-0.5">Все сгенерированные файлы Word автоматически загружаются в облачную историю</p>
                </div>
                <button onclick="window.loadTripStorageHistory()" class="bg-gray-900 hover:bg-gray-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition shadow-xs">🔄 Обновить архив</button>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-100 text-[10px] font-black text-gray-600 uppercase tracking-wider border-b border-gray-200">
                            <th class="p-2.5">Имя файла в базе данных</th>
                            <th class="p-2.5">Категория / Тип</th>
                            <th class="p-2.5 text-center">Действие</th>
                            <th class="p-2.5 text-right">Управление</th>
                        </tr>
                    </thead>
                    <tbody id="storageTripHistoryTable">
                        <tr><td colspan="4" class="p-4 text-center text-xs text-gray-400 font-medium">Загрузка истории файлов...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div id="subModulesContainer">
        ${tripTemplate}
        ${batteryTemplate}
        ${absenceTemplate}
        ${machineryLifecycleTemplate}
    </div>
</div>

<div id="tripPrintBlock" class="absolute left-0 top-0 w-full"></div>
`;

export function init() {
    renderDocCards();

    window.filterDocCategory = (cat) => {
        currentCategory = cat;
        renderDocCards();
        
        const categories = ['all', 'personal', 'acts', 'sklad'];
        categories.forEach(c => {
            const btn = document.getElementById('cat_' + c);
            if (!btn) return;
            if (c === cat) {
                btn.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition bg-gray-900 text-white shadow-xs";
            } else {
                btn.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition bg-gray-100 text-gray-600 hover:bg-200";
            }
        });
    };

    function renderDocCards() {
        const grid = document.getElementById('docCardsGrid');
        if (!grid) return;

        const filtered = ALL_DOC_CARDS.filter(c => currentCategory === 'all' || c.category === currentCategory);

        grid.innerHTML = filtered.map(card => `
            <div onclick="window.openDocSubModule('${card.id}')" class="bg-white border-2 border-gray-300 hover:border-gray-900 p-4 rounded-xl shadow-2xs hover:shadow-xs transition cursor-pointer flex gap-3 items-start group">
                <div class="text-2xl bg-gray-50 p-2 rounded-lg group-hover:bg-gray-100 transition">${card.icon}</div>
                <div class="space-y-0.5">
                    <h3 class="text-xs font-black text-gray-900 group-hover:text-blue-600 transition">${card.title}</h3>
                    <p class="text-[11px] text-gray-500 font-medium leading-relaxed">${card.desc}</p>
                </div>
            </div>
        `).join('');
    }

    window.openDocSubModule = (id) => {
        currentSubModule = id;
        document.getElementById('docMenuBlock').classList.add('hidden');
        document.getElementById('btnBackToMenu').classList.remove('hidden');

        const subs = ['subModule_trip', 'subModule_battery_act', 'subModule_absence_act', 'subModule_machinery_lifecycle'];
        subs.forEach(s => document.getElementById(s)?.classList.add('hidden'));

        if (id === 'business_trip') {
            document.getElementById('subModule_trip').classList.remove('hidden');
            initBusinessTrip();
        } else if (id === 'battery_act') {
            document.getElementById('subModule_battery_act').classList.remove('hidden');
            initBatteryAct();
        } else if (id === 'absence_act') {
            document.getElementById('subModule_absence_act').classList.remove('hidden');
            initAbsenceAct();
        } else if (id === 'machinery_lifecycle') {
            document.getElementById('subModule_machinery_lifecycle').classList.remove('hidden');
            initMachineryLifecycle(window.lastLoadedFilesHistory || []);
        }
    };

    window.backToDocMenu = () => {
        currentSubModule = "menu";
        document.getElementById('docMenuBlock').classList.remove('hidden');
        document.getElementById('btnBackToMenu').classList.add('hidden');

        const subs = ['subModule_trip', 'subModule_battery_act', 'subModule_absence_act', 'subModule_machinery_lifecycle'];
        subs.forEach(s => document.getElementById(s)?.classList.add('hidden'));
        window.loadTripStorageHistory();
    };

    window.loadTripStorageHistory = async () => {
        const tableBody = document.getElementById('storageTripHistoryTable');
        if (!tableBody) return;

        const supabase = window._supabase || window.supabase;
        if (!supabase) {
            tableBody.innerHTML = '<tr><td colspan="4" class="p-3 text-center text-xs text-red-500 font-bold">Ошибка конфигурации Supabase</td></tr>';
            return;
        }

        try {
            const { data, error } = await supabase.storage.from('documents-history').list('', {
                limit: 100,
                sortBy: { column: 'created_at', order: 'desc' }
            });

            if (error) throw error;
            window.lastLoadedFilesHistory = data || [];

            if (!data || data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-xs text-gray-400 font-semibold">История файлов пуста</td></tr>';
                return;
            }

            tableBody.innerHTML = data.map(f => {
                let catLabel = '📝 Документ';
                let catColor = 'bg-gray-600 text-white font-black';

                if (f.name.startsWith('trip_')) { catLabel = '💼 Командировка (Word)'; catColor = 'bg-gray-900 text-white font-black'; }
                else if (f.name.startsWith('battery_')) { catLabel = '🔋 Списание АКБ (Word)'; catColor = 'bg-amber-600 text-white font-black'; }
                else if (f.name.startsWith('absence_')) { catLabel = '🛑 Прогул (Word)'; catColor = 'bg-red-600 text-white font-black'; }
                else if (f.name.startsWith('storage_')) { catLabel = '❄️ Хранение ГОСТ (Word)'; catColor = 'bg-blue-600 text-white font-black'; }
                else if (f.name.startsWith('defect_')) { catLabel = '🛠️ Дефектный акт (Word)'; catColor = 'bg-purple-600 text-white font-black'; }
                else if (f.name.startsWith('repair_out_')) { catLabel = '🟢 Из ремонта (Word)'; catColor = 'bg-emerald-600 text-white font-black'; }
                else if (f.name.startsWith('to_report_')) { catLabel = '⚙️ Рапорт ТО (Word)'; catColor = 'bg-cyan-600 text-white font-black'; }

                return `
                    <tr class="border-b border-gray-100 hover:bg-gray-50 transition text-xs">
                        <td class="p-2.5 font-mono text-gray-900 font-semibold">${f.name}</td>
                        <td class="p-2.5"><span class="px-2 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-wider ${catColor}">${catLabel}</span></td>
                        <td class="p-2.5 text-center"><button onclick="window.downloadStorageFile('${f.name}')" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1 rounded-md transition text-[11px]">Открыть / Скачать</button></td>
                        <td class="p-2.5 text-right"><button onclick="window.deleteStorageFile('${f.name}')" class="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2 py-1 rounded-md transition text-[11px]">🗑️ Удалить</button></td>
                    </tr>
                `;
            }).join('');

        } catch (err) {
            tableBody.innerHTML = '<tr><td colspan="4" class="p-3 text-center text-xs text-red-500 font-bold">Ошибка загрузки: ' + err.message + '</td></tr>';
        }
    };

    window.downloadStorageFile = async (name) => {
        const supabase = window._supabase || window.supabase;
        if (!supabase) return;
        try {
            const { data, error } = await supabase.storage.from('documents-history').download(name);
            if (error) throw error;
            const url = URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url; a.download = name;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
        } catch (err) { alert('Ошибка скачивания: ' + err.message); }
    };

    window.deleteStorageFile = async (name) => {
        if (!confirm('Вы уверены, что хотите удалить файл ' + name + '?')) return;
        const supabase = window._supabase || window.supabase;
        if (!supabase) return;
        try {
            const { error } = await supabase.storage.from('documents-history').remove([name]);
            if (error) throw error;
            window.loadTripStorageHistory();
        } catch (err) { alert('Ошибка удаления: ' + err.message); }
    };

    setTimeout(window.loadTripStorageHistory, 200);
}