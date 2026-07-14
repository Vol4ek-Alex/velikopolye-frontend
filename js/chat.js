// js/chat.js

// ===== Глобальные переменные =====
let currentRoom = 'general';
let messages = [];
let chatSubscription = null;
let chatUsers = [];
let currentReceiver = null; // для личных сообщений
let isChatOpen = false;
let isMinimized = false;

// ===== Инициализация =====
export async function init() {
    console.log('💬 Глобальный чат инициализирован');

    // Добавляем HTML чата в DOM (если ещё не добавлен)
    if (!document.getElementById('chatGlobalContainer')) {
        document.body.insertAdjacentHTML('beforeend', getChatHTML());
    }

    // Привязываем события
    document.getElementById('chatFab').addEventListener('click', toggleChat);
    document.getElementById('chatCloseBtn').addEventListener('click', toggleChat);
    document.getElementById('chatMinimizeBtn').addEventListener('click', minimizeChat);
    document.getElementById('chatSendBtn').addEventListener('click', sendChatMessage);
    document.getElementById('chatInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });

    // Загружаем пользователей и сообщения
    await loadChatUsers();
    await loadMessages('general');
    renderMessages();
    subscribeToRoom('general');

    // Обработчик переключения комнат
    document.getElementById('chatRoomSelect')?.addEventListener('change', (e) => {
        switchChatRoom(e.target.value);
    });

    // Проверяем новые сообщения каждые 10 секунд (для уведомлений)
    setInterval(checkNewMessages, 10000);
}

// ===== HTML-шаблон =====
function getChatHTML() {
    return `
        <div id="chatGlobalContainer" class="fixed inset-0 pointer-events-none z-50">
            <!-- Плавающая кнопка -->
            <button id="chatFab" class="fixed bottom-6 right-6 pointer-events-auto bg-cyan-600/80 hover:bg-cyan-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center w-14 h-14 backdrop-blur-sm">
                <span id="chatFabIcon" class="text-2xl">💬</span>
                <span id="chatBadge" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center hidden">0</span>
            </button>

            <!-- Окно чата -->
            <div id="chatWindow" class="fixed inset-0 md:inset-auto md:bottom-24 md:right-6 md:w-[450px] md:h-[600px] bg-white rounded-3xl shadow-2xl border border-gray-200 pointer-events-auto flex flex-col hidden transition-all duration-300">
                <!-- Шапка -->
                <div class="bg-cyan-600 text-white p-4 rounded-t-3xl flex justify-between items-center flex-shrink-0">
                    <div class="flex items-center gap-2">
                        <span class="text-2xl">💬</span>
                        <span class="font-bold">Чат</span>
                        <span id="chatRoomName" class="text-sm font-medium bg-cyan-500 px-2 py-0.5 rounded-full">Общий</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <button id="chatMinimizeBtn" class="text-white hover:text-gray-200 text-xl leading-none">−</button>
                        <button id="chatCloseBtn" class="text-white hover:text-gray-200 text-xl leading-none">✕</button>
                    </div>
                </div>

                <!-- Переключатель комнат -->
                <div class="flex border-b border-gray-200 bg-gray-50 p-2 gap-1 overflow-x-auto flex-shrink-0">
                    <select id="chatRoomSelect" class="bg-gray-50 border border-gray-300 rounded-xl px-3 py-1 text-sm font-medium focus:ring-2 focus:ring-cyan-400 focus:border-transparent">
                        <option value="general">Общий</option>
                        <option value="repair">Ремонтная бригада</option>
                        <option value="dispatch">Диспетчерская</option>
                    </select>
                    <select id="chatUserSelect" class="bg-gray-50 border border-gray-300 rounded-xl px-3 py-1 text-sm font-medium focus:ring-2 focus:ring-cyan-400 focus:border-transparent hidden">
                        <option value="">Личное сообщение</option>
                    </select>
                </div>

                <!-- Сообщения -->
                <div id="chatMessages" class="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
                    <div class="text-center text-gray-400 py-8 text-sm">Загрузка сообщений...</div>
                </div>

                <!-- Поле ввода -->
                <div class="border-t border-gray-200 p-3 flex gap-2 items-center bg-white rounded-b-3xl flex-shrink-0">
                    <button id="chatAttachBtn" class="text-gray-500 hover:text-cyan-600 transition text-xl">📎</button>
                    <input type="text" id="chatInput" placeholder="Введите сообщение..." class="flex-1 bg-gray-100 border-0 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-cyan-400 outline-none">
                    <button id="chatSendBtn" class="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition shadow-sm">➤</button>
                </div>
            </div>
        </div>
    `;
}

// ===== Управление отображением =====
function toggleChat() {
    const window = document.getElementById('chatWindow');
    const fab = document.getElementById('chatFab');
    if (window.classList.contains('hidden')) {
        window.classList.remove('hidden');
        fab.classList.add('hidden');
        isChatOpen = true;
        // При открытии подгружаем свежие сообщения
        loadMessages(currentRoom);
        renderMessages();
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

// ===== Загрузка пользователей =====
async function loadChatUsers() {
    if (!window._supabase) return;
    try {
        // Здесь можно синхронизировать с вашей таблицей пользователей
        // Для демонстрации используем список ролей из localStorage
        const role = localStorage.getItem('user_role') || 'Сотрудник';
        const name = localStorage.getItem('user_name') || 'Неизвестный';
        // Добавляем текущего пользователя в список (можно расширить)
        chatUsers = [
            { name: 'Рунцевич Д.С.', role: 'Директор' },
            { name: 'Волчек А.А.', role: 'Инженер по ЭМТП' },
            { name: 'Ладутько И.И.', role: 'Техник' },
            { name: 'Новик А.А.', role: 'Заместитель директора' }
        ];
        // Добавляем текущего пользователя, если его нет в списке
        if (!chatUsers.find(u => u.name === name)) {
            chatUsers.push({ name, role });
        }
        fillUserSelect();
    } catch (err) {
        console.error('Ошибка загрузки пользователей:', err);
    }
}

function fillUserSelect() {
    const select = document.getElementById('chatUserSelect');
    if (!select) return;
    select.innerHTML = '<option value="">Личное сообщение</option>' +
        chatUsers.map(u => `<option value="${u.name}">${u.name} (${u.role})</option>`).join('');
}

// ===== Переключение комнаты =====
function switchChatRoom(room) {
    if (room === currentRoom) return;
    currentRoom = room;
    document.getElementById('chatRoomName').textContent = room === 'general' ? 'Общий' : room;

    // Отписываемся от старой комнаты
    if (chatSubscription) {
        chatSubscription.unsubscribe();
        chatSubscription = null;
    }

    // Загружаем сообщения
    loadMessages(room);
    renderMessages();
    subscribeToRoom(room);
}

// ===== Загрузка сообщений =====
async function loadMessages(room) {
    if (!window._supabase) return;
    try {
        const { data, error } = await window._supabase
            .from('chat_messages')
            .select('*')
            .eq('room', room)
            .order('created_at', { ascending: true })
            .limit(100);
        if (error) throw error;
        messages = data || [];
        console.log(`✅ Загружено ${messages.length} сообщений для комнаты ${room}`);
    } catch (err) {
        console.error('Ошибка загрузки сообщений:', err);
    }
}

// ===== Рендеринг сообщений =====
function renderMessages() {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    if (messages.length === 0) {
        container.innerHTML = '<div class="text-center text-gray-400 py-8 text-sm">Нет сообщений. Напишите первое!</div>';
        return;
    }

    const roleColors = {
        'Директор': 'bg-red-100 text-red-800',
        'Инженер по ЭМТП': 'bg-blue-100 text-blue-800',
        'Техник': 'bg-green-100 text-green-800',
        'Заместитель директора': 'bg-purple-100 text-purple-800'
    };

    container.innerHTML = messages.map(msg => {
        const colorClass = roleColors[msg.user_role] || 'bg-gray-100 text-gray-800';
        const time = new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        const date = new Date(msg.created_at).toLocaleDateString('ru-RU');
        return `
            <div class="flex items-start gap-3">
                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-sm">
                    ${msg.user_name.charAt(0)}
                </div>
                <div class="flex-1">
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-gray-800 text-sm">${msg.user_name}</span>
                        <span class="text-xs font-bold px-2 py-0.5 rounded-full ${colorClass}">${msg.user_role}</span>
                        <span class="text-xs text-gray-400">${date} ${time}</span>
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

    chatSubscription = window._supabase
        .channel('chat_messages')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `room=eq.${room}`
        }, (payload) => {
            messages.push(payload.new);
            renderMessages();
            // Если чат закрыт – показываем бейдж
            if (!isChatOpen) {
                showBadge(1);
            }
        })
        .subscribe();
}

// ===== Отправка сообщения =====
async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;

    const user_name = localStorage.getItem('user_name') || 'Сотрудник';
    const user_role = localStorage.getItem('user_role') || 'Сотрудник';
    const receiver = document.getElementById('chatUserSelect').value || null;

    const payload = {
        room: receiver ? `private_${receiver}` : currentRoom,
        sender_id: null, // можно хранить UUID, но для простоты оставим
        receiver_id: null,
        message: text,
        user_name: user_name,
        user_role: user_role,
        created_at: new Date().toISOString()
    };

    try {
        const { error } = await window._supabase
            .from('chat_messages')
            .insert([payload]);
        if (error) throw error;
        input.value = '';
        // Обновляем сообщения сразу (без ожидания Realtime)
        // Но Realtime сам добавит, поэтому просто очищаем поле
    } catch (err) {
        alert('Ошибка отправки: ' + err.message);
    }
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

// ===== Проверка новых сообщений (для уведомлений) =====
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
            .gt('created_at', new Date(Date.now() - 60000).toISOString()); // за последнюю минуту
        if (error) throw error;
        if (count > 0) {
            showBadge(count);
        }
    } catch (err) {
        // тихо игнорируем
    }
}

// ===== Экспорт глобальных функций =====
window.toggleChat = toggleChat;
window.minimizeChat = minimizeChat;
window.sendChatMessage = sendChatMessage;
window.switchChatRoom = switchChatRoom;