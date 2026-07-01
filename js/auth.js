import { _supabase } from './config.js';

export async function checkUser() {
    const { data: { user } } = await _supabase.auth.getUser();
    return user;
}

        async function initAuthScreen() {
            const user = await checkUser();
            const form = document.getElementById('authForm');
            const info = document.getElementById('authUserInfo');
            const title = document.getElementById('authTitle');

            if (user) {
                form.classList.add('hidden');
                info.classList.remove('hidden');
                document.getElementById('userEmailLabel').innerText = user.email;
                title.innerText = "Личный кабинет";
            } else {
                form.classList.remove('hidden');
                info.classList.add('hidden');
                title.innerText = "Авторизация сотрудника";
            }
        }

        async function handleLogin(e) {
            e.preventDefault();
            const btn = document.getElementById('authBtn');
            btn.innerText = 'Вход...';
            btn.disabled = true;

            const email = document.getElementById('authEmail').value;
            const password = document.getElementById('authPassword').value;

            const { data, error } = await _supabase.auth.signInWithPassword({ email, password });

            if (error) {
                alert('Ошибка авторизации: ' + error.message);
                btn.innerText = 'Войти';
                btn.disabled = false;
            } else {
                alert('Успешный вход в систему!');
                switchModule('fleet'); // Перекидываем в автопарк
            }
        }

        async function handleLogout() {
            await _supabase.auth.signOut();
            alert('Вы вышли из системы');
            switchModule('dashboard');
        }