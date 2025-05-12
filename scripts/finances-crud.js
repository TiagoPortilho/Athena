const transactionModal = new bootstrap.Modal(document.getElementById('transactionModal'));
const transactionForm = document.getElementById('transactionForm');
const btnNewTransaction = document.getElementById('btnNewTransaction');
let editingTransactionId = null;

// Format currency
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Load transactions
async function loadTransactions() {
  const transactions = await window.api.listTransactions();
  
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  updateTable('incomeTable', incomeTransactions);
  updateTable('expensesTable', expenseTransactions);
  updateSummary(transactions);
}

function updateTable(tableId, transactions) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  const totalCell = document.getElementById(tableId === 'incomeTable' ? 'incomeTotalCell' : 'expensesTotalCell');
  
  tbody.innerHTML = transactions.map(t => `
    <tr>
      <td>${t.description}</td>
      <td>${formatCurrency(t.value)}</td>
      <td>
        <div class="d-flex gap-2">
          <button class="btn-action edit" onclick="openTransactionForm(${t.id})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="btn-action delete" onclick="deleteTransaction(${t.id})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18"></path>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  const total = transactions.reduce((sum, t) => sum + t.value, 0);
  totalCell.textContent = formatCurrency(total);
}

function updateSummary(transactions) {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.value, 0);
    
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.value, 0);
    
  const balance = income - expenses;

  document.getElementById('totalIncome').textContent = formatCurrency(income);
  document.getElementById('totalExpenses').textContent = formatCurrency(expenses);
  document.getElementById('totalBalance').textContent = formatCurrency(balance);
}

function openTransactionForm(id = null) {
  editingTransactionId = id;
  const title = id ? 'Edit Transaction' : 'New Transaction';
  document.getElementById('transactionModalLabel').textContent = title;
  
  if (id) {
    window.api.getTransaction(id).then(transaction => {
      transactionForm.querySelector(`input[value="${transaction.type}"]`).checked = true;
      transactionForm.description.value = transaction.description;
      transactionForm.value.value = transaction.value;
    });
  } else {
    transactionForm.reset();
  }
  
  transactionModal.show();
}

async function deleteTransaction(id) {
  if (confirm('Are you sure you want to delete this transaction?')) {
    await window.api.deleteTransaction(id);
    loadTransactions();
  }
}

btnNewTransaction.onclick = () => openTransactionForm();

transactionForm.onsubmit = async (e) => {
  e.preventDefault();
  
  const data = {
    type: transactionForm.querySelector('input[name="type"]:checked').value,
    description: transactionForm.description.value,
    value: parseFloat(transactionForm.value.value)
  };

  if (editingTransactionId) {
    await window.api.updateTransaction({ id: editingTransactionId, ...data });
  } else {
    await window.api.createTransaction(data);
  }

  transactionModal.hide();
  loadTransactions();
};

// Initialize
window.openTransactionForm = openTransactionForm;
window.deleteTransaction = deleteTransaction;
window.addEventListener('DOMContentLoaded', loadTransactions);
