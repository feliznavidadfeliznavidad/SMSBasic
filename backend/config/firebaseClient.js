const { initializeApp } = require("firebase/app");
const {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} = require("firebase/auth");

// const firebaseConfig = {
//   apiKey: "AIzaSyB9Q3NFiFvwfkYxdFQgGn7krpae2Usrk-A",
//   authDomain: "login-cde1c.firebaseapp.com",
//   projectId: "login-cde1c",
//   storageBucket: "login-cde1c.appspot.com",
//   messagingSenderId: "217566408039",
//   appId: "1:217566408039:web:8db9c9eccf27afa82b93c2",
// };

// Duy 2
const firebaseConfig = {
  apiKey: "AIzaSyBZuYyfCiNnYTaHMau75q9XKucHh61zvA0",
  authDomain: "nodejsfirebaseauth-4952e.firebaseapp.com",
  projectId: "nodejsfirebaseauth-4952e",
  storageBucket: "nodejsfirebaseauth-4952e.firebasestorage.app",
  messagingSenderId: "976328113559",
  appId: "1:976328113559:web:6516d0562d88584eb8d8d2",
  measurementId: "G-H3HBPZLVK1",
};

// Duy 2 Server
// const firebaseConfig = {
//   apiKey: "AIzaSyDycS0hjSak_qsL5ZPtAldBSTef5QkDRfQ",
//   authDomain: "sms-basic.firebaseapp.com",
//   projectId: "sms-basic",
//   storageBucket: "sms-basic.firebasestorage.app",
//   messagingSenderId: "163850247907",
//   appId: "1:163850247907:web:eeee5de92c7b50b17b6fd6",
//   measurementId: "G-J4C1B0CTKK",
// };

const clientApp = initializeApp(firebaseConfig);
const clientAuth = getAuth(clientApp);

module.exports = {
  clientApp,
  clientAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
};
