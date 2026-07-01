import { supabase } from './config.js';

// 1. Загрузка и отрисовка техники
export async function loadFleet() {
    const content = document.getElementById('content');
    if (!content) return;

    content.innerHTML = '<p class="text-slate-400">Загрузка данных из Supabase...</p>';

    try {
        const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        if (!data || data.length === 0) {
            content.innerHTML = `
                <p class="text-slate-500 mb-4">В базе пока нет техники.</p>
                <button onclick="window.openAddModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition">➕ Добавить первую технику</button>
            `;
            return;
        }

        // Рендерим шапку, кнопку добавления и сетку карточек
        content.innerHTML = `
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold">Всего в парке: <span class="text-blue-400">${data.length}</span></h2>
                <button onclick="window.openAddModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition">➕ Добавить технику</button>
            </div>
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                ${data.map(v => `
                    <div class="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex flex-col justify-between">
                        <div>
                            <div class="flex justify-between items-start mb-2">
                                <h3 class="font-bold text-lg text-white">${v.model || 'Без названия'}</h3>
                                <button onclick="window.openEditModal('${v.id}', '${v.model}', '${v.plate}')" class="text-slate-400 hover:text-blue-400 transition text-sm">✏️ Редактировать</button>
                            </div>
                            <p class="text-slate-400 text-sm mb-1">Госномер: <span class="text-slate-200 font-mono">${v.plate || '—'}</span></p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (e) {
        content.innerHTML = `<p class="text-red-500">Ошибка БД: ${e.message}</p>`;
        console.error(e);
    }
}

// 2. Сохранение (Создание или Обновление)
export async function saveVehicle(id, model, plate) {
    try {
        if (id) {
            // Если ID есть — это редактирование
            const { error } = await supabase.from('vehicles').update({ model, plate }).eq('id', id);
            if (error) throw error;
        } else {
            // Если ID нет — это создание новой записи
            const { error } = await supabase.from('vehicles').insert([{ model, plate }]);
            if (error) throw error;
        }
        
        window.closeModal();
        loadFleet(); // Перезагружаем список
    } catch (e) {
        alert(`Ошибка при сохранении: ${e.message}`);
    }
}