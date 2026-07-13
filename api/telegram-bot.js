// api/telegram-bot.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // Разрешаем только POST-запросы от Telegram
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { body } = req;
    const message = body.message;
    if (!message) return res.status(200).json({ ok: true });

    const chatId = message.chat.id;
    const text = message.text || '';

    // Инициализация Supabase (используйте переменные окружения)
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Обработка команд
    if (text.startsWith('/start')) {
        await sendMessage(chatId, 
            `🤖 Привет! Я бот АРМ «Великополье».\n\n` +
            `Доступные команды:\n` +
            `/status – текущая сводка по технике\n` +
            `/subscribe – подписаться на уведомления\n` +
            `/unsubscribe – отписаться от уведомлений`
        );
        return res.status(200).json({ ok: true });
    }

    if (text === '/status') {
        await sendStatus(chatId, supabase);
        return res.status(200).json({ ok: true });
    }

    if (text === '/subscribe') {
        await subscribeUser(chatId, supabase);
        return res.status(200).json({ ok: true });
    }

    if (text === '/unsubscribe') {
        await unsubscribeUser(chatId, supabase);
        return res.status(200).json({ ok: true });
    }

    // Если неизвестная команда
    await sendMessage(chatId, '❌ Неизвестная команда. Используйте /start для списка команд.');
    res.status(200).json({ ok: true });
}

// ===== Вспомогательные функции =====

async function sendMessage(chatId, text) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' })
    });
}

async function sendStatus(chatId, supabase) {
    // Получаем все транспортные средства
    const { data: vehicles } = await supabase
        .from('vehicles')
        .select('*');

    if (!vehicles) {
        await sendMessage(chatId, '❌ Не удалось получить данные.');
        return;
    }

    const today = new Date();
    let warrantyAlerts = [];
    let docAlerts = [];

    vehicles.forEach(v => {
        // ТО (гарантия)
        const tags = v.tags ? v.tags.split(',').map(t => t.trim()) : [];
        if (tags.includes('Гарантия')) {
            const hours = v.current_hours || 0;
            const zeroHours = v.zero_hours || 0;
            const stepHours = v.step_hours || 125;
            const relativeHours = hours - zeroHours;
            const nextTO = zeroHours + (Math.ceil((relativeHours + 1) / stepHours) * stepHours);
            const hoursLeft = nextTO - hours;
            if (hoursLeft <= 100) {
                warrantyAlerts.push(`${v.model} ${v.plate ? '['+v.plate+']' : ''} – ${hoursLeft} м/ч до ТО (${nextTO})`);
            }
        }

        // Документы
        if (v.inspection_date) {
            const diff = Math.ceil((new Date(v.inspection_date) - today) / (1000*60*60*24));
            if (diff <= 14) {
                docAlerts.push(`${v.model} ${v.plate ? '['+v.plate+']' : ''} – техосмотр через ${diff} дн.`);
            }
        }
        if (v.insurance_date) {
            const diff = Math.ceil((new Date(v.insurance_date) - today) / (1000*60*60*24));
            if (diff <= 14) {
                docAlerts.push(`${v.model} ${v.plate ? '['+v.plate+']' : ''} – страховка через ${diff} дн.`);
            }
        }
    });

    let statusText = '📊 *Сводка по автопарку*\n\n';
    statusText += `🚜 Всего техники: ${vehicles.length}\n`;
    statusText += `🔧 Срочное ТО (≤100 м/ч): ${warrantyAlerts.length}\n`;
    statusText += `📄 Документы истекают (≤14 дн): ${docAlerts.length}\n\n`;

    if (warrantyAlerts.length > 0) {
        statusText += '⚠️ *ТО (критично)*:\n' + warrantyAlerts.map(a => `• ${a}`).join('\n') + '\n\n';
    }
    if (docAlerts.length > 0) {
        statusText += '📅 *Документы истекают*:\n' + docAlerts.map(a => `• ${a}`).join('\n');
    }

    await sendMessage(chatId, statusText);
}

async function subscribeUser(chatId, supabase) {
    const { error } = await supabase
        .from('telegram_subscribers')
        .upsert({ chat_id: chatId, subscribed: true });
    if (error) {
        await sendMessage(chatId, '❌ Ошибка подписки: ' + error.message);
    } else {
        await sendMessage(chatId, '✅ Вы подписаны на уведомления!');
    }
}

async function unsubscribeUser(chatId, supabase) {
    const { error } = await supabase
        .from('telegram_subscribers')
        .update({ subscribed: false })
        .eq('chat_id', chatId);
    if (error) {
        await sendMessage(chatId, '❌ Ошибка отписки: ' + error.message);
    } else {
        await sendMessage(chatId, '❌ Вы отписаны от уведомлений.');
    }
}