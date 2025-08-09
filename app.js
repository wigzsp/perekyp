// Local Storage Management
class LocalStorage {
    static get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    static set(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    static clear() {
        localStorage.clear();
    }
}

// Data Management
class DataManager {
    static generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    static getBoughtItems() {
        return LocalStorage.get('bought-items');
    }

    static getSoldItems() {
        return LocalStorage.get('sold-items');
    }

    static getAssets() {
        return LocalStorage.get('assets');
    }

    static addBoughtItem(item) {
        const items = this.getBoughtItems();
        const newItem = {
            id: this.generateId(),
            ...item,
            total: (parseFloat(item.price) * parseFloat(item.quantity)).toFixed(2),
            date: new Date().toLocaleDateString('ru-RU')
        };
        items.push(newItem);
        LocalStorage.set('bought-items', items);
        return newItem;
    }

    static addSoldItem(item) {
        const items = this.getSoldItems();
        const newItem = {
            id: this.generateId(),
            ...item,
            total: (parseFloat(item.price) * parseFloat(item.quantity)).toFixed(2),
            date: new Date().toLocaleDateString('ru-RU')
        };
        items.push(newItem);
        LocalStorage.set('sold-items', items);
        return newItem;
    }

    static addAsset(item) {
        const items = this.getAssets();
        const newItem = {
            id: this.generateId(),
            ...item,
            total: (parseFloat(item.price) * parseFloat(item.quantity)).toFixed(2),
            date: new Date().toLocaleDateString('ru-RU')
        };
        items.push(newItem);
        LocalStorage.set('assets', items);
        return newItem;
    }

    static removeItem(type, id) {
        const storageKey = type + '-items';
        const items = LocalStorage.get(storageKey);
        const filteredItems = items.filter(item => item.id !== id);
        LocalStorage.set(storageKey, filteredItems);
    }

    static removeAsset(id) {
        const items = this.getAssets();
        const filteredItems = items.filter(item => item.id !== id);
        LocalStorage.set('assets', filteredItems);
    }
}

// UI Management
class UIManager {
    static activeTab = 'bought';

    static formatCurrency(amount) {
        return `₽${Math.abs(parseFloat(amount)).toLocaleString('ru-RU')}`;
    }

    static formatProfitCurrency(amount) {
        const num = parseFloat(amount);
        const prefix = num >= 0 ? '+' : '';
        return `${prefix}${this.formatCurrency(num)}`;
    }

    static setActiveTab(tab) {
        this.activeTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('[id^="tab-"]').forEach(btn => {
            btn.className = 'py-4 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700';
        });
        document.getElementById(`tab-${tab}`).className = 'py-4 px-1 border-b-2 border-blue-500 font-medium text-sm text-blue-600';

        // Update content visibility
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        document.getElementById(`content-${tab}`).classList.remove('hidden');
    }

    static updateStats() {
        const boughtItems = DataManager.getBoughtItems();
        const soldItems = DataManager.getSoldItems();
        const assets = DataManager.getAssets();

        const totalBought = boughtItems.reduce((sum, item) => sum + parseFloat(item.total), 0);
        const totalSold = soldItems.reduce((sum, item) => sum + parseFloat(item.total), 0);
        const totalAssets = assets.reduce((sum, item) => sum + parseFloat(item.total), 0);
        const totalProfit = totalSold - totalBought;

        document.getElementById('total-bought').textContent = this.formatCurrency(totalBought);
        document.getElementById('total-sold').textContent = this.formatCurrency(totalSold);
        document.getElementById('total-assets').textContent = this.formatCurrency(totalAssets);
        
        const profitElement = document.getElementById('total-profit');
        const profitCardElement = document.getElementById('profit-card');
        
        profitElement.textContent = this.formatProfitCurrency(totalProfit);
        profitCardElement.textContent = this.formatProfitCurrency(totalProfit);
        
        // Update profit colors
        const profitClass = totalProfit >= 0 ? 'text-green-600' : 'text-red-600';
        profitElement.className = `font-semibold ml-2 ${profitClass}`;
        profitCardElement.className = `text-2xl font-bold ${profitClass}`;
    }

    static renderTable(type, items) {
        const tbody = document.getElementById(`${type}-tbody`);
        tbody.innerHTML = '';

        if (items.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                        Нет записей
                    </td>
                </tr>
            `;
            return;
        }

        items.forEach(item => {
            const row = document.createElement('tr');
            row.className = 'border-b border-gray-200 hover:bg-gray-50';
            row.innerHTML = `
                <td class="px-4 py-3">${item.name}</td>
                <td class="px-4 py-3">${this.formatCurrency(item.price)}</td>
                <td class="px-4 py-3">${item.quantity}</td>
                <td class="px-4 py-3 font-semibold">${this.formatCurrency(item.total)}</td>
                <td class="px-4 py-3 text-gray-500">${item.date}</td>
                <td class="px-4 py-3">
                    <button onclick="removeItem('${type}', '${item.id}')" class="text-red-600 hover:text-red-800 text-sm">
                        Удалить
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    static renderAssets() {
        const assets = DataManager.getAssets();
        const tbody = document.getElementById('assets-tbody');
        tbody.innerHTML = '';

        if (assets.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                        Нет записей
                    </td>
                </tr>
            `;
            return;
        }

        assets.forEach(asset => {
            const row = document.createElement('tr');
            row.className = 'border-b border-gray-200 hover:bg-gray-50';
            row.innerHTML = `
                <td class="px-4 py-3">${asset.name}</td>
                <td class="px-4 py-3">${this.formatCurrency(asset.price)}</td>
                <td class="px-4 py-3">${asset.quantity}</td>
                <td class="px-4 py-3 font-semibold">${this.formatCurrency(asset.total)}</td>
                <td class="px-4 py-3 text-gray-500">${asset.date}</td>
                <td class="px-4 py-3">
                    <button onclick="removeAsset('${asset.id}')" class="text-red-600 hover:text-red-800 text-sm">
                        Удалить
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    static clearForm(formId) {
        document.getElementById(formId).reset();
    }

    static showNotification(message, type = 'success') {
        // Simple notification using alert for now
        alert(message);
    }
}

// Event Handlers
function setActiveTab(tab) {
    UIManager.setActiveTab(tab);
}

function removeItem(type, id) {
    if (confirm('Вы уверены, что хотите удалить эту запись?')) {
        DataManager.removeItem(type, id);
        updateDisplay();
        UIManager.showNotification('Запись удалена');
    }
}

function removeAsset(id) {
    if (confirm('Вы уверены, что хотите удалить эту запись?')) {
        DataManager.removeAsset(id);
        updateDisplay();
        UIManager.showNotification('Запись удалена');
    }
}

function clearAllData() {
    if (confirm('Вы уверены, что хотите удалить ВСЕ данные? Это действие нельзя отменить.')) {
        LocalStorage.clear();
        updateDisplay();
        UIManager.showNotification('Все данные удалены');
    }
}

function updateDisplay() {
    UIManager.updateStats();
    UIManager.renderTable('bought', DataManager.getBoughtItems());
    UIManager.renderTable('sold', DataManager.getSoldItems());
    UIManager.renderAssets();
}

// Form Handlers
function setupForms() {
    // Bought form
    document.getElementById('bought-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const item = {
            name: document.getElementById('bought-name').value,
            price: document.getElementById('bought-price').value,
            quantity: document.getElementById('bought-quantity').value
        };
        
        if (item.name && item.price && item.quantity) {
            DataManager.addBoughtItem(item);
            UIManager.clearForm('bought-form');
            updateDisplay();
            UIManager.showNotification('Покупка добавлена');
        }
    });

    // Sold form
    document.getElementById('sold-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const item = {
            name: document.getElementById('sold-name').value,
            price: document.getElementById('sold-price').value,
            quantity: document.getElementById('sold-quantity').value
        };
        
        if (item.name && item.price && item.quantity) {
            DataManager.addSoldItem(item);
            UIManager.clearForm('sold-form');
            updateDisplay();
            UIManager.showNotification('Продажа добавлена');
        }
    });

    // Assets form
    document.getElementById('assets-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const item = {
            name: document.getElementById('assets-name').value,
            price: document.getElementById('assets-price').value,
            quantity: document.getElementById('assets-quantity').value
        };
        
        if (item.name && item.price && item.quantity) {
            DataManager.addAsset(item);
            UIManager.clearForm('assets-form');
            updateDisplay();
            UIManager.showNotification('Имущество добавлено');
        }
    });
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    setupForms();
    updateDisplay();
    UIManager.setActiveTab('bought');
});