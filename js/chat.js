// js/chat.js

export const template = `
<div class="space-y-6 h-full flex flex-col">
    <!-- Верхняя панель -->
    <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0">
        <div>
            <h2 class="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <span class="bg-cyan-100 p-1.5 rounded-lg">💬</span> Чат
            </h2>
            <p class="text-sm text-gray-500 font-medium">Общение и обмен файлами</p>
        </div>
        <div class="flex gap-2">
            <select id="chatRoomSelect" class="bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-cyan-400 focus:border-transparent">
                <option value="general">Общий</option>
                <option value="repair">Ремонтная бригада</option>
                <option value="dispatch">Диспетчерская</option>
                <option value="management">Руководство</option>
                <option value="direct">💬 Личные</option>
            </select>
            <button onclick="window.switchChatRoom()" class="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition shadow-sm hover-lift">Перейти</button>
            <button onclick="window.openNewDirectChat()" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition shadow-sm hover-lift">➕ Личный чат</button>
        </div>
    </div>

    <!-- Список личных чатов (боковая панель) -->
    <div id="directChatsPanel" class="hidden bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex-shrink-0">
        <h3 class="text-sm font-bold text-gray-700 mb-2">Личные чаты</h3>
        <div id="directChatsList" class="space-y-1 max-h-40 overflow-y-auto">
            <div class="text-gray-400 text-sm py-2 text-center">Нет личных чатов</div>
        </div>
    </div>

    <!-- Окно чата -->
    <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col flex-1 min-h-[400px]">
        <div id="chatMessages" class="flex-1 p-4 overflow-y-auto space-y-3">
            <div class="text-center text-gray-400 py-8 text-sm">Загрузка сообщений...</div>
        </div>
        <!-- Панель ввода -->
        <div class="border-t border-gray-200 p-3 flex flex-col gap-2">
            <div id="filePreviewContainer" class="hidden flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-200">
                <span id="filePreviewName" class="text-sm font-medium text-gray-700 truncate"></span>
                <button onclick="window.clearFileAttachment()" class="text-red-500 hover:text-red-700 text-sm">✕</button>
            </div>
            <div class="flex gap-2">
                <button onclick="document.getElementById('fileInput').click()" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2.5 rounded-xl text-sm font-bold transition shadow-sm flex-shrink-0">📎</button>
                <input type="file" id="fileInput" class="hidden" multiple accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.txt,.xls,.xlsx">
                <input type="text" id="chatInput" placeholder="Введите сообщение..." class="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-cyan-400 focus:border-transparent">
                <button onclick="window.sendChatMessage()" class="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-sm hover-lift flex-shrink-0">Отправить</button>
            </div>
        </div>
    </div>

    <!-- Модалка для выбора пользователя для личного чата -->
    <div id="directChatModal" class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm hidden z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl w-full max-w-sm p-6 border border-gray-200 shadow-2xl space-y-4 relative modal-enter">
            <button onclick="window.closeDirectChatModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-900 font-bold text-xl transition">✕</button>
            <h3 class="text-xl font-extrabold text-gray-900 border-b border-gray-100 pb-3">Новый личный чат</h3>
            <div>
                <label class="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Выберите пользователя</label>
                <select id="directChatUserSelect" class="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-cyan-400 focus:border-transparent">
                    <option value="">-- Загрузка --</option>
                </select>
            </div>
            <button onclick="window.startDirectChat()" class="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2.5 rounded-xl font-bold transition shadow-md hover-lift">Начать чат</button>
        </div>
    </div>
</div>
`;

// ===== Глобальные переменные =====
let currentRoom = 'general';
let currentRoomType = 'group'; // 'group' или 'direct'
let chatSubscription = null;
let messages = [];
let directChats = [];
let selectedFiles = [];
let userList = [];
let currentUser = { name: '', role: '' };

// ===== Инициализация =====
export async function init() {
    console.log('💬 Модуль чата инициализирован');

    // Получаем текущего пользователя
    const user_name = localStorage.getItem('user_name') || 'Сотрудник';
    const user_role = localStorage.getItem('user_role') || 'Сотрудник';
    currentUser = { name: user_name, role: user_role };

    window.sendChatMessage = sendChatMessage;
    window.switchChatRoom = switchChatRoom;
    window.openNewDirectChat = openNewDirectChat;
    window.closeDirectChatModal = closeDirectChatModal;
    window.startDirectChat = startDirectChat;
    window.clearFileAttachment = clearFileAttachment;

    // Загружаем сохранённую комнату
    const savedRoom = localStorage.getItem('chat_room') || 'general';
    const savedType = localStorage.getItem('chat_room_type') || 'group';
    document.getElementById('chatRoomSelect').value = savedRoom;
    currentRoom = savedRoom;
    currentRoomType = savedType;

    // Загружаем список пользователей (для личных чатов)
    await loadUsers();

    // Загружаем сообщения
    await loadMessages(currentRoom, currentRoomType);
    renderMessages();

    // Подписываемся на Realtime
    subscribeToRoom(currentRoom, currentRoomType);

    // Отправка по Enter
    document.getElementById('chatInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });

    // Обработчик выбора файлов
    document.getElementById('fileInput').addEventListener('change', (e) => {
        selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 0) {
            const preview = document.getElementById('filePreviewContainer');
            const nameEl = document.getElementById('filePreviewName');
            preview.classList.remove('hidden');
            nameEl.textContent = selectedFiles.map(f => f.name).join(', ');
        }
    });

    // Загружаем личные чаты
    await loadDirectChats();
    renderDirectChats();
}

// ===== Загрузка списка пользователей =====
async function loadUsers() {
    // Здесь можно загружать из таблицы users, но у нас пока нет таблицы.
    // Используем статический список или данные из автопарка (водители, механики).
    // В реальном проекте – запрос к таблице users.
    // Пока сделаем статику + текущего пользователя.
    const allUsers = [
        { name: 'Волчек А.А.', role: 'Инженер по ЭМТП' },
        { name: 'Рунцевич Д.С.', role: 'Директор' },
        { name: 'Ладутько И.И.', role: 'Техник' },
        { name: 'Макович М.П.', role: 'Заместитель директора' }
    ];
    // Добавляем всех, кроме текущего
    userList = allUsers.filter(u => u.name !== currentUser.name);
    // Заполняем select
    const select = document.getElementById('directChatUserSelect');
    if (select) {
        select.innerHTML = userList.map(u => `<option value="${u.name}">${u.name} (${u.role})</option>`).join('');
    }
}

// ===== Загрузка личных чатов =====
async function loadDirectChats() {
    if (!window._supabase) return;
    try {
        // Ищем все личные чаты текущего пользователя
        const { data, error } = await window._supabase
            .from('chat_messages')
            .select('room_id')
            .eq('room_type', 'direct')
            .or(`sender_name.eq.${currentUser.name}`)
            .order('created_at', { ascending: false });
        if (error) throw error;
        // Уникальные room_id
        const roomIds = [...new Set(data.map(item => item.room_id))];
        directChats = roomIds.map(id => {
            const users = id.split('_');
            const other = users.find(u => u !== currentUser.name);
            return { roomId: id, otherName: other };
        });
    } catch (err) {
        console.error('Ошибка загрузки личных чатов:', err);
    }
}

function renderDirectChats() {
    const container = document.getElementById('directChatsList');
    if (!container) return;
    if (directChats.length === 0) {
        container.innerHTML = '<div class="text-gray-400 text-sm py-2 text-center">Нет личных чатов</div>';
        return;
    }
    container.innerHTML = directChats.map(chat => `
        <div class="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition" onclick="window.switchToDirectChat('${chat.roomId}')">
            <span class="text-sm font-medium text-gray-700">💬 ${chat.otherName}</span>
            <span class="text-xs text-cyan-600">→</span>
        </div>
    `).join('');
}

window.switchToDirectChat = (roomId) => {
    currentRoom = roomId;
    currentRoomType = 'direct';
    localStorage.setItem('chat_room', roomId);
    localStorage.setItem('chat_room_type', 'direct');
    document.getElementById('chatRoomSelect').value = 'direct';
    // Перезагружаем сообщения
    loadMessages(roomId, 'direct');
    renderMessages();
    subscribeToRoom(roomId, 'direct');
};

// ===== Переключение комнаты =====
function switchChatRoom() {
    const select = document.getElementById('chatRoomSelect');
    const room = select.value;
    if (room === 'direct') {
        // Показываем панель личных чатов
        document.getElementById('directChatsPanel').classList.remove('hidden');
        // Если есть первый диалог, загружаем его, иначе ничего
        if (directChats.length > 0) {
            const first = directChats[0];
            currentRoom = first.roomId;
            currentRoomType = 'direct';
            localStorage.setItem('chat_room', first.roomId);
            localStorage.setItem('chat_room_type', 'direct');
            loadMessages(first.roomId, 'direct');
            renderMessages();
            subscribeToRoom(first.roomId, 'direct');
        } else {
            // Пустое состояние
            document.getElementById('chatMessages').innerHTML = '<div class="text-center text-gray-400 py-8 text-sm">Выберите личный чат или создайте новый</div>';
        }
        return;
    } else {
        document.getElementById('directChatsPanel').classList.add('hidden');
    }

    if (room === currentRoom && currentRoomType === 'group') return;
    currentRoom = room;
    currentRoomType = 'group';
    localStorage.setItem('chat_room', room);
    localStorage.setItem('chat_room_type', 'group');

    // Отписываемся от старой подписки
    if (chatSubscription) {
        chatSubscription.unsubscribe();
        chatSubscription = null;
    }

    loadMessages(room, 'group');
    renderMessages();
    subscribeToRoom(room, 'group');
}

window.switchChatRoom = switchChatRoom;

// ===== Загрузка сообщений =====
async function loadMessages(room, type) {
    if (!window._supabase) return;
    try {
        const query = window._supabase
            .from('chat_messages')
            .select('*')
            .eq('room_type', type)
            .eq('room_id', room)
            .order('created_at', { ascending: true })
            .limit(100);
        const { data, error } = await query;
        if (error) throw error;
        messages = data || [];
        console.log(`✅ Загружено ${messages.length} сообщений для ${type}/${room}`);
    } catch (err) {
        console.error('Ошибка загрузки сообщений:', err);
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

    const roleColors = {
        'Директор': 'bg-red-100 text-red-800',
        'Инженер по ЭМТП': 'bg-blue-100 text-blue-800',
        'Техник': 'bg-green-100 text-green-800',
        'Заместитель директора': 'bg-purple-100 text-purple-800'
    };

    container.innerHTML = messages.map(msg => {
        const isOwn = msg.sender_name === currentUser.name;
        const colorClass = roleColors[msg.sender_role] || 'bg-gray-100 text-gray-800';
        const time = new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        const date = new Date(msg.created_at).toLocaleDateString('ru-RU');
        const alignClass = isOwn ? 'flex-row-reverse' : '';
        const bgClass = isOwn ? 'bg-cyan-50 border-cyan-200' : 'bg-gray-50 border-gray-200';

        let contentHtml = '';
        if (msg.message) {
            contentHtml += `<div class="text-sm text-gray-700 break-words">${msg.message}</div>`;
        }
        if (msg.file_url) {
            const isImage = msg.file_type && msg.file_type.startsWith('image/');
            if (isImage) {
                contentHtml += `<a href="${msg.file_url}" target="_blank"><img src="${msg.file_url}" class="max-w-[200px] max-h-[200px] rounded-lg border border-gray-200 mt-1"></a>`;
            } else {
                contentHtml += `<a href="${msg.file_url}" target="_blank" class="text-cyan-600 underline text-sm flex items-center gap-1 mt-1">📎 ${msg.file_name || 'Файл'}</a>`;
            }
        }

        return `
            <div class="flex items-start gap-3 ${alignClass}">
                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-sm">
                    ${msg.sender_name.charAt(0)}
                </div>
                <div class="flex-1 max-w-[75%]">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-bold text-gray-800 text-sm">${msg.sender_name}</span>
                        <span class="text-xs font-bold px-2 py-0.5 rounded-full ${colorClass}">${msg.sender_role}</span>
                        <span class="text-xs text-gray-400">${date} ${time}</span>
                        ${isOwn ? `<button onclick="window.deleteMessage('${msg.id}')" class="text-red-400 hover:text-red-600 text-xs">🗑️</button>` : ''}
                        ${msg.is_edited ? `<span class="text-xs text-gray-400">(ред.)</span>` : ''}
                    </div>
                    <div class="p-2 rounded-xl border ${bgClass} mt-0.5">
                        ${contentHtml}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.scrollTop = container.scrollHeight;
}

// ===== Подписка на Realtime =====
function subscribeToRoom(room, type) {
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
            filter: `room_id=eq.${room} AND room_type=eq.${type}`
        }, (payload) => {
            messages.push(payload.new);
            renderMessages();
        })
        .on('postgres_changes', {
            event: 'DELETE',
            schema: 'public',
            table: 'chat_messages',
            filter: `room_id=eq.${room} AND room_type=eq.${type}`
        }, (payload) => {
            const deletedId = payload.old.id;
            messages = messages.filter(m => m.id !== deletedId);
            renderMessages();
        })
        .subscribe();
}

// ===== Отправка сообщения =====
async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text && selectedFiles.length === 0) return;

    if (!window._supabase) {
        alert('Ошибка: Supabase не инициализирован');
        return;
    }

    const user_name = currentUser.name;
    const user_role = currentUser.role;

    // Загружаем файлы в Storage
    let fileUrls = [];
    for (const file of selectedFiles) {
        try {
            const filePath = `chat/${Date.now()}_${file.name}`;
            const { data, error } = await window._supabase.storage
                .from('chat-files')
                .upload(filePath, file);
            if (error) throw error;
            const { data: urlData } = window._supabase.storage
                .from('chat-files')
                .getPublicUrl(filePath);
            fileUrls.push({ url: urlData.publicUrl, name: file.name, type: file.type });
        } catch (err) {
            console.error('Ошибка загрузки файла:', err);
            alert('Ошибка загрузки файла: ' + err.message);
            return;
        }
    }

    // Сохраняем сообщение
    try {
        const payload = {
            room_type: currentRoomType,
            room_id: currentRoom,
            sender_name: user_name,
            sender_role: user_role,
            message: text || null,
            file_url: fileUrls.length > 0 ? fileUrls[0].url : null,
            file_name: fileUrls.length > 0 ? fileUrls[0].name : null,
            file_type: fileUrls.length > 0 ? fileUrls[0].type : null,
            created_at: new Date().toISOString()
        };
        const { error } = await window._supabase
            .from('chat_messages')
            .insert([payload]);
        if (error) throw error;

        input.value = '';
        selectedFiles = [];
        document.getElementById('filePreviewContainer').classList.add('hidden');
        document.getElementById('fileInput').value = '';
    } catch (err) {
        alert('Ошибка отправки: ' + err.message);
    }
}

window.sendChatMessage = sendChatMessage;

// ===== Очистка выбранных файлов =====
function clearFileAttachment() {
    selectedFiles = [];
    document.getElementById('filePreviewContainer').classList.add('hidden');
    document.getElementById('fileInput').value = '';
}

window.clearFileAttachment = clearFileAttachment;

// ===== Личные чаты =====
function openNewDirectChat() {
    document.getElementById('directChatModal').classList.remove('hidden');
}

function closeDirectChatModal() {
    document.getElementById('directChatModal').classList.add('hidden');
}

window.openNewDirectChat = openNewDirectChat;
window.closeDirectChatModal = closeDirectChatModal;

function startDirectChat() {
    const select = document.getElementById('directChatUserSelect');
    const otherName = select.value;
    if (!otherName) {
        alert('Выберите пользователя');
        return;
    }
    // Создаем room_id: сортируем имена по алфавиту
    const names = [currentUser.name, otherName].sort();
    const roomId = names.join('_');
    // Закрываем модалку, переключаемся в личный чат
    closeDirectChatModal();
    // Добавляем в список личных чатов, если нет
    if (!directChats.find(d => d.roomId === roomId)) {
        directChats.push({ roomId, otherName });
        renderDirectChats();
    }
    // Переключаемся
    currentRoom = roomId;
    currentRoomType = 'direct';
    localStorage.setItem('chat_room', roomId);
    localStorage.setItem('chat_room_type', 'direct');
    document.getElementById('chatRoomSelect').value = 'direct';
    document.getElementById('directChatsPanel').classList.remove('hidden');
    loadMessages(roomId, 'direct');
    renderMessages();
    subscribeToRoom(roomId, 'direct');
}

window.startDirectChat = startDirectChat;

// ===== Удаление сообщения =====
window.deleteMessage = async (messageId) => {
    if (!confirm('Удалить сообщение?')) return;
    try {
        const { error } = await window._supabase
            .from('chat_messages')
            .delete()
            .eq('id', messageId);
        if (error) throw error;
    } catch (err) {
        alert('Ошибка удаления: ' + err.message);
    }
};