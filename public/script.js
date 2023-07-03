// IMPORTS

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { 
    getAuth, 
    signOut, 
    updatePassword,
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { 
    getFirestore,
    doc,
    setDoc,
    getDoc,
    addDoc,
    collection,
    updateDoc
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

// TAB NAVIGATION
let i = 1;
const tabs = document.querySelectorAll('[data-tab-target]');
const tabContents = document.querySelectorAll('[data-tab-content]');

// PORTFOLIO
let user = null;
let userEmail = null;
let balance = null;
const topUpWithdrawInput = document.getElementById('top-up-withdraw-input');
const balanceElement = document.getElementById('balance');
const topUpBtn = document.querySelector('.top-up-btn');
const withdrawBtn = document.querySelector('.withdraw-btn');

// SETTINGS
const changePasswordBtn = document.getElementById('change-password-button');
const logoutBtn = document.getElementById('logout-button');
const changePasswordPageBackButton = document.getElementById('change-password-page-back-button');
const changePasswordPageConfirmChangesButton = document.getElementById('change-password-page-confirm-changes-button');

// GUIDE
const nextBtn = document.getElementById('guide-next-button');
const backBtn = document.getElementById('guide-back-button');



function login(email, password) {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // alert("User email is " + email);
            user = userCredential.user;
            console.log("User state is signed in!");
            userEmail = user.email;
            const docRef = doc(db, userEmail, "Portfolio");
            (async () => {
                const docSnap = await getDoc(docRef);
                balance = await docSnap.data().balance;
                balanceElement.innerHTML = "Balance: $" + balance;
                console.log("userPortfolioBalance == " + balance);
            })();
        })
        .catch((error) => {
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
        login(sessionStorage.email, sessionStorage.password);
    } else {
        alert("Please login first!");
        window.location.replace("login.html");
    }
    return true;
}


// Check if user is logged in or not
// if not logged in, nav to login page
checkAuth();


// portfolioPart
let totalTopUp = 0;
let totalWithdraw = 0;

topUpBtn.addEventListener('click', handleTopUp);
withdrawBtn.addEventListener('click', handleWithdraw);

function updateBalance(balance) {
    balanceElement.textContent = `Balance: $` + balance;
    (async () => {
        const portfolioDocRef = doc(db, userEmail, "Portfolio");
        await updateDoc(portfolioDocRef, {
            "balance": balance
        });
    })();
    document.getElementById('total-top-up').textContent = ` $` + totalTopUp;
    document.getElementById('total-withdrawal').textContent = ` $` + totalWithdraw;
}
function handleTopUp() {
    const amount = parseFloat(topUpWithdrawInput.value);
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid positive amount to top up.');
        return;
    }

    balance += amount;
    totalTopUp += amount;
    updateBalance(balance);
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

    balance -= amount;
    totalWithdraw += amount;
    updateBalance(balance);
    topUpWithdrawInput.value = '';
}


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
        });
    });
}


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
        window.location.assign("index.html");
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

        updatePassword(user, password1).then(() => {
            alert("User Password Successfully Updated!");
        }).catch((error) => {
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



window.addEventListener('beforeunload', () => {
    sessionStorage.clear();
});