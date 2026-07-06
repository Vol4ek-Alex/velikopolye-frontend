// Текущее состояние модуля (какой подмодуль активен)
let currentSubModule = "menu"; // "menu", "weekend_memo", "business_trip", "vacation"

export const template = `
<style>
/* Стили для анимации появления подмодулей */
.fade-in-sub {
    animation: fadeInSub 0.25s ease-out forwards;
}
@keyframes fadeInSub {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>

<div class="space-y-6">
    <div class="bg-white p-5 rounded-xl border-2 border-gray-400/80 shadow-xs flex justify-between items-center">
        <div>
            <h2 class="text-xl font-bold text-gray-950 tracking-tight">📁 Центр документооборота</h2>
            <p class="text-xs text-gray-600 font-medium">Управление внутренней документацией, служебными записками и заявлениями</p>
        </div>
        <button id="docBackToMenuBtn" onclick="window.switchDocSubModule('menu')" class="hidden bg-gray-100 hover:bg-gray-200 border border-gray-400 font-bold text-xs text-gray-900 px-3 py-1.5 rounded-lg transition">
            ⬅ Назад в каталог
        </button>
    </div>

    <div id="docHubMainMenu" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 fade-in-sub">
        
        <div onclick="window.switchDocSubModule('weekend_memo')" class="bg-white border-2 border-gray-400 rounded-xl p-5 shadow-2xs hover:border-emerald-600 cursor-pointer transition-all flex items-start gap-4 hover:shadow-xs group">
            <div class="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-xl font-bold group-hover:bg-emerald-600 group-hover:text-white transition">📝</div>
            <div>
                <h4 class="font-bold text-gray-950 text-sm">Выходные дни</h4>
                <p class="text-[11px] text-gray-500 mt-1 font-medium">Привлечение персонала к работе в субботу и воскресенье.</p>
            </div>
        </div>

        <div onclick="window.switchDocSubModule('business_trip')" class="bg-white border-2 border-gray-400 rounded-xl p-5 shadow-2xs hover:border-blue-600 cursor-pointer transition-all flex items-start gap-4 hover:shadow-xs group">
            <div class="bg-blue-50 text-blue-700 p-3 rounded-lg text-xl font-bold group-hover:bg-blue-600 group-hover:text-white transition">💼</div>
            <div>
                <h4 class="font-bold text-gray-950 text-sm">Командировки</h4>
                <p class="text-[11px] text-gray-500 mt-1 font-medium">Оформление приказов, направлений и командировочных удостоверений.</p>
            </div>
        </div>

        <div onclick="window.switchDocSubModule('vacation')" class="bg-white border-2 border-gray-400 rounded-xl p-5 shadow-2xs hover:border-amber-600 cursor-pointer transition-all flex items-start gap-4 hover:shadow-xs group">
            <div class="bg-amber-50 text-amber-700 p-3 rounded-lg text-xl font-bold group-hover:bg-amber-600 group-hover:text-white transition">🌴</div>
            <div>
                <h4 class="font-bold text-gray-950 text-sm">График отпусков</h4>
                <p class="text-[11px] text-gray-500 mt-1 font-medium">Заявления на ежегодный отпуск и перенос дат отдыха.</p>
            </div>
        </div>

    </div>

    <div id="subModule_weekend_memo" class="hidden bg-white border-2 border-gray-400 p-6 rounded-xl shadow-xs fade-in-sub">
        <h3 class="text-sm font-black text-emerald-700 uppercase tracking-wider mb-2">📝 Выходные дни</h3>
        <p class="text-xs text-gray-500 font-medium mb-4">Здесь будет размещен конструктор служебных записок и архив выходных дней.</p>
        <div class="border-4 border-dashed border-gray-200 rounded-xl h-48 flex items-center justify-center text-xs text-gray-400 font-bold">
            [ Место под форму и реестр вызовов ]
        </div>
    </div>

    <div id="subModule_business_trip" class="hidden bg-white border-2 border-gray-400 p-6 rounded-xl shadow-xs fade-in-sub">
        <h3 class="text-sm font-black text-blue-700 uppercase tracking-wider mb-2">💼 Командировочные документы</h3>
        <p class="text-xs text-gray-500 font-medium mb-4">Здесь будет размещен модуль генерации приказов на командировки.</p>
        <div class="border-4 border-dashed border-gray-200 rounded-xl h-48 flex items-center justify-center text-xs text-gray-400 font-bold">
            [ Место под форму командировок ]
        </div>
    </div>

    <div id="subModule_vacation" class="hidden bg-white border-2 border-gray-400 p-6 rounded-xl shadow-xs fade-in-sub">
        <h3 class="text-sm font-black text-amber-700 uppercase tracking-wider mb-2">🌴 Отпуска и заявления</h3>
        <p class="text-xs text-gray-500 font-medium mb-4">Здесь будет размещен модуль контроля графика отпусков.</p>
        <div class="border-4 border-dashed border-gray-200 rounded-xl h-48 flex items-center justify-center text-xs text-gray-400 font-bold">
            [ Место под интерфейс отпусков ]
        </div>
    </div>
</div>
`;

export function init() {
    setupSubModuleNavigation();
    // Принудительно сбрасываем отображение на главное меню при инициализации вкладки
    window.switchDocSubModule('menu');
}

function setupSubModuleNavigation() {
    window.switchDocSubModule = (targetModule) => {
        currentSubModule = targetModule;

        const mainMenu = document.getElementById('docHubMainMenu');
        const backBtn = document.getElementById('docBackToMenuBtn');
        
        // Список всех контейнеров подмодулей
        const subContainers = {
            weekend_memo: document.getElementById('subModule_weekend_memo'),
            business_trip: document.getElementById('subModule_business_trip'),
            vacation: document.getElementById('subModule_vacation')
        };

        // Прячем всё
        if (mainMenu) mainMenu.classList.add('hidden');
        if (backBtn) backBtn.classList.add('hidden');
        Object.values(subContainers).forEach(el => {
            if (el) el.classList.add('hidden');
        });

        // Включаем то, что выбрали
        if (targetModule === 'menu') {
            if (mainMenu) mainMenu.classList.remove('hidden');
        } else {
            if (backBtn) backBtn.classList.remove('hidden');
            if (subContainers[targetModule]) {
                subContainers[targetModule].classList.remove('hidden');
            }
        }
    };
}