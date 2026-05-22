
// ======================================
// FIREBASE CONFIG
// Replace with your Firebase credentials
// ======================================
const firebaseConfig = {
  apiKey: ,
  authDomain: ,
  projectId: ,
  storageBucket: ,
  messagingSenderId: ,
  appId: ,
  measurementId: 
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// ======================================
// SIGNUP
// ======================================

function showSignup(){
  document.getElementById('signup-modal').classList.add('open');
}

function closeSignup(){
  document.getElementById('signup-modal').classList.remove('open');
}

function signupUser(){
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  auth.createUserWithEmailAndPassword(email,password)
    .then((userCredential)=>{
      return userCredential.user.sendEmailVerification();
    })
    .then(()=>{
      alert('Verification email sent. Please verify your email.');
      closeSignup();
    })
    .catch(err=>{
      alert(err.message);
    });
}

// ======================================
// LOGIN
// ======================================

function doLogin(){

  const email = document.getElementById('login-user').value;
  const password = document.getElementById('login-pass').value;

  auth.signInWithEmailAndPassword(email,password)
    .then((userCredential)=>{

      if(!userCredential.user.emailVerified){
        alert('Please verify your email first.');
        auth.signOut();
        return;
      }

      // CURRENT USER
      currentUser = {
        name: userCredential.user.email
      };

      // USER ID
      window.currentUID = userCredential.user.uid;

      // APP SHOW
      document.getElementById('login-screen').style.display='none';
      document.getElementById('app').style.display='block';

      // LOAD USER DATA
      loadUserData();

    })
    .catch(err=>{
      alert(err.message);
    });
}

// ======================================
// LOAD USER DATA
// ======================================

function loadUserData(){

  products = JSON.parse(
    localStorage.getItem('sp_products_' + currentUID) || '[]'
  );

  auditLog = JSON.parse(
    localStorage.getItem('sp_audit_' + currentUID) || '[]'
  );

  invoices = JSON.parse(
    localStorage.getItem('sp_invoices_' + currentUID) || '[]'
  );

  // FIRST TIME USER
  if(products.length === 0){
    seedProducts();
  }

  refreshDashboard();
  renderInventory();
  renderPOS();
  renderInvoicesList();
  renderAudit();
}

// ======================================
// SAVE USER DATA
// ======================================

function saveData(){

  localStorage.setItem(
    'sp_products_' + currentUID,
    JSON.stringify(products)
  );

  localStorage.setItem(
    'sp_audit_' + currentUID,
    JSON.stringify(auditLog)
  );

  localStorage.setItem(
    'sp_invoices_' + currentUID,
    JSON.stringify(invoices)
  );
}

// ======================================
// RESET PASSWORD
// ======================================

function forgotPassword(){

  const email = prompt('Enter your registered email');

  if(!email) return;

  auth.sendPasswordResetEmail(email)
    .then(()=>{
      alert('Password reset email sent.');
    })
    .catch(err=>{
      alert(err.message);
    });
}

// ======================================
// LOGOUT
// ======================================

function doLogout(){

  auth.signOut().then(()=>{

    currentUser = null;
    currentUID = null;

    location.reload();

  });

}

