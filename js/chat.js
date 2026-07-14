// js/chat.js

// ============================================================
// ГЛОБАЛЬНЫЙ ЧАТ – версия 2.0 (полноценный, с анимациями)
// ============================================================

// ---------- Переменные ----------
let currentRoom = 'general';          // текущая комната
let currentReceiver = null;           // для личных сообщений (имя пользователя)
let messages = [];                    // массив сообщений
let chatSubscription = null;          // подписка Realtime
let isChatOpen = false;               // открыто ли окно чата
let unreadCount = 0;                 // счетчик непрочитанных

// ---------- Инициализация ----------
export async function init() {
    console.log('💬 Чат инициализирован');

    // Добавляем HTML чата в DOM, если его ещё нет
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

    // Переключение комнаты
    document.getElementById('chatRoomSelect').addEventListener('change', (e) => {
        const room = e.target.value;
        switchChatRoom(room);
    });

    // Переключение личного получателя
    document.getElementById('chatUserSelect').addEventListener('change', (e) => {
        currentReceiver = e.target.value || null;
        if (currentReceiver) {
            // При выборе пользователя переключаемся в личный чат
            const room = `private_${currentReceiver}`;
            switchChatRoom(room);
            document.getElementById('chatRoomName').textContent = `Личное: ${currentReceiver}`;
        } else {
            // Возвращаемся в общий чат
            switchChatRoom('general');
            document.getElementById('chatRoomName').textContent = 'Общий';
        }
    });

    // Загружаем список пользователей для личных сообщений
    await loadUsers();

    // Загружаем сообщения общей комнаты
    await loadMessages('general');
    renderMessages();

    // Подписываемся на Realtime
    subscribeToRoom('general');

    // Периодическая проверка новых сообщений (для бейджа)
    setInterval(checkNewMessages, 10000);

    // Очищаем бейдж при открытии чата
    document.addEventListener('click', (e) => {
        if (isChatOpen) clearBadge();
    });
}

// ---------- HTML-шаблон ----------
function getChatHTML() {
    return `
        <div id="chatGlobalContainer" class="fixed inset-0 pointer-events-none z-[999]">
            <!-- Плавающая кнопка -->
            <button id="chatFab" class="fixed bottom-6 right-6 pointer-events-auto bg-cyan-600/80 hover:bg-cyan-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center w-14 h-14 backdrop-blur-sm transform hover:scale-105">
                <span class="text-2xl">💬</span>
                <span id="chatBadge" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center hidden animate-pulse">0</span>
            </button>

            <!-- Окно чата -->
            <div id="chatWindow" class="fixed inset-0 md:inset-auto md:bottom-24 md:right-6 md:w-[480px] md:h-[650px] bg-white shadow-2xl border border-gray-200 pointer-events-auto flex flex-col hidden max-h-screen max-w-screen overflow-hidden rounded-none md:rounded-3xl transition-all duration-300 transform scale-95 opacity-0 md:scale-100 md:opacity-100">
                <!-- Шапка -->
                <div class="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-4 flex justify-between items-center flex-shrink-0 rounded-t-none md:rounded-t-3xl">
                    <div class="flex items-center gap-3">
                        <span class="text-2xl">💬</span>
                        <span class="font-bold text-lg">Чат</span>
                        <span id="chatRoomName" class="text-sm font-medium bg-white/20 px-3 py-0.5 rounded-full">Общий</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <button id="chatMinimizeBtn" class="text-white hover:text-gray-200 text-xl leading-none transition">−</button>
                        <button id="chatCloseBtn" class="text-white hover:text-gray-200 text-xl leading-none transition">✕</button>
                    </div>
                </div>

                <!-- Управление комнатами и личными чатами -->
                <div class="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-gray-50 p-3 flex-shrink-0">
                    <select id="chatRoomSelect" class="bg-gray-50 border border-gray-300 rounded-xl px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-cyan-400 focus:border-transparent flex-1 min-w-[120px]">
                        <option value="general">Общий</option>
                        <option value="repair">Ремонтная бригада</option>
                        <option value="dispatch">Диспетчерская</option>
                    </select>
                    <select id="chatUserSelect" class="bg-gray-50 border border-gray-300 rounded-xl px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-cyan-400 focus:border-transparent flex-1 min-w-[140px]">
                        <option value="">Личное сообщение</option>
                    </select>
                </div>

                <!-- Сообщения -->
                <div id="chatMessages" class="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
                    <div class="text-center text-gray-400 py-8 text-sm">Загрузка сообщений...</div>
                </div>

                <!-- Поле ввода -->
                <div class="border-t border-gray-200 p-3 flex gap-2 items-center bg-white flex-shrink-0 rounded-b-none md:rounded-b-3xl">
                    <input type="text" id="chatInput" placeholder="Введите сообщение..." class="flex-1 bg-gray-100 border-0 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-cyan-400 outline-none transition">
                    <button id="chatSendBtn" class="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-sm hover:shadow-md transform hover:scale-105">➤</button>
                </div>
            </div>
        </div>
    `;
}

// ---------- Управление отображением ----------
function toggleChat() {
    const window = document.getElementById('chatWindow');
    const fab = document.getElementById('chatFab');
    if (window.classList.contains('hidden')) {
        // Открываем
        window.classList.remove('hidden');
        fab.classList.add('hidden');
        isChatOpen = true;
        clearBadge();
        // Загружаем свежие сообщения
        loadMessages(currentRoom);
        renderMessages();
        // Анимация появления
        window.classList.add('scale-100', 'opacity-100');
        window.classList.remove('scale-95', 'opacity-0');
    } else {
        // Закрываем
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

// ---------- Переключение комнаты ----------
function switchChatRoom(room) {
    if (room === currentRoom && !currentReceiver) return;
    currentRoom = room;
    currentReceiver = null;

    // Обновляем название комнаты
    const roomNameMap = {
        'general': 'Общий',
        'repair': 'Ремонтная бригада',
        'dispatch': 'Диспетчерская'
    };
    document.getElementById('chatRoomName').textContent = roomNameMap[room] || room;

    // Отписываемся от старой комнаты
    if (chatSubscription) {
        chatSubscription.unsubscribe();
        chatSubscription = null;
    }

    // Загружаем сообщения новой комнаты
    loadMessages(room);
    renderMessages();
    subscribeToRoom(room);

    // Сбрасываем выбор пользователя, если был выбран
    const userSelect = document.getElementById('chatUserSelect');
    if (userSelect) userSelect.value = '';
}

// ---------- Загрузка пользователей ----------
async function loadUsers() {
    if (!window._supabase) return;
    try {
        // Получаем список пользователей из таблицы users (или из vehicles)
        const { data, error } = await window._supabase
            .from('vehicles')
            .select('notes')
            .not('notes', 'is', null)
            .order('notes');
        if (error) throw error;

        // Извлекаем уникальные имена из поля notes (водители/механизаторы)
        const users = data.map(v => v.notes).filter(Boolean);
        const uniqueUsers = [...new Set(users)];

        // Добавляем текущего пользователя
        const currentUser = localStorage.getItem('user_name') || 'Сотрудник';
        if (!uniqueUsers.includes(currentUser)) {
            uniqueUsers.unshift(currentUser);
        }

        // Заполняем select
        const select = document.getElementById('chatUserSelect');
        if (select) {
            select.innerHTML = '<option value="">Личное сообщение</option>' +
                uniqueUsers.map(u => `<option value="${u}">${u}</option>`).join('');
        }
    } catch (err) {
        console.error('Ошибка загрузки пользователей:', err);
    }
}

// ---------- Загрузка сообщений ----------
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

// ---------- Рендеринг сообщений с анимацией ----------
function renderMessages() {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    if (messages.length === 0) {
        container.innerHTML = '<div class="text-center text-gray-400 py-8 text-sm animate-fade-in-up">Нет сообщений. Напишите первое!</div>';
        return;
    }

    const roleColors = {
        'Директор': 'bg-red-100 text-red-800',
        'Инженер по ЭМТП': 'bg-blue-100 text-blue-800',
        'Техник': 'bg-green-100 text-green-800',
        'Заместитель директора': 'bg-purple-100 text-purple-800'
    };

    let html = '';
    messages.forEach((msg, index) => {
        const colorClass = roleColors[msg.user_role] || 'bg-gray-100 text-gray-800';
        const time = new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        const date = new Date(msg.created_at).toLocaleDateString('ru-RU');

        // Анимация для каждого сообщения (задержка по индексу)
        const delay = Math.min(index * 30, 300);
        html += `
            <div class="flex items-start gap-3 animate-fade-in-up" style="animation-delay: ${delay}ms">
                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-sm">
                    ${msg.user_name ? msg.user_name.charAt(0).toUpperCase() : '?'}
                </div>
                <div class="flex-1">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-bold text-gray-800 text-sm">${msg.user_name || 'Неизвестный'}</span>
                        <span class="text-xs font-bold px-2 py-0.5 rounded-full ${colorClass}">${msg.user_role || 'Сотрудник'}</span>
                        <span class="text-xs text-gray-400">${date} ${time}</span>
                    </div>
                    <div class="text-sm text-gray-700 mt-0.5 break-words bg-white p-2 rounded-lg shadow-sm inline-block max-w-full">${msg.message}</div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
}

// ---------- Подписка на Realtime ----------
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

// ---------- Отправка сообщения ----------
async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;

    const user_name = localStorage.getItem('user_name') || 'Сотрудник';
    const user_role = localStorage.getItem('user_role') || 'Сотрудник';

    // Определяем комнату: если выбран личный получатель – создаём private_комнату
    const receiver = document.getElementById('chatUserSelect').value;
    let room = currentRoom;
    if (receiver) {
        room = `private_${receiver}`;
        // Обновляем название комнаты в шапке
        document.getElementById('chatRoomName').textContent = `Личное: ${receiver}`;
    } else {
        document.getElementById('chatRoomName').textContent = document.getElementById('chatRoomSelect').selectedOptions[0].text;
    }

    const payload = {
        room: room,
        user_name: user_name,
        user_role: user_role,
        message: text,
        created_at: new Date().toISOString()
    };

    try {
        const { error } = await window._supabase
            .from('chat_messages')
            .insert([payload]);
        if (error) throw error;
        input.value = '';
        // Realtime автоматически добавит сообщение
    } catch (err) {
        console.error('Ошибка отправки:', err);
        alert('Ошибка отправки: ' + err.message);
    }
}

// ---------- Уведомления (бейдж) ----------
function showBadge(count) {
    const badge = document.getElementById('chatBadge');
    if (badge) {
        // Если уже есть число, суммируем
        const current = parseInt(badge.textContent) || 0;
        badge.textContent = current + count;
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

// ---------- Периодическая проверка новых сообщений ----------
async function checkNewMessages() {
    if (!window._supabase) return;
    if (isChatOpen) {
        clearBadge();
        return;
    }
    try {
        // Проверяем сообщения за последнюю минуту в текущей комнате
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

// ---------- Глобальные функции для доступа из HTML ----------
window.toggleChat = toggleChat;
window.minimizeChat = minimizeChat;
window.sendChatMessage = sendChatMessage;
window.switchChatRoom = switchChatRoom;

// ---------- CSS-анимации (добавляем в head, если их нет) ----------
function addAnimationsCSS() {
    if (document.getElementById('chatAnimationsStyle')) return;
    const style = document.createElement('style');
    style.id = 'chatAnimationsStyle';
    style.textContent = `
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fadeInUp 0.3s ease-out forwards;
            opacity: 0;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        .animate-pulse {
            animation: pulse 1s infinite;
        }
    `;
    document.head.appendChild(style);
}
addAnimationsCSS();