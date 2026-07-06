// js/orders.js

import { tripTemplate, initBusinessTrip } from './docs/businessTrip.js';
import { batteryTemplate, initBatteryAct } from './docs/batteryAct.js';
import { absenceTemplate, initAbsenceAct } from './docs/absenceAct.js';

const ALL_DOC_CARDS = [
    { id: 'business_trip', title: 'Командировки', desc: 'Оформление приказов и служебных записок.', icon: '💼', category: 'personal' },
    { id: 'absence_act', title: 'Акт о прогуле', desc: 'Акт об отсутствии сотрудника на рабочем месте с указанием периода.', icon: '🛑', category: 'acts' }, // Новый пункт
    { id: 'battery_act', title: 'Списание АКБ', desc: 'Акт на списание аккумуляторных батарей с расчетом лома свинца.', icon: '🔋', category: 'acts' },
    { id: 'inventory_act', title: 'Акт инвентаризации', desc: 'Списание, проверка и учет ТМЦ.', icon: '📊', category: 'sklad' }
];

let currentCategory = 'all';
let currentSubModule = "menu";

export const template = `
<style>
.fade-in-sub { animation: fadeInSub 0.25s ease-out forwards; }
@keyframes fadeInSub { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
@media print {
    body * { visibility: hidden !important; }
    #tripPrintBlock, #tripPrintBlock * { visibility: visible !important; }
    #tripPrintBlock { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; }
    .no-print-section { display: none !important; }
}
</style>

<div class="space-y-6 no-print-section">
    <div class="bg-white p-5 rounded-xl border-2 border-gray-400/80 shadow-xs flex justify-between items-center">
        <div>
            <h2 class="text-xl font-bold text-gray-950 tracking-tight">📁 Центр документооборота</h2>
            <p class="text-xs text-gray-600 font-medium">Управление внутренней документацией и общий архив документов</p>
        </div>
        <button id="docBackToMenuBtn" onclick="window.switchDocSubModule('menu')" class="hidden bg-gray-100 hover:bg-gray-200 border border-gray-400 font-bold text-xs text-gray-900 px-3 py-1.5 rounded-lg transition">
            ⬅ Назад в каталог
        </button>
    </div>

    <div id="docHubMainContainer" class="space-y-6">
        <div class="flex flex-wrap gap-2 border-b border-gray-300 pb-2">
            <button onclick="window.filterDocByCategory('all')" id="catTab_all" class="px-4 py-1.5 text-xs font-black border-b-2 border-blue-600 text-blue-600">Все документы</button>
            <button onclick="window.filterDocByCategory('personal')" id="catTab_personal" class="px-4 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 border-b-2 border-transparent">🧑‍💻 Служебные записки</button>
            <button onclick="window.filterDocByCategory('acts')" id="catTab_acts" class="px-4 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 border-b-2 border-transparent">📝 Акты</button>
            <button onclick="window.filterDocByCategory('sklad')" id="catTab_sklad" class="px-4 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 border-b-2 border-transparent">📊 Склад</button>
        </div>

        <div id="docSearchPanel" class="bg-white p-4 rounded-xl border-2 border-gray-400/60 shadow-2xs flex gap-3 items-center">
            <div class="relative flex-1">
                <span class="absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm">🔍</span>
                <input type="text" id="docCardsSearchInput" oninput="window.filterDocCards()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:border-blue-600 focus:bg-white transition" placeholder="Поиск среди документов...">
            </div>
        </div>

        <div id="docHubMainMenu" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 fade-in-sub"></div>

        <div class="bg-white border-2 border-gray-400 p-5 rounded-xl shadow-xs fade-in-sub">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xs font-black text-gray-600 uppercase tracking-wider">🗄️ Общий архив сгенерированных документов (Supabase Storage)</h3>
                <button onclick="window.loadTripStorageHistory()" class="text-[11px] font-bold text-blue-600 hover:underline">🔄 Обновить архив</button>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                    <thead>
                        <tr class="bg-gray-100 border-b border-gray-300 text-gray-700">
                            <th class="p-2.5 font-bold">Имя файла в хранилище</th>
                            <th class="p-2.5 font-bold">Категория</th>
                            <th class="p-2.5 font-bold text-center">Просмотр</th>
                            <th class="p-2.5 font-bold text-right">Управление</th>
                        </tr>
                    </thead>
                    <tbody id="tripStorageTableBody"></tbody>
                </table>
            </div>
        </div>
    </div>

    ` + tripTemplate + `
    ` + batteryTemplate + `
    ` + absenceTemplate + `
</div>

<div id="tripPrintBlock"></div>
`;

export function init() {
    setupSubModuleNavigation();
    initBusinessTrip();
    initBatteryAct();
    initAbsenceAct();
    renderDocCards(ALL_DOC_CARDS);
    window.switchDocSubModule('menu');
}

window.filterDocByCategory = (cat) => {
    currentCategory = cat;
    ['all', 'personal', 'acts', 'sklad'].forEach(c => {
        const btn = document.getElementById('catTab_' + c);
        if (btn) {
            btn.classList.remove('border-b-2', 'border-blue-600', 'text-blue-600');
            btn.classList.add('text-gray-500', 'border-transparent');
        }
    });
    const activeBtn = document.getElementById('catTab_' + cat);
    if (activeBtn) {
        activeBtn.classList.remove('text-gray-500', 'border-transparent');
        activeBtn.classList.add('border-b-2', 'border-blue-600', 'text-blue-600');
    }
    window.filterDocCards();
};

function renderDocCards(cardsList) {
    const container = document.getElementById('docHubMainMenu');
    if (!container) return;
    
    if (cardsList.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-8 text-xs font-bold text-gray-400">Ничего не найдено</div>';
        return;
    }

    container.innerHTML = cardsList.map(card => {
        const isReady = card.id === 'business_trip' || card.id === 'battery_act' || card.id === 'absence_act';
        const clickAction = isReady ? "window.switchDocSubModule('" + card.id + "')" : "alert('Данный тип документа находится в разработке')";
        const opacityClass = isReady ? "border-gray-400 hover:border-blue-600" : "opacity-50 border-gray-300 bg-gray-50 cursor-not-allowed";

        return '<div onclick="' + clickAction + '" class="bg-white border-2 rounded-xl p-5 shadow-2xs cursor-pointer transition flex items-start gap-4 group ' + opacityClass + '">' +
            '<div class="bg-blue-50 text-blue-700 p-3 rounded-lg text-xl font-bold group-hover:bg-blue-600 group-hover:text-white transition">' + card.icon + '</div>' +
            '<div class="flex-1">' +
                '<div class="flex justify-between items-center">' +
                    '<h4 class="font-bold text-gray-950 text-sm">' + card.title + '</h4>' +
                    (!isReady ? '<span class="text-[9px] bg-gray-200 text-gray-600 font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">План</span>' : '') +
                '</div>' +
                '<p class="text-[11px] text-gray-500 mt-1 font-medium">' + card.desc + '</p>' +
            '</div>' +
        '</div>';
    }).join('');
}

window.filterDocCards = () => {
    const query = document.getElementById('docCardsSearchInput')?.value.toLowerCase().trim() || "";
    const filtered = ALL_DOC_CARDS.filter(card => {
        const matchesSearch = card.title.toLowerCase().includes(query) || card.desc.toLowerCase().includes(query);
        const matchesCategory = currentCategory === 'all' || card.category === currentCategory;
        return matchesSearch && matchesCategory;
    });
    renderDocCards(filtered);
};

function setupSubModuleNavigation() {
    window.switchDocSubModule = (targetModule) => {
        currentSubModule = targetModule;
        const mainContainer = document.getElementById('docHubMainContainer');
        const backBtn = document.getElementById('docBackToMenuBtn');
        const subContainers = { 
            business_trip: document.getElementById('subModule_business_trip'),
            battery_act: document.getElementById('subModule_battery_act'),
            absence_act: document.getElementById('subModule_absence_act')
        };

        if (mainContainer) mainContainer.classList.add('hidden');
        if (backBtn) backBtn.classList.add('hidden');
        Object.values(subContainers).forEach(el => { if (el) el.classList.add('hidden'); });

        if (targetModule === 'menu') {
            if (mainContainer) mainContainer.classList.remove('hidden');
            if (document.getElementById('docCardsSearchInput')) document.getElementById('docCardsSearchInput').value = "";
            window.filterDocByCategory(currentCategory);
            window.loadTripStorageHistory();
        } else {
            if (backBtn) backBtn.classList.remove('hidden');
            if (subContainers[targetModule]) subContainers[targetModule].classList.remove('hidden');
            if (targetModule === 'business_trip' && typeof window.updateTripPreview === 'function') {
                const today = new Date().toISOString().split('T')[0];
                if (document.getElementById('tripDocDate')) document.getElementById('tripDocDate').value = today;
                if (document.getElementById('tripTargetDate')) document.getElementById('tripTargetDate').value = today;
                window.updateTripPreview();
            }
            if (targetModule === 'battery_act' && typeof window.updateBatteryPreview === 'function') {
                const today = new Date().toISOString().split('T')[0];
                if (document.getElementById('batteryDocDate')) document.getElementById('batteryDocDate').value = today;
                window.updateBatteryPreview();
            }
            if (targetModule === 'absence_act' && typeof window.updateAbsencePreview === 'function') {
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('absenceDocDate').value = today;
                document.getElementById('absenceStartDate').value = today;
                document.getElementById('absenceEndDate').value = today;
                window.updateAbsencePreview();
            }
        }
    };

    window.downloadStorageFile = async (filePath) => {
        const supabase = window._supabase || window.supabase;
        if (!supabase) return alert('Supabase клиент недоступен');
        try {
            const { data, error } = await supabase.storage.from('documents-history').createSignedUrl(filePath, 60, { download: true });
            if (error) throw error;
            const a = document.createElement('a'); a.href = data.signedUrl; a.download = filePath; document.body.appendChild(a); a.click(); document.body.removeChild(a);
        } catch (err) { alert('Не удалось скачать файл: ' + err.message); }
    };

    window.deleteStorageFile = async (filePath) => {
        if (!confirm('Вы уверены, что хотите безвозвратно удалить этот документ из архива?')) return;
        const supabase = window._supabase || window.supabase;
        if (!supabase) return alert('Supabase клиент недоступен');
        try {
            const { error } = await supabase.storage.from('documents-history').remove([filePath]);
            if (error) throw error;
            alert('Файл успешно удален.');
            window.loadTripStorageHistory();
        } catch (err) { alert('Не удалось удалить файл: ' + err.message); }
    };

    window.loadTripStorageHistory = async () => {
        const tBody = document.getElementById('tripStorageTableBody');
        if (!tBody) return;
        tBody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-gray-400 font-medium">Загрузка архива...</td></tr>';

        const supabase = window._supabase || window.supabase;
        if (!supabase) { tBody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-red-500 font-bold">Supabase недоступен.</td></tr>'; return; }

        try {
            const { data: files, error } = await supabase.storage.from('documents-history').list('', { sortBy: { column: 'name', order: 'desc' } });
            if (error) throw error;
            const filteredFiles = files ? files.filter(f => f.name !== '.emptyFolderPlaceholder') : [];

            if (filteredFiles.length === 0) {
                tBody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-gray-400 font-medium">Архив документов пуст.</td></tr>';
                return;
            }

            tBody.innerHTML = filteredFiles.map(f => {
                let catLabel = '📁 Документ';
                let catColor = 'bg-gray-100 text-gray-800';

                if (f.name.startsWith('trip_')) {
                    catLabel = '💼 Командировка (Word)'; catColor = 'bg-blue-600 text-white font-black';
                } else if (f.name.startsWith('battery_')) {
                    catLabel = '🔋 Списание АКБ (Word)'; catColor = 'bg-amber-600 text-white font-black';
                }

                return '<tr class="border-b border-gray-100 hover:bg-gray-50 transition text-xs">' +
                    '<td class="p-2.5 font-mono text-gray-900 font-semibold">' + f.name + '</td>' +
                    '<td class="p-2.5"><span class="px-2 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-wider ' + catColor + '">' + catLabel + '</span></td>' +
                    '<td class="p-2.5 text-center"><button onclick="window.downloadStorageFile(\'' + f.name + '\')" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1 rounded-md transition text-[11px]">Открыть / Скачать</button></td>' +
                    '<td class="p-2.5 text-right"><button onclick="window.deleteStorageFile(\'' + f.name + '\')" class="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-2 py-1 rounded-md border border-red-200 transition text-[11px]">❌ Удалить</button></td>' +
                '</tr>';
            }).join('');
        } catch (err) { tBody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-red-500">Ошибка получения архива.</td></tr>'; }
    };
    
    setTimeout(() => { window.loadTripStorageHistory(); }, 100);
}