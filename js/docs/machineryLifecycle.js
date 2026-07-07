// js/docs/machineryLifecycle.js

export const machineryLifecycleTemplate = `
<div id="subModule_machinery_lifecycle" class="hidden space-y-4 fade-in-sub">
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
                font-size: 12pt !important;
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
    </style>

    <div class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border-2 border-gray-900 shadow-xs">
        <div>
            <h2 class="text-xs font-black text-gray-900 uppercase tracking-wider">🚜 Жизненный цикл и акты техники</h2>
            <p class="text-[11px] text-gray-500 font-medium">Выберите тип документа и номер акта для формирования бланка</p>
        </div>
        <div class="flex items-center gap-2">
            <select id="lifecycleDocType" class="border-2 border-gray-900 rounded-xl px-3 py-1.5 text-xs font-bold bg-white focus:outline-none">
                <option value="storage">❄️ Акт постановки на хранение (ГОСТ)</option>
                <option value="defect">🛠️ Дефектный акт комиссии</option>
                <option value="repair_out">🟢 Акт приема из ремонта</option>
                <option value="to_report">⚙️ Рапорт проведения ТО</option>
            </select>
            <input type="text" id="lifecycleNum" value="1" placeholder="№ акта" class="border-2 border-gray-900 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none w-20 text-center">
        </div>
    </div>

    <div id="lifecycleFormsContainer" class="bg-white border-2 border-gray-900 rounded-2xl p-6 shadow-xs">
        </div>
</div>
`;

window.generateLifecycleHtmlContent = (forWord = false) => {
    const docType = document.getElementById('lifecycleDocType')?.value || 'storage';
    
    // Вызываем строго те функции, которые объявлены в подмодулях
    if (docType === 'storage' && typeof window.getStorageHtml === 'function') {
        return window.getStorageHtml(forWord);
    }
    if (docType === 'defect' && typeof window.getDefectHtml === 'function') {
        return window.getDefectHtml(forWord);
    }
    if (docType === 'repair_out' && typeof window.getRepairOutHtml === 'function') {
        return window.getRepairOutHtml(forWord);
    }
    if (docType === 'to_report' && typeof window.getToReportHtml === 'function') {
        return window.getToReportHtml(forWord);
    }
    return '<p>Ошибка: Модуль документа не найден или не инициализирован.</p>';
};

export async function initMachineryLifecycle() {
    const supabase = window._supabase || window.supabase;
    if (!supabase) return;

    // Автоматический переключатель отображения блоков форм в зависимости от селекта
    document.getElementById('lifecycleDocType')?.addEventListener('change', (e) => {
        const val = e.target.value;
        ['storage', 'defect', 'repair_out', 'to_report'].forEach(type => {
            const el = document.getElementById(`form_block_${type}`);
            if (el) {
                if (type === val) el.classList.remove('hidden');
                else el.classList.add('hidden');
            }
        });
    });
}