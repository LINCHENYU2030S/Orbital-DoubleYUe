// IMPORTS

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { 
    getAuth, 
    signOut, 
    updatePassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    deleteUser
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    getDocs,
    addDoc,
    collection,
    updateDoc,
    increment,
    onSnapshot,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";


// INITIALIZATIONS
const firebaseConfig = {
    apiKey: "AIzaSyBi9h_Rpk9-RUBKRZ_WGHLrdNQ5YEHvJk8",
    authDomain: "doubleyue-57c46.firebaseapp.com",
    databaseURL: "https://doubleyue-57c46-default-rtdb.firebaseio.com",
    projectId: "doubleyue-57c46",
    storageBucket: "doubleyue-57c46.appspot.com",
    messagingSenderId: "616024099867",
    appId: "1:616024099867:web:15c57e18d3cc49e3397cbe",
    measurementId: "G-9EBK7QNX7B"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const alphaVantageAPIKey = "D5AVFFFTC6HG8HKJ";

// TAB NAVIGATION
let k = 1;
let i = 1;
const tabs = document.querySelectorAll('[data-tab-target]');
const tabContents = document.querySelectorAll('[data-tab-content]');

// PORTFOLIO
let user = null;
let userEmail = null;
let balance = null;
let prevNumOfStocks = null;
let numOfStocks = null;
const topUpWithdrawInput = document.getElementById('top-up-withdraw-input');
const balanceElement = document.getElementById('balance');
const topUpBtn = document.querySelector('.top-up-btn');
const withdrawBtn = document.querySelector('.withdraw-btn');
const totalProfitLossElement = document.getElementById('total-profit-loss');
let currStockTableColNumber = 9;

// TRADE


// SETTINGS
const changePasswordBtn = document.getElementById('change-password-button');
const logoutBtn = document.getElementById('logout-button');
const changePasswordPageBackButton = document.getElementById('change-password-page-back-button');
const changePasswordPageConfirmChangesButton = document.getElementById('change-password-page-confirm-changes-button');

// GUIDE
const nextBtn = document.getElementById('guide-next-button');
const backBtn = document.getElementById('guide-back-button');





function getStockDocRef(docId) {
    return doc(db, userEmail, "Portfolio", "Stocks", docId);
}

function getAlphaVantageURL(timeFrame, stockSymbol) {
    let url = `https://www.alphavantage.co/query?function=${timeFrame}&symbol=${stockSymbol}&apikey=${alphaVantageAPIKey}&datatype=csv`;

    if (timeFrame == 'TIME_SERIES_INTRADAY') {
        url = `https://www.alphavantage.co/query?function=${timeFrame}&symbol=${stockSymbol}&interval=15min&apikey=${alphaVantageAPIKey}&datatype=csv`;
    }
    return url;
}

async function updateTotalProfitLoss(totalProfitLoss) {
    await updateDoc(doc(db, userEmail, "Portfolio"), {
        "totalProfitLoss": totalProfitLoss
    });
    totalProfitLossElement.innerHTML = "$" + totalProfitLoss.toFixed(4); 
    console.log("totalProfitLoss: " + totalProfitLoss);


    if (totalProfitLoss > 0) {
        totalProfitLossElement.style.color = "rgb(0, 255, 0)";
    } else if (totalProfitLoss < 0) {
        totalProfitLossElement.style.color = 'rgb(255, 0, 0)';
    } else {
        totalProfitLossElement.style.color = '#FFFFFF';
    }

}

async function initializeAndUpdateUser() {
    // Get User Current Portfolio Balance
    const portfolioDocRef = doc(db, userEmail, "Portfolio");
    const docSnap = await getDoc(portfolioDocRef);
    const docData = docSnap.data();
    balance = docData.balance;
    numOfStocks = docData.numOfStocks;
    prevNumOfStocks = numOfStocks;
    balanceElement.innerHTML = "Balance: $" + balance;
    
    console.log("user current balance is " + balance);
}
async function initializePortfolioTable() {
    const portfolioStockTable = document.querySelector('#portfolio-stock-table tbody');
    console.log("user current owned number of stocks is " + numOfStocks);
    const portfolioDocRef = doc(db, userEmail, "Portfolio");
    const stockColRef = collection(db, userEmail, "Portfolio", "Stocks");

    for (let i = 1; i <= numOfStocks; i++) {
        portfolioStockTable.insertRow();
    }

    // Initialize Realtime Listener Object to Update Table whenever there is a change to the database
    onSnapshot(stockColRef, (snapshot) => {

        // Delete current table
        for (let i = 1; i <= prevNumOfStocks; i++) {
            portfolioStockTable.deleteRow(1);
            console.log("rows deleted");
        }

        // Display "No Stock Holdings" if user has no stock holdings
        if (numOfStocks !== 0) {
            document.getElementById("no-stock-holdings-description").classList.remove("active");
            document.getElementById("no-stock-holdings-description").classList.add("unactive");
        } else {
            document.getElementById("no-stock-holdings-description").classList.remove("unactive");
            document.getElementById("no-stock-holdings-description").classList.add("active");
        }

        let rowNumber = 0;
        let totalProfitLoss = 0;
        snapshot.docs.forEach((doc) => { // ** change back (delete async)
            if (doc.id == "?") return;

            const docData = doc.data();
            const row = portfolioStockTable.insertRow(-1);
            for (let j = 0; j < currStockTableColNumber; j++) {
                row.insertCell();
            }
            row.cells[0].innerHTML = ++rowNumber;
            console.log("inserted row " + rowNumber);

            if (localStorage.getItem(doc.id) == null) {
                anychart.onDocumentReady(async function() {
                    const stockDocRef = getStockDocRef(doc.id);
                    const stockDocSnap = await getDoc(stockDocRef);
                    const stockDocData = stockDocSnap.data();
                    const timeFrame = stockDocData.timeFrame;
                    const stockSymbol = stockDocData.stockSymbol;
                    const url = getAlphaVantageURL(timeFrame, stockSymbol);

                    anychart.data.loadCsvFile(url, (data) => {
                        console.log(data);
                
                        const currPrice = Number(Papa.parse(data, {
                            header: true
                        }).data[0].close);

                        console.log("This stock's current price is " + currPrice);

                        if (isNaN(currPrice)) {
                            alert("Due to free API issues, please try again in a minute");
                            return;
                        }

                        localStorage.setItem(doc.id, currPrice);




                        const currentPrice = Number(localStorage.getItem(doc.id));
                        console.log(currentPrice);
                
                        const cells = row.cells;
                        cells[1].innerHTML = docData.stockSymbol + " - " + docData.stockName;
                        cells[2].innerHTML = docData.type;
                        cells[3].innerHTML = docData.timeFrameDisplay;
                        cells[4].innerHTML = docData.size;
                        cells[5].innerHTML = Number(docData.price).toFixed(4);
                        cells[6].innerHTML = currentPrice.toFixed(4);
                        let profitLoss = (docData.type == "Long") 
                            ? (docData.size * (currentPrice - docData.price))
                            : (docData.size * (docData.price - currentPrice));
                        profitLoss = Number(profitLoss).toFixed(4);
                        cells[7].innerHTML = profitLoss;

                        totalProfitLoss += Number(profitLoss);

                        updateTotalProfitLoss(totalProfitLoss);

                        console.log("totalProfitLoss: " + totalProfitLoss);

                        if (profitLoss > 0) {
                            cells[7].style.color = '#008000';
                        } else if (profitLoss < 0) {
                            cells[7].style.color = '#FF0000';
                        } else {
                            cells[7].style.color = '#000000';
                        }
                        console.log("filled row inserted");

                        // Sell Buttons
                        row.cells[8].innerHTML = `<div class="portfolio-table-sellbutton" id="${doc.id}">sell</div>`;
                        const btn = document.getElementById(doc.id);
                        btn.addEventListener('click', async () => {
                            console.log(btn.id);

                            const docRef = getStockDocRef(btn.id);
                            const docSnap = await getDoc(docRef);
                            const docData = docSnap.data();

                    // Popup sell window
                    let sellSize = Number(prompt("Enter your selling size", ""));
                    console.log(sellSize);
                    if (isNaN(sellSize) || sellSize <= 0 || !Number.isInteger(sellSize)) {
                        alert("Please Enter a Valid Positive Integer!");
                        return;
                    } 
                    
                    if (sellSize > docData.size) {
                        alert("Sell size has exceeded current owned stock size!");
                        return;
                    } 
                    
                    let currPrice = localStorage.getItem(btn.id);
                    updateBalance(balance + sellSize * currPrice);

                            if (sellSize < docData.size) {
                                const newSize = docData.size - sellSize;
                                prevNumOfStocks = numOfStocks;
                                await updateDoc(docRef, {
                                    "size": newSize
                                });
                            } else if (sellSize == docData.size) {
                                prevNumOfStocks = numOfStocks--;
                                await updateDoc(portfolioDocRef, {
                                    "numOfStocks": numOfStocks
                                });
                                await deleteDoc(docRef);
                            }
                        });

                    });

                });

            } else {

                const currentPrice = Number(localStorage.getItem(doc.id));
                console.log(currentPrice);
        
                const cells = row.cells;
                cells[1].innerHTML = docData.stockSymbol + " - " + docData.stockName;
                cells[2].innerHTML = docData.type;
                cells[3].innerHTML = docData.timeFrameDisplay;
                cells[4].innerHTML = docData.size;
                cells[5].innerHTML = Number(docData.price).toFixed(4);
                cells[6].innerHTML = currentPrice.toFixed(4);
                let profitLoss = (docData.type == "Long") 
                    ? (docData.size * (currentPrice - docData.price))
                    : (docData.size * (docData.price - currentPrice));
                profitLoss = Number(profitLoss).toFixed(4);
                cells[7].innerHTML = profitLoss;

                totalProfitLoss += Number(profitLoss);

                updateTotalProfitLoss(totalProfitLoss);

                console.log("totalProfitLoss: " + totalProfitLoss);

                if (profitLoss > 0) {
                    cells[7].style.color = '#008000';
                } else if (profitLoss < 0) {
                    cells[7].style.color = '#FF0000';
                } else {
                    cells[7].style.color = '#000000';
                }
                console.log("filled row inserted");

                // Sell Buttons
                row.cells[8].innerHTML = `<div class="portfolio-table-sellbutton" id="${doc.id}">sell</div>`;
                const btn = document.getElementById(doc.id);
                btn.addEventListener('click', async () => {
                    console.log(btn.id);

                    const docRef = getStockDocRef(btn.id);
                    const docSnap = await getDoc(docRef);
                    const docData = docSnap.data();

                    // Popup sell window
                    let sellSize = Number(prompt("Enter your selling size", ""));
                    console.log(sellSize);
                    if (isNaN(sellSize) || sellSize <= 0 || !Number.isInteger(sellSize)) {
                        alert("Please Enter a Valid Positive Integer!");
                        return;
                    } 
                    if (sellSize > docData.size) {
                        alert("Sell size has exceeded current owned stock size!");
                        return;
                    } 
                    let currPrice = localStorage.getItem(btn.id);
                    updateBalance(balance + sellSize * currPrice);

                    if (sellSize < docData.size) {
                        const newSize = docData.size - sellSize;
                        prevNumOfStocks = numOfStocks;
                        await updateDoc(docRef, {
                            "size": newSize
                        });
                    } else if (sellSize == docData.size) {
                        prevNumOfStocks = numOfStocks--;
                        await updateDoc(portfolioDocRef, {
                            "numOfStocks": numOfStocks
                        });
                        await deleteDoc(docRef);
                    }
                });

            }
            
        });

    });
}
async function login(email, password) {
    await signInWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                // alert("User email is " + email);
                user = userCredential.user;
                userEmail = user.email;
                console.log("User state is signed in!");
                // Get User Current Portfolio Balance
                await initializeAndUpdateUser();

                // Initialize User Portfolio Stock Table (IDK WHETHER THIS THING NEED ASYNC OR NOT !!!!!! ans : NEED)
                await initializePortfolioTable();
            })
            .catch((error) => {
                console.log("Sign in failed!");

                const errorCode = error.code;
                const errorMessage = error.message;

                if (errorCode == "auth/invalid-email") {
                    alert("Please Enter a Valid Email!");
                }
                else if (errorCode == "auth/missing-password") {
                    alert("Please Enter Your Password!");
                } 
                else if (errorCode == "auth/user-not-found") {
                    alert("User Does Not Exist!");
                } 
                else if (errorCode == "auth/wrong-password") {
                    alert("Incorrect Password!");
                }
                else {
                    alert("login failed " + errorCode + " " + errorMessage);
                }
                // For debugging purposes
                
                console.log(errorCode + errorMessage);
                return;
            });
}
function checkAuth() {
    if (sessionStorage.email && sessionStorage.password) {
        document.body.classList.remove("pending");
        (async () => await login(sessionStorage.email, sessionStorage.password))();
    } else {
        alert("Please login first!");
        window.location.replace("index.html");
    }
}



// MAIN FUNCTION

// Check if user is logged in or not
// if not logged in, nav to login page
checkAuth();



// Tab Navigation System
if (tabs) {
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = document.querySelector(tab.dataset.tabTarget);
            tabContents.forEach(tabContent => {
                tabContent.classList.remove('active');
            });
            tabs.forEach(tab => {
                tab.classList.remove('active');
                tab.classList.add('unactive');
            });
            tab.classList.remove('unactive');
            tab.classList.add('active');
            target.classList.add('active');

            if (tab.id == "sidebar-button-guide") {
                // alert(i);
                // guideWindow(1);
                const guides = document.querySelectorAll('[guide-content]');
                guides.forEach(guide => {
                    guide.classList.remove('active');
                    guide.classList.add('unactive');
                });

                i = 1;
                const currGuide = document.getElementById('guide-' + i);
                currGuide.classList.remove('unactive');
                currGuide.classList.add('active');
            }
            if (tab.id == "sidebar-button-backtesting") {
                const backtests = document.querySelectorAll('[backtest-content]');
                backtests.forEach(backtest => {
                    backtest.classList.remove('active');
                    backtest.classList.add('unactive');
                });

                k = 1;
                const currBacktest = document.getElementById('backtest-' + k);
                currBacktest.classList.remove('unactive');
                currBacktest.classList.add('active');
            }
        });
    });
}



/* Backtesting */
const nextButton = document.getElementById('backtest-next-button');
const backButton = document.getElementById('backtest-back-button');

if (nextButton) {
    nextButton.addEventListener('click', () => {
        const currBacktest = document.getElementById('backtest-' + k);
        console.log(k);
        if (k < 6) {
            currBacktest.classList.remove('active');
            currBacktest.classList.add('unactive');
            k = k + 1;
            const nextBacktest = document.getElementById('backtest-' + k);
            nextBacktest.classList.remove('unactive');
            nextBacktest.classList.add('active');
        }
    });
}
if (backButton) {
    backButton.addEventListener('click', () => {
        const currBacktest = document.getElementById('backtest-' + k);
        console.log(k);
        if (k > 1) {
            currBacktest.classList.remove('active');
            currBacktest.classList.add('unactive');
            k = k - 1;
            const nextBacktest = document.getElementById('backtest-' + k);
            nextBacktest.classList.remove('unactive');
            nextBacktest.classList.add('active');
        }
    });
}

$("#mean-reversion").click(function() {
    // Parameters from users
    const selectedStock = $("#search-input").val();
    const selectedTimeframe = $("#time-frame").val();
    const period = parseFloat($("#mean-reversionperiod").val()); //period for the SMA
    const zScoreThreshold = parseFloat($("#mean-reversionzthreshold").val()); // Adjust the threshold as per your preference
    const initialAmount = 10000; // Initial amount in dollars

    // Fetch data from AlphaVantage API
    var apiUrl = getAlphaVantageURL(selectedTimeframe, selectedStock);
    axios.get(apiUrl)
      .then(response => {
        console.log("Response Data:", response.data);
        // Parse CSV data using PapaParse
        const parsedData = Papa.parse(response.data, {
          header: true,
          skipEmptyLines: true,
        }).data;

        // Parse dates using Moment.js
        parsedData.forEach(row => {
          row.time = moment(row.date, "D/MM/YYYY").toDate();
          delete row.date;
        });

        // Convert the parsed data into DataFrame-like structure
        const inputSeries = parsedData.reduce((series, row) => {
          series.push(row);
          return series;
        }, []);

        // Calculate Simple Moving Average(SMA)
        function sma(series, period) {
          const smaValues = [];
          for (let i = 0; i < series.length - period + 1; i++) {
            const sum = series.slice(i, i + period).reduce((acc, row) => acc + parseFloat(row.close), 0);

            const sma = sum / period;
            smaValues.push(sma);
          }
          return smaValues;
        }

        //const closingPrices = inputSeries.map(row => parseFloat(row.close));
        const movingAverage = sma(inputSeries, period); // 30 day moving average

        // Integrate moving average indexed on date.
        inputSeries.forEach((row, index) => {
            if (index > (period - 2)) {
                row.sma = movingAverage[index - (period - 1)];
            }
        });

        // Calculate Mean and Standard Deviation of closing prices
        function calculateMeanAndStdDev(series) {
          const mean = series.reduce((acc, value) => acc + value, 0) / series.length;
          const squaredDeviations = series.map(value => Math.pow(value - mean, 2));
          const variance = squaredDeviations.reduce((acc, value) => acc + value, 0) / series.length;
          const stdDev = Math.sqrt(variance);
          return { mean, stdDev };
        }

        // Apply Mean-Reversion Strategy and simulate with initial amount $10000
        function meanReversionStrategySimulation(inputSeries, period, zScoreThreshold, initialAmount) {
          const closingPrices = inputSeries.map(row => parseFloat(row.close));
          const smaValues = sma(inputSeries, period);
          const { mean, stdDev } = calculateMeanAndStdDev(closingPrices);

          const zScores = closingPrices.map((price, index) => {
            if (index > (period - 2)) {
                return (price - smaValues[index - (period - 1)]) / stdDev
            }
          });
          console.log(zScores);

          let currentBalance = initialAmount;
          let currentStocks = 0;
          const signals = [];
          for (let i = 0; i < zScores.length; i++) {
            if (zScores[i] > zScoreThreshold) {
              // Sell signal, sell all stocks
              currentBalance += currentStocks * closingPrices[i];
              currentStocks = 0;
              signals.push("SELL");
            } else if (zScores[i] < -1 * zScoreThreshold) {
              // Buy signal, buy with available balance
              currentStocks += Math.floor(currentBalance / closingPrices[i]);
              currentBalance -= Math.floor(currentBalance / closingPrices[i]) * closingPrices[i];
              signals.push("BUY");
            } else {
              // Hold signal, do nothing
              signals.push("HOLD");
            }
          }

          // Calculate the final amount and profit
          const finalAmount = currentBalance + currentStocks * closingPrices[closingPrices.length - 1];
          const profitPercentage = ((finalAmount - initialAmount) / initialAmount) * 100;

          return { signals, finalAmount, profitPercentage };
        }

        const simulationResult = meanReversionStrategySimulation(inputSeries, period, zScoreThreshold, initialAmount);
        const finalAmount = simulationResult.finalAmount;
        const profitPercentage = simulationResult.profitPercentage;
        console.log(simulationResult.signals);
        console.log("Final Amount: $" + finalAmount.toFixed(2));
        console.log("Profit Percentage: " + profitPercentage.toFixed(2) + "%");

        // Update the simulation result to the user
        const resultDiv = document.getElementById('simulation-result');
        resultDiv.innerHTML = `
            <p>Initial Amount: $${initialAmount.toFixed(2)}</p>
            <p>Final Amount: $${finalAmount.toFixed(2)}</p>
            <p>Profit/Loss Percentage: ${profitPercentage.toFixed(2)}%</p>
        `;
      })
      .catch(error => {
        console.error("Error fetching data from AlphaVantage:", error);
        // Display an error message to the user
        const resultDiv = document.getElementById('simulation-result');
        resultDiv.innerHTML = "Error fetching data. Please try again later.";
      });


});

// Moving Average CrossOver strategy
$("#moving-average-crossover").click(function () {
    // Parameters from users
    const selectedStock = $("#search-input2").val();
    const selectedTimeframe = $("#time-frame2").val();
    const shortPeriod = parseFloat($("#short-period").val()); // Short-term period for the short-term SMA
    const longPeriod = parseFloat($("#long-period").val()); // Long-term period for the long-term SMA
    const initialAmount = 10000; // Initial amount in dollars
  
    // Fetch data from AlphaVantage API
    var apiUrl = getAlphaVantageURL(selectedTimeframe, selectedStock);
    axios
      .get(apiUrl)
      .then((response) => {
        console.log("Response Data:", response.data);
        // Parse CSV data using PapaParse
        const parsedData = Papa.parse(response.data, {
          header: true,
          skipEmptyLines: true,
        }).data;
  
        // Parse dates using Moment.js
        parsedData.forEach((row) => {
          row.time = moment(row.date, "D/MM/YYYY").toDate();
          delete row.date;
        });
  
        // Convert the parsed data into DataFrame-like structure
        const inputSeries = parsedData.reduce((series, row) => {
          series.push(row);
          return series;
        }, []);
  
        // Calculate Simple Moving Average (SMA)
        function sma(series, period) {
          const smaValues = [];
          for (let i = 0; i < series.length - period + 1; i++) {
            const sum = series
              .slice(i, i + period)
              .reduce((acc, row) => acc + parseFloat(row.close), 0);
  
            const sma = sum / period;
            smaValues.push(sma);
          }
          return smaValues;
        }
  
        const shortSMA = sma(inputSeries, shortPeriod); // Short-term SMA
        const longSMA = sma(inputSeries, longPeriod); // Long-term SMA
  
        // Integrate moving averages indexed on date.
        inputSeries.forEach((row, index) => {
          if (index > longPeriod - 2) {
            row.shortSMA = shortSMA[index - (shortPeriod - 1)];
            row.longSMA = longSMA[index - (longPeriod - 1)];
          }
        });
  
        // Apply Moving Average Crossover Strategy and simulate with initial amount $10000
        function movingAverageCrossoverStrategySimulation(
          inputSeries,
          shortPeriod,
          longPeriod,
          initialAmount
        ) {
          let currentBalance = initialAmount;
          let currentStocks = 0;
          const signals = [];
  
          for (let i = 0; i < inputSeries.length; i++) {
            if (i > longPeriod - 2) {
              const currentRow = inputSeries[i];
              const previousRow = inputSeries[i - 1];
  
              if (previousRow.shortSMA < previousRow.longSMA && currentRow.shortSMA >= currentRow.longSMA) {
                // Golden Cross (Buy signal), buy with available balance
                currentStocks += Math.floor(currentBalance / parseFloat(currentRow.close));
                currentBalance -=
                  Math.floor(currentBalance / parseFloat(currentRow.close)) *
                  parseFloat(currentRow.close);
                signals.push("BUY");
              } else if (previousRow.shortSMA > previousRow.longSMA && currentRow.shortSMA <= currentRow.longSMA) {
                // Death Cross (Sell signal), sell all stocks
                currentBalance += currentStocks * parseFloat(currentRow.close);
                currentStocks = 0;
                signals.push("SELL");
              } else {
                // Hold signal, do nothing
                signals.push("HOLD");
              }
            } else {
              // Before having enough data for both short and long SMAs, just hold
              signals.push("HOLD");
            }
          }
  
          // Calculate the final amount and profit
          const finalAmount =
            currentBalance + currentStocks * parseFloat(inputSeries[inputSeries.length - 1].close);
          const profitPercentage = ((finalAmount - initialAmount) / initialAmount) * 100;
  
          return { signals, finalAmount, profitPercentage };
        }
  
        const simulationResult = movingAverageCrossoverStrategySimulation(
          inputSeries,
          shortPeriod,
          longPeriod,
          initialAmount
        );
        const finalAmount = simulationResult.finalAmount;
        const profitPercentage = simulationResult.profitPercentage;
        console.log(simulationResult.signals);
        console.log("Final Amount: $" + finalAmount.toFixed(2));
        console.log("Profit Percentage: " + profitPercentage.toFixed(2) + "%");
  
        // Update the simulation result to the user
        const resultDiv = document.getElementById("simulation-result2");
        resultDiv.innerHTML = `
            <p>Initial Amount: $${initialAmount.toFixed(2)}</p>
            <p>Final Amount: $${finalAmount.toFixed(2)}</p>
            <p>Profit/Loss Percentage: ${profitPercentage.toFixed(2)}%</p>
        `;
      })
      .catch((error) => {
        console.error("Error fetching data from AlphaVantage:", error);
        // Display an error message to the user
        const resultDiv = document.getElementById("simulation-result2");
        resultDiv.innerHTML = "Error fetching data. Please try again later.";
      });
  });
  
  // Bollinger Bands Strategy
  $("#bollinger-bands").click(function () {
    // Parameters from users
    const selectedStock = $("#search-input3").val();
    const selectedTimeframe = $("#time-frame3").val();
    const period = parseFloat($("#bollinger-period").val()); // Period for the SMA and standard deviation calculation
    const numDeviations = parseFloat($("#bollinger-deviations").val()); // Number of standard deviations for Bollinger Bands
    const initialAmount = 10000; // Initial amount in dollars
  
    // Fetch data from AlphaVantage API
    var apiUrl = getAlphaVantageURL(selectedTimeframe, selectedStock);
    axios
      .get(apiUrl)
      .then((response) => {
        console.log("Response Data:", response.data);
        // Parse CSV data using PapaParse
        const parsedData = Papa.parse(response.data, {
          header: true,
          skipEmptyLines: true,
        }).data;
  
        // Parse dates using Moment.js
        parsedData.forEach((row) => {
          row.time = moment(row.date, "D/MM/YYYY").toDate();
          delete row.date;
        });
  
        // Convert the parsed data into DataFrame-like structure
        const inputSeries = parsedData.reduce((series, row) => {
          series.push(row);
          return series;
        }, []);
  
        // Calculate Simple Moving Average (SMA)
        function sma(series, period) {
          const smaValues = [];
          for (let i = 0; i < series.length - period + 1; i++) {
            const sum = series
              .slice(i, i + period)
              .reduce((acc, row) => acc + parseFloat(row.close), 0);
  
            const sma = sum / period;
            smaValues.push(sma);
          }
          return smaValues;
        }
  
        // Calculate Standard Deviation of closing prices
        function calculateStandardDeviation(series, mean) {
          const squaredDeviations = series.map((value) => Math.pow(value - mean, 2));
          const variance = squaredDeviations.reduce((acc, value) => acc + value, 0) / series.length;
          return Math.sqrt(variance);
        }
  
        const closingPrices = inputSeries.map((row) => parseFloat(row.close));
        const smaValues = sma(inputSeries, period); // Simple Moving Average
        const stdDev = calculateStandardDeviation(closingPrices, smaValues[period - 1]); // Standard Deviation
  
        // Calculate Bollinger Bands
        const upperBands = smaValues.map((sma) => sma + numDeviations * stdDev);
        const lowerBands = smaValues.map((sma) => sma - numDeviations * stdDev);
  
        // Integrate Bollinger Bands indexed on date.
        inputSeries.forEach((row, index) => {
          if (index > period - 2) {
            row.upperBand = upperBands[index - (period - 1)];
            row.lowerBand = lowerBands[index - (period - 1)];
          }
        });
  
        // Apply Bollinger Bands Strategy and simulate with initial amount $10000
        function bollingerBandsStrategySimulation(inputSeries, initialAmount) {
          let currentBalance = initialAmount;
          let currentStocks = 0;
          const signals = [];
  
          for (let i = 0; i < inputSeries.length; i++) {
            if (i > period - 2) {
              const currentRow = inputSeries[i];
  
              if (currentRow.close < currentRow.lowerBand) {
                // Buy signal, buy with available balance
                currentStocks += Math.floor(currentBalance / parseFloat(currentRow.close));
                currentBalance -=
                  Math.floor(currentBalance / parseFloat(currentRow.close)) *
                  parseFloat(currentRow.close);
                signals.push("BUY");
              } else if (currentRow.close > currentRow.upperBand) {
                // Sell signal, sell all stocks
                currentBalance += currentStocks * parseFloat(currentRow.close);
                currentStocks = 0;
                signals.push("SELL");
              } else {
                // Hold signal, do nothing
                signals.push("HOLD");
              }
            } else {
              // Before having enough data for Bollinger Bands, just hold
              signals.push("HOLD");
            }
          }
  
          // Calculate the final amount and profit
          const finalAmount =
            currentBalance + currentStocks * parseFloat(inputSeries[inputSeries.length - 1].close);
          const profitPercentage = ((finalAmount - initialAmount) / initialAmount) * 100;
  
          return { signals, finalAmount, profitPercentage };
        }
  
        const simulationResult = bollingerBandsStrategySimulation(inputSeries, initialAmount);
        const finalAmount = simulationResult.finalAmount;
        const profitPercentage = simulationResult.profitPercentage;
        console.log(simulationResult.signals);
        console.log("Final Amount: $" + finalAmount.toFixed(2));
        console.log("Profit Percentage: " + profitPercentage.toFixed(2) + "%");
  
        // Update the simulation result to the user
        const resultDiv = document.getElementById("simulation-result3");
        resultDiv.innerHTML = `
            <p>Initial Amount: $${initialAmount.toFixed(2)}</p>
            <p>Final Amount: $${finalAmount.toFixed(2)}</p>
            <p>Profit/Loss Percentage: ${profitPercentage.toFixed(2)}%</p>
        `;
      })
      .catch((error) => {
        console.error("Error fetching data from AlphaVantage:", error);
        // Display an error message to the user
        const resultDiv = document.getElementById("simulation-result3");
        resultDiv.innerHTML = "Error fetching data. Please try again later.";
      });
  });
  
      


// portfolioPart
let totalTopUp = 0;
let totalWithdraw = 0;

topUpBtn.addEventListener('click', handleTopUp);
withdrawBtn.addEventListener('click', handleWithdraw);

function updateBalance(newBalance) {
    balance = Number(newBalance);
    balanceElement.textContent = `Balance: $` + balance;
    document.getElementById('total-top-up').textContent = ` $` + totalTopUp;
    document.getElementById('total-withdrawal').textContent = ` $` + totalWithdraw;
    (async () => {
        const portfolioDocRef = doc(db, userEmail, "Portfolio");
        await updateDoc(portfolioDocRef, {
            "balance": balance
        });
    })();
}
function handleTopUp() {
    const amount = parseFloat(topUpWithdrawInput.value);
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid positive amount to top up.');
        return;
    }

    totalTopUp += amount;
    updateBalance(balance + amount);
    topUpWithdrawInput.value = '';
}
function handleWithdraw() {
    const amount = parseFloat(topUpWithdrawInput.value);
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid positive amount to withdraw.');
        return;
    }

    if (balance - amount < 0) {
        alert('Insufficient funds. Cannot withdraw more than the current balance.');
        return;
    }

    totalWithdraw += amount;
    updateBalance(balance - amount);
    topUpWithdrawInput.value = '';
}
function hashTimeFrame(timeFrame) {
    if (timeFrame == "TIME_SERIES_INTRADAY") {
        return "15 min";
    }
    else if (timeFrame == "TIME_SERIES_DAILY_ADJUSTED") {
        return "Day";
    }
    else if (timeFrame == "TIME_SERIES_WEEKLY") {
        return "Week";
    }
    else if (timeFrame == "TIME_SERIES_MONTHLY") {
        return "Month";
    } else {
        return "";
    }
}



// Trade Part
$(document).ready(function() {
    const searchInput = $("#searchInput");
    const searchResults = $("#searchResults");
    let selectedStockSymbol = "";
    let selectedStockName = "";

    // Function to fetch search results from Alpha Vantage API
    function fetchSearchResults(keyword) {
        console.log("searching...");
        console.log(alphaVantageAPIKey);
        const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${keyword}&apikey=${alphaVantageAPIKey}`;
        
        // Make the API request
        $.get(url, function(data) {
            searchResults.empty();
            console.log("searching for best matches...");

            if (data.Information) {
                console.log(data.Information);
            }

            const results = data.bestMatches;
            console.log(results);

            if (!results) return;

            results.forEach(function(result) {
                console.log("search results");
                const symbol = result["1. symbol"];
                const name = result["2. name"];
                // const listItem = `<li>${symbol} - ${name}</li>`;
                // console.log("added to searchResults");
                const listItem = `<option><p>${symbol} - ${name}</p></option>`;
                const $listItem = $(listItem);
                
                // Add click event handler to the autocomplete item
                $listItem.on("click", function() {
                    // Update the input value with the selected option
                    searchInput.val(symbol);
                    
                    // Perform desired action when an item is clicked
                    console.log("Selected:", symbol);
                    selectedStockSymbol = symbol;
                    selectedStockName = name;
                    // You can use the selected symbol or perform any other action here
                    searchResults.empty();
                });
                
                searchResults.append($listItem);
            });
            console.log("Results shown");
        });
    }

    // Event handler for input changes
    var delay = null;
    function search() {
        clearTimeout(delay);
        const keyword = searchInput.val();
        if (!keyword) {
            searchResults.empty();
            selectedStockName = "";
            selectedStockSymbol = "";
            console.log("Results Emptied");
            return;
        }
        delay = setTimeout(() => fetchSearchResults(keyword), 300);
    }
    searchInput.keyup(search);
    searchInput.focusin(search);
    document.addEventListener("click", () => searchResults.empty());

    // Event handler for "View Chart" button click
    $("#view-chart-button").click(function() {
        // Get the selected stock and time frame
        const selectedStock = $("#searchInput").val();
        const selectedTimeFrame = $("#Time-Frame").val();

        if (!selectedStock || !selectedTimeFrame) {
            alert("Please select your stock and time frame");
            return;
        }

        // Store the values in localStorage
        localStorage.setItem("selectedStock", selectedStock);
        localStorage.setItem("selectedTimeFrame", selectedTimeFrame);

        // Redirect to the other HTML file / Open a new tab
        window.open("visualization.html");
    });

    $("#confirm-order-button").click(function() {

        function resetInputs() {
            $("#searchInput").val('');
            $("#Time-Frame").val('');
            $("#trade-options-size").val('');
            $("#stock-type").val('');
        }

        if (numOfStocks >= 5) {
            resetInputs();
            alert("Due to restrictions, a user can only have 5 stock holdings!");
            return;
        }

        let stockSymbol = selectedStockSymbol;
        let stockName = selectedStockName;
        let timeFrame = $("#Time-Frame").val();
        let size = $("#trade-options-size").val();
        let type = $("#stock-type").val();

        const invalid = (!stockSymbol) || (!timeFrame) || (!size) || (!type);

        if (invalid) {
            alert("Please fill up all the fields!");
            return;
        }



        anychart.onDocumentReady(async function() {
            const url = getAlphaVantageURL(timeFrame, stockSymbol);

            anychart.data.loadCsvFile(url, (data) => {
                console.log(data);
        
                const currPrice = Papa.parse(data, {
                    header: true
                }).data[0].close;

                console.log("This stock's current price is " + currPrice);

                if (isNaN(currPrice)) {
                    alert("Due to free API issues, please try again in a minute");
                    return;
                }

                localStorage.setItem(doc.id, currPrice);


                const price = Number(localStorage.getItem(doc.id));

                // Placing the order
                (async () => {
                    const portfolioDocRef = doc(db, userEmail, "Portfolio");
                    const docSnap = await getDoc(portfolioDocRef);
                    const docData = docSnap.data();
                    const balance = docData.balance;
        
                    if (balance - size * price < 0) {
                        alert("Insufficient funds. This order has exceeded the current balance");
                        return;
                    }
        
                    await (async () => updateBalance(balance - size * price))();
        
                    prevNumOfStocks = numOfStocks;
        
                    await updateDoc(portfolioDocRef, {
                        "numOfStocks": ++numOfStocks
                    });
        
                    const stockDocRef = await addDoc(collection(db, userEmail, "Portfolio", "Stocks"), {
                        "stockSymbol": stockSymbol,
                        "stockName": stockName,
                        "type": type,
                        "timeFrame": timeFrame,
                        "timeFrameDisplay": hashTimeFrame(timeFrame),
                        "size": size,
                        "price": price,
                    });
        
                    localStorage.setItem(stockDocRef.id, price);
        
                    const newSellBtn = document.createElement("div");
                    newSellBtn.innerText = "sell";
                    newSellBtn.classList.add("portfolio-table-sellbutton");
                    newSellBtn.id = stockDocRef.id;
        
                    newSellBtn.addEventListener('click', async () => {
                        console.log(newSellBtn.id);
            
                        const docRef = getStockDocRef(newSellBtn.id);
                        const docSnap = await getDoc(docRef);
                        const docData = docSnap.data();
            
                        // Popup sell window
                        let sellSize = Number(prompt("Enter your selling size", ""));
                        console.log(sellSize);
                        if (isNaN(sellSize) || sellSize <= 0 || !Number.isInteger(sellSize)) {
                            alert("Please Enter a Valid Positive Integer!");
                            return;
                        } 
                        
                        if (sellSize > docData.size) {
                            alert("Sell size has exceeded current owned stock size!");
                            return;
                        } 
        
                        let currPrice = localStorage.getItem(newSellBtn.id);
                        
                        updateBalance(balance + sellSize * currPrice);
            
                        if (sellSize < docData.size) {
                            const newSize = docData.size - sellSize;
                            await updateDoc(docRef, {
                                "size": newSize
                            });
                        } else if (sellSize == docData.size) {
                            prevNumOfStocks = numOfStocks;
                            await updateDoc(portfolioDocRef, {
                                "numOfStocks": --numOfStocks
                            });
                            await deleteDoc(docRef);
                        }
            
                    });
        
        
                    alert("Order is Placed!");
                    console.log("Order is Placed!");
        
                    // RESET ALL INPUTS
                    resetInputs();
                })();

            });

        });

    });
    
});



// settingsPart
if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', () => {
        const changePasswordHeadings = document.getElementsByClassName('change-password-headings')[0];
        changePasswordHeadings.classList.remove('unactive');

        const changePasswordPage = document.getElementsByClassName('change-password-page')[0];
        changePasswordPage.classList.remove('unactive');

        const settingsDefaultPage = document.getElementsByClassName('default-page')[0];
        settingsDefaultPage.classList.add('unactive');
    });
}
function logOut() {
    signOut(auth).then(() => {
        // Sign-out successful.
        alert('User logged out!');
        sessionStorage.clear();
        localStorage.clear();
        window.location.replace("index.html");
    }).catch((error) => {
        // An error happened.
    });
}
if (logoutBtn) {
    logoutBtn.addEventListener('click', logOut);
}
if (changePasswordPageBackButton) {
    changePasswordPageBackButton.addEventListener('click', () => {
        const changePasswordHeadings = document.getElementsByClassName('change-password-headings')[0];
        changePasswordHeadings.classList.add('unactive');

        const changePasswordPage = document.getElementsByClassName('change-password-page')[0];
        changePasswordPage.classList.add('unactive');

        const settingsDefaultPage = document.getElementsByClassName('default-page')[0];
        settingsDefaultPage.classList.remove('unactive');
    });
}
if (changePasswordPageConfirmChangesButton) {
    changePasswordPageConfirmChangesButton.addEventListener('click', () => {
        const user = auth.currentUser;
        const password1 = document.getElementById('change-password-page-password1').value;
        const password2 = document.getElementById('change-password-page-password2').value;

        if (!password1 && !password2) {
            alert("Password length should be at least 6 characters!");
            return;
        }

        if (password1 != password2) {
            alert("Passwords do not match!");
            return;
        }

        updatePassword(user, password1)
            .then(() => {
                alert("User Password Successfully Updated!");
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;

                if (errorCode == "auth/weak-password") {
                    alert("Password should be at least 6 characters!");
                } 
                else if (errorCode == "auth/requires-recent-login") {
                    alert("Time session expired, please login again!");
                }
                else {
                    alert("login failed " + errorCode + " " + errorMessage);
                }
                console.log(errorCode + errorMessage);
            });

    });
}



// guidePart
if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        const currGuide = document.getElementById('guide-' + i);
        if (i < 8) {
            currGuide.classList.remove('active');
            currGuide.classList.add('unactive');
            i = i + 1;
            const nextGuide = document.getElementById('guide-' + i);
            nextGuide.classList.remove('unactive');
            nextGuide.classList.add('active');
        }
    });
}
if (backBtn) {
    backBtn.addEventListener('click', () => {
        const currGuide = document.getElementById('guide-' + i);
        if (i > 1) {
            currGuide.classList.remove('active');
            currGuide.classList.add('unactive');
            i = i - 1;
            const nextGuide = document.getElementById('guide-' + i);
            nextGuide.classList.remove('unactive');
            nextGuide.classList.add('active');
        }
    });
}



// window.addEventListener('beforeunload', () => {
//     sessionStorage.clear();
//     localStorage.clear();
// });