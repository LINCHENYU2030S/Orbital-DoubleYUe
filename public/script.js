//alert("Yo")

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, signOut, updatePassword } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);



let i = 1;
const tabs = document.querySelectorAll('[data-tab-target]');
const tabContents = document.querySelectorAll('[data-tab-content]');

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


// settingsPart
const changePasswordBtn = document.getElementById('change-password-button');
changePasswordBtn.addEventListener('click', () => {
    const changePasswordHeadings = document.getElementsByClassName('change-password-headings')[0];
    changePasswordHeadings.classList.remove('unactive');

    const changePasswordPage = document.getElementsByClassName('change-password-page')[0];
    changePasswordPage.classList.remove('unactive');

    const settingsDefaultPage = document.getElementsByClassName('default-page')[0];
    settingsDefaultPage.classList.add('unactive');
});
const logoutBtn = document.getElementById('logout-button');
logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
            // Sign-out successful.
            alert('User logged out!');
            window.location.assign("index.html");
        }).catch((error) => {
            // An error happened.
        });
});
const changePasswordPageBackButton = document.getElementById('change-password-page-back-button');
changePasswordPageBackButton.addEventListener('click', () => {
    const changePasswordHeadings = document.getElementsByClassName('change-password-headings')[0];
    changePasswordHeadings.classList.add('unactive');

    const changePasswordPage = document.getElementsByClassName('change-password-page')[0];
    changePasswordPage.classList.add('unactive');

    const settingsDefaultPage = document.getElementsByClassName('default-page')[0];
    settingsDefaultPage.classList.remove('unactive');
});
const changePasswordPageConfirmChangesButton = document.getElementById('change-password-page-confirm-changes-button');
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


// guidePart
const nextBtn = document.getElementById('guide-next-button');
const backBtn = document.getElementById('guide-back-button');
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


