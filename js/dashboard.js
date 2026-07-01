export const template = `
    <div class="max-w-md mx-auto text-center py-12">
        <span class="text-5xl">🌾</span>
        <h2 class="text-2xl font-bold text-gray-800 mt-4">Добро пожаловать в АРМ</h2>
        <p class="text-gray-500 mt-2">Выберите необходимый модуль в боковом меню для работы с данными хозяйства.</p>
    </div>
`;

// Если логика для главной не нужна, оставляем функцию пустой
export function init() {
    console.log("Модуль Dashboard успешно проинициализирован");
}