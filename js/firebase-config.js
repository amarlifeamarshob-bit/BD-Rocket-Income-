// ==========================================================
// BD Rocket Income - Firebase config (ready to use)
// ==========================================================

const firebaseConfig = {
  apiKey: "AIzaSyDRfxJImRXgdBrfX-ePtSCUOmw3xrheIpA",
  authDomain: "bd-rocket-income.firebaseapp.com",
  projectId: "bd-rocket-income",
  storageBucket: "bd-rocket-income.firebasestorage.app",
  messagingSenderId: "236558120688",
  appId: "1:236558120688:web:096a2525478d7fd7f87435",
  measurementId: "G-1FKJG24MRB"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

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
