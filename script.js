let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

const form = document.getElementById('transaction-form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const list = document.getElementById('transaction-list');
const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income');
const expenseEl = document.getElementById('expense');

form.addEventListener('submit', addTransaction);

function addTransaction(e) {
  e.preventDefault();

  if (text.value.trim() === '' || amount.value.trim() === '') return;

  const transaction = {
    id: Date.now(),
    text: text.value,
    amount: +amount.value
  };

  transactions.push(transaction);
  updateUI();
  updateLocalStorage();

  text.value = '';
  amount.value = '';
}

function removeTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  updateUI();
  updateLocalStorage();
}

function updateUI() {
  list.innerHTML = '';
  transactions.forEach(addToList);

  const amounts = transactions.map(t => t.amount);
  const total = amounts.reduce((acc, item) => acc + item, 0).toFixed(2);
  const income = amounts.filter(a => a > 0).reduce((a, b) => a + b, 0).toFixed(2);
  const expense = (
    amounts.filter(a => a < 0).reduce((a, b) => a + b, 0) * -1
  ).toFixed(2);

  balanceEl.innerText = total;
  incomeEl.innerText = income;
  expenseEl.innerText = expense;
}

function addToList(transaction) {
  const sign = transaction.amount < 0 ? '-' : '+';
  const li = document.createElement('li');
  li.classList.add('transaction', transaction.amount < 0 ? 'expense' : 'income');

  li.innerHTML = `
    ${transaction.text} <span>${sign}$${Math.abs(transaction.amount)}</span>
    <button onclick="removeTransaction(${transaction.id})">❌</button>
  `;

  list.appendChild(li);
}

function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

updateUI();
const chartCtx = document.getElementById('chart').getContext('2d');

function updateChart(income, expense) {
  new Chart(chartCtx, {
    type: 'pie',
    data: {
      labels: ['Income', 'Expenses'],
      datasets: [{
        data: [income, expense],
        backgroundColor: ['green', 'red']
      }]
    },
    options: { responsive: true }
  });
}
