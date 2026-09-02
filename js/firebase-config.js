// ==========================================================
// STEP 1: Go to https://console.firebase.google.com
// Create a free project → Add a Web App → copy the config below
// STEP 2: Enable "Authentication" → Email/Password sign-in method
// STEP 3: Enable "Firestore Database" → Start in production mode
// ==========================================================

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// ---------- Firestore structure (auto-created on first write) ----------
// users/{uid}: {
//   name, phone, email, referredBy, refCode,
//   balance: number,
//   activationStatus: "pending" | "approved" | "rejected",
//   activationTrxId: string,
//   createdAt
// }
//
// tasks/{taskId}: { type: "ad"|"survey"|"microjob", title, rate, status }
//
// submissions/{id}: {
//   uid, taskId, type, proof, status: "pending"|"approved"|"rejected",
//   amount, createdAt
// }
//
// withdrawals/{id}: {
//   uid, amount, fee, netAmount, method, accountNumber,
//   status: "pending"|"approved"|"rejected", createdAt
// }
//
// settings/rates: { ad: 0, survey: 0, microjob: 0, referral: 0 }
