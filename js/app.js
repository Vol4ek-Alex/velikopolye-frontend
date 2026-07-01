import { loadFleet } from './fleet.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log("1. DOM полностью загружен. Начинаем инициализацию...");
    
    const contentElement = document.getElementById('content');
    if (!contentElement) {
        console.error("Критическая ошибка: Элемент #content не найден в HTML!");
        return;
    }
    
    console.log("2. Элемент #content найден. Вызываем функцию loadFleet()...");
    try {
        await loadFleet();
        console.log("4. Функция loadFleet() успешно завершила работу.");
    } catch (err) {
        console.error("Произошла ошибка при выполнении loadFleet:", err);
    }
});