// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBUQLtvXzo0rvvWeBrj_Gd2X8dbw_5NJNs",
    authDomain: "tradingsimulator-ff1ab.firebaseapp.com",
    projectId: "tradingsimulator-ff1ab",
    storageBucket: "tradingsimulator-ff1ab.appspot.com",
    messagingSenderId: "981457221998",
    appId: "1:981457221998:web:5ad38a21134505e42da97f",
    measurementId: "G-WD0WKZ588R"
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

const loginForm = document.querySelector('#signin-form');

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
});
