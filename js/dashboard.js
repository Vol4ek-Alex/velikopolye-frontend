export const template = `
    <div class="mb-6">
        <h2 class="text-xl font-bold text-gray-900 tracking-tight">Панель управления</h2>
        <p class="text-xs text-gray-500">Оперативная сводка по филиалу СХК «Великополье»</p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div class="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs">
            <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Всего техники</p>
            <h3 id="dashTotal" class="text-2xl font-bold text-gray-900 mt-1">0 <span class="text-xs font-normal text-gray-400">ед.</span></h3>
        </div>
        <div class="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs border-l-4 border-l-emerald-500">
            <p class="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">🟢 Готовы к работе</p>
            <h3 id="dashReady" class="text-2xl font-bold text-gray-900 mt-1">0</h3>
        </div>
        <div class="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs border-l-4 border-l-blue-500">
            <p class="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">🔵 В работе / На хранении</p>
            <h3 id="dashInWork" class="text-2xl font-bold text-gray-900 mt-1">0</h3>
        </div>
        <div class="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs border-l-4 border-l-red-500">
            <p class="text-[11px] font-semibold text-red-500 uppercase tracking-wider">🔴 В ремонте</p>
            <h3 id="dashInRepair" class="text-2xl font-bold text-gray-900 mt-1">0</h3>
        </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2 space-y-5">
            <div class="space-y-3">
                <h3 class="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                    ⚠️ Требует внимания (Сроки документов)
                </h3>
                <div id="dashAlertsContainer" class="space-y-2">
                    <div class="text-center text-gray-400 py-6 text-xs bg-white border border-gray-100 rounded-xl">Загрузка данных...</div>
                </div>
            </div>

            <div id="dashTasksBlock" class="space-y-3 hidden">
                <h3 class="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                    📋 Актуальные задачи автопарка
                </h3>
                <div id="dashboardTasksContainer" class="space-y-2"></div>
            </div>
        </div>

        <div class="space-y-3">
            <h3 class="text-sm font-bold text-gray-800">Быстрые действия</h3>
            <div class="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs space-y-3">
                <button onclick="window.switchModule('fleet')" class="w-full text-left p-3 bg-gray-50 hover:bg-emerald-50/50 rounded-lg border border-gray-100 hover:border-emerald-200/60 transition flex items-center justify-between group">
                    <div>
                        <p class="text-xs font-bold text-gray-800 group-hover:text-emerald-900">Открыть автопарк</p>
                        <p class="text-[11px] text-gray-400">Управление машинами и тегами</p>
                    </div>
                    <span class="text-gray-400 group-hover:text-emerald-600 transition text-xs">➔</span>
                </button>
            </div>
        </div>
    </div>
`;

let refreshIntervalId = null;

export async function init() {
    window.completeDashboardTask = async (id) => {
        if (!window._supabase) return;
        try {
            await window._supabase.from('vehicle_tasks').update({ is_completed: true }).eq('id', id);
            await loadDashboardData();
        } catch (e) {
            console.error(e);
        }
    };

    await loadDashboardData();
    if (refreshIntervalId) clearInterval(refreshIntervalId);
    refreshIntervalId = setInterval(loadDashboardData, 5000);
}

async function loadDashboardData() {
    if (!window._supabase) return;
    try {
        // Загрузка техники
        const { data: vehicles, error: vErr } = await window._supabase.from('vehicles').select('*');
        if (vErr) throw vErr;
        renderStats(vehicles || []);
        renderAlerts(vehicles || []);

        // Безопасная загрузка задач
        try {
            const { data: tasks, error: tErr } = await window._supabase.from('vehicle_tasks').select('*').eq('is_completed', false);
            if (!tErr && tasks) {
                document.getElementById('dashTasksBlock').classList.remove('hidden');
                renderTasks(tasks);
            }
        } catch (taskErr) {
            // Ошибка таблицы задач подавляется, чтобы не ломать дашборд
            document.getElementById('dashTasksBlock').classList.add('hidden');
        }

    } catch (err) {
        console.error("Ошибка Dashboard:", err.message);
        const container = document.getElementById('dashAlertsContainer');
        if (container) {
            container.innerHTML = `<div class="p-3 bg-red-50 text-red-700 rounded-lg text-xs border border-red-100">Ошибка обновления данных: ${err.message}</div>`;
        }
    }
}

function renderStats(list) {
    document.getElementById('dashTotal').innerHTML = `${list.length} <span class="text-xs font-normal text-gray-400">ед.</span>`;
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
        if (v.inspection_date) {
            const diff = Math.ceil((new Date(v.inspection_date) - today) / (1000 * 60 * 60 * 24));
            if (diff <= 0) {
                alerts.push({ type: 'danger', text: `<b>${v.model}</b> (${v.plate || 'б/н'}): <span class="text-red-600 font-semibold">Просрочен Гостехосмотр!</span>` });
            } else if (diff <= 30) {
                alerts.push({ type: 'warning', text: `<b>${v.model}</b>: Гостехосмотр истекает через ${diff} дн.` });
            }
        }
        if (v.insurance_date) {
            const diffIns = Math.ceil((new Date(v.insurance_date) - today) / (1000 * 60 * 60 * 24));
            if (diffIns <= 0) {
                alerts.push({ type: 'danger', text: `<b>${v.model}</b> (${v.plate || 'б/н'}): <span class="text-red-600 font-semibold">Закончилась страховка!</span>` });
            } else if (diffIns <= 30) {
                alerts.push({ type: 'warning', text: `<b>${v.model}</b>: Страховка истекает через ${diffIns} дн.` });
            }
        }
    });

    if (alerts.length === 0) {
        container.innerHTML = `
            <div class="bg-emerald-50/60 border border-emerald-100 text-emerald-800 p-4 rounded-xl text-center text-xs font-medium">
                Все документы в порядке! Просрочек и критических сроков не обнаружено.
            </div>`;
        return;
    }

    container.innerHTML = alerts.map(a => {
        let classes = "bg-amber-50/60 border-amber-100 text-amber-900";
        if (a.type === 'danger') classes = "bg-red-50/60 border-red-100 text-red-900";
        return `<div class="p-2.5 border rounded-lg text-xs ${classes}">${a.text}</div>`;
    }).join('');
}

function renderTasks(taskList) {
    const container = document.getElementById('dashboardTasksContainer');
    if (!container) return;
    if (taskList.length === 0) {
        container.innerHTML = `<div class="p-4 text-center text-xs text-gray-400 bg-gray-50 rounded-xl border border-gray-100">Все задачи выполнены.</div>`;
        return;
    }
    container.innerHTML = taskList.map(task => `
        <div class="bg-gray-50 border border-gray-200 p-2.5 rounded-lg flex items-center justify-between text-xs">
            <div><span class="font-bold text-gray-700 mr-2">${task.vehicle_name}:</span>${task.text}</div>
            <button onclick="window.completeDashboardTask(${task.id})" class="text-[11px] font-bold text-emerald-600 hover:underline ml-2">Готово</button>
        </div>
    `).join('');
}