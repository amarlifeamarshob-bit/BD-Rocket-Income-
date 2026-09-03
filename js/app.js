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

// ================= Site content (admin-editable text/notice/color/logo) =================
// Call this on any page (index.html, dashboard.html, etc.) to pull whatever
// the admin has set and apply it automatically.
function loadSiteContent(callback){
  db.collection("settings").doc("siteContent").get().then(function(doc){
    const c = doc.exists ? doc.data() : {};

    // Apply theme color as a CSS variable so existing var(--blue) etc. can
    // be pointed at it, or use var(--primary) directly in your CSS.
    if(c.primaryColor){
      document.documentElement.style.setProperty('--primary', c.primaryColor);
    }

    // Any element with data-site="siteName" / "heroTitle" / "heroSubtitle"
    // gets its text filled in automatically.
    if(c.siteName) document.querySelectorAll('[data-site="siteName"]').forEach(el=>el.textContent = c.siteName);
    if(c.heroTitle) document.querySelectorAll('[data-site="heroTitle"]').forEach(el=>el.textContent = c.heroTitle);
    if(c.heroSubtitle) document.querySelectorAll('[data-site="heroSubtitle"]').forEach(el=>el.textContent = c.heroSubtitle);

    // Notice banner: only overwrite if admin has actually written something,
    // otherwise leave the page's default fallback text in place.
    if(c.notice){
      document.querySelectorAll('[data-site="notice"]').forEach(el=>el.textContent = c.notice);
    }

    // Logo: any <img data-site="logo"> gets its src set.
    if(c.logoUrl) document.querySelectorAll('img[data-site="logo"]').forEach(img=>img.src = c.logoUrl);

    // Task cards on dashboard.html: admin-editable icon + label + link.
    // Looks for a container with id="taskCardsGrid". If admin hasn't saved
    // any custom cards yet, the page's own hardcoded default cards stay as-is.
    if(c.taskCards && Array.isArray(c.taskCards) && c.taskCards.length){
      const grid = document.getElementById('taskCardsGrid');
      if(grid){
        grid.innerHTML = "";
        c.taskCards.forEach(function(t){
          const a = document.createElement('a');
          a.className = "grid-item";
          a.href = t.link || "#";
          const isImage = t.icon && /^https?:\/\//.test(t.icon);
          const iconInner = isImage
            ? '<img src="' + t.icon + '" style="width:28px;height:28px;object-fit:contain;">'
            : (t.icon || "");
          a.innerHTML = '<div class="ic">' + iconInner + '</div>' + (t.label || "");
          grid.appendChild(a);
        });
      }
    }

    if(typeof callback === "function") callback(c);
  });
}

// ================= Quiz / survey questions (admin-editable) =================
function loadQuestions(callback){
  db.collection("questions").orderBy("createdAt","desc").get().then(function(snap){
    const list = [];
    snap.forEach(doc=>list.push({ id: doc.id, ...doc.data() }));
    if(typeof callback === "function") callback(list);
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

// ================= Special per-user notices (admin-sent, bell icon) =================
function loadNotifications(uid, callback){
  db.collection("notifications").where("uid","==",uid).orderBy("createdAt","desc").limit(20).get().then(function(snap){
    const list = [];
    snap.forEach(doc=>list.push({ id: doc.id, ...doc.data() }));
    if(typeof callback === "function") callback(list);
  });
}

function markNotificationRead(id){
  return db.collection("notifications").doc(id).update({ read: true });
      }
