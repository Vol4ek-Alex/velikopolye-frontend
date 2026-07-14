// js/chat.js – Финальная версия, идеально адаптивная

// ===== СОСТОЯНИЕ =====
const S = {
    currentRoom: 'general',
    messages: [],
    users: [],
    subscription: null,
    isOpen: false,
    unreadCount: 0,
    selectedUser: null,
    currentUser: null
};

// ===== ИНИЦИАЛИЗАЦИЯ =====
export async function init() {
    S.currentUser = {
        name: localStorage.getItem('user_name') || 'Сотрудник',
        role: localStorage.getItem('user_role') || 'Сотрудник'
    };

    if (!document.getElementById('chatRoot')) {
        document.body.insertAdjacentHTML('beforeend', getChatHTML());
    }

    bindEvents();
    await loadUsers();
    await loadMessages('general');
    renderMessages();
    renderUserList();
    subscribeToRoom('general');
    await updateOnlineStatus(true);

    setInterval(checkNewMessages, 10000);
    setInterval(updateOnlineStatus, 30000);

    window.toggleChat = toggleChat;
    window.closeChat = closeChat;
    window.sendMessage = sendMessage;
    window.switchRoom = switchRoom;
    window.startPrivateChat = startPrivateChat;
    window.openChatMenu = openChatMenu;
    window.closeChatMenu = closeChatMenu;
    window.minimizeChat = minimizeChat;
}

// ===== HTML (адаптивный, никаких фиксированных px для мобильных) =====
function getChatHTML() {
    return `
        <div id="chatRoot" style="position:fixed;inset:0;z-index:999;pointer-events:none;">
            <!-- Плавающая кнопка -->
            <button id="chatFab" style="position:fixed;bottom:24px;right:24px;pointer-events:auto;background:linear-gradient(135deg,#06b6d4,#0891b2);color:#fff;border:none;border-radius:50%;width:64px;height:64px;box-shadow:0 8px 32px rgba(6,182,212,0.4);font-size:28px;cursor:pointer;transition:all 0.3s;z-index:1000;display:flex;align-items:center;justify-content:center;">
                💬
                <span id="chatBadge" style="position:absolute;top:-4px;right:-4px;background:#ef4444;color:#fff;border-radius:50%;width:24px;height:24px;font-size:12px;font-weight:700;display:none;align-items:center;justify-content:center;">0</span>
            </button>

            <!-- Окно чата -->
            <div id="chatWindow" style="position:fixed;inset:0;pointer-events:auto;background:#fff;display:none;flex-direction:column;overflow:hidden;transition:all 0.3s;transform:scale(0.95);opacity:0;z-index:1001;box-shadow:0 24px 80px rgba(0,0,0,0.2);border-radius:0;max-width:100%;max-height:100%;">
                <!-- Шапка -->
                <div style="background:linear-gradient(135deg,#06b6d4,#0891b2);color:#fff;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <button id="chatMenuBtn" style="background:transparent;border:none;color:#fff;font-size:24px;cursor:pointer;display:block;">☰</button>
                        <span style="font-size:20px;">💬</span>
                        <span style="font-weight:700;font-size:18px;">Чат</span>
                        <span id="chatRoomName" style="font-size:12px;background:rgba(255,255,255,0.2);padding:2px 12px;border-radius:20px;">Общий</span>
                    </div>
                    <div style="display:flex;gap:16px;">
                        <button id="chatMinimizeBtn" style="background:transparent;border:none;color:#fff;font-size:20px;cursor:pointer;">−</button>
                        <button id="chatCloseBtn" style="background:transparent;border:none;color:#fff;font-size:20px;cursor:pointer;">✕</button>
                    </div>
                </div>

                <!-- Основная область (меню + сообщения) -->
                <div style="display:flex;flex:1;overflow:hidden;position:relative;">
                    <!-- Боковое меню -->
                    <div id="chatSidebar" style="position:absolute;inset:0;width:280px;background:#f8fafc;border-right:1px solid #e2e8f0;transform:translateX(-100%);transition:transform 0.3s;z-index:20;overflow-y:auto;padding:12px 0;display:flex;flex-direction:column;gap:4px;">
                        <div style="padding:0 16px 12px 16px;border-bottom:1px solid #e2e8f0;font-weight:700;font-size:14px;color:#475569;">👥 Комнаты</div>
                        <button onclick="window.switchRoom('general')" id="room-general" style="text-align:left;padding:12px 16px;margin:0 8px;border-radius:12px;border:none;background:transparent;cursor:pointer;font-size:14px;font-weight:500;display:flex;align-items:center;gap:8px;width:calc(100% - 16px);transition:background 0.2s;">💬 Общий чат</button>
                        <div style="padding:8px 16px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Личные сообщения</div>
                        <div id="chatUserList" style="display:flex;flex-direction:column;gap:2px;"></div>
                    </div>

                    <!-- Оверлей для мобильного меню -->
                    <div id="chatMenuOverlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.3);z-index:10;display:none;pointer-events:auto;" onclick="closeChatMenu()"></div>

                    <!-- Область сообщений -->
                    <div style="flex:1;display:flex;flex-direction:column;background:#f1f5f9;overflow:hidden;">
                        <div id="chatMessages" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;">
                            <div style="text-align:center;color:#94a3b8;padding:40px 0;font-size:14px;">Загрузка...</div>
                        </div>
                        <div style="padding:12px 16px;background:#fff;border-top:1px solid #e2e8f0;display:flex;gap:10px;align-items:center;">
                            <input id="chatInput" type="text" placeholder="Введите сообщение..." style="flex:1;padding:12px 18px;border:1px solid #e2e8f0;border-radius:24px;font-size:15px;outline:none;background:#f1f5f9;transition:border 0.2s;">
                            <button id="chatSendBtn" style="background:#06b6d4;color:#fff;border:none;border-radius:24px;padding:12px 20px;font-size:15px;font-weight:600;cursor:pointer;transition:background 0.2s;">➤</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ===== ОБРАБОТЧИКИ =====
function bindEvents() {
    document.getElementById('chatFab').addEventListener('click', toggleChat);
    document.getElementById('chatCloseBtn').addEventListener('click', closeChat);
    document.getElementById('chatMinimizeBtn').addEventListener('click', minimizeChat);
    document.getElementById('chatSendBtn').addEventListener('click', sendMessage);
    document.getElementById('chatInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    document.getElementById('chatMenuBtn').addEventListener('click', openChatMenu);
    document.getElementById('chatMenuOverlay').addEventListener('click', closeChatMenu);
}

// ===== УПРАВЛЕНИЕ ОКНОМ =====
function toggleChat() {
    const win = document.getElementById('chatWindow');
    const fab = document.getElementById('chatFab');
    if (win.style.display === 'none' || win.style.display === '') {
        // Открываем
        win.style.display = 'flex';
        win.style.transform = 'scale(1)';
        win.style.opacity = '1';
        fab.style.display = 'none';
        S.isOpen = true;
        clearBadge();
        loadMessages(S.currentRoom);
        renderMessages();
        updateOnlineStatus(true);
    } else {
        closeChat();
    }
}

function closeChat() {
    const win = document.getElementById('chatWindow');
    const fab = document.getElementById('chatFab');
    win.style.transform = 'scale(0.95)';
    win.style.opacity = '0';
    setTimeout(() => {
        win.style.display = 'none';
        fab.style.display = 'flex';
        S.isOpen = false;
    }, 300);
}

function minimizeChat() {
    const win = document.getElementById('chatWindow');
    const fab = document.getElementById('chatFab');
    win.style.display = 'none';
    fab.style.display = 'flex';
    S.isOpen = false;
}

// ===== МЕНЮ =====
function openChatMenu() {
    const sidebar = document.getElementById('chatSidebar');
    const overlay = document.getElementById('chatMenuOverlay');
    sidebar.style.transform = 'translateX(0)';
    overlay.style.display = 'block';
}

function closeChatMenu() {
    const sidebar = document.getElementById('chatSidebar');
    const overlay = document.getElementById('chatMenuOverlay');
    sidebar.style.transform = 'translateX(-100%)';
    overlay.style.display = 'none';
}

// ===== ПОЛЬЗОВАТЕЛИ =====
async function loadUsers() {
    if (!window._supabase) return;
    try {
        const { data, error } = await window._supabase
            .from('chat_users')
            .select('*')
            .order('name');
        if (error) throw error;
        S.users = data || [];
        renderUserList();
    } catch (err) { console.error(err); }
}

function renderUserList() {
    const container = document.getElementById('chatUserList');
    if (!container) return;
    const currentName = S.currentUser.name;
    const filtered = S.users.filter(u => u.name !== currentName);
    if (filtered.length === 0) {
        container.innerHTML = '<div style="padding:8px 16px;color:#94a3b8;font-size:13px;">Нет пользователей</div>';
        return;
    }
    container.innerHTML = filtered.map(u => {
        const online = u.online ? '🟢' : '⚪';
        const isActive = S.selectedUser === u.name;
        return `
            <button onclick="window.startPrivateChat('${u.name}')" style="text-align:left;padding:10px 16px;margin:0 8px;border-radius:12px;border:none;background:${isActive ? '#e0f2fe' : 'transparent'};cursor:pointer;font-size:14px;font-weight:500;display:flex;align-items:center;gap:8px;width:calc(100% - 16px);transition:background 0.2s;">
                <span>${online}</span>
                <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${u.name}</span>
                <span style="font-size:10px;color:#94a3b8;background:#f1f5f9;padding:2px 8px;border-radius:12px;">${u.role}</span>
            </button>
        `;
    }).join('');
}

// ===== ПЕРЕКЛЮЧЕНИЕ =====
window.switchRoom = function(room) {
    S.currentRoom = room;
    S.selectedUser = null;
    document.getElementById('chatRoomName').textContent = room === 'general' ? 'Общий' : room;
    closeChatMenu();
    if (S.subscription) {
        S.subscription.unsubscribe();
        S.subscription = null;
    }
    loadMessages(room);
    renderMessages();
    subscribeToRoom(room);
    document.querySelectorAll('#room-general, #chatUserList button').forEach(el => {
        el.style.background = 'transparent';
    });
    if (room === 'general') {
        document.getElementById('room-general').style.background = '#e0f2fe';
    }
};

window.startPrivateChat = function(userName) {
    const room = `private_${userName}`;
    S.currentRoom = room;
    S.selectedUser = userName;
    document.getElementById('chatRoomName').textContent = `Личное: ${userName}`;
    closeChatMenu();
    if (S.subscription) {
        S.subscription.unsubscribe();
        S.subscription = null;
    }
    loadMessages(room);
    renderMessages();
    subscribeToRoom(room);
    document.querySelectorAll('#room-general, #chatUserList button').forEach(el => {
        el.style.background = 'transparent';
    });
    document.querySelectorAll('#chatUserList button').forEach(el => {
        if (el.textContent.includes(userName)) {
            el.style.background = '#e0f2fe';
        }
    });
};

// ===== СООБЩЕНИЯ =====
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
        S.messages = data || [];
    } catch (err) { console.error(err); }
}

function renderMessages() {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    if (S.messages.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#94a3b8;padding:40px 0;font-size:14px;">Нет сообщений. Напишите первое!</div>';
        return;
    }
    const roleColors = {
        'Директор': 'bg-red-100 text-red-800',
        'Инженер по ЭМТП': 'bg-blue-100 text-blue-800',
        'Техник': 'bg-green-100 text-green-800',
        'Заместитель директора': 'bg-purple-100 text-purple-800'
    };
    const currentName = S.currentUser.name;
    container.innerHTML = S.messages.map(msg => {
        const isMe = msg.user_name === currentName;
        const colorClass = roleColors[msg.user_role] || 'bg-gray-100 text-gray-800';
        const time = new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        const date = new Date(msg.created_at).toLocaleDateString('ru-RU');
        return `
            <div style="display:flex;align-items:flex-start;gap:10px;${isMe ? 'flex-direction:row-reverse;' : ''}animation:fadeInUp 0.3s ease-out;">
                <div style="flex-shrink:0;width:36px;height:36px;border-radius:50%;background:#cffafe;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:#0891b2;">${msg.user_name ? msg.user_name.charAt(0) : '?'}</div>
                <div style="flex:1;${isMe ? 'display:flex;flex-direction:column;align-items:flex-end;' : ''}">
                    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;${isMe ? 'justify-content:flex-end;' : ''}">
                        <span style="font-weight:600;font-size:14px;color:#1e293b;">${msg.user_name || 'Неизвестный'}</span>
                        <span style="font-size:11px;font-weight:600;padding:2px 10px;border-radius:12px;${colorClass}">${msg.user_role || 'Сотрудник'}</span>
                        <span style="font-size:11px;color:#94a3b8;">${date} ${time}</span>
                    </div>
                    <div style="margin-top:4px;font-size:14px;color:#1e293b;background:${isMe ? '#e0f2fe' : '#fff'};padding:10px 14px;border-radius:16px;box-shadow:0 1px 2px rgba(0,0,0,0.05);max-width:85%;word-break:break-word;">${msg.message}</div>
                </div>
            </div>
        `;
    }).join('');
    container.scrollTop = container.scrollHeight;
}

// ===== REALTIME =====
function subscribeToRoom(room) {
    if (!window._supabase) return;
    if (S.subscription) {
        S.subscription.unsubscribe();
        S.subscription = null;
    }
    S.subscription = window._supabase
        .channel(`chat_${room}`)
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `room=eq.${room}`
        }, (payload) => {
            S.messages.push(payload.new);
            renderMessages();
            if (!S.isOpen) {
                showBadge(S.unreadCount + 1);
            }
        })
        .subscribe();
}

// ===== ОТПРАВКА =====
window.sendMessage = async function() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    const payload = {
        room: S.currentRoom,
        user_name: S.currentUser.name,
        user_role: S.currentUser.role,
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
    } catch (err) {
        console.error('Ошибка отправки:', err);
        alert('Ошибка отправки: ' + err.message);
    }
};

// ===== ОНЛАЙН =====
async function updateOnlineStatus() {
    if (!window._supabase) return;
    const name = S.currentUser.name;
    try {
        const { error } = await window._supabase
            .from('chat_users')
            .update({ last_seen: new Date().toISOString(), online: true })
            .eq('name', name);
        if (error) {
            await window._supabase
                .from('chat_users')
                .insert([{ name: name, role: S.currentUser.role, online: true }]);
        }
    } catch (e) {}
    setTimeout(loadUsers, 1000);
}

// ===== УВЕДОМЛЕНИЯ =====
function showBadge(count) {
    const badge = document.getElementById('chatBadge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = 'flex';
    }
    S.unreadCount = count;
}

function clearBadge() {
    const badge = document.getElementById('chatBadge');
    if (badge) {
        badge.style.display = 'none';
        badge.textContent = '0';
    }
    S.unreadCount = 0;
}

async function checkNewMessages() {
    if (!window._supabase) return;
    if (S.isOpen) {
        clearBadge();
        return;
    }
    try {
        const { count, error } = await window._supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('room', S.currentRoom)
            .gt('created_at', new Date(Date.now() - 60000).toISOString());
        if (error) throw error;
        if (count > 0) {
            showBadge(count);
        }
    } catch (err) {}
}