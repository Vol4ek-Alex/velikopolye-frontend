import { supabase } from './config.js';

export async function loadFleet() {
    console.log("3. Функция loadFleet вызвана. Делаем запрос к Supabase...");
    const content = document.getElementById('content');
    
    try {
        const { data, error } = await supabase.from('vehicles').select('*');
        
        if (error) {
            console.error("Ошибка от самого Supabase:", error);
            throw error;
        }
        
        console.log("Данные из базы успешно получены:", data);
        
        // ... (дальше идет ваш код отрисовки из предыдущего шага)
        
    } catch (e) {
        content.innerHTML = `<p class="text-red-500">Ошибка: ${e.message}</p>`;
    }
}