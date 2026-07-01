import { loadFleet, saveVehicle } from './fleet.js';

// Глобальные функции для работы с модальным окном в HTML
window.loadFleet = loadFleet;

window.openAddModal = () => {
    document.getElementById('vehicleId').value = '';
    document.getElementById('modalModel').value = '';
    document.getElementById('modalPlate').value = '';
    document.getElementById('modalTitle').innerText = 'Добавить технику';
    document.getElementById('vehicleModal').classList.remove('hidden');
    document.getElementById('vehicleModal').classList.add('flex');
};

window.openEditModal = (id, model, plate) => {
    document.getElementById('vehicleId').value = id;
    document.getElementById('modalModel').value = model === 'null' ? '' : model;
    document.getElementById('modalPlate').value = plate === 'null' ? '' : plate;
    document.getElementById('modalTitle').innerText = 'Редактировать технику';
    document.getElementById('vehicleModal').classList.remove('hidden');
    document.getElementById('vehicleModal').classList.add('flex');
};

window.closeModal = () => {
    document.getElementById('vehicleModal').classList.remove('flex');
    document.getElementById('vehicleModal').classList.add('hidden');
};

window.handleFormSubmit = (e) => {
    e.preventDefault();
    const id = document.getElementById('vehicleId').value;
    const model = document.getElementById('modalModel').value;
    const plate = document.getElementById('modalPlate').value;
    saveVehicle(id, model, plate);
};

// Старт при загрузке
document.addEventListener('DOMContentLoaded', () => {
    loadFleet();
});