// Firebase Compat Initialization
const firebaseConfig = {
    apiKey: "AIzaSyCuHtcEE9ttKIflxRfksNRBVKrcpAs0JHU",
    authDomain: "g5tk-492da.firebaseapp.com",
    projectId: "g5tk-492da",
    storageBucket: "g5tk-492da.firebasestorage.app",
    messagingSenderId: "141004246824",
    appId: "1:141004246824:web:2ae30ffa35fbaeb31e0a1d"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const analytics = firebase.analytics();

console.log("Firebase initialized successfully (Compat Mode)");

// Make available globally
window.db = db;
