import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
        
        async function loadVehicles() {
            const listContainer = document.getElementById('vehiclesList');
            if (!listContainer) return;

            // ПРОВЕРКА ПРАВ
            const user = await checkUser();
            const formSection = document.querySelector('#moduleWorkspace form')?.closest('section');
            
            if (formSection) {
                if (user) {
                    // Пользователь авторизован — показываем форму добавления
                    formSection.classList.remove('hidden');
                } else {
                    // Гость — скрываем форму, чтобы нельзя было ничего добавить
                    formSection.classList.add('hidden');
                }
            }
            
            // ... (весь остальной твой код загрузки списка машин из Supabase)

            try {
                // Запрос к Supabase
                const { data, error } = await _supabase
                    .from('vehicles')
                    .select('*');

                if (error) throw error;

                if(data.length === 0) {
                    document.getElementById('count').innerText = '0';
                    listContainer.innerHTML = `<div class="col-span-full text-center text-slate-600 py-12 px-6 border-2 border-dashed border-slate-700 rounded-xl">В базе парка пока нет техники.</div>`;
                    return;
                }

                const today = new Date();
                today.setHours(0,0,0,0); // сбрасываем время для точного расчета дней

                // Массивы для аналитики
                let expiredCount = 0;
                let warningCount = 0;

                // Обрабатываем каждую машину и вычисляем остаток дней
                const processedVehicles = data.map(v => {
                    const insDate = new Date(v.insurance);
                    const inspDate = new Date(v.inspection);
                    insDate.setHours(0,0,0,0);
                    inspDate.setHours(0,0,0,0);

                    // Расчет дней (1 день = 24 * 60 * 60 * 1000 мс)
                    const daysLeftIns = Math.ceil((insDate - today) / (1000 * 60 * 60 * 24));
                    const daysLeftInsp = Math.ceil((inspDate - today) / (1000 * 60 * 60 * 24));

                    // Определяем статус для сортировки (чем меньше дней, тем выше приоритет)
                    const minDays = Math.min(daysLeftIns, daysLeftInsp);

                    if (daysLeftIns <= 0 || daysLeftInsp <= 0) {
                        expiredCount++;
                    } else if (daysLeftIns <= 30 || daysLeftInsp <= 30) {
                        warningCount++;
                    }

                    return { ...v, daysLeftIns, daysLeftInsp, minDays };
                });

                // Сортируем: сначала самые проблемные (где меньше всего дней или уже просрочено)
                processedVehicles.sort((a, b) => a.minDays - b.minDays);

                // Обновляем общую цифру на странице
                document.getElementById('count').innerText = processedVehicles.length;

                // Генерация карточек
                listContainer.innerHTML = processedVehicles.map(v => {
                    const insDateStr = new Date(v.insurance).toLocaleDateString('ru-RU');
                    const inspDateStr = new Date(v.inspection).toLocaleDateString('ru-RU');

                    // Функция для подбора стиля текста и фонов в зависимости от дней
                    const getStatusStyle = (days) => {
                        if (days <= 0) {
                            return {
                                text: 'text-red-500 font-bold',
                                bg: 'bg-red-500/10 border-red-500/30',
                                label: `Просрочено на ${Math.abs(days)} дн.`
                            };
                        } else if (days <= 30) {
                            return {
                                text: 'text-amber-400 font-medium',
                                bg: 'bg-amber-500/10 border-amber-500/30',
                                label: `Осталось: ${days} дн.`
                            };
                        } else {
                            return {
                                text: 'text-emerald-400',
                                bg: 'bg-slate-900/50 border-slate-700/50',
                                label: `Осталось: ${days} дн.`
                            };
                        }
                    };

                    const insStyle = getStatusStyle(v.daysLeftIns);
                    const inspStyle = getStatusStyle(v.daysLeftInsp);

                    // Общая рамка карточки: если хоть один документ просрочен — подсветим всю карточку
                    const cardBorderColor = (v.daysLeftIns <= 0 || v.daysLeftInsp <= 0) 
                        ? 'border-red-500/40 hover:border-red-500/60 shadow-red-950/20' 
                        : (v.daysLeftIns <= 30 || v.daysLeftInsp <= 30)
                        ? 'border-amber-500/40 hover:border-amber-500/60 shadow-amber-950/20'
                        : 'border-slate-700 hover:border-slate-600';

                    return `
                        <div class="bg-slate-800 border ${cardBorderColor} rounded-2xl p-5 shadow-lg flex flex-col justify-between transition hover:shadow-xl">
                            <div>
                                <div class="flex justify-between items-start mb-4 gap-3">
                                    <h3 class="font-bold text-white text-base leading-tight">${v.model}</h3>
                                    <span class="bg-slate-900 border border-slate-600 text-xs text-slate-200 font-mono px-2 py-1 rounded-md shadow-inner">${v.plate}</span>
                                </div>
                                
                                <div class="space-y-3 pt-3 border-t border-slate-700/60 text-xs">
                                    <div class="p-2.5 rounded-xl border ${insStyle.bg} flex justify-between items-center">
                                        <div>
                                            <span class="text-slate-400 block text-[11px] uppercase tracking-wider">Страховка</span>
                                            <span class="text-slate-200 font-medium">${insDateStr}</span>
                                        </div>
                                        <span class="${insStyle.text}">${insStyle.label}</span>
                                    </div>

                                    <div class="p-2.5 rounded-xl border ${inspStyle.bg} flex justify-between items-center">
                                        <div>
                                            <span class="text-slate-400 block text-[11px] uppercase tracking-wider">Техосмотр</span>
                                            <span class="text-slate-200 font-medium">${inspDateStr}</span>
                                        </div>
                                        <span class="${inspStyle.text}">${inspStyle.label}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');

                // Если хочешь выводить инфо-панель сверху (просрочено/внимания), 
                // мы можем также динамически внедрить блоки-счетчики. Пока выведем логи в консоль:
                console.log(`Просрочено: ${expiredCount}, Внимания требует: ${warningCount}`);

            } catch (error) {
                console.error(error);
                listContainer.innerHTML = `<div class="col-span-full text-center text-red-400 py-12 px-6 border border-red-500/30 bg-red-950/20 rounded-xl">⚠️ Ошибка получения данных: <br> ${error.message}</div>`;
            }
        }

        async function saveVehicle(e) {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            btn.innerHTML = 'Сохранение...';
            btn.disabled = true;

            const row = {
                model: document.getElementById('model').value,
                plate: document.getElementById('plate').value,
                insurance: document.getElementById('insurance').value,
                inspection: document.getElementById('inspection').value
            };

            try {
                // Прямая вставка строки в таблицу 'vehicles'
                const { error } = await _supabase
                    .from('vehicles')
                    .insert([row]);

                if (error) throw error;

                document.getElementById('vehicleForm').reset();
                await loadVehicles();
            } catch (error) {
                alert('Ошибка сохранения в Supabase: ' + error.message);
            } finally {
                btn.innerHTML = '💾 Сохранить транспорт в базу';
                btn.disabled = false;
            }
        }