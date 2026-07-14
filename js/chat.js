// js/chat.js

let currentRoom = 'general';
let messages = [];
let chatSubscription = null;
let isChatOpen = false;

export async function init() {
    console.log('💬 Глобальный чат инициализирован');

    if (!document.getElementById('chatGlobalContainer')) {
        document.body.insertAdjacentHTML('beforeend', getChatHTML());
    }

    document.getElementById('chatFab').addEventListener('click', toggleChat);
    document.getElementById('chatCloseBtn').addEventListener('click', toggleChat);
    document.getElementById('chatMinimizeBtn').addEventListener('click', minimizeChat);
    document.getElementById('chatSendBtn').addEventListener('click', sendChatMessage);
    document.getElementById('chatInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });

    await loadMessages('general');
    renderMessages();
    subscribeToRoom('general');

    document.getElementById('chatRoomSelect')?.addEventListener('change', (e) => {
        switchChatRoom(e.target.value);
    });

    setInterval(checkNewMessages, 15000);
}

function getChatHTML() {
    return `
        <div id="chatGlobalContainer" class="fixed inset-0 pointer-events-none z-[999]">
            <button id="chatFab" class="fixed bottom-6 right-6 pointer-events-auto bg-cyan-600/80 hover:bg-cyan-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center w-14 h-14 backdrop-blur-sm">
                <span class="text-2xl">💬</span>
                <span id="chatBadge" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center hidden">0</span>
            </button>

            <div id="chatWindow" class="fixed inset-0 md:inset-auto md:bottom-24 md:right-6 md:w-[450px] md:h-[600px] bg-white shadow-2xl border border-gray-200 pointer-events-auto flex flex-col hidden max-h-screen max-w-screen overflow-hidden rounded-none md:rounded-3xl">
                <div class="bg-cyan-600 text-white p-4 flex justify-between items-center flex-shrink-0">
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

                <div class="flex border-b border-gray-200 bg-gray-50 p-2 gap-1 overflow-x-auto flex-shrink-0">
                    <select id="chatRoomSelect" class="bg-gray-50 border border-gray-300 rounded-xl px-3 py-1 text-sm font-medium focus:ring-2 focus:ring-cyan-400 focus:border-transparent">
                        <option value="general">Общий</option>
                        <option value="repair">Ремонтная бригада</option>
                        <option value="dispatch">Диспетчерская</option>
                    </select>
                </div>

                <div id="chatMessages" class="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
                    <div class="text-center text-gray-400 py-8 text-sm">Загрузка сообщений...</div>
                </div>

                <div class="border-t border-gray-200 p-3 flex gap-2 items-center bg-white flex-shrink-0">
                    <input type="text" id="chatInput" placeholder="Введите сообщение..." class="flex-1 bg-gray-100 border-0 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-cyan-400 outline-none">
                    <button id="chatSendBtn" class="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition shadow-sm">➤</button>
                </div>
            </div>
        </div>
    `;
}

function toggleChat() {
    const window = document.getElementById('chatWindow');
    const fab = document.getElementById('chatFab');
    if (window.classList.contains('hidden')) {
        window.classList.remove('hidden');
        fab.classList.add('hidden');
        isChatOpen = true;
        clearBadge();
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

function switchChatRoom(room) {
    if (room === currentRoom) return;
    currentRoom = room;
    document.getElementById('chatRoomName').textContent = room === 'general' ? 'Общий' : room;
    if (chatSubscription) {
        chatSubscription.unsubscribe();
        chatSubscription = null;
    }
    loadMessages(room);
    renderMessages();
    subscribeToRoom(room);
}

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
    } catch (err) {
        console.error('Ошибка загрузки сообщений:', err);
    }
}

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
                    ${msg.user_name ? msg.user_name.charAt(0) : '?'}
                </div>
                <div class="flex-1">
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-gray-800 text-sm">${msg.user_name || 'Неизвестный'}</span>
                        <span class="text-xs font-bold px-2 py-0.5 rounded-full ${colorClass}">${msg.user_role || 'Сотрудник'}</span>
                        <span class="text-xs text-gray-400">${date} ${time}</span>
                    </div>
                    <div class="text-sm text-gray-700 mt-0.5 break-words">${msg.message}</div>
                </div>
            </div>
        `;
    }).join('');
    container.scrollTop = container.scrollHeight;
}

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
            if (!isChatOpen) {
                showBadge(1);
            }
        })
        .subscribe();
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;

    const user_name = localStorage.getItem('user_name') || 'Сотрудник';
    const user_role = localStorage.getItem('user_role') || 'Сотрудник';

    const payload = {
        room: currentRoom,
        user_name: user_name,
        user_role: user_role,
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
        // Realtime автоматически добавит сообщение
    } catch (err) {
        console.error('Ошибка отправки:', err);
        alert('Ошибка отправки: ' + err.message);
    }
}

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

// Глобальные функции
window.toggleChat = toggleChat;
window.minimizeChat = minimizeChat;
window.sendChatMessage = sendChatMessage;
window.switchChatRoom = switchChatRoom;