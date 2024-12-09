import { initializeApp } from "firebase/app";

// const firebaseConfig = {
//   apiKey: "AIzaSyB9Q3NFiFvwfkYxdFQgGn7krpae2Usrk-A",
//   authDomain: "login-cde1c.firebaseapp.com",
//   projectId: "login-cde1c",
//   storageBucket: "login-cde1c.firebasestorage.app",
//   messagingSenderId: "217566408039",
//   appId: "1:217566408039:web:8db9c9eccf27afa82b93c2"
// };

// Duy server
const firebaseConfig = {
  apiKey: "AIzaSyBZuYyfCiNnYTaHMau75q9XKucHh61zvA0",
  authDomain: "nodejsfirebaseauth-4952e.firebaseapp.com",
  projectId: "nodejsfirebaseauth-4952e",
  storageBucket: "nodejsfirebaseauth-4952e.firebasestorage.app",
  messagingSenderId: "976328113559",
  appId: "1:976328113559:web:6516d0562d88584eb8d8d2",
  measurementId: "G-H3HBPZLVK1"
};

const app = initializeApp(firebaseConfig);

export { app };