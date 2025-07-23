const conversionRate = 83.0; // 1 USD = 83 INR
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

const form = document.getElementById('transaction-form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const list = document.getElementById('transaction-list');
const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income');
const expenseEl = document.getElementById('expense');

form.addEventListener('submit', addTransaction);

// Add a transaction
function addTransaction(e) {
  e.preventDefault();

  if (text.value.trim() === '' || amount.value.trim() === '') return;

  const currency = document.getElementById('currency').value;
  const inputAmount = +amount.value;

  let rupeeAmount, dollarAmount;

  if (currency === 'INR') {
    rupeeAmount = inputAmount;
    dollarAmount = +(inputAmount / conversionRate).toFixed(2);
  } else {
    dollarAmount = inputAmount;
    rupeeAmount = +(inputAmount * conversionRate).toFixed(2);
  }

  const transaction = {
    id: Date.now(),
    text: text.value,
    rupeeAmount,
    dollarAmount
  };

  transactions.push(transaction);
  updateLocalStorage();
  updateUI();

  text.value = '';
  amount.value = '';
}


// Remove a transaction
function removeTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  updateLocalStorage();
  updateUI();
}

// Add transaction to list
function addToList(transaction) {
  const sign = transaction.rupeeAmount < 0 ? '-' : '+';
  const li = document.createElement('li');
  li.classList.add('transaction', transaction.rupeeAmount < 0 ? 'expense' : 'income');

  li.innerHTML = `
    ${transaction.text}
    <span>${sign}₹${Math.abs(transaction.rupeeAmount).toFixed(2)} / $${Math.abs(transaction.dollarAmount).toFixed(2)}</span>
    <button onclick="removeTransaction(${transaction.id})">❌</button>
  `;

  list.appendChild(li);
}

// Update UI
function updateUI() {
  list.innerHTML = '';
  transactions.forEach(addToList);

  const rupeeAmounts = transactions.map(t => t.rupeeAmount);

  const total = rupeeAmounts.reduce((acc, val) => acc + val, 0).toFixed(2);
  const income = rupeeAmounts
    .filter(val => val > 0)
    .reduce((acc, val) => acc + val, 0)
    .toFixed(2);
  const expense = (
    rupeeAmounts.filter(val => val < 0).reduce((acc, val) => acc + val, 0) * -1
  ).toFixed(2);

  balanceEl.innerText = `₹${total} / $${(total / conversionRate).toFixed(2)}`;
  incomeEl.innerText = `₹${income} / $${(income / conversionRate).toFixed(2)}`;
  expenseEl.innerText = `₹${expense} / $${(expense / conversionRate).toFixed(2)}`;

  updateChart(income, expense);
}

// Save to localStorage
function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Chart.js
const chartCtx = document.getElementById('chart').getContext('2d');
let pieChart;

function updateChart(income, expense) {
  if (pieChart) pieChart.destroy();

  pieChart = new Chart(chartCtx, {
    type: 'pie',
    data: {
      labels: ['Income', 'Expenses'],
      datasets: [{
        data: [income, expense],
        backgroundColor: ['#28a745', '#dc3545']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        }
      }
    }
  });
}
// ✅ Reset all transactions
function resetTransactions() {
  if (confirm("Are you sure you want to reset all transactions?")) {
    transactions = [];
    updateLocalStorage();
    updateUI();
  }
}

// Initial render
updateUI();

