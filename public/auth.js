const signupForm = document.querySelector('#signup-form');
signupForm.addEventListener('submit', (e) => {
    e.preventDefault(); // prevent page from refreshing

    // get user info
    const email = signupForm['email'].value;
    const password = signupForm['password1'].value;
    const confirmPassword = signupForm['password2'].value;

    if (password !== confirmPassword) {
        console.log("Password do not match");
        return false;
    }

    console.log(email, password); // test whether email and password us printed out at console

    // sign up the user
    
    // createUserWithEmailAndPassword(auth, email, password)
    //     .then((userCredential) => {
    //         // Signed In
    //         console.log(userCredential);
    //         const user = userCredential.user;
    //     })
    //     .catch((error) => {
    //         const errorCode = error.code;
    //         const errorMessage = error.message;
    //     });
    auth.createUserWithEmailAndPassword(email, password).then((cred) => {
        console.log(cred)
    })
});