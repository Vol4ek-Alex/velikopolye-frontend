// js/docs/machineryLifecycle.js

export const machineryLifecycleTemplate = `
<div id="subModule_machinery_lifecycle" class="hidden space-y-4 fade-in-sub">
    <!-- Изолированные стили для идеальной А4 печати всех актов -->
    <style>
        @media print {
            body * { visibility: hidden; }
            #tripPrintBlock, #tripPrintBlock * { visibility: visible; }
            #tripPrintBlock { position: absolute; left: 0; top: 0; width: 100%; }
            .print-page-a4 {
                visibility: visible !important;
                page-break-after: always !important;
                page-break-inside: avoid !important;
                font-family: "Times New Roman", serif !important;
                font-size: 11pt !important;
                line-height: 1.4 !important;
                width: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
                border: none !important;
                box-shadow: none !important;
                background: transparent !important;
            }
            @page { size: A4 portrait; margin: 2cm 1.5cm 2cm 2.5cm; }
            .no-print { display: none !important; }
        }
        .lifecycle-table th, .lifecycle-table td {
            border: 1px solid black !important;
            padding: 5px 6px;
            font-size: 12px;
            text-align: center;
        }
    </style>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Панель управления параметрами документов -->
        <div class="bg-white border-2 border-gray-400 p-5 rounded-xl shadow-xs space-y-4 no-print">
            <h3 class="text-xs font-black text-gray-700 uppercase tracking-wider mb-2">🚜 Жизненный цикл техники</h3>
            
            <!-- Выбор типа генерируемого бланка -->
            <div>
                <label class="block text-[9px] font-bold text-gray-600 mb-0.5">Выберите тип документа</label>
                <select id="lifecycleDocType" onchange="window.switchLifecycleFields()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold focus:border-blue-600">
                    <option value="storage">Постановка на хранение (ГОСТ 7751-2009)</option>
                    <option value="defect">Дефектный акт</option>
                    <option value="repair_out">Акт приема из ремонта</option>
                    <option value="to_report">Рапорт проведения ТО</option>
                </select>
            </div>

            <!-- Общие поля -->
            <div class="grid grid-cols-2 gap-2 border-t border-gray-100 pt-2">
                <div>
                    <label class="block text-[9px] font-bold text-gray-600 mb-0.5">Дата документа</label>
                    <input type="date" id="lifecycleDate" oninput="window.updateLifecyclePreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold">
                </div>
                <div>
                    <label class="block text-[9px] font-bold text-gray-600 mb-0.5">Номер бланка/акта</label>
                    <input type="text" id="lifecycleNum" value="1" oninput="window.updateLifecyclePreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold">
                </div>
            </div>

            <div>
                <label class="block text-[9px] font-bold text-gray-600 mb-0.5">ФИО Водителя / Механизатора</label>
                <input type="text" id="lifecycleDriver" value="Чернов В.Н." oninput="window.updateLifecyclePreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold">
            </div>

            <!-- Специфичные поля динамически отображаются через JS -->
            <div id="dynamicLifecycleFields" class="space-y-3 border-t border-gray-200 pt-3">
                <!-- Сюда вставляются уникальные инпуты -->
            </div>

            <button onclick="window.printAndSaveLifecycleDoc()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-bold transition shadow-xs text-xs flex items-center justify-center gap-2">
                🖨️ Сформировать и распечатать
            </button>
        </div>

        <!-- Область предпросмотра -->
        <div class="lg:col-span-2 bg-gray-100 p-4 rounded-xl border-2 border-gray-300 flex flex-col justify-between max-h-[80vh] overflow-y-auto no-print">
            <div id="lifecycleLivePreview"></div>
        </div>
    </div>
</div>
`;

export function initMachineryLifecycle(selectedVehicle = null) {
    // Внутренний объект машины по умолчанию, если ничего не пришло из общей таблицы
    const vehicle = selectedVehicle || {
        model: "Картофелесажалка «Л-202»",
        plate: "44-55 AA-7",
        inv_number: "1463",
        type: "трактор", // или автомобиль
        current_hours: 459703,
        next_to_hours: 479986
    };

    function formatRusDate(dateStr) {
        if (!dateStr) return '«___» ____________ 2026г.';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
            return `«${parts[2]}» ${months[parseInt(parts[1])-1]} 20${parts[0].substring(2)}г.`;
        }
        return dateStr;
    }

    // Динамическая перестройка полей ввода в панели слева
    window.switchLifecycleFields = () => {
        const docType = document.getElementById('lifecycleDocType').value;
        const container = document.getElementById('dynamicLifecycleFields');
        if (!container) return;

        if (docType === 'storage') {
            container.innerHTML = `
                <div>
                    <label class="block text-[9px] font-bold text-gray-600 mb-0.5">Техническое состояние</label>
                    <input type="text" id="storageCondition" value="на ходу" oninput="window.updateLifecyclePreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold">
                </div>
                <div>
                    <label class="block text-[9px] font-bold text-gray-600 mb-0.5">Качество консервации</label>
                    <input type="text" id="storageQuality" value="соответствует требованиям стандартов ГОСТ 7751-2009" oninput="window.updateLifecyclePreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold">
                </div>`;
        } else if (docType === 'defect') {
            container.innerHTML = `
                <div>
                    <label class="block text-[9px] font-bold text-gray-600 mb-0.5">Выявленные неисправности</label>
                    <textarea id="defectFailures" oninput="window.updateLifecyclePreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold h-16">1. Износ рабочих органов\n2. Повреждение гидравлического шланга</textarea>
                </div>
                <div>
                    <label class="block text-[9px] font-bold text-gray-600 mb-0.5">Предлагаемые работы и запчасти</label>
                    <textarea id="defectWorks" oninput="window.updateLifecyclePreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold h-16">Произвести замену негодных, поврежденных деталей, ремонт собственными силами</textarea>
                </div>`;
        } else if (docType === 'repair_out') {
            container.innerHTML = `
                <div>
                    <label class="block text-[9px] font-bold text-gray-600 mb-0.5">Заключение по качеству ремонта</label>
                    <textarea id="repairOutConclusion" oninput="window.updateLifecyclePreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold h-20">Ремонт выполнен в полном объеме. Техника соответствует требованиям техники безопасности, исправна и готова к эксплуатации.</textarea>
                </div>`;
        } else if (docType === 'to_report') {
            container.innerHTML = `
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-[9px] font-bold text-gray-600 mb-0.5">Вид ТО</label>
                        <input type="text" id="toKind" value="ТО-2" oninput="window.updateLifecyclePreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold">
                    </div>
                    <div>
                        <label class="block text-[9px] font-bold text-gray-600 mb-0.5">Дата проведения ТО</label>
                        <input type="date" id="toDoneDate" oninput="window.updateLifecyclePreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-[9px] font-bold text-gray-600 mb-0.5">Текущая наработка</label>
                        <input type="number" id="toCurrentHours" value="${vehicle.current_hours}" oninput="window.updateLifecyclePreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold">
                    </div>
                    <div>
                        <label class="block text-[9px] font-bold text-gray-600 mb-0.5">Наработка после ТО</label>
                        <input type="number" id="toDoneHours" value="${parseInt(vehicle.current_hours) + 283}" oninput="window.updateLifecyclePreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold">
                    </div>
                </div>
                <div>
                    <label class="block text-[9px] font-bold text-gray-600 mb-0.5">Выполненные работы / Замены</label>
                    <textarea id="toWorksList" oninput="window.updateLifecyclePreview()" class="w-full bg-gray-50 border-2 border-gray-300 rounded-lg p-2 text-xs font-bold h-16">1. Масло 10W40 (замена)\n2. Фильтр масляный (замена)\n3. Фильтр воздушный (замена)</textarea>
                </div>`;
        }
        window.updateLifecyclePreview();
    };

    window.generateLifecycleHtmlContent = (isForWord = false) => {
        const docType = document.getElementById('lifecycleDocType')?.value || 'storage';
        const rawDate = document.getElementById('lifecycleDate')?.value || '';
        const docNum = document.getElementById('lifecycleNum')?.value || '___';
        const driverName = document.getElementById('lifecycleDriver')?.value || '_______';
        const formattedDate = formatRusDate(rawDate);

        // --- БЛАНК 1: ПОСТАНОВКА НА ХРАНЕНИЕ ---
        if (docType === 'storage') {
            const cond = document.getElementById('storageCondition')?.value || 'на ходу';
            const qual = document.getElementById('storageQuality')?.value || '';
            return `
            <div class="print-page-a4 bg-white p-8 border border-gray-300 text-black font-serif text-justify" style="font-family: 'Times New Roman', serif; font-size: 14px; line-height: 1.4; box-sizing: border-box;">
                <div style="text-align: center; font-size: 11px; margin-bottom: 10px; font-weight: bold;">ГОСТ 7751-2009</div>
                <table style="width: 100%; border-collapse: collapse; border: none; margin-bottom: 30px;">
                    <tr>
                        <td style="width: 50%; vertical-align: top; border: none; padding: 0; font-size: 14px; line-height: 1.3;">
                            Филиал СХК «Великополье»<br>ГП «Минсктранс»
                        </td>
                        <td style="width: 50%; vertical-align: top; border: none; padding: 0; padding-left: 40px; font-size: 14px; line-height: 1.3; text-align: left;">
                            <strong>УТВЕРЖДАЮ</strong><br>Директор филиала СХК «Великополье»<br>__________________ Д.С. Рунцевич<br>${formattedDate}
                        </td>
                    </tr>
                </table>
                <div style="text-align: center; margin-bottom: 25px;">
                    <strong style="font-size: 16px;">АКТ № ${docNum}</strong><br><strong>постановки машин на хранение</strong><br><span>${formattedDate}</span>
                </div>
                <p>Мы, нижеподписавшиеся, составили настоящий акт о том, что механизатор (водитель) ${driverName} сдал, а ответственный за хранение инженер по ЭМТП Волчек А.А. принял:</p>
                <div style="margin-bottom: 20px; padding-left: 20px; line-height: 1.5;">
                    <strong>Наименование (марка) машины:</strong> ${vehicle.model}<br>
                    <strong>Инвентарный номер:</strong> инв. № ${vehicle.inv_number}<br>
                    <strong>Техническое состояние:</strong> ${cond}
                </div>
                <div style="font-weight: bold; margin-bottom: 6px;">Характеристика основных сборочных единиц и деталей:</div>
                <table class="lifecycle-table" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr style="background-color: #fafafa;"><th rowspan="2" style="width: 45%;">Наименование</th><th rowspan="2">Подлежит замене</th><th colspan="2">Требует</th><th rowspan="2" style="width: 25%;">Примечание</th></tr>
                        <tr style="background-color: #fafafa;"><th>ремонт</th><th>ТО</th></tr>
                    </thead>
                    <tbody>
                        <tr><td style="text-align: left;">Двигатель / Рама</td><td>нет</td><td>нет</td><td>нет</td><td>исправен</td></tr>
                        <tr><td style="text-align: left;">Ходовая часть / Рабочие органы</td><td>нет</td><td>нет</td><td>нет</td><td>очищены, консервация</td></tr>
                        <tr><td style="text-align: left;">Электрооборудование</td><td>нет</td><td>нет</td><td>нет</td><td>аккумулятор снят</td></tr>
                    </tbody>
                </table>
                <p style="margin-bottom: 40px;"><strong>Качество подготовки, установки машин и ее консервации:</strong><br>${qual}</p>
                <table style="width: 100%; border-collapse: collapse; border: none; margin-top: 50px;">
                    <tr>
                        <td style="width: 50%; border: none; padding: 0; text-align: left;">Сдал: ___________________ / ${driverName} /</td>
                        <td style="width: 50%; border: none; padding: 0; text-align: right;">Принял: ___________________ / Волчек А.А. /</td>
                    </tr>
                </table>
            </div>`;
        }

        // --- БЛАНК 2: ДЕФЕКТНЫЙ АКТ ---
        if (docType === 'defect') {
            const failures = (document.getElementById('defectFailures')?.value || '').replace(/\n/g, '<br>');
            const works = (document.getElementById('defectWorks')?.value || '').replace(/\n/g, '<br>');
            return `
            <div class="print-page-a4 bg-white p-8 border border-gray-300 text-black font-serif text-justify" style="font-family: 'Times New Roman', serif; font-size: 14px; line-height: 1.4; box-sizing: border-box;">
                <table style="width: 100%; border-collapse: collapse; border: none; margin-bottom: 30px;">
                    <tr>
                        <td style="width: 50%; vertical-align: top; border: none; padding: 0; font-size: 14px; line-height: 1.3;">
                            Филиал СХК «Великополье»<br>государственного предприятия<br>«Минсктранс»
                        </td>
                        <td style="width: 50%; vertical-align: top; border: none; padding: 0; padding-left: 40px; font-size: 14px; line-height: 1.3; text-align: left;">
                            <strong>УТВЕРЖДАЮ</strong><br>Директор филиала СХК «Великополье»<br>__________________ Д.С. Рунцевич<br>${formattedDate}
                        </td>
                    </tr>
                </table>
                <div style="text-align: center; margin-bottom: 25px;">
                    <strong style="font-size: 16px;">ДЕФЕКТНЫЙ АКТ № ${docNum}</strong><br><span>${formattedDate}</span>
                </div>
                <div style="margin-bottom: 20px; line-height: 1.5;">
                    Комиссия в составе:<br>
                    <strong>Председатель:</strong> главный инженер М.П. Макович<br>
                    <strong>Члены комиссии:</strong> 1) Инженер по ЭМТП А.А. Волчёк, 2) агроном В.А. Глотова
                </div>
                <p>составила настоящий акт о том, что ${formattedDate} в ходе осмотра с/х техники <strong>${vehicle.model}</strong>, гос. номер: ${vehicle.plate || '—'}, инв. № ${vehicle.inv_number} выявлены следующие неисправности:</p>
                <div style="border: 1px solid black; padding: 10px; margin-bottom: 20px; min-height: 60px; background-color: #fafafa;">${failures}</div>
                <p>Для устранения вышеперечисленных неисправностей предлагается (указать виды работ, наименование и количество деталей для замены):</p>
                <div style="border: 1px solid black; padding: 10px; margin-bottom: 25px; min-height: 60px; background-color: #fafafa;">${works}</div>
                <p>Комиссия предлагает провести ремонтные работы <strong>Собственными силами</strong>.</p>
                <table style="width: 100%; border-collapse: collapse; border: none; margin-top: 40px; line-height: 2;">
                    <tr><td style="width: 40%; border: none; text-align: left;">Председатель комиссии:</td><td style="width: 30%; border: none;">___________________</td><td style="width: 30%; border: none; text-align: right;">М.П. Макович</td></tr>
                    <tr><td style="width: 40%; border: none; text-align: left;">Члены комиссии:</td><td style="width: 30%; border: none;">___________________</td><td style="width: 30%; border: none; text-align: right;">А.А. Волчёк</td></tr>
                    <tr><td style="width: 40%; border: none; text-align: left;"></td><td style="width: 30%; border: none;">___________________</td><td style="width: 30%; border: none; text-align: right;">В.А. Глотова</td></tr>
                </table>
            </div>`;
        }

        // --- БЛАНК 3: ПРИЕМ ТЕХНИКИ ИЗ РЕМОНТА ---
        if (docType === 'repair_out') {
            const conclusion = (document.getElementById('repairOutConclusion')?.value || '').replace(/\n/g, '<br>');
            return `
            <div class="print-page-a4 bg-white p-8 border border-gray-300 text-black font-serif text-justify" style="font-family: 'Times New Roman', serif; font-size: 14px; line-height: 1.4; box-sizing: border-box;">
                <table style="width: 100%; border-collapse: collapse; border: none; margin-bottom: 40px;">
                    <tr>
                        <td style="width: 50%; border: none;"></td>
                        <td style="width: 50%; border: none; font-size: 14px; line-height: 1.3; text-align: left;">
                            <strong>УТВЕРЖДАЮ</strong><br>Директор филиала СХК «Великополье»<br>__________________ Д.С. Рунцевич<br>${formattedDate}
                        </td>
                    </tr>
                </table>
                <div style="text-align: center; margin-bottom: 30px;">
                    <strong style="font-size: 16px;">АКТ № ${docNum}</strong><br><strong style="font-size: 15px;">Приема техники из ремонта</strong><br><span>${formattedDate}</span>
                </div>
                <p>Комиссия в составе: агронома Глотовой В.А., главного инженера Маковича М.П., механизатора (водителя) ${driverName}, составила настоящий акт о приёме отремонтированной техники.</p>
                <div style="margin-bottom: 25px; padding-left: 20px; line-height: 1.5;">
                    <strong>Марка с/х машины:</strong> ${vehicle.model}<br>
                    <strong>Инвентарный номер:</strong> инв. № ${vehicle.inv_number}
                </div>
                <p><strong>Заключение комиссии по качеству ремонта и соответствия требованиям техники безопасности:</strong></p>
                <div style="border: 1px solid black; padding: 15px; margin-bottom: 50px; min-height: 100px; background-color: #fafafa; line-height: 1.5;">${conclusion}</div>
                <table style="width: 100%; border-collapse: collapse; border: none; margin-top: 40px; line-height: 2.2;">
                    <tr><td style="width: 50%; border: none; text-align: left;">Агроном</td><td style="width: 50%; border: none; text-align: right;">___________________ / В.А. Глотова /</td></tr>
                    <tr><td style="width: 50%; border: none; text-align: left;">Главный инженер</td><td style="width: 50%; border: none; text-align: right;">___________________ / М.П. Макович /</td></tr>
                    <tr><td style="width: 50%; border: none; text-align: left;">Механизатор (Водитель)</td><td style="width: 50%; border: none; text-align: right;">___________________ / ${driverName} /</td></tr>
                </table>
            </div>`;
        }

        // --- БЛАНК 4: РАПОРТ ПРОВЕДЕНИЯ ТO (АВТО И ТРАКТОРА) ---
        if (docType === 'to_report') {
            const toKind = document.getElementById('toKind')?.value || 'ТО-2';
            const toDoneDate = formatRusDate(document.getElementById('toDoneDate')?.value || '');
            const curH = document.getElementById('toCurrentHours')?.value || '0';
            const doneH = document.getElementById('toDoneHours')?.value || '0';
            const worksList = (document.getElementById('toWorksList')?.value || '').replace(/\n/g, '<br>');
            
            // Динамические единицы измерения в зависимости от типа техники
            const isCar = (vehicle.type || '').toLowerCase().includes('авто');
            const unit = isCar ? 'км' : 'м/ч';
            const unitFull = isCar ? 'пробег составил' : 'наработка составила';
            const unitCounter = isCar ? 'Показание одометра' : 'Показание счетчика наработки';
            const driverTitle = isCar ? 'Водитель' : 'Тракторист';

            return `
            <div class="print-page-a4 bg-white p-8 border border-gray-300 text-black font-serif text-justify" style="font-family: 'Times New Roman', serif; font-size: 14px; line-height: 1.4; box-sizing: border-box;">
                <div style="text-align: center; margin-bottom: 25px;">
                    <strong style="font-size: 16px; uppercase tracking-wide">РАПОРТ</strong><br>
                    <strong>о проведении технического обслуживания ${isCar ? 'автомобиля' : 'трактора'}</strong>
                </div>
                <p style="text-indent: 0px;">По состоянию на ${formattedDate}, на ${isCar ? 'автомобиле' : 'тракторе'} марки <strong>${vehicle.model}</strong> инв. № ${vehicle.inv_number}, ${unitFull} <strong>${curH} (${unit})</strong>.</p>
                <p style="text-indent: 0px;">${driverTitle}: <strong>${driverName}</strong></p>
                <p>1. Приближается срок проведения очередного технического обслуживания ${toKind}. Необходимо приостановить эксплуатацию техники до выполнения технического обслуживания.</p>
                <table style="width: 100%; border-collapse: collapse; border: none; margin-top: 15px; margin-bottom: 25px;">
                    <tr>
                        <td style="width: 40%; border: none;">Инженер по ЭМТП</td>
                        <td style="width: 30%; border: none; text-align: center;">___________________</td>
                        <td style="width: 30%; border: none; text-align: right;">Волчек А.А.</td>
                    </tr>
                </table>
                <div style="border-top: 1px dashed black; margin: 20px 0;"></div>
                <p style="text-indent: 0px;">Техническое обслуживание <strong>${toKind}</strong> произведено: ${toDoneDate}</p>
                <p style="text-indent: 0px;">${unitCounter} на ${toDoneDate}: <strong>${doneH} (${unit})</strong></p>
                <p><strong>Произведена замена (ремонт) агрегатов (основной перечень выполненных работ):</strong></p>
                <div style="border: 1px solid black; padding: 12px; margin-bottom: 20px; background-color: #fafafa; line-height: 1.5;">${worksList}</div>
                <p><i>Примечание: следующее обслуживание провести при наработке (пробеге) не более ${parseInt(doneH) + 20000} ${unit}.</i></p>
                <table style="width: 100%; border-collapse: collapse; border: none; margin-top: 40px; line-height: 2;">
                    <tr><td style="width: 40%; border: none; text-align: left;">Инженер по ЭМТП</td><td style="width: 30%; border: none;">___________________</td><td style="width: 30%; border: none; text-align: right;">Волчек А.А.</td></tr>
                    <tr><td style="width: 40%; border: none; text-align: left;">${driverTitle}</td><td style="width: 30%; border: none;">___________________</td><td style="width: 30%; border: none; text-align: right;">${driverName}</td></tr>
                </table>
            </div>`;
        }
        return '';
    };

    window.updateLifecyclePreview = () => {
        const preview = document.getElementById('lifecycleLivePreview');
        if (preview) preview.innerHTML = window.generateLifecycleHtmlContent(false);
    };

    window.printAndSaveLifecycleDoc = async () => {
        const printBlock = document.getElementById('tripPrintBlock');
        if (printBlock) {
            printBlock.innerHTML = window.generateLifecycleHtmlContent(false);
            window.print();
            printBlock.innerHTML = '';
        }

        const supabase = window._supabase || window.supabase;
        if (!supabase) return;

        const docType = document.getElementById('lifecycleDocType')?.value || 'doc';
        const docNum = document.getElementById('lifecycleNum')?.value || '1';
        const fileName = `${docType}_act_№${docNum}_${vehicle.inv_number}.doc`;

        try {
            const wordContent = 
                '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">\n' +
                '<head><meta charset="utf-8">\n' +
                '<style>\n' +
                '@page { size: 21cm 29.7cm; margin: 2cm 1.5cm 2cm 2.5cm; }\n' +
                'body { font-family: "Times New Roman", serif; font-size: 11pt; }\n' +
                'table { width:100%; border-collapse:collapse; }\n' +
                'td, th { border: 1px solid black; padding: 4px; text-align: center; }\n' +
                '</style></head>\n' +
                '<body>\n' + window.generateLifecycleHtmlContent(true) + '\n</body></html>';

            const fileBlob = new Blob([wordContent], { type: 'application/msword;charset=utf-8' });
            await supabase.storage.from('documents-history').upload(fileName, fileBlob, { upsert: true });
        } catch (err) {
            console.error('Ошибка архивации файла:', err.message);
        }
    };

    // Первая инициализация полей ввода
    window.switchLifecycleFields();
}