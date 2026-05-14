const firebaseConfig = {
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
let confirmationResultGlobal = null;

document.addEventListener('DOMContentLoaded', () => {
  window.switchTab = function(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    if (tab === 'login') {
      document.querySelectorAll('.auth-tab')[0].classList.add('active');
      document.getElementById('login-form').classList.add('active');
    } else {
      document.querySelectorAll('.auth-tab')[1].classList.add('active');
      document.getElementById('signup-form').classList.add('active');
    }
  };

  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    size: 'normal'
  });

  const signupForm = document.getElementById('signup-form');
  signupForm.addEventListener('submit', function(e){
    e.preventDefault();
    const name = signup-name.value.trim();
    const mobile = signup-mobile.value.trim();
    const pass = signup-pass.value.trim();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    users.push({name,mobile,pass});
    localStorage.setItem('users', JSON.stringify(users));
    alert('Account created. Now login with OTP');
    switchTab('login');
  });
});

async function sendOTP(){
  const mobile = document.getElementById('login-id').value.trim();
  const errorEl = document.getElementById('login-error');
  errorEl.textContent='';
  if(mobile.length !== 10) return errorEl.textContent='Enter valid mobile number';
  try{
    confirmationResultGlobal = await auth.signInWithPhoneNumber('+91'+mobile, window.recaptchaVerifier);
    alert('OTP sent successfully');
  }catch(err){ errorEl.textContent = err.message; }
}

async function verifyOTP(){
  const code = document.getElementById('otp').value.trim();
  const errorEl = document.getElementById('login-error');
  try{
    const result = await confirmationResultGlobal.confirm(code);
    localStorage.setItem('currentUser', JSON.stringify({ mobile: result.user.phoneNumber }));
    window.location.href='index.html';
  }catch(err){ errorEl.textContent='Invalid OTP'; }
}