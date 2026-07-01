import { initAuthScreen, handleLogin, handleLogout } from './auth.js';
import { loadVehicles, saveVehicle } from './fleet.js';

// 1. Привязываем функции к глобальному window, чтобы HTML (onclick=...) их видел
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.saveVehicle = saveVehicle;
window.toggleMobileMenu = toggleMobileMenu;
window.switchModule = switchModule;
window.refreshCurrentModule = refreshCurrentModule;

// 2. Конфигурация модулей
const APP_MODULES = [
    { id: 'dashboard', name: '🏠 Главная панель', init: () => {} },
    { id: 'fleet', name: '🚜 Сельхоз.парк', init: loadVehicles },
    { id: 'auth', name: '🔐 Вход в АРМ', init: initAuthScreen }
];

let currentModuleId = 'dashboard';

// 3. Функции интерфейса
function toggleMobileMenu() {
    const overlay = document.getElementById('mobileMenuOverlay');
    const drawer = document.getElementById('mobileDrawer');
    if (overlay.classList.contains('hidden')) {
        overlay.classList.remove('hidden');
        setTimeout(() => {
            overlay.classList.remove('opacity-0');
            overlay.classList.add('pointer-events-auto');
            drawer.classList.remove('-translate-x-full');
        }, 10);
    } else {
        overlay.classList.add('opacity-0');
        overlay.classList.remove('pointer-events-auto');
        drawer.classList.add('-translate-x-full');
        setTimeout(() => { overlay.classList.add('hidden'); }, 300);
    }
}

function renderMenu() {
    const pcContainer = document.getElementById('pcMenuContainer');
    const mobileContainer = document.getElementById('mobileMenuContainer');
    const menuHtml = APP_MODULES.map(mod => {
        const isActive = mod.id === currentModuleId;
        const activeClasses = isActive ? 'bg-blue-600 text-white font-semibold shadow-md' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200';
        return `
            <button onclick="switchModule('${mod.id}'); if(window.innerWidth < 768) toggleMobileMenu();" class="w-full text-left px-5 py-3.5 rounded-xl text-sm transition flex items-center justify-between ${activeClasses}">
                <span>${mod.name}</span>
                ${isActive ? '<span class="w-2 h-2 bg-white rounded-full"></span>' : ''}
            </button>
        `;
    }).join('');
    if(pcContainer) pcContainer.innerHTML = menuHtml;
    if(mobileContainer) mobileContainer.innerHTML = menuHtml;
}

function switchModule(moduleId) {
    currentModuleId = moduleId;
    renderMenu();
    
    const template = document.getElementById(`tpl-${moduleId}`);
    if (template) {
        document.getElementById('moduleWorkspace').innerHTML = template.innerHTML;
    }
    
    const targetModule = APP_MODULES.find(m => m.id === moduleId);
    if (targetModule && targetModule.init) targetModule.init();
    
    window.scrollTo(0, 0);
}

function refreshCurrentModule() {
    const targetModule = APP_MODULES.find(m => m.id === currentModuleId);
    if (targetModule && targetModule.init) targetModule.init();
}

// 4. Инициализация при загрузке
window.addEventListener('DOMContentLoaded', () => {
    switchModule('dashboard');
});