

// Mengambil elemen HTML
const form = document.getElementById('expense-form');
const transactionList = document.getElementById('transaction-list');
const totalBalanceEl = document.getElementById('total-balance');
const themeToggleBtn = document.getElementById('theme-toggle');
const sortSelect = document.getElementById('sort-transactions');

// State penyimpanan (dari Local Storage API)
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let chartInstance = null;

// Saat aplikasi dijalankan
function init() {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    }
    updateUI();
}

// Menambah transaksi baru
form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('item-name').value.trim();
    const amount = parseFloat(document.getElementById('item-amount').value);
    let category = document.getElementById('item-category').value;
    const customCategory = document.getElementById('custom-category').value.trim();
    
    // Opsional 2: Jika kategori custom diisi, gunakan kategori custom
    if (customCategory !== '') {
        category = customCategory;
    }
    
    if (!name || isNaN(amount) || !category) {
        alert('Please fill all required fields');
        return;
    }
    
    const transaction = {
        id: Date.now(), // Generate ID unik
        name: name,
        amount: amount,
        category: category
    };
    
    transactions.push(transaction);
    saveData();
    updateUI();
    form.reset(); // Kosongkan form kembali
});

// Menghapus transaksi
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveData();
    updateUI();
}

// Simpan data ke browser Local Storage
function saveData() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Update antarmuka keseluruhan
function updateUI() {
    renderList();
    updateBalance();
    updateChart();
}

// Opsional 3: Mengurutkan dan render list ke layar
function renderList() {
    transactionList.innerHTML = '';
    
    let sortedTransactions = [...transactions];
    const sortVal = sortSelect.value;
    
    if (sortVal === 'amount-desc') {
        sortedTransactions.sort((a, b) => b.amount - a.amount);
    } else if (sortVal === 'amount-asc') {
        sortedTransactions.sort((a, b) => a.amount - b.amount);
    } else if (sortVal === 'category') {
        sortedTransactions.sort((a, b) => a.category.localeCompare(b.category));
    } else { // date-desc (default)
        sortedTransactions.sort((a, b) => b.id - a.id);
    }
    
    sortedTransactions.forEach(t => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="item-info">
                <strong>${t.name}</strong>
                <span class="item-category">${t.category}</span>
            </div>
            <div>
                <span style="margin-right:15px; font-weight:bold;">Rp ${t.amount.toLocaleString()}</span>
                <button class="delete-btn" onclick="deleteTransaction(${t.id})">X</button>
            </div>
        `;
        transactionList.appendChild(li);
    });
}

// Event trigger saat pilihan urutan diubah
sortSelect.addEventListener('change', renderList);

// Render Total Balance
function updateBalance() {
    const total = transactions.reduce((acc, t) => acc + t.amount, 0);
    totalBalanceEl.innerText = `Rp ${total.toLocaleString()}`;
}

// Render Visual Chart menggunakan Chart.js
function updateChart() {
    const ctx = document.getElementById('expense-chart').getContext('2d');
    
    const categoryTotals = {};
    transactions.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    
    if (chartInstance) chartInstance.destroy();
    
    chartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
            }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
}

// Opsional 1: Toggle Mode Gelap/Terang
themeToggleBtn.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    if (isDark) {
        document.body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
    } else {
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
});

// Jalankan sistem
init();
