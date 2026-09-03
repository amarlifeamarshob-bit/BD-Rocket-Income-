// ================= Helpers =================
function genRefCode(name){
  const clean = (name || "user").replace(/\s+/g,"").toUpperCase().slice(0,4);
  return clean + Math.floor(1000 + Math.random()*9000);
}

function getRefFromURL(){
  const params = new URLSearchParams(window.location.search);
  return params.get("ref") || "";
}

const WITHDRAW_LIMITS = [150, 250, 350, 450, 550, 1150];
const WITHDRAW_FEE_PERCENT = 10;

function calcWithdraw(amount){
  const fee = Math.round(amount * WITHDRAW_FEE_PERCENT) / 100;
  const net = amount - fee;
  return { fee, net };
}

function requireLogin(){
  auth.onAuthStateChanged(function(user){
    if(!user){
      window.location.href = "index.html";
    }
  });
}

function logout(){
  auth.signOut().then(()=>{ window.location.href = "index.html"; });
}

// ================= Signup =================
function signupUser({name, phone, email, password}){
  const refCode = getRefFromURL();
  return auth.createUserWithEmailAndPassword(email, password).then(function(cred){
    const uid = cred.user.uid;
    return db.collection("users").doc(uid).set({
      name: name,
      phone: phone,
      email: email,
      refCode: genRefCode(name),
      referredBy: refCode || null,
      balance: 0,
      activationStatus: "unpaid", // unpaid -> pending -> approved/rejected
      activationTrxId: "",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  });
}

function loginUser({email, password}){
  return auth.signInWithEmailAndPassword(email, password);
}

// ================= Activation payment =================
function submitActivationTrxId(uid, trxId){
  return db.collection("users").doc(uid).update({
    activationTrxId: trxId,
    activationStatus: "pending"
  });
}

// ================= Task submission =================
function submitTaskProof({uid, type, rate, proofFields}){
  return db.collection("submissions").add({
    uid: uid,
    type: type,           // "ad" | "survey" | "microjob"
    amount: rate,
    proof: proofFields,
    status: "pending",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

// ================= Withdraw =================
function requestWithdraw({uid, amount, method, accountNumber}){
  const { fee, net } = calcWithdraw(amount);
  return db.collection("withdrawals").add({
    uid: uid,
    amount: amount,
    fee: fee,
    netAmount: net,
    method: method,
    accountNumber: accountNumber,
    status: "pending",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

// ================= Load current user's data into dashboard =================
function loadUserProfile(callback){
  auth.onAuthStateChanged(function(user){
    if(!user){ window.location.href = "index.html"; return; }
    db.collection("users").doc(user.uid).get().then(function(doc){
      if(doc.exists){
        callback({ uid: user.uid, ...doc.data() });
      }
    });
  });
}
