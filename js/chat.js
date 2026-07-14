// js/chat.js

// ===== Глобальные переменные =====
let currentRoom = 'general';
let currentReceiver = null; // для личных сообщений
let messages = [];
let chatUsers = [];
let chatSubscription = null;
let isChatOpen = false;
let isMenuOpen = false;

// ===== Инициализация =====
export async function init() {
    console.log('💬 Глобальный чат инициализирован');

    if (!document.getElementById('chatGlobalContainer')) {
        document.body.insertAdjacentHTML('beforeend', getChatHTML());
    }

    // Привязка событий
    document.getElementById('chatFab').addEventListener('click', toggleChat);
    document.getElementById('chatCloseBtn').addEventListener('click', toggleChat);
    document.getElementById('chatMinimizeBtn').addEventListener('click', minimizeChat);
    document.getElementById('chatSendBtn').addEventListener('click', sendChatMessage);
    document.getElementById('chatInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });
    document.getElementById('chatMenuBtn').addEventListener('click', toggleMenu);
    document.getElementById('chatMenuOverlay').addEventListener('click', closeMenu);

    // Загружаем пользователей и сообщения
    await loadChatUsers();
    await loadMessages('general');
    renderMessages();
    subscribeToRoom('general');

    // Периодическая проверка онлайн-статусов
    setInterval(updateOnlineStatus, 30000);
    // Проверка новых сообщений для бейджа
    setInterval(checkNewMessages, 10000);
}

// ===== HTML-шаблон =====
function getChatHTML() {
    return `
        <div id="chatGlobalContainer" class="fixed inset-0 pointer-events-none z-[999]">
            <!-- Плавающая кнопка -->
            <button id="chatFab" class="fixed bottom-6 right-6 pointer-events-auto bg-cyan-600/80 hover:bg-cyan-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center w-14 h-14 backdrop-blur-sm animate-fade-in-up">
                <span class="text-2xl">💬</span>
                <span id="chatBadge" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center hidden animate-pulse">0</span>
            </button>

            <!-- Окно чата -->
            <div id="chatWindow" class="fixed inset-0 md:inset-auto md:bottom-24 md:right-6 md:w-[450px] md:h-[600px] bg-white shadow-2xl border border-gray-200 pointer-events-auto flex flex-col hidden max-h-screen max-w-screen overflow-hidden rounded-none md:rounded-3xl animate-fade-in-up">
                <!-- Шапка с меню -->
                <div class="bg-gradient-to-r from-cyan-600 to-cyan-500 text-white p-4 flex justify-between items-center flex-shrink-0 rounded-t-none md:rounded-t-3xl">
                    <div class="flex items-center gap-3">
                        <button id="chatMenuBtn" class="text-white hover:text-gray-200 text-2xl leading-none transition-transform hover:scale-110">☰</button>
                        <span class="font-bold text-lg">Чат</span>
                        <span id="chatRoomName" class="text-sm font-medium bg-cyan-700/50 px-3 py-0.5 rounded-full">Общий</span>
                        <span id="chatOnlineCount" class="text-xs bg-green-400/30 px-2 py-0.5 rounded-full">🟢 0</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <button id="chatMinimizeBtn" class="text-white hover:text-gray-200 text-xl leading-none">−</button>
                        <button id="chatCloseBtn" class="text-white hover:text-gray-200 text-xl leading-none">✕</button>
                    </div>
                </div>

                <!-- Меню (выезжающее слева) -->
                <div id="chatMenuOverlay" class="absolute inset-0 bg-black/30 hidden z-10" style="pointer-events: auto;"></div>
                <div id="chatMenu" class="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl z-20 transform -translate-x-full transition-transform duration-300 ease-in-out overflow-y-auto rounded-none md:rounded-l-3xl">
                    <div class="p-4 border-b border-gray-200 bg-gray-50">
                        <h3 class="font-bold text-gray-800">💬 Каналы</h3>
                    </div>
                    <div class="p-2 space-y-1">
                        <button onclick="window.switchChatRoom('general')" class="w-full text-left px-3 py-2 rounded-xl hover:bg-cyan-50 transition text-sm font-medium text-gray-700 flex items-center gap-2">
                            <span class="text-lg">📢</span> Общий чат
                        </button>
                        <button onclick="window.switchChatRoom('repair')" class="w-full text-left px-3 py-2 rounded-xl hover:bg-cyan-50 transition text-sm font-medium text-gray-700 flex items-center gap-2">
                            <span class="text-lg">🔧</span> Ремонтная бригада
                        </button>
                        <button onclick="window.switchChatRoom('dispatch')" class="w-full text-left px-3 py-2 rounded-xl hover:bg-cyan-50 transition text-sm font-medium text-gray-700 flex items-center gap-2">
                            <span class="text-lg">📋</span> Диспетчерская
                        </button>
                    </div>
                    <div class="p-4 border-t border-gray-200 bg-gray-50">
                        <h3 class="font-bold text-gray-800">👤 Личные сообщения</h3>
                    </div>
                    <div id="chatUserList" class="p-2 space-y-1 max-h-[300px] overflow-y-auto"></div>
                    <div class="p-3 text-xs text-gray-400 border-t border-gray-200 text-center">
                        Онлайн: <span id="chatOnlineCountMenu">0</span>
                    </div>
                </div>

                <!-- Сообщения -->
                <div id="chatMessages" class="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
                    <div class="text-center text-gray-400 py-8 text-sm">Загрузка сообщений...</div>
                </div>

                <!-- Поле ввода -->
                <div class="border-t border-gray-200 p-3 flex gap-2 items-center bg-white flex-shrink-0">
                    <input type="text" id="chatInput" placeholder="Введите сообщение..." class="flex-1 bg-gray-100 border-0 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-cyan-400 outline-none transition-shadow">
                    <button id="chatSendBtn" class="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition shadow-sm hover:shadow-md active:scale-95">➤</button>
                </div>
            </div>
        </div>
    `;
}

// ===== Загрузка пользователей чата =====
async function loadChatUsers() {
    if (!window._supabase) return;
    try {
        const { data, error } = await window._supabase
            .from('chat_users')
            .select('*')
            .order('name');
        if (error) throw error;
        chatUsers = data || [];
        // Если нет пользователей, загружаем из localStorage
        if (chatUsers.length === 0) {
            const role = localStorage.getItem('user_role') || 'Сотрудник';
            const name = localStorage.getItem('user_name') || 'Неизвестный';
            // Добавляем базовых пользователей
            const defaultUsers = [
                { name: 'Рунцевич Д.С.', role: 'Директор' },
                { name: 'Волчек А.А.', role: 'Инженер по ЭМТП' },
                { name: 'Ладутько И.И.', role: 'Техник' },
                { name: 'Новик А.А.', role: 'Заместитель директора' }
            ];
            // Добавляем текущего пользователя
            if (!defaultUsers.find(u => u.name === name)) {
                defaultUsers.push({ name, role });
            }
            // Сохраняем в Supabase
            for (const u of defaultUsers) {
                await window._supabase.from('chat_users').upsert({
                    name: u.name,
                    role: u.role,
                    online: false,
                    last_seen: new Date().toISOString()
                }, { onConflict: 'name' });
            }
            // Перезагружаем
            const { data: newData } = await window._supabase
                .from('chat_users')
                .select('*')
                .order('name');
            chatUsers = newData || [];
        }
        renderUserList();
        updateOnlineStatus();
    } catch (err) {
        console.error('Ошибка загрузки пользователей:', err);
    }
}

// ===== Рендеринг списка пользователей =====
function renderUserList() {
    const container = document.getElementById('chatUserList');
    if (!container) return;
    const currentUser = localStorage.getItem('user_name') || 'Неизвестный';
    container.innerHTML = chatUsers
        .filter(u => u.name !== currentUser) // не показываем себя
        .map(u => `
            <button onclick="window.startPrivateChat('${u.name}')" class="w-full text-left px-3 py-2 rounded-xl hover:bg-cyan-50 transition text-sm font-medium text-gray-700 flex items-center gap-2">
                <span class="flex-shrink-0 w-2 h-2 rounded-full ${u.online ? 'bg-green-500' : 'bg-gray-300'}"></span>
                <span>${u.name}</span>
                <span class="text-xs text-gray-400 ml-auto">${u.role}</span>
            </button>
        `).join('');
    // Обновляем счетчик онлайн
    const onlineCount = chatUsers.filter(u => u.online).length;
    document.getElementById('chatOnlineCount').textContent = `🟢 ${onlineCount}`;
    document.getElementById('chatOnlineCountMenu').textContent = onlineCount;
}

// ===== Обновление онлайн-статуса =====
async function updateOnlineStatus() {
    if (!window._supabase) return;
    const currentUser = localStorage.getItem('user_name') || 'Неизвестный';
    // Обновляем статус текущего пользователя
    await window._supabase
        .from('chat_users')
        .update({ online: true, last_seen: new Date().toISOString() })
        .eq('name', currentUser);
    // Получаем всех пользователей
    const { data } = await window._supabase
        .from('chat_users')
        .select('*')
        .order('name');
    if (data) {
        chatUsers = data;
        renderUserList();
    }
}

// ===== Переключение комнаты =====
window.switchChatRoom = function(room) {
    if (room === currentRoom && !currentReceiver) return;
    currentRoom = room;
    currentReceiver = null;
    document.getElementById('chatRoomName').textContent = room === 'general' ? 'Общий' : room;
    if (chatSubscription) {
        chatSubscription.unsubscribe();
        chatSubscription = null;
    }
    loadMessages(room);
    renderMessages();
    subscribeToRoom(room);
    closeMenu();
};

// ===== Личный чат =====
window.startPrivateChat = function(receiverName) {
    const room = `private_${receiverName}`;
    currentRoom = room;
    currentReceiver = receiverName;
    document.getElementById('chatRoomName').textContent = `💬 ${receiverName}`;
    if (chatSubscription) {
        chatSubscription.unsubscribe();
        chatSubscription = null;
    }
    loadMessages(room);
    renderMessages();
    subscribeToRoom(room);
    closeMenu();
};

// ===== Загрузка сообщений =====
async function loadMessages(room) {
    if (!window._supabase) return;
    try {
        let query = window._supabase
            .from('chat_messages')
            .select('*')
            .order('created_at', { ascending: true })
            .limit(100);
        if (room.startsWith('private_')) {
            const receiver = room.replace('private_', '');
            const currentUser = localStorage.getItem('user_name') || 'Неизвестный';
            query = query.or(`room.eq.${room},and(sender_name.eq.${currentUser},receiver_name.eq.${receiver}),and(sender_name.eq.${receiver},receiver_name.eq.${currentUser})`);
        } else {
            query = query.eq('room', room);
        }
        const { data, error } = await query;
        if (error) throw error;
        messages = data || [];
    } catch (err) {
        console.error('Ошибка загрузки сообщений:', err);
    }
}

// ===== Рендеринг сообщений =====
function renderMessages() {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    if (messages.length === 0) {
        container.innerHTML = '<div class="text-center text-gray-400 py-8 text-sm animate-fade-in">Нет сообщений. Напишите первое!</div>';
        return;
    }
    const roleColors = {
        'Директор': 'bg-red-100 text-red-800',
        'Инженер по ЭМТП': 'bg-blue-100 text-blue-800',
        'Техник': 'bg-green-100 text-green-800',
        'Заместитель директора': 'bg-purple-100 text-purple-800'
    };
    const currentUser = localStorage.getItem('user_name') || 'Неизвестный';
    container.innerHTML = messages.map(msg => {
        const isOwn = msg.sender_name === currentUser;
        const colorClass = roleColors[msg.sender_role] || 'bg-gray-100 text-gray-800';
        const time = new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        const date = new Date(msg.created_at).toLocaleDateString('ru-RU');
        return `
            <div class="flex items-start gap-3 animate-fade-in-up" style="animation-delay: 0.05s;">
                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-sm">
                    ${msg.sender_name.charAt(0)}
                </div>
                <div class="flex-1">
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-gray-800 text-sm">${msg.sender_name}</span>
                        <span class="text-xs font-bold px-2 py-0.5 rounded-full ${colorClass}">${msg.sender_role || 'Сотрудник'}</span>
                        <span class="text-xs text-gray-400">${date} ${time}</span>
                        ${isOwn ? '<span class="text-xs text-gray-400">✓</span>' : ''}
                    </div>
                    <div class="text-sm text-gray-700 mt-0.5 break-words">${msg.message}</div>
                </div>
            </div>
        `;
    }).join('');
    container.scrollTop = container.scrollHeight;
}

// ===== Подписка на Realtime =====
function subscribeToRoom(room) {
    if (!window._supabase) return;
    if (chatSubscription) {
        chatSubscription.unsubscribe();
        chatSubscription = null;
    }
    let filter = `room=eq.${room}`;
    if (room.startsWith('private_')) {
        const currentUser = localStorage.getItem('user_name') || 'Неизвестный';
        const receiver = room.replace('private_', '');
        filter = `or(room.eq.${room},and(sender_name.eq.${currentUser},receiver_name.eq.${receiver}),and(sender_name.eq.${receiver},receiver_name.eq.${currentUser}))`;
    }
    chatSubscription = window._supabase
        .channel('chat_messages')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: filter
        }, (payload) => {
            messages.push(payload.new);
            renderMessages();
            if (!isChatOpen) {
                showBadge(1);
            }
        })
        .subscribe();
}

// ===== Отправка сообщения =====
window.sendChatMessage = async function() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;

    const sender_name = localStorage.getItem('user_name') || 'Сотрудник';
    const sender_role = localStorage.getItem('user_role') || 'Сотрудник';
    let room = currentRoom;
    let receiver_name = null;

    if (currentRoom.startsWith('private_')) {
        receiver_name = currentRoom.replace('private_', '');
        // Для личных сообщений сохраняем room как private_ + имя получателя, но для выборки используем комнату
        room = `private_${receiver_name}`;
    }

    const payload = {
        room: room,
        sender_name: sender_name,
        sender_role: sender_role,
        receiver_name: receiver_name,
        message: text,
        created_at: new Date().toISOString()
    };

    if (!window._supabase) {
        alert('Ошибка: Supabase не инициализирован');
        return;
    }

    try {
        const { error } = await window._supabase
            .from('chat_messages')
            .insert([payload]);
        if (error) throw error;
        input.value = '';
        // Realtime добавит сообщение автоматически
    } catch (err) {
        console.error('Ошибка отправки:', err);
        alert('Ошибка отправки: ' + err.message);
    }
};

// ===== Управление меню =====
function toggleMenu() {
    const menu = document.getElementById('chatMenu');
    const overlay = document.getElementById('chatMenuOverlay');
    isMenuOpen = !isMenuOpen;
    menu.style.transform = isMenuOpen ? 'translateX(0)' : 'translateX(-100%)';
    overlay.style.display = isMenuOpen ? 'block' : 'none';
}

function closeMenu() {
    const menu = document.getElementById('chatMenu');
    const overlay = document.getElementById('chatMenuOverlay');
    isMenuOpen = false;
    menu.style.transform = 'translateX(-100%)';
    overlay.style.display = 'none';
}

// ===== Управление окном чата =====
function toggleChat() {
    const window = document.getElementById('chatWindow');
    const fab = document.getElementById('chatFab');
    if (window.classList.contains('hidden')) {
        window.classList.remove('hidden');
        fab.classList.add('hidden');
        isChatOpen = true;
        clearBadge();
        // Загружаем свежие сообщения
        loadMessages(currentRoom);
        renderMessages();
        // Обновляем онлайн-статус
        updateOnlineStatus();
    } else {
        window.classList.add('hidden');
        fab.classList.remove('hidden');
        isChatOpen = false;
    }
}

function minimizeChat() {
    const window = document.getElementById('chatWindow');
    const fab = document.getElementById('chatFab');
    window.classList.add('hidden');
    fab.classList.remove('hidden');
    isChatOpen = false;
}

// ===== Бейдж уведомлений =====
function showBadge(count) {
    const badge = document.getElementById('chatBadge');
    if (badge) {
        badge.textContent = count;
        badge.classList.remove('hidden');
    }
}

function clearBadge() {
    const badge = document.getElementById('chatBadge');
    if (badge) {
        badge.classList.add('hidden');
        badge.textContent = '0';
    }
}

// ===== Проверка новых сообщений для бейджа =====
async function checkNewMessages() {
    if (!window._supabase) return;
    if (isChatOpen) {
        clearBadge();
        return;
    }
    try {
        const { count, error } = await window._supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('room', currentRoom)
            .gt('created_at', new Date(Date.now() - 60000).toISOString());
        if (error) throw error;
        if (count > 0) {
            showBadge(count);
        }
    } catch (err) {
        // игнорируем
    }
}

// ===== Глобальные функции =====
window.toggleChat = toggleChat;
window.minimizeChat = minimizeChat;
window.sendChatMessage = sendChatMessage;
window.switchChatRoom = window.switchChatRoom;
window.startPrivateChat = window.startPrivateChat;
window.toggleMenu = toggleMenu;
window.closeMenu = closeMenu;

// ===== Анимации: добавляем CSS-классы при загрузке =====
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        .animate-fade-in-up {
            animation: fadeInUp 0.3s ease-out forwards;
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-pulse {
            animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
    `;
    document.head.appendChild(style);
});