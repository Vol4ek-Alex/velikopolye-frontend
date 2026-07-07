// js/docs/lifecycle/defectAct.js

export const defectTemplate = '\n' +
'<div id="form_block_defect" class="space-y-4 pt-4 fade-in-sub">\n' +
'    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">\n' +
'        <div>\n' +
'            <label class="block text-[10px] font-bold text-gray-700 uppercase">Номер акта</label>\n' +
'            <input type="text" id="defect_num" value="1" class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1">\n' +
'        </div>\n' +
'        <div>\n' +
'            <label class="block text-[10px] font-bold text-gray-700 uppercase">Дата осмотра</label>\n' +
'            <input type="date" id="defect_date" class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1">\n' +
'        </div>\n' +
'        <div>\n' +
'            <label class="block text-[10px] font-bold text-gray-700 uppercase">Механизатор / Водитель</label>\n' +
'            <input type="text" id="defect_driver" class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1">\n' +
'        </div>\n' +
'    </div>\n' +
'    <div>\n' +
'        <label class="block text-[10px] font-bold text-gray-700 uppercase">Выявленные неисправности</label>\n' +
'        <textarea id="defect_faults" rows="3" placeholder="Описание поломок..." class="w-full border-2 border-gray-900 rounded-xl p-2 text-xs font-semibold mt-1"></textarea>\n' +
'    </div>\n' +
'    <div class="flex justify-end">\n' +
'        <button onclick="window.generateDefectDoc()" class="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition">💾 Сгенерировать Дефектный Акт Word</button>\n' +
'    </div>\n' +
'</div>\n' +
'';

window.generateDefectDoc = async () => {
    const vehicle = window.getActiveVehicle();
    if (!vehicle) return alert('Сначала выберите машину из таблицы!');

    const num = document.getElementById('defect_num').value;
    const date = document.getElementById('defect_date').value;
    const driver = document.getElementById('defect_driver').value;
    const faults = document.getElementById('defect_faults').value;

    const htmlContent = '<div class="print-page-a4">' +
        '<p align="right">УТВЕРЖДАЮ<br>Директор филиала СХК «Великополье»<br>________________ Д.С. Рунцевич</p>' +
        '<h2 align="center">ДЕФЕКТНЫЙ АКТ № ' + num + '</h2>' +
        '<p align="center">от ' + date + '</p>' +
        '<p>Комиссия в составе председателя главного инженера Маковича М.П., инженера по ЭМТП Волчка А.А., составила настоящий акт о том, что в ходе осмотра техники <b>' + vehicle.brand + ' ' + vehicle.model + '</b>, инв. № <b>' + vehicle.inv_num + '</b> под управлением <b>' + driver + '</b> выявлено:</p>' +
        '<p style="border:1px solid black; padding:10px; min-height:100px;">' + (faults || 'Неисправностей не обнаружено.') + '</p>' +
        '<br><p>Председатель комиссии: _________ М.П. Макович</p>' +
        '<p>Член комиссии: _________ А.А. Волчёк</p>' +
        '</div>';

    if (typeof window.uploadLifecycleToStorage === 'function') {
        window.uploadLifecycleToStorage('defect_' + num + '_' + vehicle.inv_num + '.doc', htmlContent);
    }
};