"use strict";

///////////////////
/// BANKIST APP ///
///////////////////

//////////////////// Data ////////////////////

const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2020-05-27T17:01:17.194Z",
    "2020-07-11T23:36:17.929Z",
    "2024-03-15T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2024-03-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const currencies = new Map([
  ["USD", "United States dollar"],
  ["EUR", "Euro"],
  ["GBP", "Pound sterling"],
]);

const accounts = [account1, account2];

let currentAccount, timer;

//////////////////// Elements ////////////////////

const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

//////////////////// Functions ////////////////////

const moneyFormatter = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: `currency`,
    currency: currency,
  }).format(value);
};

const usernameCreator = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((word) => word[0])
      .join("");
  });
};

const formatDate = function (date, acc) {
  const calcDate = (date1, date2) => Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDate(new Date(), date);

  if (daysPassed === 0) return `Today`;
  if (daysPassed === 1) return `Yesterday`;
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else return new Intl.DateTimeFormat(acc.locale).format(date);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = ``;

  const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;

  movs.forEach(function (mov, i) {
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatDate(date, acc);

    const type = mov > 0 ? `deposit` : `withdrawal`;
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${moneyFormatter(mov, acc.locale, acc.currency)}</div>
    </div>
    `;
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce(function (accu, move) {
    return accu + move;
  }, 0);
  labelBalance.textContent = `${moneyFormatter(acc.balance, acc.locale, acc.currency)}`;
};

const calcDisplaySummary = function (acc) {
  const income = acc.movements.filter((movement) => movement > 0).reduce((acc, movement) => acc + movement, 0);
  labelSumIn.textContent = `${moneyFormatter(income, acc.locale, acc.currency)}`;

  const out = acc.movements.filter((movement) => movement < 0).reduce((acc, movement) => acc + movement, 0);
  labelSumOut.textContent = `${moneyFormatter(out, acc.locale, acc.currency)}`;

  const interest = acc.movements
    .filter((movement) => movement > 0)
    .map((movement) => (movement * acc.interestRate) / 100)
    .filter((inter) => inter >= 1)
    .reduce((acc, inter) => acc + inter);
  labelSumInterest.textContent = `${moneyFormatter(interest, acc.locale, acc.currency)}`;
};

const updateUI = function (acc) {
  // Display Movements
  displayMovements(acc);

  // Display Balance
  calcDisplayBalance(acc);

  // Dsiplay Summary
  calcDisplaySummary(acc);
};

const setLogoutTimer = function () {
  let time = 600;
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, `0`);
    const sec = String(Math.trunc(time % 60)).padStart(2, `0`);

    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
    }

    time--;
  };

  tick();
  timer = setInterval(tick, 1000);

  return timer;
};

//////////////////// Main App ////////////////////

usernameCreator(accounts);

btnLogin.addEventListener(`click`, function (e) {
  e.preventDefault();
  currentAccount = accounts.find(function (account) {
    return account.username === inputLoginUsername.value;
  });

  const options = {
    day: `2-digit`,
    month: `2-digit`,
    year: `numeric`,
    hour: `numeric`,
    minute: `numeric`,
  };
  labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(new Date());

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Update UI
    updateUI(currentAccount);

    // Display and Welcome Message
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(" ")[0]}`;

    containerApp.style.opacity = 100;

    // Clear Fields
    inputLoginUsername.value = inputLoginPin.value = ``;

    // Reset Timer
    if (timer) clearInterval(timer);
    timer = setLogoutTimer();
  }
});

btnTransfer.addEventListener(`click`, function (e) {
  e.preventDefault();

  const transferTo = accounts.find((acc) => acc.username === inputTransferTo.value);
  const amount = Number(inputTransferAmount.value);

  if (transferTo && transferTo !== currentAccount && amount <= currentAccount.balance && amount > 0) {
    // Clear Fields
    inputTransferTo.value = inputTransferAmount.value = ``;

    // Transfer Money
    transferTo.movements.push(amount);
    currentAccount.movements.push(-amount);

    // Add Date
    transferTo.movementsDates.push(new Date());
    currentAccount.movementsDates.push(new Date());

    // Update UI
    updateUI(currentAccount);

    // Reset Timer
    clearInterval(timer);
    timer = setLogoutTimer();
  }
});

btnLoan.addEventListener(`click`, function (e) {
  e.preventDefault();

  const loanAmount = Math.trunc(inputLoanAmount.value);

  if (loanAmount > 0 && currentAccount.movements.some((movement) => movement >= loanAmount * 0.1)) {
    setTimeout(() => {
      // Loan Money
      currentAccount.movements.push(loanAmount);

      // Add Date
      currentAccount.movementsDates.push(new Date());

      // Update UI
      updateUI(currentAccount);
    }, 3000);
  }

  // Clear Field
  inputLoanAmount.value = ``;

  // Reset Timer
  clearInterval(timer);
  timer = setLogoutTimer();
});

btnClose.addEventListener(`click`, function (e) {
  e.preventDefault();

  const confirmUser = inputCloseUsername.value;
  const confirmPin = Number(inputClosePin.value);

  if (confirmUser === currentAccount.username && confirmPin === currentAccount.pin) {
    // Finde The index
    const index = accounts.findIndex((account) => account.username === confirmUser);

    // Delete The Account
    accounts.splice(index, 1);

    // Log Out
    containerApp.style.opacity = 0;
  }

  // Clear Fields
  inputCloseUsername.value = inputClosePin.value = ``;
});

let isSorted = false;
btnSort.addEventListener(`click`, function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !isSorted);
  isSorted = !isSorted;
});
