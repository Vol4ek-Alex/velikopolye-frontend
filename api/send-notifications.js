// api/send-notifications.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // Для безопасности можно проверять секретный ключ в запросе
    // или использовать Vercel Cron (если доступно)

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Получаем подписанных пользователей
    const { data: subscribers } = await supabase
        .from('telegram_subscribers')
        .select('chat_id')
        .eq('subscribed', true);

    if (!subscribers || subscribers.length === 0) {
        return res.status(200).json({ ok: true, message: 'Нет подписчиков' });
    }

    // Получаем данные с критическими событиями
    const { data: vehicles } = await supabase.from('vehicles').select('*');
    const today = new Date();

    let alerts = [];
    vehicles.forEach(v => {
        const tags = v.tags ? v.tags.split(',').map(t => t.trim()) : [];
        if (tags.includes('Гарантия')) {
            const hours = v.current_hours || 0;
            const zeroHours = v.zero_hours || 0;
            const stepHours = v.step_hours || 125;
            const relativeHours = hours - zeroHours;
            const nextTO = zeroHours + (Math.ceil((relativeHours + 1) / stepHours) * stepHours);
            const hoursLeft = nextTO - hours;
            if (hoursLeft <= 50) {
                alerts.push(`🚨 Срочно ТО! ${v.model} ${v.plate ? '['+v.plate+']' : ''} – осталось ${hoursLeft} м/ч`);
            }
        }
        if (v.inspection_date) {
            const diff = Math.ceil((new Date(v.inspection_date) - today) / (1000*60*60*24));
            if (diff <= 3) {
                alerts.push(`📅 Просрочка техосмотра! ${v.model} ${v.plate ? '['+v.plate+']' : ''}`);
            }
        }
        if (v.insurance_date) {
            const diff = Math.ceil((new Date(v.insurance_date) - today) / (1000*60*60*24));
            if (diff <= 3) {
                alerts.push(`📅 Просрочка страховки! ${v.model} ${v.plate ? '['+v.plate+']' : ''}`);
            }
        }
    });

    if (alerts.length === 0) {
        return res.status(200).json({ ok: true, message: 'Нет критических уведомлений' });
    }

    // Отправляем уведомления всем подписчикам
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const message = '⚠️ *Критические уведомления*\n\n' + alerts.map(a => `• ${a}`).join('\n');

    for (const sub of subscribers) {
        try {
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: sub.chat_id, text: message, parse_mode: 'Markdown' })
            });
        } catch (err) {
            console.error('Ошибка отправки уведомления для', sub.chat_id, err.message);
        }
    }

    res.status(200).json({ ok: true });
}