const admin = require("firebase-admin");
// const serviceAccount = require("../serviceAccountKey.json");
const serviceAccount = require("../duyserver.json");
// const serviceAccount = require("../duyserver2.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL:
//     "https://console.firebase.google.com/u/0/project/login-cde1c/firestore/databases/-default-/data/~2F1~2Fmep9Fabh4tbVM8uYQbMF?fb_gclid=Cj0KCQiAgJa6BhCOARIsAMiL7V-l0nEeqe8ZM4vdNBoM0CoidCEe3YvsIj2CTLzAV6D1VZQdng93eZMaAtOPEALw_wcB",
// });

// Duy Server
/* The `admin.initializeApp()` function in the provided code is initializing the Firebase Admin SDK
with the specified configuration options. Here's what each part of the configuration does: */
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://console.firebase.google.com/u/0/project/nodejsfirebaseauth-4952e/firestore/databases/-default-/data?fb_gclid=Cj0KCQiAgJa6BhCOARIsAMiL7V-l0nEeqe8ZM4vdNBoM0CoidCEe3YvsIj2CTLzAV6D1VZQdng93eZMaAtOPEALw_wcB",
});

// Duy Server 2
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL:
//     "https://console.firebase.google.com/u/0/project/sms-basic/firestore/databases/-default-/data?fb_gclid=Cj0KCQiAgJa6BhCOARIsAMiL7V-l0nEeqe8ZM4vdNBoM0CoidCEe3YvsIj2CTLzAV6D1VZQdng93eZMaAtOPEALw_wcB",
// });

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, auth, db };
