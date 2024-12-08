import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyB9Q3NFiFvwfkYxdFQgGn7krpae2Usrk-A",
  authDomain: "login-cde1c.firebaseapp.com",
  projectId: "login-cde1c",
  storageBucket: "login-cde1c.firebasestorage.app",
  messagingSenderId: "217566408039",
  appId: "1:217566408039:web:8db9c9eccf27afa82b93c2"
};

const app = initializeApp(firebaseConfig);

export { app };