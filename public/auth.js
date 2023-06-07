// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
const database = getDatabase(app);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

//Get the sign up form element
const signupForm = document.querySelector('#signup-form');

//Add an event listener to the form submission
signupForm.addEventListener('submit', (e) => {

    // get user info
    var email = signupForm['email'].value;
    var password = signupForm['password1'].value;
    var passwordConfirmation = signupForm['password2'].value;

    //check if passwords match
    if (password != passwordConfirmation) {
        alert("passwords do not match")
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            
            //set(ref(database, 'users/' + user.uid), {
            //    email: email
            //})

            alert('user created!');
            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            
            alert(errorMessage);
        });
});

/*const loginForm = document.querySelector('#signin-form');

loginForm.addEventListener('submit', (e) => {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;

            alert('User logged in!');
            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;

            alert(errorMessage);
        });
});*/
