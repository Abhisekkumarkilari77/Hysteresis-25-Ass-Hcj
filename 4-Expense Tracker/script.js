const STORAGE_KEY = 'expenseTrackerData';
const THEME_KEY = 'expenseTrackerTheme';
const CURRENCY_KEY = 'expenseTrackerCurrency';
let transactions = [];
let editingId = null;
let currency = '₹';
const form = document.getElementById('transactionForm');
const nameInput = document.getElementById('name');
const amountInput = document.getElementById('amount');
const typeSelect = document.getElementById('type');
const categorySelect = document.getElementById('category');
const dateInput = document.getElementById('date');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const formTitle = document.getElementById('formTitle');
const transactionsList = document.getElementById('transactionsList');
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpense');
const balanceEl = document.getElementById('balance');
const filterType = document.getElementById('filterType');
const filterCategory = document.getElementById('filterCategory');
const sortBy = document.getElementById('sortBy');
const themeToggle = document.getElementById('themeToggle');
const resetData = document.getElementById('resetData');
const exportCSV = document.getElementById('exportCSV');
const categoryChart = document.getElementById('categoryChart');
function init() {
    loadFromLocalStorage();
    loadTheme();
    setDefaultDate();
    renderTransactions();
    updateSummary();
    updateCategoryBreakdown();
    attachEventListeners();
}
function loadFromLocalStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        transactions = JSON.parse(data);
    }
    
    const savedCurrency = localStorage.getItem(CURRENCY_KEY);
    if (savedCurrency) {
        currency = savedCurrency;
    }
}

function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function loadTheme() {
    const theme = localStorage.getItem(THEME_KEY);
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.textContent = '☀️';
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
}
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
}
function attachEventListeners() {
    form.addEventListener('submit', handleSubmit);
    cancelBtn.addEventListener('click', cancelEdit);
    filterType.addEventListener('change', renderTransactions);
    filterCategory.addEventListener('change', renderTransactions);
    sortBy.addEventListener('change', renderTransactions);
    themeToggle.addEventListener('click', toggleTheme);
    resetData.addEventListener('click', handleReset);
    exportCSV.addEventListener('click', handleExportCSV);
}
function handleSubmit(e) {
    e.preventDefault();
    
    const name = nameInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const type = typeSelect.value;
    const category = categorySelect.value;
    const date = dateInput.value;
    if (!name) {
        alert('Please enter a description');
        return;
    }
    
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    if (editingId !== null) {
        const index = transactions.findIndex(t => t.id === editingId);
        if (index !== -1) {
            transactions[index] = {
                ...transactions[index],
                name,
                amount,
                type,
                category,
                date
            };
        }
        editingId = null;
        submitBtn.textContent = 'Add Transaction';
        cancelBtn.style.display = 'none';
        formTitle.textContent = 'Add Transaction';
    } else {
        const transaction = {
            id: Date.now(),
            name,
            amount,
            type,
            category,
            date
        };
        transactions.push(transaction);
    }
    
    saveToLocalStorage();
    form.reset();
    setDefaultDate();
    renderTransactions();
    updateSummary();
    updateCategoryBreakdown();
}
function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;
    
    nameInput.value = transaction.name;
    amountInput.value = transaction.amount;
    typeSelect.value = transaction.type;
    categorySelect.value = transaction.category;
    dateInput.value = transaction.date;
    
    editingId = id;
    submitBtn.textContent = 'Update Transaction';
    cancelBtn.style.display = 'inline-block';
    formTitle.textContent = 'Edit Transaction';
    form.scrollIntoView({ behavior: 'smooth' });
}
function cancelEdit() {
    editingId = null;
    form.reset();
    setDefaultDate();
    submitBtn.textContent = 'Add Transaction';
    cancelBtn.style.display = 'none';
    formTitle.textContent = 'Add Transaction';
}
function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveToLocalStorage();
        renderTransactions();
        updateSummary();
        updateCategoryBreakdown();
    }
}
function getFilteredAndSortedTransactions() {
    let filtered = [...transactions];
    const typeFilter = filterType.value;
    if (typeFilter !== 'all') {
        filtered = filtered.filter(t => t.type === typeFilter);
    }
    const categoryFilter = filterCategory.value;
    if (categoryFilter !== 'all') {
        filtered = filtered.filter(t => t.category === categoryFilter);
    }
    const sortOption = sortBy.value;
    filtered.sort((a, b) => {
        switch (sortOption) {
            case 'date-desc':
                return new Date(b.date) - new Date(a.date);
            case 'date-asc':
                return new Date(a.date) - new Date(b.date);
            case 'amount-desc':
                return b.amount - a.amount;
            case 'amount-asc':
                return a.amount - b.amount;
            default:
                return 0;
        }
    });
    
    return filtered;
}
function renderTransactions() {
    const filtered = getFilteredAndSortedTransactions();
    
    if (filtered.length === 0) {
        transactionsList.innerHTML = `
            <div class="empty-state">
                <p>No transactions found</p>
            </div>
        `;
        return;
    }
    
    transactionsList.innerHTML = filtered.map(t => `
        <div class="transaction-item ${t.type}">
            <div class="transaction-info">
                <div class="transaction-header">
                    <span class="transaction-name">${t.name}</span>
                    <span class="transaction-type ${t.type}">${t.type}</span>
                </div>
                <div class="transaction-details">
                    ${t.category} • ${formatDate(t.date)}
                </div>
            </div>
            <p class="transaction-amount ${t.type}">
                ${t.type === 'income' ? '+' : '-'}${currency}${t.amount.toFixed(2)}
            </p>
            <div class="transaction-actions">
                <button class="action-btn edit-btn" onclick="editTransaction(${t.id})">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteTransaction(${t.id})">Delete</button>
            </div>
        </div>
    `).join('');
}
function updateSummary() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expense;
    
    totalIncomeEl.textContent = `${currency}${income.toFixed(2)}`;
    totalExpenseEl.textContent = `${currency}${expense.toFixed(2)}`;
    balanceEl.textContent = `${currency}${balance.toFixed(2)}`;
}
function updateCategoryBreakdown() {
    const expenses = transactions.filter(t => t.type === 'expense');
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    
    if (totalExpense === 0) {
        categoryChart.innerHTML = `
            <div class="empty-state">
                <p>No expense data available</p>
            </div>
        `;
        return;
    }
    
    const categoryTotals = {};
    expenses.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    
    const sortedCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1]);
    
    categoryChart.innerHTML = sortedCategories.map(([category, amount]) => {
        const percentage = (amount / totalExpense * 100).toFixed(1);
        return `
            <div class="category-item">
                <div class="category-header">
                    <span class="category-name">${category}</span>
                    <span class="category-amount">${currency}${amount.toFixed(2)}</span>
                </div>
                <div class="category-bar">
                    <div class="category-fill" style="width: ${percentage}%">
                        ${percentage}%
                    </div>
                </div>
            </div>
        `;
    }).join('');
}
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}
function handleReset() {
    if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
        transactions = [];
        saveToLocalStorage();
        renderTransactions();
        updateSummary();
        updateCategoryBreakdown();
        cancelEdit();
    }
}
function handleExportCSV() {
    if (transactions.length === 0) {
        alert('No transactions to export');
        return;
    }
    
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
    const rows = transactions.map(t => [
        t.date,
        t.name,
        t.category,
        t.type,
        t.amount.toFixed(2)
    ]);
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(field => `"${field}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-tracker-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}
init();
