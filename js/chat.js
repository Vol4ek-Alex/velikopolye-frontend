// js/chat.js

export const template = `
    <!-- Плавающая кнопка -->
    <button id="chatFab" onclick="window.toggleChat()" class="fixed bottom-6 right-6 z-50 bg-cyan-600 hover:bg-cyan-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center w-14 h-14">
        <span id="chatFabIcon" class="text-2xl">💬</span>
        <span id="chatBadge" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center hidden">0</span>
    </button>

    <!-- Окно чата -->
    <div id="chatWindow" class="fixed inset-0 md:inset-auto md:bottom-24 md:right-6 md:w-[450px] md:h-[600px] bg-white rounded-3xl shadow-2xl border border-gray-200 z-50 flex flex-col hidden transition-all duration-300">
        <!-- Шапка -->
        <div class="bg-cyan-600 text-white p-4 rounded-t-3xl flex justify-between items-center">
            <div class="flex items-center gap-3">
                <span class="text-2xl">💬</span>
                <span class="font-bold">Чат</span>
                <span id="chatRoomName" class="text-sm font-medium bg-cyan-500 px-2 py-0.5 rounded-full">Общий</span>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="window.minimizeChat()" class="text-white hover:text-gray-200 text-xl leading-none">−</button>
                <button onclick="window.toggleChat()" class="text-white hover:text-gray-200 text-xl leading-none">✕</button>
            </div>
        </div>

        <!-- Список комнат / пользователей -->
        <div id="chatSidebar" class="flex border-b border-gray-200 bg-gray-50 p-2 gap-1 overflow-x-auto">
            <button onclick="window.switchChatRoom('general')" data-room="general" class="px-3 py-1 text-xs font-bold rounded-full bg-cyan-600 text-white whitespace-nowrap">Общий</button>
            <div id="chatUserList" class="flex gap-1 overflow-x-auto"></div>
        </div>

        <!-- Сообщения -->
        <div id="chatMessages" class="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
            <div class="text-center text-gray-400 py-8 text-sm">Загрузка сообщений...</div>
        </div>

        <!-- Поле ввода + кнопки -->
        <div class="border-t border-gray-200 p-3 flex gap-2 items-center bg-white rounded-b-3xl">
            <button onclick="window.chatAttachFile()" class="text-gray-500 hover:text-cyan-600 transition text-xl">📎</button>
            <input type="text" id="chatInput" placeholder="Введите сообщение..." class="flex-1 bg-gray-100 border-0 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-cyan-400 outline-none">
            <button onclick="window.sendChatMessage()" class="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition shadow-sm">➤</button>
        </div>
    </div>
`;

// ===== Глобальные переменные =====
let currentRoom = 'general';
let chatSubscription = null;
let messages = [];
let chatUsers = [];
let unreadCount = 0;
let isChatOpen = false;
let fileInput = null;

// ===== Инициализация =====
export async function init() {
    console.log('💬 Модуль чата инициализирован');

    window.toggleChat = toggleChat;
    window.minimizeChat = minimizeChat;
    window.sendChatMessage = sendChatMessage;
    window.switchChatRoom = switchChatRoom;
    window.chatAttachFile = chatAttachFile;

    // Создаём скрытый input для файлов
    fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.style.display = 'none';
    fileInput.accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt';
    fileInput.addEventListener('change', handleFileUpload);
    document.body.appendChild(fileInput);

    // Загружаем пользователей чата
    await loadChatUsers();

    // Загружаем сохранённую комнату
    const savedRoom = localStorage.getItem('chat_room') || 'general';
    currentRoom = savedRoom;
    document.getElementById('chatRoomName').textContent = savedRoom === 'general' ? 'Общий' : 'Личные';

    // Загружаем сообщения
    await loadMessages(currentRoom);
    renderMessages();

    // Подписываемся на Realtime
    subscribeToRoom(currentRoom);

    // Отправка по Enter
    document.getElementById('chatInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });

    // Периодическое обновление непрочитанных
    setInterval(updateUnreadBadge, 5000);
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
        console.log(`✅ Загружено ${chatUsers.length} пользователей чата`);
        renderUserList();
    } catch (err) {
        console.error('Ошибка загрузки пользователей:', err);
    }
}

// ===== Рендеринг списка пользователей =====
function renderUserList() {
    const container = document.getElementById('chatUserList');
    if (!container) return;
    const currentUser = localStorage.getItem('user_name') || 'Сотрудник';
    container.innerHTML = chatUsers
        .filter(u => u.name !== currentUser)
        .map(u => `
            <button onclick="window.switchChatRoom('private_${u.id}')" class="px-3 py-1 text-xs font-bold rounded-full bg-gray-200 text-gray-700 hover:bg-cyan-100 whitespace-nowrap transition">
                ${u.avatar || '👤'} ${u.name}
                ${u.online ? '<span class="w-2 h-2 inline-block rounded-full bg-green-500 ml-1"></span>' : ''}
            </button>
        `).join('');
}

// ===== Переключение комнаты =====
function switchChatRoom(room) {
    if (room === currentRoom) return;
    currentRoom = room;
    localStorage.setItem('chat_room', room);
    document.getElementById('chatRoomName').textContent = room === 'general' ? 'Общий' : 'Личные';

    // Отписываемся от старой комнаты
    if (chatSubscription) {
        chatSubscription.unsubscribe();
        chatSubscription = null;
    }

    // Загружаем сообщения новой комнаты
    loadMessages(room);
    renderMessages();
    subscribeToRoom(room);
}

window.switchChatRoom = switchChatRoom;

// ===== Загрузка сообщений =====
async function loadMessages(room) {
    if (!window._supabase) return;
    try {
        let query = window._supabase
            .from('chat_messages')
            .select('*')
            .eq('room', room)
            .order('created_at', { ascending: true })
            .limit(200);
        const { data, error } = await query;
        if (error) throw error;
        messages = data || [];
        // Сбрасываем счётчик непрочитанных для этой комнаты
        if (room === currentRoom) {
            await markMessagesAsRead(room);
        }
        console.log(`✅ Загружено ${messages.length} сообщений для комнаты ${room}`);
    } catch (err) {
        console.error('Ошибка загрузки сообщений:', err);
    }
}

// ===== Отметить сообщения как прочитанные =====
async function markMessagesAsRead(room) {
    if (!window._supabase) return;
    try {
        const { error } = await window._supabase
            .from('chat_messages')
            .update({ is_read: true })
            .eq('room', room)
            .eq('is_read', false);
        if (error) throw error;
    } catch (err) {
        console.error('Ошибка отметки прочитанных:', err);
    }
}

// ===== Рендеринг сообщений =====
function renderMessages() {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    if (messages.length === 0) {
        container.innerHTML = `<div class="text-center text-gray-400 py-8 text-sm">Нет сообщений. Напишите первое!</div>`;
        return;
    }

    const currentUser = localStorage.getItem('user_name') || 'Сотрудник';

    container.innerHTML = messages.map(msg => {
        const isMine = msg.sender_name === currentUser;
        const time = new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        const date = new Date(msg.created_at).toLocaleDateString('ru-RU');

        let content = '';
        if (msg.message) {
            content = `<div class="text-sm break-words">${msg.message}</div>`;
        }
        if (msg.file_url) {
            const isImage = msg.file_type && msg.file_type.startsWith('image/');
            if (isImage) {
                content += `<div class="mt-1"><a href="${msg.file_url}" target="_blank"><img src="${msg.file_url}" class="max-w-full max-h-48 rounded-lg border border-gray-200"></a></div>`;
            } else {
                content += `<div class="mt-1"><a href="${msg.file_url}" target="_blank" class="text-cyan-600 hover:underline">📎 ${msg.file_name || 'Файл'}</a></div>`;
            }
        }

        const bubbleClass = isMine
            ? 'bg-cyan-600 text-white rounded-br-none'
            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none';

        return `
            <div class="flex ${isMine ? 'justify-end' : 'justify-start'}">
                <div class="max-w-[80%]">
                    <div class="flex items-center gap-2 mb-0.5">
                        <span class="text-xs font-bold text-gray-600">${isMine ? 'Вы' : msg.sender_name}</span>
                        <span class="text-[10px] text-gray-400">${date} ${time}</span>
                    </div>
                    <div class="p-3 rounded-2xl shadow-sm ${bubbleClass}">
                        ${content}
                    </div>
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
            const msg = payload.new;
            // Если сообщение от другого пользователя и комната текущая – добавляем
            if (msg.sender_name !== localStorage.getItem('user_name')) {
                messages.push(msg);
                renderMessages();
                // Увеличиваем счётчик непрочитанных, если чат закрыт
                if (!isChatOpen) {
                    unreadCount++;
                    updateUnreadBadge();
                }
                // Отмечаем как прочитанное, если чат открыт
                if (isChatOpen) {
                    markMessagesAsRead(room);
                }
            }
        })
        .subscribe();

    // Подписка на изменения пользователей (онлайн-статус)
    window._supabase
        .channel('chat_users')
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'chat_users'
        }, () => {
            loadChatUsers();
        })
        .subscribe();
}

// ===== Отправка сообщения =====
async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;

    const userName = localStorage.getItem('user_name') || 'Сотрудник';
    const userRole = localStorage.getItem('user_role') || 'Сотрудник';

    // Определяем получателя для личных сообщений
    let receiverId = null;
    if (currentRoom.startsWith('private_')) {
        const targetId = currentRoom.replace('private_', '');
        receiverId = targetId;
    }

    const payload = {
        room: currentRoom,
        sender_id: null, // можно добавить ID пользователя
        sender_name: userName,
        sender_role: userRole,
        receiver_id: receiverId,
        message: text,
        is_read: false
    };

    try {
        const { error } = await window._supabase
            .from('chat_messages')
            .insert([payload]);
        if (error) throw error;
        input.value = '';
        // Добавляем сообщение локально
        messages.push({ ...payload, created_at: new Date().toISOString() });
        renderMessages();
    } catch (err) {
        alert('Ошибка отправки: ' + err.message);
    }
}

window.sendChatMessage = sendChatMessage;

// ===== Вложение файлов =====
function chatAttachFile() {
    if (fileInput) {
        fileInput.click();
    }
}

async function handleFileUpload(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const userName = localStorage.getItem('user_name') || 'Сотрудник';
    const userRole = localStorage.getItem('user_role') || 'Сотрудник';

    for (const file of files) {
        try {
            // Загружаем файл в Storage
            const filePath = `chat/${Date.now()}_${file.name}`;
            const { data, error } = await window._supabase.storage
                .from('chat-files')
                .upload(filePath, file);

            if (error) throw error;

            // Получаем публичную ссылку
            const { data: urlData } = window._supabase.storage
                .from('chat-files')
                .getPublicUrl(filePath);

            const fileUrl = urlData.publicUrl;

            let receiverId = null;
            if (currentRoom.startsWith('private_')) {
                const targetId = currentRoom.replace('private_', '');
                receiverId = targetId;
            }

            const payload = {
                room: currentRoom,
                sender_id: null,
                sender_name: userName,
                sender_role: userRole,
                receiver_id: receiverId,
                message: null,
                file_url: fileUrl,
                file_name: file.name,
                file_type: file.type,
                is_read: false
            };

            const { error: msgError } = await window._supabase
                .from('chat_messages')
                .insert([payload]);
            if (msgError) throw msgError;

            messages.push({ ...payload, created_at: new Date().toISOString() });
            renderMessages();

        } catch (err) {
            alert('Ошибка загрузки файла: ' + err.message);
        }
    }

    fileInput.value = '';
}

window.chatAttachFile = chatAttachFile;

// ===== Управление окном чата =====
function toggleChat() {
    const windowEl = document.getElementById('chatWindow');
    const fabIcon = document.getElementById('chatFabIcon');
    isChatOpen = !isChatOpen;
    if (isChatOpen) {
        windowEl.classList.remove('hidden');
        fabIcon.textContent = '✕';
        // Отмечаем сообщения как прочитанные
        markMessagesAsRead(currentRoom);
        unreadCount = 0;
        updateUnreadBadge();
        // Подгружаем пользователей
        loadChatUsers();
    } else {
        windowEl.classList.add('hidden');
        fabIcon.textContent = '💬';
    }
}

function minimizeChat() {
    document.getElementById('chatWindow').classList.add('hidden');
    document.getElementById('chatFabIcon').textContent = '💬';
    isChatOpen = false;
}

window.toggleChat = toggleChat;
window.minimizeChat = minimizeChat;

// ===== Обновление бейджа непрочитанных =====
function updateUnreadBadge() {
    const badge = document.getElementById('chatBadge');
    if (unreadCount > 0) {
        badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// ===== Инициализация при загрузке модуля =====
setTimeout(() => {
    if (window._supabase) {
        // Проверяем, есть ли пользователи в chat_users, если нет – добавляем из localStorage
        loadChatUsers();
    }
}, 100);