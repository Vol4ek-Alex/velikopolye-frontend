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
            <p class="text-xs font-semibold text-blue-600 uppercase tracking-wider">🔵 В работе / На хранении</p>
            <h3 id="dashInWork" class="text-3xl font-black text-gray-800 mt-2">0</h3>
        </div>
        <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm border-l-4 border-l-red-500">
            <p class="text-xs font-semibold text-red-600 uppercase tracking-wider">🔴 В ремонте</p>
            <h3 id="dashInRepair" class="text-3xl font-black text-gray-800 mt-2">0</h3>
        </div>
    </div>

    <div class="grid gap-8 lg:grid-cols-3">
        
        <div class="lg:col-span-2 space-y-6">
            <div class="space-y-4">
                <h3 class="text-lg font-bold text-gray-700 flex items-center gap-2">
                    ⚠️ Требует внимания
                </h3>
                <div id="dashAlertsContainer" class="space-y-3">
                    <div class="text-center text-gray-400 py-6 bg-white border border-gray-200 rounded-2xl">Загрузка данных...</div>
                </div>
            </div>

            <div class="space-y-4">
                <h3 class="text-lg font-bold text-gray-700 flex items-center gap-2">
                    📋 Задачи и запчасти автопарка
                </h3>
                <div id="dashboardTasksContainer" class="space-y-3">
                    <div class="text-center text-gray-400 py-6 bg-white border border-gray-200 rounded-2xl">Загрузка активных задач...</div>
                </div>
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
                    💡 <b>Подсказка:</b> Кнопка «✏️ Редактировать» теперь доступна прямо внутри каждой карточки техники в модуле «Автопарк» для быстрого изменения наработки и данных госрегистрации.
                </div>
            </div>
        </div>

    </div>
`;

let refreshIntervalId = null;

export async function init() {
    window.completeDashboardTask = async (id) => {
        if (!window._supabase) return;
        try {
            const { error } = await window._supabase.from('vehicle_tasks').update({ is_completed: true }).eq('id', id);
            if (error) throw error;
            await loadDashboardData();
        } catch (e) {
            console.error("Не удалось закрыть задачу:", e.message);
        }
    };

    await loadDashboardData();
    
    if (refreshIntervalId) clearInterval(refreshIntervalId);
    refreshIntervalId = setInterval(loadDashboardData, 5000); // Автообновление каждые 5 секунд
}

async function loadDashboardData() {
    if (!window._supabase) return;
    try {
        // 1. Загрузка техники
        const { data: vehicles, error: vErr } = await window._supabase.from('vehicles').select('*');
        if (vErr) throw vErr;

        // 2. Загрузка незавершенных задач
        const { data: tasks, error: tErr } = await window._supabase.from('vehicle_tasks').select('*').eq('is_completed', false);
        if (tErr) throw tErr;

        renderStats(vehicles || []);
        renderAlerts(vehicles || []);
        renderTasks(tasks || []);

    } catch (err) {
        console.error("Ошибка Dashboard:", err.message);
        const container = document.getElementById('dashAlertsContainer');
        if (container) {
            container.innerHTML = `
                <div class="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
                    Не удалось загрузить сводку: ${err.message}
                </div>
            `;
        }
    }
}

function renderStats(list) {
    document.getElementById('dashTotal').innerHTML = `${list.length} <span class="text-sm font-normal text-gray-400">ед.</span>`;
    
    // Мягкий поиск подстроки `.includes()`, чтобы корректно считать составные теги из вашей текстовой колонки
    document.getElementById('dashReady').innerText = list.filter(v => v.tags && v.tags.includes('Готов')).length;
    document.getElementById('dashInWork').innerText = list.filter(v => v.tags && (v.tags.includes('В работе') || v.tags.includes('На хранении'))).length;
    document.getElementById('dashInRepair').innerText = list.filter(v => v.tags && v.tags.includes('В ремонте')).length;
}

function renderAlerts(list) {
    const container = document.getElementById('dashAlertsContainer');
    if (!container) return;

    const alerts = [];
    const today = new Date();
    
    list.forEach(v => {
        // 1. Проверка просрочки или скорого окончания гостехосмотра
        if (v.inspection_date) {
            const diff = Math.ceil((new Date(v.inspection_date) - today) / (1000 * 60 * 60 * 24));
            if (diff <= 0) {
                alerts.push({
                    type: 'danger',
                    text: `<b>${v.model}</b> (госномер ${v.plate || 'б/н'}): <span class="font-bold text-red-600">Просрочен Гостехосмотр!</span> (был до ${new Date(v.inspection_date).toLocaleDateString('ru-RU')})`
                });
            } else if (diff <= 15) {
                alerts.push({
                    type: 'warning',
                    text: `<b>${v.model}</b>: Срок гостехосмотра истекает через ${diff} дн. (${new Date(v.inspection_date).toLocaleDateString('ru-RU')})`
                });
            }
        }

        // 2. Проверка окончания страхового полиса
        if (v.insurance_date) {
            const diffIns = Math.ceil((new Date(v.insurance_date) - today) / (1000 * 60 * 60 * 24));
            if (diffIns <= 0) {
                alerts.push({
                    type: 'danger',
                    text: `<b>${v.model}</b> (госномер ${v.plate || 'б/н'}): <span class="font-bold text-red-600">Закончилась страховка!</span> (была до ${new Date(v.insurance_date).toLocaleDateString('ru-RU')})`
                });
            } else if (diffIns <= 15) {
                alerts.push({
                    type: 'warning',
                    text: `<b>${v.model}</b>: Страховка истекает через ${diffIns} дн. (${new Date(v.insurance_date).toLocaleDateString('ru-RU')})`
                });
            }
        }

        // 3. Проверка критической наработки моточасов до ТО (для гарантии)
        if (v.tags && v.tags.includes('Гарантия') && v.current_hours && v.next_to_hours) {
            const left = v.next_to_hours - v.current_hours;
            if (left <= 0) {
                alerts.push({
                    type: 'danger',
                    text: `<b>${v.model}</b> (Инв. №${v.inv_number || '—'}): <span class="font-bold text-red-600">Перевышена планка ТО!</span> Наработка ${v.current_hours} м/ч при норме ${v.next_to_hours} м/ч.`
                });
            } else if (left <= 20) {
                alerts.push({
                    type: 'warning',
                    text: `<b>${v.model}</b> (На гарантии): Срочно требуется проведение технического обслуживания! Осталось <span class="font-bold">${left} м/ч</span>.`
                });
            }
        }

        // 4. Если машина висит в ремонте
        if (v.tags && v.tags.includes('В ремонте')) {
            alerts.push({
                type: 'info',
                text: `<b>${v.model}</b> (госномер ${v.plate || '—'}) находится в процессе ремонта / ожидания запчастей.`
            });
        }
    });

    if (alerts.length === 0) {
        container.innerHTML = `
            <div class="bg-green-50 border border-green-200 text-green-800 p-5 rounded-2xl text-center font-medium shadow-xs">
                🎉 Вся техника в порядке! Просроченных документов и критических наработок не обнаружено.
            </div>
        `;
        return;
    }

    container.innerHTML = alerts.map(a => {
        let classes = "bg-blue-50/60 border-blue-200 text-blue-800";
        let icon = "ℹ️";
        if (a.type === 'danger') { classes = "bg-red-50 border-red-200 text-red-900 font-medium shadow-xs"; icon = "🚨"; }
        if (a.type === 'warning') { classes = "bg-amber-50 border-amber-200 text-amber-900"; icon = "⚠️"; }
        
        return `
            <div class="p-3.5 border rounded-xl flex items-start gap-3 text-xs ${classes}">
                <span class="text-sm shrink-0">${icon}</span>
                <div>${a.text}</div>
            </div>
        `;
    }).join('');
}

function renderTasks(taskList) {
    const container = document.getElementById('dashboardTasksContainer');
    if (!container) return;

    if (taskList.length === 0) {
        container.innerHTML = `
            <div class="p-5 text-center text-xs text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 font-medium">
                👌 Все текущие задачи закрыты, закупки запчастей не требуются.
            </div>`;
        return;
    }

    container.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${taskList.map(task => `
                <div class="bg-amber-50/60 border border-amber-100 p-3 rounded-xl flex items-start justify-between gap-3 text-xs">
                    <div class="space-y-1">
                        <span class="bg-amber-100/80 border border-amber-200 text-amber-900 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wide">${task.vehicle_name}</span>
                        <p class="text-gray-800 font-medium leading-normal">${task.text}</p>
                    </div>
                    <button onclick="window.completeDashboardTask(${task.id})" class="text-[11px] font-bold text-emerald-700 bg-white border border-emerald-200 px-2 py-1 rounded-lg hover:bg-emerald-50 transition shadow-2xs shrink-0">
                        Готово
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}