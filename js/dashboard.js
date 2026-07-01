export const template = `
    <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-800">Панель управления</h2>
        <p class="text-sm text-gray-500">Оперативная сводка по филиалу СХК «Великополье»</p>
    </div>

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Всего техники</p>
            <h3 id="dashTotal" class="text-3xl font-black text-gray-800 mt-2">0 <span class="text-sm font-normal text-gray-400">ед.</span></h3>
        </div>
        <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm border-l-4 border-l-green-500">
            <p class="text-xs font-semibold text-green-600 uppercase tracking-wider">🟢 Готовы к работе</p>
            <h3 id="dashReady" class="text-3xl font-black text-gray-800 mt-2">0</h3>
        </div>
        <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm border-l-4 border-l-blue-500">
            <p class="text-xs font-semibold text-blue-600 uppercase tracking-wider">🔵 В работе</p>
            <h3 id="dashInWork" class="text-3xl font-black text-gray-800 mt-2">0</h3>
        </div>
        <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm border-l-4 border-l-red-500">
            <p class="text-xs font-semibold text-red-600 uppercase tracking-wider">🔴 В ремонте</p>
            <h3 id="dashInRepair" class="text-3xl font-black text-gray-800 mt-2">0</h3>
        </div>
    </div>

    <div class="grid gap-8 lg:grid-cols-3">
        
        <div class="lg:col-span-2 space-y-4">
            <h3 class="text-lg font-bold text-gray-700 flex items-center gap-2">
                ⚠️ Требует внимания
            </h3>
            <div id="dashAlertsContainer" class="space-y-3">
                <div class="text-center text-gray-400 py-6 bg-white border border-gray-200 rounded-2xl">Загрузка данных...</div>
            </div>
        </div>

        <div class="space-y-4">
            <h3 class="text-lg font-bold text-gray-700">Быстрые действия</h3>
            <div class="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
                <button onclick="window.switchModule('fleet')" class="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition flex items-center justify-between group">
                    <div>
                        <p class="text-sm font-semibold text-gray-700">Открыть автопарк</p>
                        <p class="text-xs text-gray-400">Управление машинами и тегами</p>
                    </div>
                    <span class="text-gray-400 group-hover:text-gray-700 transition">➔</span>
                </button>
                <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800">
                    💡 <b>Подсказка:</b> Чтобы изменить статус машины или внести наработку моточасов, перейдите в модуль «Автопарк» и нажмите «Изменить» на нужной карточке.
                </div>
            </div>
        </div>

    </div>
`;

export async function init() {
    try {
        // Подтягиваем актуальные данные из Supabase
        const { data: vehicles, error } = await window._supabase.from('vehicles').select('*');
        if (error) throw error;

        renderStats(vehicles || []);
        renderAlerts(vehicles || []);

    } catch (err) {
        console.error("Ошибка Dashboard:", err.message);
        document.getElementById('dashAlertsContainer').innerHTML = `
            <div class="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
                Не удалось загрузить сводку: ${err.message}
            </div>
        `;
    }
}

function renderStats(list) {
    document.getElementById('dashTotal').innerHTML = `${list.length} <span class="text-sm font-normal text-gray-400">ед.</span>`;
    document.getElementById('dashReady').innerText = list.filter(v => v.tags === 'Готов').length;
    document.getElementById('dashInWork').innerText = list.filter(v => v.tags === 'В работе').length;
    document.getElementById('dashInRepair').innerText = list.filter(v => v.tags === 'В ремонте').length;
}

function renderAlerts(list) {
    const container = document.getElementById('dashAlertsContainer');
    if (!container) return;

    const alerts = [];
    const today = new Date();

    list.forEach(v => {
        // 1. Проверка просрочки или скорого окончания техосмотра
        if (v.inspection_date) {
            const diff = Math.ceil((new Date(v.inspection_date) - today) / (1000 * 60 * 60 * 24));
            if (diff <= 0) {
                alerts.push({
                    type: 'danger',
                    text: `<b>${v.model}</b> (госномер ${v.plate || '—'}): <span class="font-bold">Просрочен техосмотр!</span> (был до ${new Date(v.inspection_date).toLocaleDateString('ru-RU')})`
                });
            } else if (diff <= 15) {
                alerts.push({
                    type: 'warning',
                    text: `<b>${v.model}</b>: Срок техосмотра истекает через ${diff} дн. (${new Date(v.inspection_date).toLocaleDateString('ru-RU')})`
                });
            }
        }

        // 2. Проверка критической наработки моточасов до ТО (для гарантии)
        if (v.tags === 'Гарантия' && v.current_hours && v.next_to_hours) {
            const left = v.next_to_hours - v.current_hours;
            if (left <= 0) {
                alerts.push({
                    type: 'danger',
                    text: `<b>${v.model}</b> (Инв. №${v.inv_number}): <span class="font-bold">Превышена планка ТО!</span> Наработка ${v.current_hours} м/ч при норме ${v.next_to_hours} м/ч.`
                });
            } else if (left <= 20) {
                alerts.push({
                    type: 'warning',
                    text: `<b>${v.model}</b> (На гарантии): Срочно требуется проведение ТО! Осталось <span class="font-bold">${left} м/ч</span>.`
                });
            }
        }

        // 3. Если машина зависла в ремонте
        if (v.tags === 'В ремонте') {
            alerts.push({
                type: 'info',
                text: `<b>${v.model}</b> (госномер ${v.plate || '—'}) находится в процессе ремонта.`
            });
        }
    });

    // Если проблемных машин нет — пишем что всё супер
    if (alerts.length === 0) {
        container.innerHTML = `
            <div class="bg-green-50 border border-green-200 text-green-800 p-6 rounded-2xl text-center font-medium shadow-sm">
                🎉 Вся техника в порядке! Просроченных документов и критической наработки не обнаружено.
            </div>
        `;
        return;
    }

    // Рендерим алерты по цветам сложности
    container.innerHTML = alerts.map(a => {
        let classes = "bg-blue-50 border-blue-200 text-blue-800";
        let icon = "ℹ️";
        if (a.type === 'danger') { classes = "bg-red-50 border-red-200 text-red-900 font-medium shadow-sm"; icon = "🚨"; }
        if (a.type === 'warning') { classes = "bg-amber-50 border-amber-200 text-amber-900"; icon = "⚠️"; }
        
        return `
            <div class="p-4 border rounded-xl flex items-start gap-3 text-sm ${classes}">
                <span class="text-base">${icon}</span>
                <div>${a.text}</div>
            </div>
        `;
    }).join('');
}