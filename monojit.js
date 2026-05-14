// monojit.js — Full working script

// 1. Initialize EmailJS with your Public Key
// NOTE: @emailjs/browser v4 requires an object with publicKey — plain string no longer works (causes 404)
(function() {
    emailjs.init({
        publicKey: "vKcbxrilJRHmNjcim"
    });
})();

// ─── EmailJS Config ───────────────────────────────────────────────────────────
// OTP emails (login & signup)
const EMAILJS_SERVICE_ID   = 'service_9dhzguh';
const EMAILJS_OTP_TEMPLATE = 'template_7eigzsg';
// Dedicated booking confirmation email template
const EMAILJS_BOOKING_TEMPLATE = 'template_8p1bnsp';
const EMAILJS_PUBLIC_KEY   = 'vKcbxrilJRHmNjcim';
// ─────────────────────────────────────────────────────────────────────────────

let generatedOTP; // Global variable to hold the OTP code

/* -------------------------
   Final Signup & OTP Logic
--------------------------*/

window.sendOTP = function() {
    const SERVICE_ID  = EMAILJS_SERVICE_ID;
    const TEMPLATE_ID = EMAILJS_OTP_TEMPLATE;
    const PUBLIC_KEY  = EMAILJS_PUBLIC_KEY;

    const name     = document.getElementById("signup-name").value.trim();
    const email    = document.getElementById("signup-email").value.trim();
    const mobile   = document.getElementById("signup-mobile").value.trim();
    const password = document.getElementById("password").value;

    if (!name || !email || !mobile || !password) {
        alert("Please fill in all fields");
        return;
    }

    if (!checkPasswordStrength()) {
        alert("Password does not meet required standards.");
        return;
    }

    // Generate random 6-digit OTP
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

    // FIX 1: Pass ALL likely template variable names so the template resolves
    //         regardless of which variable names you used in EmailJS dashboard.
    // FIX 2: Pass publicKey as 4th argument — required by v4 to use /v2/ endpoint.
    //         Without this, the SDK falls back to the old /v1.0/ endpoint => 400.
    const templateParams = {
        to_name:    name,
        to_email:   email,
        from_name:  "MedBook",
        user_name:  name,
        user_email: email,
        otp_code:   generatedOTP,
        message:    "Your OTP is: " + generatedOTP
    };

    emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, { publicKey: PUBLIC_KEY })
        .then(() => {
            alert("OTP sent successfully to " + email);
            document.getElementById("signup-form-section").style.display = "none";
            document.getElementById("otp-section").style.display = "block";
            document.getElementById("modal-title").innerText = "Verify OTP";
        })
        .catch((err) => {
            console.error("EmailJS status:", err.status);
            console.error("EmailJS text:",   err.text);
            console.error("EmailJS full:",   err);
            alert("Email failed (" + err.status + "): " + (err.text || JSON.stringify(err)));
        });
}
window.verifyAndRegister = function() {
    const userOtp = document.getElementById("otp-input").value.trim();

    if (userOtp === generatedOTP) {
        const name = document.getElementById("signup-name").value.trim();
        const mobile = document.getElementById("signup-mobile").value.trim();
        
        // Save to local storage — include email so booking confirmation reaches the user
        const emailVal = document.getElementById("signup-email").value.trim();
        const user = { name, mobile, email: emailVal };
        localStorage.setItem("currentUser", JSON.stringify(user));

        alert("Signup Successful!");
        closeSignup();
        location.reload(); // Refresh to show "Hi, User" in header
    } else {
        alert("Invalid OTP. Try again.");
    }
};

window.backToSignup = function() {
    document.getElementById("signup-form-section").style.display = "block";
    document.getElementById("otp-section").style.display = "none";
    document.getElementById("modal-title").innerText = "Create Account";
};

window.checkPasswordStrength = function() {
    const password = document.getElementById("password").value;
    const rules = {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[@#$%^&*!?]/.test(password),
        space: !/\s/.test(password)
    };

    updateRule("rule-length", rules.length);
    updateRule("rule-upper", rules.upper);
    updateRule("rule-lower", rules.lower);
    updateRule("rule-number", rules.number);
    updateRule("rule-special", rules.special);
    updateRule("rule-space", rules.space);

    return Object.values(rules).every(v => v);
};

window.updateRule = function(id, valid) {
    const el = document.getElementById(id);
    if(!el) return;
    el.style.color = valid ? "green" : "red";
    el.innerHTML = (valid ? "✅ " : "❌ ") + el.innerText.substring(2);
};


/* -------------------------
   Auth Logic for Main App
--------------------------*/

function checkAuth() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const userSection = document.getElementById('user-section');
  const loginBtnSection = document.getElementById('login-btn-section');
  
  const userNameDisplay = document.getElementById('user-name-display');
  const userInitial = document.getElementById('user-initial');

  if (currentUser) {
    userSection.style.display = 'flex';
    loginBtnSection.style.display = 'none';
    
    userNameDisplay.textContent = currentUser.name.split(' ')[0]; 
    userInitial.textContent = currentUser.name.charAt(0).toUpperCase();
    
    const patientNameInput = document.getElementById('patient-name');
    const patientContactInput = document.getElementById('patient-contact');
    if(patientNameInput) patientNameInput.value = currentUser.name;
    if(patientContactInput) patientContactInput.value = currentUser.mobile;
  } else {
    userSection.style.display = 'none';
    loginBtnSection.style.display = 'block';
  }
}

function logoutUser() {
  localStorage.removeItem('currentUser');
  window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', checkAuth);


/* -------------------------
   Data: districts + districtLocations
--------------------------*/
const districts = [
  "Kolkata","Howrah","Hooghly","North 24 Parganas","South 24 Parganas",
  "Nadia","Murshidabad","Birbhum","Purba Bardhaman","Purulia","Jalpaiguri","Darjeeling",
  "Alipurduar","Bankura","Cooch Behar","Dakshin Dinajpur","Malda",
  "Paschim Medinipur","Purba Medinipur","Paschim Bardhaman","Jhargram",
  "Uttar Dinajpur","Kalimpong"
];

const districtLocations = {
  "Kolkata": ["Salt Lake","New Alipore","Garia","Behala","Tollygunge","Kasba","Jadavpur","Ballygunge","Dumdum","Park Street"],
  "Howrah": ["Shibpur","Bally","Liluah","Uluberia","Santragachi","Domjur","Andul","Bagnan","Rampur","Kona"],
  "Hooghly": ["Chinsurah","Serampore","Tarakeswar","Arambagh","Konnagar","Bandel","Dankuni","Mogra","Titagarh","Hugli-Chuchura"],
  "North 24 Parganas": ["Barasat","Barrackpore","Madhyamgram","Khardaha","Belgharia","Naihati","Bongaon","Amdanga","Basirhat","Habra"],
  "South 24 Parganas": ["Diamond Harbour","Baruipur","Canning","Budge Budge","Maheshtala","Sonarpur","Namkhana","Kakdwip","Raidighi","Joynagar"],
  "Nadia": ["Krishnanagar","Kalyani","Ranaghat","Shantipur","Karimpur","Tehatta","Nabadwip","Palashbari","Hanskhali","Birnagar"],
  "Murshidabad": ["Baharampur","Jiaganj","Azimganj","Kandi","Lalbagh","Beldanga","Farakka","Jangipur","Domkal","Lalgola"],
  "Birbhum": ["Bolpur","Suri","Rampurhat","Dubrajpur","Nalhati","Sainthia","Ilambazar","Mohammadbazar","Hansan","Mayureswar"],
  "Purba Bardhaman": ["Asansol","Durgapur","Kalna","Katwa","Memari","Sadar","Galsi","Burdwan","Bhatar","Pandabeswar"],
  "Purulia": ["Purulia Town","Raghunathpur","Jhalda","Balarampur","Hura","Manbazar","Kashipur","Arsha","Bagmundi","Bamni"],
  "Jalpaiguri": ["Mal Bazar","Kadamtala","Maynaguri","Nagrakata","Dhupguri","Rajganj","Belakoba","Banarhat","Chalsa","Ambari"],
  "Darjeeling": ["Ghoom","Kurseong","Mirik","Sonada","Lebong","Ghum","Rimbick","Bijanbari","Tindharia","Lebong"],
  "Alipurduar": ["Alipurduar Town","Falakata","Birpara","Hasimara","Madarihat","Kalchini","Samuktala","Jaygaon","Samsing","Buxa"],
  "Bankura": ["Bishnupur","Bankura Town","Khatra","Ranibandh","Barjora","Indas","Chhatna","Saltora","Sonamukhi","Onda"],
  "Cooch Behar": ["Cooch Behar Town","Tufanganj","Dinhata","Mekhliganj","Sitalkuchi","Mathabhanga","Ananda Nagar","Gitaldaha","Balarampur","Gossaigaon"],
  "Dakshin Dinajpur": ["Balurghat","Gangarampur","Kumarganj","Harirampur","Hili","Tapan","Banshihari","Bhamra","Kushmandi","Mange"],
  "Malda": ["English Bazar","Old Malda","Ratua","Gazole","Kaliachak","Manikchak","Harishchandrapur","Chanchal","Habibpur","Bamangola"],
  "Paschim Medinipur": ["Kharagpur","Midnapore","Ghatal","Pingla","Tamluk","Keshiary","Chandrakona","Garbeta","Salboni","Egra"],
  "Purba Medinipur": ["Tamluk","Contai","Haldia","Kanthi","Nayachar","Ramachandrapur","Medinipur","Egra","Durmuth","Raghurampur"],
  "Paschim Bardhaman": ["Asansol","Raniganj","Kulti","Jamuria","Pandaveswar","Salanpur","Barakar","Chittaranjan","Dhawalgiri","Bermo"],
  "Jhargram": ["Jhargram Town","Gopiballavpur","Silda","Binpur","Belpahari","Lalgarh","Sabang","Gopiballavpur-I","Gopiballavpur-II","Dantan"],
  "Uttar Dinajpur": ["Raiganj","Islampur","Dalkhola","Chopra","Kaliyaganj","Goalpokhar","Itahar","Raninagar","Karandighi","Haripur"],
  "Kalimpong": ["Kalimpong Town","Algarah","Lava","Labha","Relli","Mefti","Gorubathan","Jhalong","Sillery Gaon","Samardong"]
};

const specialties = [
  "General Physician","Dentist","Pediatrician","Psychiatrist","Pathologist",
  "Dermatologist","Cardiologist","ENT","Orthopedic","Neurologist","Gynecologist"
];

function randomInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }
function pad(n){ return n<10? '0'+n : '' }
function dateToISO(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function addDays(d, days){ const nd=new Date(d); nd.setDate(nd.getDate()+days); return nd; }

// Doctor data is loaded from doctors_data.js (static, 5636 doctors)
// Edit doctors_data.js to add/update/remove individual doctors.

let selectedDistrict = null;
let selectedSpecialty = null;
let selectedDoctor = null;

function $id(id){ return document.getElementById(id); }
function showPage(n){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  $id(`page-${n}`).classList.add('active');
}

function renderDistricts(filter=''){
  const box = $id('district-list'); 
  if(!box) return;
  box.innerHTML = '';
  districts.forEach(d=>{
    if(filter && !d.toLowerCase().includes(filter.toLowerCase())) return;
    const el = document.createElement('div'); 
    el.className='district-card'; 
    el.textContent=d;
    
    el.onclick=()=> {
      $id('district-search').value = d;
      confirmDistrict(); 
    };
    box.appendChild(el);
  });
}
renderDistricts();
$id('district-search').addEventListener('input', e=> renderDistricts(e.target.value));

function confirmDistrict(){
  const val = ($id('district-search').value || '').trim();
  if(!val || !districts.includes(val)){ alert('Please select a valid district'); return; }
  selectedDistrict = val;
  selectedSpecialty = null;
  selectedDoctor = null;
  renderSpecialtyGridCore();
  showPage(1);
}

function renderSpecialtyGridCore(filter=''){
  const grid = document.querySelector('.specialty-grid');
  if(!grid) return;
  grid.innerHTML = '';
  specialties.forEach(s=>{
    if(filter && !s.toLowerCase().includes(filter.toLowerCase())) return;
    const card = document.createElement('div');
    card.className = 'specialty-card';
    card.innerHTML = `<h3>${s}</h3>`;
    card.onclick = ()=>{
      selectedSpecialty = s;
      renderDoctors();
      showPage(2);
    };
    grid.appendChild(card);
  });
}

function showLocationSuggestions(input){
  const suggestionsBox = $id('location-suggestions');
  suggestionsBox.innerHTML = '';
  if(!selectedDistrict) return;
  const locations = districtLocations[selectedDistrict] || [];
  const q = (input||'').trim().toLowerCase();
  let matches = [];
  if(q){
    matches = locations.filter(loc => loc.toLowerCase().includes(q));
  }
  if(matches.length === 0){
    matches = [...locations].slice(0,6);
  }
  matches.slice(0,6).forEach(loc=>{
    const pill = document.createElement('div');
    pill.className = 'suggestion-pill';
    pill.textContent = loc;
    pill.onclick = ()=> {
      $id('location-filter').value = loc;
      renderDoctors(); 
      suggestionsBox.innerHTML = '';
    };
    suggestionsBox.appendChild(pill);
  });
}

function renderDoctors(){
  if(!selectedDistrict){
    alert('Please choose a district first.'); showPage(0); return;
  }
  if(!selectedSpecialty){
    alert('Please choose a specialty.'); showPage(1); return;
  }

  const dateVal = $id('date-filter').value || null; 
  const locationQ = ($id('location-filter').value || '').trim().toLowerCase();

  $id('page2-title').textContent = `${selectedSpecialty} in ${selectedDistrict}`;

  let candidates = doctors.filter(d => d.district === selectedDistrict && d.domain === selectedSpecialty);

  let byLocation = candidates;
  if(locationQ){
    byLocation = candidates.filter(d => d.location.toLowerCase().includes(locationQ));
  }

  if(locationQ && byLocation.length === 0){
    showLocationSuggestions(locationQ);
    $id('availability-summary').textContent = `No doctors at "${$id('location-filter').value}". Try a nearby location:`;
  } else {
    $id('location-suggestions').innerHTML = '';
    $id('availability-summary').textContent = '';
  }

  const listToUse = (locationQ && byLocation.length>0) ? byLocation : candidates;
  let finalList = listToUse;

  /* FEE FILTER */
  const feeFilter = $id("fee-filter").value;
  if (feeFilter === "under400") finalList = finalList.filter(d => d.fee < 400);
  else if (feeFilter === "400to700") finalList = finalList.filter(d => d.fee >= 400 && d.fee <= 700);
  else if (feeFilter === "above700") finalList = finalList.filter(d => d.fee >= 700 && d.fee <= 900);
  else if (feeFilter === "above900") finalList = finalList.filter(d => d.fee > 900);

  /* EXPERIENCE FILTER */
  const expFilter = parseInt($id("exp-filter").value);
  if (expFilter > 0) finalList = finalList.filter(d => d.experience >= expFilter);

  /* RATING FILTER */
  const ratingFilter = parseFloat($id("rating-filter").value);
  if (ratingFilter > 0) finalList = finalList.filter(d => d.rating >= ratingFilter);

  const available = [];
  const notAvailable = [];

  finalList.forEach(d => {
      if (dateVal) {
        // Check workDays: get day-of-week for selected date (0=Mon..6=Sun)
        const dt = new Date(dateVal + 'T00:00:00');
        const jsDay = dt.getDay(); // 0=Sun,1=Mon...6=Sat
        const wbDay = jsDay === 0 ? 6 : jsDay - 1; // convert to 0=Mon..6=Sun
        const worksOnDay = d.workDays && d.workDays.includes(wbDay);
        const isUnavailable = d.unavailable.includes(dateVal);
        if (!worksOnDay || isUnavailable) notAvailable.push(d);
        else available.push(d);
      } else {
        available.push(d);
      }
  });

  available.sort((a,b)=> b.rating - a.rating);
  notAvailable.sort((a,b)=> b.rating - a.rating);

  $id('availability-summary').textContent = `${available.length} available · ${notAvailable.length} not available` + (dateVal ? ` on ${dateVal}` : '');

  const availBox = $id('available-list');
  const notBox = $id('not-available-list');
  availBox.innerHTML = '';
  notBox.innerHTML = '';

  function makeDayPills(d, selectedDateVal) {
    const DAY_LABELS = ['M','T','W','T','F','S','S'];
    const DAY_NAMES  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    let selectedWbDay = -1;
    if (selectedDateVal) {
      const dt = new Date(selectedDateVal + 'T00:00:00');
      const js = dt.getDay();
      selectedWbDay = js === 0 ? 6 : js - 1;
    }
    const workSet = new Set(d.workDays || []);
    return DAY_LABELS.map((lbl, idx) => {
      const isWork = workSet.has(idx);
      const isToday = idx === selectedWbDay;
      let bg = '#e5e7eb'; let color = '#9ca3af'; let border = 'transparent';
      if (isWork) { bg = '#dcfce7'; color = '#16a34a'; }
      if (isWork && isToday) { bg = '#16a34a'; color = '#fff'; border = '#15803d'; }
      if (!isWork && isToday) { bg = '#fee2e2'; color = '#dc2626'; border = '#fca5a5'; }
      return `<span title="${DAY_NAMES[idx]}" style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:${bg};color:${color};font-size:11px;font-weight:700;border:1.5px solid ${border};">${lbl}</span>`;
    }).join('');
  }

  function makeCard(d, isAvailable){
    const card = document.createElement('div');
    card.className = 'doctor-card';
    card.innerHTML = `
      <h3>${d.name}</h3>
      <p style="font-size:13px;color:#374151"><strong>Rating:</strong> ⭐ ${d.rating} &nbsp; • &nbsp; <strong>Exp:</strong> ${d.experience} yrs</p>
      <p style="font-size:13px;color:#374151"><strong>Fee:</strong> ₹${d.fee}</p>
      <p style="font-size:13px;color:#374151"><strong>Location:</strong> ${d.location}</p>
      <p style="font-size:12px;color:#6366f1;margin-top:3px;"><strong>🏥</strong> ${d.hospitalName || ''}</p>
      <div style="display:flex;gap:4px;margin-top:8px;align-items:center;">${makeDayPills(d, dateVal)}</div>
    `;
    if(isAvailable){
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = 'Book';
      btn.onclick = ()=> selectDoctor(d.id);
      card.appendChild(btn);
    } else {
      card.style.opacity = '0.6';
      card.style.filter = 'grayscale(.08)';
      const note = document.createElement('p');
      note.style.color = '#a00';
      note.style.fontSize = '13px';
      note.style.marginTop = '8px';
      note.textContent = `Unavailable on: ${d.unavailable.join(', ') || '—'}`;
      card.appendChild(note);

      const suggestBtn = document.createElement('div');
      suggestBtn.className = 'suggestion-pill';
      suggestBtn.style.marginTop='8px';
      suggestBtn.style.background='#fff2f2';
      suggestBtn.style.color='#a00';
      suggestBtn.textContent = 'See nearest available';
      suggestBtn.onclick = ()=> suggestNearestAvailable(d);
      card.appendChild(suggestBtn);
    }
    return card;
  }

  available.forEach(d => availBox.appendChild(makeCard(d, true)));
  notAvailable.forEach(d => notBox.appendChild(makeCard(d, false)));
}

function suggestNearestAvailable(unavailableDoctor){
  const dateVal = $id('date-filter').value || null;
  const allCandidates = doctors.filter(d => d.district === unavailableDoctor.district && d.domain === unavailableDoctor.domain);

  const locationMap = {}; 
  allCandidates.forEach(d => {
    const isUnavailable = dateVal && d.unavailable.includes(dateVal);
    if(!isUnavailable){
      locationMap[d.location] = (locationMap[d.location] || 0) + 1;
    }
  });

  const locs = Object.keys(locationMap).sort((a,b)=> locationMap[b]-locationMap[a]);
  if(locs.length === 0){
    alert('No nearby doctors available for this date in this district.');
    return;
  }

  const sugBox = $id('location-suggestions');
  sugBox.innerHTML = '';
  const header = document.createElement('div');
  header.style.margin = '6px 0';
  header.textContent = 'Nearby locations with available doctors:';
  sugBox.appendChild(header);

  locs.slice(0,6).forEach(loc=>{
    const pill = document.createElement('div');
    pill.className = 'suggestion-pill';
    pill.textContent = `${loc} (${locationMap[loc]})`;
    pill.onclick = ()=>{
      $id('location-filter').value = loc;
      renderDoctors(); 
      sugBox.innerHTML = '';
    };
    sugBox.appendChild(pill);
  });

  setTimeout(()=> window.scrollTo({top: $id('available-list').offsetTop - 80, behavior:'smooth'}), 120);
}

function onLocationFilterInput(){
  const q = ($id('location-filter').value || '').trim();
  if(!selectedDistrict) { $id('location-suggestions').innerHTML = ''; return; }
  if(q.length === 0) { $id('location-suggestions').innerHTML = ''; renderDoctors(); return; }
  showLocationSuggestions(q);
}

function selectDoctor(id){
  // Enforce date selection
  const dateInput = document.getElementById('date-filter');
  const dateErr   = document.getElementById('date-error');
  if (!dateInput || !dateInput.value) {
    if (dateErr) { dateErr.style.display = 'block'; dateErr.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    return;
  }
  if (dateErr) dateErr.style.display = 'none';

  selectedDoctor = doctors.find(d=> d.id === id);
  if(!selectedDoctor){ alert('Doctor not found'); return; }

  const info = $id('selected-doctor-info');
  info.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px;">
      <h3 style="margin:0;">${selectedDoctor.name}</h3>
      <button class="back-btn" onclick="showPage(2)">← Back</button>
    </div>
    <p>${selectedDoctor.domain} • ${selectedDoctor.location}</p>
    <p>Fee: ₹${selectedDoctor.fee} • Exp: ${selectedDoctor.experience} yrs</p>
  `;

  const slotSel = $id('slot-select');
  slotSel.innerHTML = '';
  selectedDoctor.slots.forEach(s=>{
    const now = new Date();
    const booked = s.bookedUntil ? new Date(s.bookedUntil) : null;
    if(!booked || now > booked){
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.time} (ID: ${s.id})`;
      slotSel.appendChild(opt);
    }
  });

  showPage(3);
}

/* --- Payment & Booking --- */
let currentMethod = 'razorpay';
let paymentTimer;

window.setPayMethod = function(method) {
    currentMethod = method;
};


// ── Save booking to localStorage ───────────────────────────
function saveBooking(params, txId, methodLabel, advancePaid) {
    try {
        const existing = JSON.parse(localStorage.getItem('mb_bookings') || '[]');
        existing.push({
            id:           txId || ('MB' + Date.now()),
            patientName:  params.patient_name || params.user_name || '—',
            doctorName:   params.doctor_name || '—',
            specialty:    params.specialty || '—',
            location:     params.location || '—',
            timeSlot:     params.time_slot || '—',
            date:         params.appointment_date || new Date().toLocaleDateString('en-IN'),
            fee:          params.fee || '—',
            advancePaid:  '₹' + advancePaid,
            method:       methodLabel || 'Razorpay',
            txId:         txId || '—',
            bookedAt:     new Date().toISOString()
        });
        localStorage.setItem('mb_bookings', JSON.stringify(existing));
    } catch(e) { console.warn('Could not save booking', e); }
}
// ── End save booking ────────────────────────────────────────

window.confirmBooking = function() {
    // ── AUTH GUARD ──────────────────────────────────────────────────
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        // Store intended destination so login can redirect back
        sessionStorage.setItem('redirectAfterLogin', 'booking');
        // Show a brief overlay message then redirect
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position:fixed; inset:0; background:rgba(0,0,0,0.55);
            display:flex; align-items:center; justify-content:center; z-index:9999;
        `;
        overlay.innerHTML = `
            <div style="background:#fff; border-radius:16px; padding:36px 32px;
                        max-width:360px; width:90%; text-align:center; box-shadow:0 20px 60px rgba(0,0,0,0.3);">
                <div style="font-size:48px; margin-bottom:12px;">🔒</div>
                <h2 style="margin:0 0 8px; color:#1e40af; font-size:20px;">Login Required</h2>
                <p style="color:#555; margin:0 0 24px; font-size:14px; line-height:1.5;">
                    You need to be logged in to book an appointment.<br>
                    Please sign in or create an account first.
                </p>
                <button onclick="window.location.href='login.html'"
                    style="background:#2563eb; color:#fff; border:none; border-radius:10px;
                           padding:13px 32px; font-size:15px; font-weight:600; cursor:pointer;
                           width:100%; margin-bottom:10px;">
                    Login / Sign Up
                </button>
                <button onclick="this.closest('div').parentElement.remove()"
                    style="background:#f3f4f6; color:#374151; border:none; border-radius:10px;
                           padding:10px 24px; font-size:14px; font-weight:500; cursor:pointer; width:100%;">
                    Cancel
                </button>
            </div>
        `;
        document.body.appendChild(overlay);
        return;
    }
    // ── END AUTH GUARD ───────────────────────────────────────────────

    const name = document.getElementById('patient-name').value.trim();
    const _upiEl = document.getElementById('user-upi-id');
    const upiIdInput = _upiEl ? _upiEl.value.trim() : '';

    if (!name) { alert("Please enter patient name"); return; }

    if (currentMethod === 'upi-id' && !upiIdInput.includes('@')) {
        alert("Please enter a valid UPI ID");
        return;
    }

    // ── RAZORPAY BRANCH ──────────────────────────────────────────────
    if (currentMethod === 'razorpay') {
        const loggedUser = JSON.parse(localStorage.getItem('currentUser'));
        const advanceEl = document.getElementById('advance');
        const fee = advanceEl ? parseInt(advanceEl.value, 10) : (selectedDoctor ? selectedDoctor.fee : 100);
        const amountPaise = fee * 100; // Razorpay works in paise (advance amount)

        const rzpOptions = {
            key:         'rzp_test_SnP0p1ALFOJ8Wi',
            amount:      amountPaise,
            currency:    'INR',
            name:        'MedBook WB',
            description: 'Doctor Appointment Fee',
            image:       '',
            handler: function(response) {
                // Payment successful — fire email + show confirmation
                const txId = response.razorpay_payment_id;
                const methodDetails = 'Razorpay (ID: ' + txId + ')';
                const _advEl = document.getElementById('advance');
                const _advPaid = _advEl ? parseInt(_advEl.value, 10) : fee;
                const rzpLoggedUser = JSON.parse(localStorage.getItem('currentUser'));
                let rzpApptParams = null;

                if (rzpLoggedUser && rzpLoggedUser.email) {
                    const slotSel = document.getElementById('slot-select');
                    const slotText = slotSel ? slotSel.options[slotSel.selectedIndex]?.text || '—' : '—';
                    const bookingDate = document.getElementById('date-filter')
                        ? (document.getElementById('date-filter').value || new Date().toLocaleDateString('en-IN'))
                        : new Date().toLocaleDateString('en-IN');

                    rzpApptParams = {
                        to_name:          rzpLoggedUser.name,
                        to_email:         rzpLoggedUser.email,
                        email:            rzpLoggedUser.email,
                        recipient_email:  rzpLoggedUser.email,
                        from_name:        'MedBook',
                        user_name:        rzpLoggedUser.name,
                        user_email:       rzpLoggedUser.email,
                        patient_name:     name,
                        doctor_name:      selectedDoctor ? selectedDoctor.name : '—',
                        specialty:        selectedDoctor ? selectedDoctor.domain : '—',
                        location:         selectedDoctor ? selectedDoctor.location : '—',
                        time_slot:        slotText,
                        appointment_date: bookingDate,
                        fee:              selectedDoctor ? '₹' + selectedDoctor.fee : '—',
                        payment_method:   methodDetails,
                        transaction_id:   txId,
                        otp_code:         txId,
                        message: [
                            '🎉 Your appointment has been successfully booked!',
                            '',
                            '📋 Booking Details:',
                            '  Patient      : ' + name,
                            '  Doctor       : ' + (selectedDoctor ? selectedDoctor.name : '—'),
                            '  Specialty    : ' + (selectedDoctor ? selectedDoctor.domain : '—'),
                            '  Location     : ' + (selectedDoctor ? selectedDoctor.location : '—'),
                            '  Time Slot    : ' + slotText,
                            '  Date         : ' + bookingDate,
                            '  Fee Paid     : ' + (selectedDoctor ? '₹' + selectedDoctor.fee : '—'),
                            '  Payment      : ' + methodDetails,
                            '  Transaction  : ' + txId,
                            '',
                            'Please arrive 10 minutes early. See you at the clinic!'
                        ].join('\n')
                    };
                }

                // Save booking
                if (rzpApptParams) saveBooking(rzpApptParams, txId, 'Razorpay', _advPaid || fee);
                // Render confirmation UI
                document.getElementById('confirmation-info').innerHTML = `
                    <div class="confirmation-box" style="border-left:5px solid #059669;background:#f0fdf4;padding:20px;">
                        <h2 style="color:#059669;margin-top:0;">✅ Payment Received</h2>
                        <p><strong>Patient:</strong> ${name}</p>
                        <p><strong>Method:</strong> Razorpay</p>
                        <p><strong>Transaction ID:</strong> ${txId}</p>
                        ${rzpLoggedUser ? `<p data-email-note style="color:#059669;font-size:13px;">📧 Sending confirmation email to <strong>${rzpLoggedUser.email}</strong>…</p>` : ''}
                        <p style="color:#666;font-size:13px;margin-top:10px;">Booking confirmed. See you at the clinic!</p>
                    </div>
                `;
                showPage(4);

                // Send confirmation email
                if (rzpLoggedUser && rzpLoggedUser.email && rzpApptParams) {
                    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_BOOKING_TEMPLATE, rzpApptParams)
                        .then(() => {
                            const note = document.querySelector('#confirmation-info p[data-email-note]');
                            if (note) { note.textContent = '📧 Confirmation email sent to ' + rzpLoggedUser.email; note.style.color = '#059669'; }
                        })
                        .catch(err => {
                            console.error('Email failed:', err);
                            const note = document.querySelector('#confirmation-info p[data-email-note]');
                            if (note) { note.textContent = '⚠️ Email could not be sent. Please note your Transaction ID.'; note.style.color = '#b91c1c'; }
                        });
                }
            },
            prefill: {
                name:    loggedUser ? loggedUser.name    : name,
                email:   loggedUser ? loggedUser.email   : '',
                contact: loggedUser ? loggedUser.mobile  : ''
            },
            theme: { color: '#0d6efd' },
            modal: {
                ondismiss: function() {
                    console.log('Razorpay checkout closed by user.');
                }
            }
        };

        const rzp = new Razorpay(rzpOptions);
        rzp.open();
        return; // Stop here — Razorpay handler takes over
    }
    // ── END RAZORPAY BRANCH ──────────────────────────────────────────

    const modal = document.getElementById('payment-modal');
    const status = document.getElementById('status-text');
    const display = document.getElementById('timer-box');
    const progressBar = document.getElementById('progress-bar');
    
    modal.style.display = 'flex';
    status.textContent = currentMethod === 'upi-id' ? `Request sent to ${upiIdInput}` : "Awaiting QR Scan...";
    
    let totalTime = 120; 
    let timeLeft = totalTime;
    
    const randomSuccessMoment = Math.floor(Math.random() * (100 - 80 + 1)) + 80;

    display.textContent = "02:00";
    progressBar.style.width = "100%";

    clearInterval(paymentTimer); 

    paymentTimer = setInterval(() => {
        timeLeft--;
        
        let mins = Math.floor(timeLeft / 60);
        let secs = timeLeft % 60;
        display.textContent = mins.toString().padStart(2, '0') + ":" + secs.toString().padStart(2, '0');
        
        let progressPercent = (timeLeft / totalTime) * 100;
        progressBar.style.width = progressPercent + "%";

        if (timeLeft <= randomSuccessMoment) {
            clearInterval(paymentTimer);
            
            const txId = 'MB' + Math.floor(Math.random() * 10000000);
            const methodDetails = currentMethod === 'upi-id' ? `UPI ID: ${upiIdInput}` : "Paid via QR Scan";

            // ── Appointment confirmation email ──────────────────────────
            const loggedUser = JSON.parse(localStorage.getItem('currentUser'));
            let apptParams = null;
            if (loggedUser && loggedUser.email) {
                const slotSel = document.getElementById('slot-select');
                const slotText = slotSel ? slotSel.options[slotSel.selectedIndex]?.text || '—' : '—';
                const bookingDate = document.getElementById('date-filter')
                    ? (document.getElementById('date-filter').value || new Date().toLocaleDateString('en-IN'))
                    : new Date().toLocaleDateString('en-IN');

                apptParams = {
                    // Standard fields — all common EmailJS variable name variants included
                    to_name:          loggedUser.name,
                    to_email:         loggedUser.email,
                    email:            loggedUser.email,
                    recipient_email:  loggedUser.email,
                    from_name:        'MedBook',
                    user_name:        loggedUser.name,
                    user_email:       loggedUser.email,
                    // Booking-specific fields (for template_8p1bnsp)
                    patient_name:     name,
                    doctor_name:      selectedDoctor ? selectedDoctor.name : '—',
                    specialty:        selectedDoctor ? selectedDoctor.domain : '—',
                    location:         selectedDoctor ? selectedDoctor.location : '—',
                    time_slot:        slotText,
                    appointment_date: bookingDate,
                    fee:              selectedDoctor ? '₹' + selectedDoctor.fee : '—',
                    payment_method:   methodDetails,
                    transaction_id:   txId,
                    // message field as fallback plain-text summary
                    otp_code:         txId,
                    message: [
                        '🎉 Your appointment has been successfully booked!',
                        '',
                        '📋 Booking Details:',
                        '  Patient      : ' + name,
                        '  Doctor       : ' + (selectedDoctor ? selectedDoctor.name : '—'),
                        '  Specialty    : ' + (selectedDoctor ? selectedDoctor.domain : '—'),
                        '  Location     : ' + (selectedDoctor ? selectedDoctor.location : '—'),
                        '  Time Slot    : ' + slotText,
                        '  Date         : ' + bookingDate,
                        '  Fee Paid     : ' + (selectedDoctor ? '₹' + selectedDoctor.fee : '—'),
                        '  Payment      : ' + methodDetails,
                        '  Transaction  : ' + txId,
                        '',
                        'Please arrive 10 minutes early. See you at the clinic!'
                    ].join('\n')
                };

            }
            // ── End email params build ────────────────────────────────────

            // Save booking (non-Razorpay path)
            {
                const _advEl2 = document.getElementById('advance');
                const _advPaid2 = _advEl2 ? parseInt(_advEl2.value, 10) : (selectedDoctor ? selectedDoctor.fee : 100);
                const _loggedUser2 = JSON.parse(localStorage.getItem('currentUser'));
                const _slotSel2 = document.getElementById('slot-select');
                const _slotText2 = _slotSel2 ? (_slotSel2.options[_slotSel2.selectedIndex]?.text || '—') : '—';
                const _bookDate2 = (document.getElementById('date-filter') || {}).value || new Date().toLocaleDateString('en-IN');
                const _tx2 = 'MB' + Math.floor(Math.random()*10000000);
                saveBooking({
                    patient_name: name,
                    doctor_name: selectedDoctor ? selectedDoctor.name : '—',
                    specialty: selectedDoctor ? selectedDoctor.domain : '—',
                    location: selectedDoctor ? selectedDoctor.location : '—',
                    time_slot: _slotText2,
                    appointment_date: _bookDate2,
                    fee: selectedDoctor ? '₹' + selectedDoctor.fee : '—'
                }, _tx2, currentMethod, _advPaid2);
            }
            // Render confirmation UI FIRST so the DOM is ready
            document.getElementById('confirmation-info').innerHTML = `
                <div class="confirmation-box" style="border-left: 5px solid #059669; background: #f0fdf4; padding: 20px;">
                    <h2 style="color:#059669; margin-top:0;">✅ Payment Received</h2>
                    <p><strong>Patient:</strong> ${name}</p>
                    <p><strong>Method:</strong> ${methodDetails}</p>
                    <p><strong>Transaction ID:</strong> ${txId}</p>
                    ${loggedUser ? `<p data-email-note style="color:#059669; font-size:13px;">📧 Sending confirmation email to <strong>${loggedUser.email}</strong>…</p>` : ''}
                    <p style="color: #666; font-size: 13px; margin-top: 10px;">Booking confirmed. See you at the clinic!</p>
                </div>
            `;

            // Send email AFTER UI is rendered (so .catch can update the DOM)
            if (loggedUser && loggedUser.email && apptParams) {
                // NOTE: Do NOT pass publicKey as 4th arg in EmailJS v4 — init() already set it.
                emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_BOOKING_TEMPLATE, apptParams)
                    .then(() => {
                        console.log('✅ Confirmation email sent to', loggedUser.email);
                        const emailNote = document.querySelector('#confirmation-info p[data-email-note]');
                        if (emailNote) {
                            emailNote.textContent = '📧 Confirmation email sent to ' + loggedUser.email;
                            emailNote.style.color = '#059669';
                        }
                    })
                    .catch(err => {
                        console.error('⚠️ Confirmation email failed:', JSON.stringify(err));
                        const emailNote = document.querySelector('#confirmation-info p[data-email-note]');
                        if (emailNote) {
                            emailNote.textContent = '⚠️ Email could not be sent (error: ' + (err.text || err.status || 'unknown') + '). Please note your Transaction ID.';
                            emailNote.style.color = '#b91c1c';
                        }
                    });
            }
            
            modal.style.display = 'none';
            showPage(4);
        }

        if (timeLeft <= 0) {
            clearInterval(paymentTimer);
            alert("Payment timeout. Please try again.");
            modal.style.display = 'none';
        }
    }, 1000);
};

window.resetApp = function() {
    location.reload();
};

/* Global bindings */
window.confirmDistrict = confirmDistrict;
window.searchSpecialties = ()=> renderSpecialtyGridCore(document.getElementById('search-doctor').value || '');
window.renderDoctors = renderDoctors;
window.onLocationFilterInput = onLocationFilterInput;
window.showPage = showPage;

/* Startup */
renderDistricts();
renderSpecialtyGridCore('');
showPage(0);
setupDateFilter();
/* ── Date Filter Constraints ───────────────────────────────── */
function setupDateFilter() {
    const input = document.getElementById('date-filter');
    if (!input) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Eligible from: 3 days after today
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 3);

    // Max: 30 days after minDate
    const maxDate = new Date(minDate);
    maxDate.setDate(minDate.getDate() + 30);

    const toISO = d => d.toISOString().split('T')[0];
    input.min = toISO(minDate);
    input.max = toISO(maxDate);
    input.value = '';  // force user to pick
}

window.onDateFilterChange = function() {
    const err = document.getElementById('date-error');
    if (err) err.style.display = 'none';
    renderDoctors();
};
/* ── End Date Filter Constraints ───────────────────────────── */

/* ══════════════════════════════════════════════════════════════
   ADVANCE PAYMENT LOGIC
   Runs when page-3 is shown (doctor selected) or fee changes.
══════════════════════════════════════════════════════════════ */

window.refreshAdvanceUI = function() {
  const fee = selectedDoctor ? selectedDoctor.fee : 100;
  const amt50  = Math.round(fee * 0.5);
  const amt100 = fee;

  const el50  = document.getElementById('adv-amt-50');
  const el100 = document.getElementById('adv-amt-100');
  if (el50)  el50.textContent  = '₹' + amt50;
  if (el100) el100.textContent = '₹' + amt100;

  const checked = document.querySelector('input[name="advance-option"]:checked');
  const val = checked ? checked.value : '100';
  _applyAdvance(val, fee);
};

function _applyAdvance(val, fee) {
  fee = fee || (selectedDoctor ? selectedDoctor.fee : 100);
  let payAmt;

  if (val === '50') {
    payAmt = Math.round(fee * 0.5);
  } else if (val === '100') {
    payAmt = fee;
  } else {
    const customInput = document.getElementById('custom-advance-input');
    payAmt = customInput ? parseInt(customInput.value, 10) : null;
    if (isNaN(payAmt) || payAmt < 100) payAmt = null;
  }

  const badge    = document.getElementById('advance-badge-amt');
  const btn      = document.getElementById('proceed-pay-btn');
  const qrAmt    = document.getElementById('qr-pay-amt');
  const hiddenAdv = document.getElementById('advance');

  if (payAmt !== null && payAmt !== undefined) {
    if (badge)     badge.textContent = '₹' + payAmt;
    if (btn)       btn.textContent   = 'Proceed to Pay ₹' + payAmt;
    if (qrAmt)     qrAmt.textContent = '₹' + payAmt;
    if (hiddenAdv) hiddenAdv.value   = payAmt;
  }

  ['50','100','custom'].forEach(k => {
    const lbl = document.getElementById('adv-label-' + k);
    if (lbl) {
      lbl.style.borderColor = (k === val) ? '#2563eb' : '#ddd';
      lbl.style.background  = (k === val) ? '#eff6ff' : '#fff';
    }
  });
}

window.updateAdvanceAmount = function(radio) {
  const val  = radio.value;
  const wrap = document.getElementById('custom-advance-wrap');
  if (wrap) wrap.style.display = (val === 'custom') ? 'block' : 'none';
  const err = document.getElementById('custom-advance-error');
  if (err) err.style.display = 'none';
  _applyAdvance(val);
};

window.onCustomAdvanceInput = function() {
  const input = document.getElementById('custom-advance-input');
  const err   = document.getElementById('custom-advance-error');
  const val   = parseInt(input.value, 10);

  if (isNaN(val) || val < 100) {
    if (err) err.style.display = 'block';
    const badge = document.getElementById('advance-badge-amt');
    const btn   = document.getElementById('proceed-pay-btn');
    const qrAmt = document.getElementById('qr-pay-amt');
    if (badge) badge.textContent = '—';
    if (btn)   btn.textContent   = 'Proceed to Pay';
    if (qrAmt) qrAmt.textContent = '—';
  } else {
    if (err) err.style.display = 'none';
    _applyAdvance('custom');
  }
};

// Patch showPage to refresh advance UI when page-3 opens
const _origShowPage = showPage;
showPage = function(n) {
  _origShowPage(n);
  if (n === 3) {
    setTimeout(window.refreshAdvanceUI, 60);
  }
};
window.showPage = showPage;
/* ── End Advance Payment Logic ─────────────────────────── */

/* ══════════════════════════════════════════════════════════════
   WEST BENGAL DISTRICT MAP — Pin-based interaction
══════════════════════════════════════════════════════════════ */
(function () {

  let _selectedDistrict = null;

  function clearPinSelection() {
    document.querySelectorAll('.map-pin').forEach(p => p.classList.remove('selected'));
    document.querySelectorAll('.sidebar-dist-btn').forEach(b => b.classList.remove('selected'));
  }

  function selectPin(name) {
    clearPinSelection();
    _selectedDistrict = name;

    // Highlight pin
    const pin = document.querySelector(`.map-pin[data-district="${name}"]`);
    if (pin) pin.classList.add('selected');

    // Highlight sidebar btn
    const btn = document.querySelector(`.sidebar-dist-btn[data-district="${name}"]`);
    if (btn) { btn.classList.add('selected'); btn.scrollIntoView({ block:'nearest' }); }

    // Show selected bar
    const bar = document.getElementById('map-selected-bar');
    const nameEl = document.getElementById('map-sel-name');
    if (bar) bar.classList.add('visible');
    if (nameEl) nameEl.textContent = name;
  }

  window.selectDistrictFromMap = function(name) {
    selectPin(name);
  };

  window.confirmMapSelection = function() {
    if (!_selectedDistrict) return;
    const searchEl = document.getElementById('district-search');
    if (searchEl) searchEl.value = _selectedDistrict;
    selectedDistrict  = _selectedDistrict;
    selectedSpecialty = null;
    selectedDoctor    = null;
    renderSpecialtyGridCore();
    closeMapModal();
    showPage(1);
  };

  function buildSidebar() {
    const list = document.getElementById('map-sidebar-list');
    if (!list || list.children.length > 0) return;
    districts.forEach(name => {
      const btn = document.createElement('button');
      btn.className = 'sidebar-dist-btn';
      btn.setAttribute('data-district', name);
      btn.textContent = name;
      btn.onclick = () => selectPin(name);
      list.appendChild(btn);
    });
  }

  window.openMapModal = function () {
    const modal = document.getElementById('wb-map-modal');
    if (!modal) return;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    // Reset state
    _selectedDistrict = null;
    clearPinSelection();
    const bar = document.getElementById('map-selected-bar');
    if (bar) bar.classList.remove('visible');
    buildSidebar();
  };

  window.closeMapModal = function () {
    const modal = document.getElementById('wb-map-modal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
  };

  // Close on backdrop click
  document.addEventListener('click', e => {
    const modal = document.getElementById('wb-map-modal');
    if (e.target === modal) closeMapModal();
  });

})();
/* ── End Map Modal ─────────────────────────────────────────── */

/* ── Search Options Panel ──────────────────────────────────── */
window.selectSearchMode = function(mode) {
  const cardName   = document.getElementById('card-name');
  const cardFilter = document.getElementById('card-filter');
  const radioName  = document.getElementById('radio-name');
  const radioFilter= document.getElementById('radio-filter');
  const nameArea   = document.getElementById('name-search-area');
  const filterArea = document.getElementById('filter-options-area');

  if (mode === 'name') {
    cardName.classList.add('active');
    cardFilter.classList.remove('active');
    radioName.classList.add('selected');
    radioFilter.classList.remove('selected');
    nameArea.style.display = 'block';
    filterArea.style.display = 'none';
    // Reset filters so name search is clean
    document.getElementById('location-filter').value = '';
    document.getElementById('fee-filter').value = '';
    document.getElementById('exp-filter').value = '0';
    document.getElementById('rating-filter').value = '0';
    renderDoctors();
    setTimeout(() => document.getElementById('doctor-name-search').focus(), 50);
  } else {
    cardFilter.classList.add('active');
    cardName.classList.remove('active');
    radioFilter.classList.add('selected');
    radioName.classList.remove('selected');
    filterArea.style.display = 'block';
    nameArea.style.display = 'none';
    // Clear name search
    document.getElementById('doctor-name-search').value = '';
    renderDoctors();
  }
};

window.onDoctorNameSearch = function() {
  const q = (document.getElementById('doctor-name-search').value || '').trim().toLowerCase();
  const dateVal = document.getElementById('date-filter').value || null;

  let candidates = doctors.filter(d =>
    d.district === selectedDistrict && d.domain === selectedSpecialty
  );

  if (q) {
    candidates = candidates.filter(d => d.name.toLowerCase().includes(q));
  }

  const available = [];
  const notAvailable = [];
  candidates.forEach(d => {
    if (dateVal) {
      const dt = new Date(dateVal + 'T00:00:00');
      const js = dt.getDay();
      const wbDay = js === 0 ? 6 : js - 1;
      const worksOnDay = d.workDays && d.workDays.includes(wbDay);
      const isUnavailable = d.unavailable.includes(dateVal);
      if (!worksOnDay || isUnavailable) notAvailable.push(d);
      else available.push(d);
    } else {
      available.push(d);
    }
  });
  available.sort((a, b) => b.rating - a.rating);
  notAvailable.sort((a, b) => b.rating - a.rating);

  document.getElementById('availability-summary').textContent =
    `${available.length} available · ${notAvailable.length} not available` +
    (dateVal ? ` on ${dateVal}` : '');

  const availBox = document.getElementById('available-list');
  const notBox   = document.getElementById('not-available-list');
  availBox.innerHTML = '';
  notBox.innerHTML = '';

  function makeNameCard(d, isAvailable) {
    const card = document.createElement('div');
    card.className = 'doctor-card';
    const DAY_LABELS = ['M','T','W','T','F','S','S'];
    const DAY_NAMES  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    let selectedWbDay = -1;
    if (dateVal) {
      const dt = new Date(dateVal + 'T00:00:00');
      const js = dt.getDay();
      selectedWbDay = js === 0 ? 6 : js - 1;
    }
    const workSet = new Set(d.workDays || []);
    const dayPills = DAY_LABELS.map((lbl, idx) => {
      const isWork = workSet.has(idx);
      const isToday = idx === selectedWbDay;
      let bg = '#e5e7eb'; let color = '#9ca3af'; let border = 'transparent';
      if (isWork) { bg = '#dcfce7'; color = '#16a34a'; }
      if (isWork && isToday) { bg = '#16a34a'; color = '#fff'; border = '#15803d'; }
      if (!isWork && isToday) { bg = '#fee2e2'; color = '#dc2626'; border = '#fca5a5'; }
      return `<span title="${DAY_NAMES[idx]}" style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:${bg};color:${color};font-size:11px;font-weight:700;border:1.5px solid ${border};">${lbl}</span>`;
    }).join('');
    card.innerHTML = `
      <h3>${d.name}</h3>
      <p style="font-size:13px;color:#374151"><strong>Rating:</strong> ⭐ ${d.rating} &nbsp; • &nbsp; <strong>Exp:</strong> ${d.experience} yrs</p>
      <p style="font-size:13px;color:#374151"><strong>Fee:</strong> ₹${d.fee}</p>
      <p style="font-size:13px;color:#374151"><strong>Location:</strong> ${d.location}</p>
      <p style="font-size:12px;color:#6366f1;margin-top:3px;"><strong>🏥</strong> ${d.hospitalName || ''}</p>
      <div style="display:flex;gap:4px;margin-top:8px;align-items:center;">${dayPills}</div>
    `;
    if (isAvailable) {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = 'Book';
      btn.onclick = () => selectDoctor(d.id);
      card.appendChild(btn);
    } else {
      card.style.opacity = '0.6';
      const note = document.createElement('p');
      note.style.color = '#a00';
      note.style.fontSize = '13px';
      note.style.marginTop = '8px';
      note.textContent = `Not available on ${dateVal}`;
      card.appendChild(note);
    }
    return card;
  }

  available.forEach(d => availBox.appendChild(makeNameCard(d, true)));
  notAvailable.forEach(d => notBox.appendChild(makeNameCard(d, false)));

  if (!q) renderDoctors(); // fall back to normal view if search cleared
};
/* ── End Search Options Panel ──────────────────────────────── */
