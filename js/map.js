export const template = `
    <div class="h-full flex flex-col">
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Спутниковый мониторинг</h2>
            <p class="text-sm text-gray-500">Онлайн-карта расположения техники СХК «Великополье» (Wialon)</p>
        </div>
        
        <div class="flex-1 bg-white border border-gray-200 rounded-2xl p-2 shadow-sm min-h-[650px] overflow-hidden">
            <iframe 
                src="https://host.local3.wialon.host/" 
                class="w-full h-full rounded-xl border-0"
                allow="geolocation; autoplay; encrypted-media; picture-in-picture"
                loading="lazy">
            </iframe>
        </div>
    </div>
`;

export function init() {
    console.log("Модуль карты Wialon успешно инициализирован с внешним хостом");
}