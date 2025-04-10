// Importar o Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDkzRxrpIX1bq9ZuYl3_-5YRnMDDnfei0A",
    authDomain: "bbcar-system.firebaseapp.com",
    projectId: "bbcar-system",
    storageBucket: "bbcar-system.firebasestorage.app",
    messagingSenderId: "26592448394",
    appId: "1:26592448394:web:4ad18d088908508ac58273"
};

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };