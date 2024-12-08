// config/firebaseClient.js
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: "AIzaSyB9Q3NFiFvwfkYxdFQgGn7krpae2Usrk-A",
  authDomain: "login-cde1c.firebaseapp.com",
  projectId: "login-cde1c",
  storageBucket: "login-cde1c.appspot.com",
  messagingSenderId: "217566408039",
  appId: "1:217566408039:web:8db9c9eccf27afa82b93c2",
};

// Initialize Firebase Client SDK
const clientApp = initializeApp(firebaseConfig);
const clientAuth = getAuth(clientApp);

module.exports = { clientApp, clientAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword };