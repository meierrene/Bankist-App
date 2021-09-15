'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const account5 = {
  owner: 'René Meier',
  movements: [27, -9.99, 1000, 700, -49.79, 99, 900.7, -300],
  interestRate: 2,
  pin: 9999,
};

const accounts = [account1, account2, account3, account4, account5];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

let checked = document.querySelector('.checkbox');
checked.addEventListener('click', function () {
  inputLoginPin.type === 'password'
    ? (inputLoginPin.type = 'text')
    : (inputLoginPin.type = 'password');
});

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';
  // is like .textContent = 0;

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
    <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__value">${mov.toFixed(2)}</div>
        </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance.toFixed(2)} €`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes.toFixed(2)}€`;

  const outcomes = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(outcomes.toFixed(2))}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

const createUserNames = function (accounts) {
  accounts.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

createUserNames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc.movements);
  // Display balance
  calcDisplayBalance(acc);
  // Display summary
  calcDisplaySummary(acc);
  // Blanking fields
  inputLoginUsername.value = inputLoginPin.value = '';
  inputLoginPin.blur();
  inputCloseUsername.value = inputClosePin.value = '';
  inputLoanAmount.value = '';
  inputTransferAmount.value = inputTransferTo.value = '';
};

// Event Handler
let currentAccount;

btnLogin.addEventListener('click', function (e) {
  //Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // This ? will only show if currentAccount exists like=> (Optional chaining)
    // acc.username === inputLoginUsername.value && currentAccount.pin === inputLoginPin.value

    // Display UI and welcome message
    labelWelcome.textContent = `Welcome back ${
      currentAccount.owner.split(' ')[0]
    }`;

    containerApp.style.opacity = 100;

    // Clear input fields

    //Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    //Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    currentAccount.movements.push(amount);

    //Update UI
    updateUI(currentAccount);
  }
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(acc => acc === currentAccount);

    // Delete account
    accounts.splice(index, 1);

    //  Hide UI
    containerApp.style.opacity = 0;
    labelWelcome.textContent = 'Log in to get started';
  }
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
const eurToUsd = 1.1;

/////////////////////////////////////////////////
//--------------------------------------------------------------------------
// // Simple Array Methods

// let arr = ['a', 'b', 'c', 'd', 'e'];
// // Slice
// console.log(arr.slice(2)); // c,d,e
// console.log(arr.slice(2, 4)); // c,d
// console.log(arr.slice(-2)); // d,e
// console.log(arr.slice(-1)); // e
// console.log(arr.slice(1, -2)); // b,c
// console.log([...arr]); // a,b,c,d,e

// // Splice
// console.log(arr.splice(2)); // Shows c,d,e and delete them!
// // arr.splice(-1);
// console.log(arr); // now it's only a,b

// // Reverse
// arr = ['a', 'b', 'c', 'd', 'e'];
// const arr2 = ['j', 'i', 'h', 'g', 'f'];
// console.log(arr2.reverse()); // f,g,h,i,j
// console.log(arr2); // also mutates!

// // Concat
// const letters = arr.concat(arr2);
// console.log(letters); // a,b,c,d,e,f,g,h,i,j
// console.log([...arr, ...arr2]); // a,b,c,d,e,f,g,h,i,j ALSO WORKS!

// // Join
// console.log(letters.join('-')); // a-b-c-d-e-f-g-h-i-j

//--------------------------------------------------------------------------
// // forEach Methods

// for (const [i, movement] of movements.entries()) {
//   movement > 0
//     ? console.log(`Movement ${i + 1}: You deposited ${movement}`)
//     : console.log(`Movement ${i + 1}: You withdrew ${Math.abs(movement)}`);
// }

// // It also works with...
// console.log('-----------FOR EACH-----------');
// movements.forEach(function (movement, i, arr) {
//   movement > 0
//     ? console.log(`Movement ${i + 1}: You deposited ${movement}`)
//     : console.log(`Movement ${i + 1}: You withdrew ${Math.abs(movement)}`);
// });
// // 0: function(200)
// // 1: function(450)
// // 2: function(-400)
// // ...

//--------------------------------------------------------------------------
// forEach with Maps and Sets

// // Map
// const currencies = new Map([
//   ['USD', 'United States dollar'], // [key, value]
//   ['EUR', 'Euro'],
//   ['GBP', 'Pound sterling'],
// ]);

// currencies.forEach(function (value, key, map) {
//   console.log(`${key}: ${value}`);
// });

// // Set
// const currenciesUnique = new Set(['USD', 'GBP', 'USD', 'EUR', 'EUR']); // [key,key,key,...]
// console.log(currenciesUnique);
// currenciesUnique.forEach(function (value, key, map) {
//   // value = key for Sets
//   console.log(`${value}: ${key}`); //value = map for sets
// });

//--------------------------------------------------------------------------
// // Exercise 1

// const checkdogs = function (dataJulia, dataKate) {
//   dataJulia.splice(0, 1);
//   dataJulia.splice(-2, 2);
//   const data = dataJulia.concat(dataKate);
//   data.forEach(function (age, i) {
//     const isAdult =
//       age >= 3
//         ? `Dog number ${i + 1} is an adult, and is ${age} years old`
//         : `Dog number ${i + 1} is still a puppy 🐶`;
//     console.log(`${isAdult}`);
//   });
// };

// checkdogs([3, 5, 2, 12, 7], [4, 1, 15, 8, 3]);
// console.log('----------------------------');
// checkdogs([9, 16, 6, 8, 3], [10, 5, 6, 1, 4]);

//--------------------------------------------------------------------------
// // Exercise 2
// const checkdogs2 = function (data) {
//   const humanAge = data.map(age => (age <= 2 ? age * 2 : 16 + age * 4));
//   console.log(humanAge);

//   const humanAgeOlder = humanAge.filter(age => age >= 18);
//   console.log(humanAgeOlder);

//   const average = humanAgeOlder.reduce(
//     (acc, age, i, arr) => acc + age / arr.length,
//     0
//   );
//   console.log(average);
//   return average;
// };

// checkdogs2([5, 2, 4, 1, 15, 8, 3]);
// console.log('----------------------------');
// checkdogs2([16, 6, 10, 5, 6, 1, 4]);

//--------------------------------------------------------------------------
// // Exercise 3

// const checkdogs3 = function (data) {
//   const humanAge = data
//     .map(age => (age <= 2 ? age * 2 : 16 + age * 4))
//     .filter(age => age >= 18)
//     .reduce((acc, age, i, arr) => acc + age / arr.length, 0);
//   console.log(humanAge);
//   return humanAge;
// };

// checkdogs3([5, 2, 4, 1, 15, 8, 3]);
// console.log('----------------------------');
// checkdogs3([16, 6, 10, 5, 6, 1, 4]);

//--------------------------------------------------------------------------
// // The map Method

// // const movementsUSD = movements.map(function (mov) {
// //   return mov * eurToUsd;
// // });

// // or can be done either by Arrow function
// const movementsUSD = movements.map(mov => mov * eurToUsd);

// console.log(movements);
// console.log(movementsUSD);

// // also applies for-of operation
// const movementsUSD2 = [];

// for (const mov of movements) movementsUSD2.push(mov * eurToUsd);

// console.log(movementsUSD2);

// const movementsDescriptions = movements.map(
//   (mov, i) =>
//     `Movement ${i + 1}: You ${mov > 0 ? `deposited ` : `withdrew `}${Math.abs(
//       mov
//     )}`
// );

// console.log(movementsDescriptions);

//--------------------------------------------------------------------------
// // The filter Method

// const deposits = movements.filter(function (mov) {
//   return mov > 0;
// });
// console.log(movements);
// console.log(deposits);

// const deposits2 = [];
// for (const mov of movements) mov > 0 ? deposits2.push(mov) : '';
// console.log(deposits2);

// const withdrawals = movements.filter(mov => mov < 0);

// console.log(withdrawals);

//--------------------------------------------------------------------------
// // The reduce Method
// console.log(movements);

// // acc -> accumulator -> snowball
// const balance = movements.reduce((acc, cur) => acc + cur, 0); // 0 is a starter value

// console.log(balance);

// let balance2 = 0;
// for (const mov of movements) balance2 += mov;

// console.log(balance2);

// // Maxium value
// debugger;
// const max = movements.reduce(
//   (acc, mov) => (acc > mov ? acc : mov),
//   movements[0]
// );
// console.log(max);

//--------------------------------------------------------------------------
// // Chaining Methods
// // Pipeline
// const totalDepositsUSD = movements
//   .filter(mov => mov > 0)
//   .map(mov => mov * eurToUsd)
//   .reduce((acc, mov) => acc + mov, 0);

// console.log(totalDepositsUSD);

//--------------------------------------------------------------------------
// // The find Method

// const firstWithdrawal = movements.find(mov => mov < 0);
// console.log(movements);
// console.log(firstWithdrawal);

// console.log(accounts);

// const acc1 = accounts.find(acc => acc.owner === 'René Meier');
// console.log(acc1);

// // SImilar as for-of in this statement
// let acc2 = [];
// for (const find of accounts) find.owner === 'René Meier' ? (acc2 = find) : '';
// console.log(acc2);

//--------------------------------------------------------------------------
// // The findIndex Method

// const nummer = ['Null', 'Eins', 'Zwei', 'Drei'];

// const index2 = nummer.findIndex(pos => pos === 'Zwei');
// console.log(index2);

//--------------------------------------------------------------------------
// // Some and every Methods
// console.log(movements);

// // Equality
// console.log(movements.includes(-130)); // Shall return true

// // Some: Condition
// console.log(movements.some(mov => mov === -130)); // Is the same as the last one

// const anyDeposits = movements.some(mov => mov > 0);
// console.log(anyDeposits);

// // Every
// console.log(movements.every(mov => mov > 0)); // Not every movements are deposit. So it's false
// console.log(account4.movements.every(mov => mov > 0)); // But Sarah Smith receives only deposits. So it's true

// // Separate Callback
// const deposit = mov => mov > 0;
// console.log(movements.some(deposit));
// console.log(movements.every(deposit));
// console.log(movements.filter(deposit));

//--------------------------------------------------------------------------
// // Flat and flatMap

// const arr = [[1, 2, 3], [4, 5, 6], 7, 8];
// console.log(arr.flat()); // Removes nested arrays

// const arrDeep = [[[1, 2], 3], [4, [5, 6]], 7, 8]; // This time was removed only one level of nested array
// console.log(arrDeep.flat(2)); // flats 2 levels now

// // Let's calculate the entire movements of this bank get the overal balance
// const overalBalance = accounts
//   .map(acc => acc.movements)
//   .flat()
//   .reduce((acc, mov) => acc + mov, 0);
// console.log(overalBalance);

// flatMap (flat+map) => this method cannot flat more than 1 level
// const overalBalance2 = accounts
//   .flatMap(acc => acc.movements)
//   .reduce((acc, mov) => acc + mov, 0);
// console.log(overalBalance2);

//--------------------------------------------------------------------------
// // Sorting Arrays

// const nummer = ['Null', 'Eins', 'Zwei', 'Drei'];
// console.log(nummer);
// console.log(nummer.sort()); // Now sorts A-Z

// // return <, a,b (keep order)
// // return >, b,a (swotch order)
// // Ascending
// // movements.sort((a, b) => {
// //   if (a > b) return 1;
// //   if (a < b) return -1;
// // });

// // Can be summarized like
// movements.sort((a, b) => a - b);
// console.log(movements);

// // Descending
// // movements.sort((a, b) => {
// //   if (a > b) return -1;
// //   if (a < b) return 1;
// // });
// movements.sort((a, b) => b - a);
// console.log(movements);

//--------------------------------------------------------------------------
// // Creating and filling Arrays
// const arr = [1, 2, 3, 4, 5, 6, 7];
// console.log(new Array(1, 2, 3, 4, 5, 6, 7));

// // Empty Arrays + fill Method
// const x = new Array(7); // weird way to create Arrays
// console.log(x);
// // console.log(x.map(() => 5)); // Filling like this doesn't work

// // Empty arrays + fill method

// // x.fill(1);
// x.fill(1, 3, 5); // Works like slice method. e.g. will start to fill Numbers '1' from index [3] until [5]
// console.log(x);

// arr.fill(27, 2, 6); // Will fill Numbers '27's from index [2] until [6]
// console.log(arr);

// // Array.from
// const y = Array.from({ length: 7 }, () => 1);
// console.log(y);

// const z = Array.from({ length: 7 }, (_, i) => i + 1); // Normally the developers set '_' instead an alid parameter such as 'cur';
// console.log(z);

// const dice = Array.from({ length: 100 }, () =>
//   Math.trunc(Math.random() * 6 + 1)
// );
// console.log(dice);

// labelBalance.addEventListener('click', function () {
//   const movementsUI = Array.from(
//     document.querySelectorAll('.movements__value'),
//     el => Number(el.textContent.replace('€', ''))
//   );
//   console.log(movementsUI);

//   // It also works if...
//   const movementsUI2 = [...document.querySelectorAll('.movements__value')];
//   console.log(movementsUI2.map(el => Number(el.textContent.replace('€', ''))));
// });

//--------------------------------------------------------------------------
// // Array Method Practice

// // 1.
// const bankDepositSum = accounts
//   .flatMap(acc => acc.movements)
//   .filter(mov => mov > 0)
//   .reduce((sum, cur) => sum + cur, 0);
// console.log(bankDepositSum);

// // 2.
// const numDeposits1000 = accounts
//   .flatMap(acc => acc.movements)
//   .reduce((count, cur) => (cur >= 1000 ? ++count : count), 0);

// console.log(numDeposits1000);

// // Prefixed ++ operator
// let a = 10;
// console.log(a++); // Still returning 10
// console.log(a); // Now increased to 11
// console.log(++a); // This now already increases to 12

// // 3.
// const { deposits, withdrawals } = accounts
//   .flatMap(acc => acc.movements)
//   .reduce(
//     (sums, cur) => {
//       // cur > 0 ? (sums.deposits += cur) : (sums.withdrawals += cur);
//       sums[cur > 0 ? 'deposits' : 'withdrawals'] += cur;
//       return sums;
//     },
//     { deposits: 0, withdrawals: 0 }
//   );

// console.log(deposits, withdrawals);

// // 4.
// // this is a nice title -> This Is a Nice Title
// const convertTitleCase = function (title) {
//   const capitalize = str => str[0].toUpperCase() + str.slice(1);

//   const exceptions = ['a', 'an', 'and', 'the', 'but', 'or', 'in', 'with'];

//   const titleCase = title
//     .toLowerCase()
//     .split(' ')
//     .map(word => (exceptions.includes(word) ? word : capitalize(word)))
//     .join(' ');

//   return capitalize(titleCase);
// };
// console.log(convertTitleCase('this is a nice and fine title'));
// console.log(convertTitleCase('this is a LONG title but not too long'));
// console.log(convertTitleCase('and here is another title with an EXAMPLE'));

//--------------------------------------------------------------------------
// // Exercise 4
// const dogs = [
//   { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
//   { weight: 8, curFood: 200, owners: ['Matilda'] },
//   { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
//   { weight: 32, curFood: 340, owners: ['Michael'] },
// ];

// // 1.
// dogs.forEach(dog => (dog.recFood = Math.trunc(dog.weight ** 0.75 * 28)));

// // 2.
// const dogSarah = dogs.find(dog => dog.owners.includes('Sarah'));
// console.log(
//   `Sarah's dog is eating too ${
//     dogSarah.curFood > dogSarah.recFood ? 'much' : 'little'
//   }`
// );

// // 3.
// const ownersEatTooMuch = dogs
//   .filter(dog => dog.curFood > 1.1 * dog.recFood)
//   .flatMap(dogs => dogs.owners);
// const ownersEatTooLittle = dogs
//   .filter(dog => dog.curFood < 0.9 * dog.recFood)
//   .flatMap(dogs => dogs.owners);

// // 4.
// console.log(`${ownersEatTooMuch.join(' and ')} dogs eat too much`);
// console.log(`${ownersEatTooLittle.join(' and ')} dogs eat too little`);

// // 5.
// console.log(dogs.some(dog => dog.curFood === dog.recFood));
// // 6.
// const checkEatingOkay = dog =>
//   dog.curFood <= 1.1 * dog.recFood && dog.curFood >= 0.9 * dog.recFood;

// console.log(dogs.some(checkEatingOkay));

// // 7.
// console.log(dogs.filter(checkEatingOkay));

// // 8.
// const dogsSorted = dogs.slice().sort((a, b) => a.recFood - b.recFood);
// console.log(dogsSorted);

//--------------------------------------------------------------------------
