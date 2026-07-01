import { supabase } from './config.js';

export async function renderFleet() {
    const content = document.getElementById('content');
    content.innerHTML = '<p>Загрузка списка техники...</p>';

    const { data, error } = await supabase.from('vehicles').select('*');

    if (error) {
        content.innerHTML = `<p class="text-red-500">Ошибка: ${error.message}</p>`;
        return;
    }

    content.innerHTML = `
        <h2 class="text-lg font-semibold mb-4">Техника в парке</h2>
        <div class="grid gap-4">
            ${data.map(v => `
                <div class="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <h3 class="font-bold">${v.model}</h3>
                    <p class="text-slate-400 text-sm">Госномер: ${v.plate}</p>
                </div>
            `).join('')}
        </div>
    `;
}