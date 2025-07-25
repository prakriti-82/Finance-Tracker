const conversionRate = 83.0; // 1 USD = 83 INR
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

const form = document.getElementById('transaction-form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const list = document.getElementById('transaction-list');
const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income');
const expenseEl = document.getElementById('expense');
const incomeBar = document.querySelector('.income-bar');
const expenseBar = document.querySelector('.expense-bar');

form.addEventListener('submit', addTransaction);

function addTransaction(e) {
  e.preventDefault();

  if (text.value.trim() === '' || amount.value.trim() === '') return;

  const currency = document.getElementById('currency').value;
  const type = document.getElementById('type').value;
  let inputAmount = +amount.value;

  if (type === 'expense') inputAmount *= -1;

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

function removeTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  updateLocalStorage();
  updateUI();
}

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

function updateUI() {
  list.innerHTML = '';
  transactions.forEach(addToList);

  const rupeeAmounts = transactions.map(t => t.rupeeAmount);

  const total = rupeeAmounts.reduce((acc, val) => acc + val, 0).toFixed(2);
  const income = rupeeAmounts.filter(val => val > 0).reduce((acc, val) => acc + val, 0).toFixed(2);
  const expense = (
    rupeeAmounts.filter(val => val < 0).reduce((acc, val) => acc + val, 0) * -1
  ).toFixed(2);

  balanceEl.innerText = `₹${total} / $${(total / conversionRate).toFixed(2)}`;
  incomeEl.innerText = `₹${income} / $${(income / conversionRate).toFixed(2)}`;
  expenseEl.innerText = `₹${expense} / $${(expense / conversionRate).toFixed(2)}`;

  updateBars(income, expense);
}

function updateBars(income, expense) {
  const total = parseFloat(income) + parseFloat(expense);
  const incomePercent = total ? (parseFloat(income) / total) * 100 : 0;
  const expensePercent = total ? (parseFloat(expense) / total) * 100 : 0;

  incomeBar.style.width = `${incomePercent}%`;
  expenseBar.style.width = `${expensePercent}%`;
}

function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function resetTransactions() {
  if (confirm("Are you sure you want to reset all transactions?")) {
    transactions = [];
    updateLocalStorage();
    updateUI();
  }
}

updateUI();



