// monojit.js — Full working script
// Option A: doctors have `unavailable` arrays (YYYY-MM-DD).
// Behaviors:
//  - district -> specialty -> date -> location filtering
//  - Available doctors shown first; Not Available listed under them
//  - If location filter yields no exact matches, suggestions appear as pills
//  - Fees divisible by 100, experience 2..30, rating 3.0..5.0
//  - Booking with time slots and 1-hour validity


/* -------------------------
   Auth Logic for Main App
--------------------------*/

function checkAuth() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const userSection = document.getElementById('user-section');
  const loginBtnSection = document.getElementById('login-btn-section');
  
  // Elements inside user section
  const userNameDisplay = document.getElementById('user-name-display');
  const userInitial = document.getElementById('user-initial');

  if (currentUser) {
    // User is logged in
    userSection.style.display = 'flex';
    loginBtnSection.style.display = 'none';
    
    // Set name and initial
    userNameDisplay.textContent = currentUser.name.split(' ')[0]; // First name only
    userInitial.textContent = currentUser.name.charAt(0).toUpperCase();
    
    // Auto-fill booking form if it exists
    const patientNameInput = document.getElementById('patient-name');
    const patientContactInput = document.getElementById('patient-contact');
    if(patientNameInput) patientNameInput.value = currentUser.name;
    if(patientContactInput) patientContactInput.value = currentUser.mobile;

  } else {
    // User is NOT logged in
    userSection.style.display = 'none';
    loginBtnSection.style.display = 'block';
  }
}

function logoutUser() {
  localStorage.removeItem('currentUser');
  window.location.href = 'login.html';
}

// Run check on load
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

/* -------------------------
   Specialties
--------------------------*/
const specialties = [
  "General Physician","Dentist","Pediatrician","Psychiatrist","Pathologist",
  "Dermatologist","Cardiologist","ENT","Orthopedic","Neurologist","Gynecologist"
];

/* -------------------------
   Utility helpers
--------------------------*/
function randomInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }
function pad(n){ return n<10? '0'+n : '' }
function dateToISO(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function addDays(d, days){ const nd=new Date(d); nd.setDate(nd.getDate()+days); return nd; }

/* -------------------------
   Generate realistic doctors (with unavailable dates)
   - fee divisible by 100 (200..3000)
   - experience 2..30
--------------------------*/
const firstNames = ["Amit","Priya","Rohit","Sunita","Ananya","Suman","Rina","Arjun","Bipasha","Kabir"];
const lastNames  = ["Roy","Sen","Das","Sharma","Mondal","Bhattacharya","Chatterjee","Ghosh","Mukherjee","Banerjee"];

const doctors = [];
let docCounter = 1;

districts.forEach((dist, distIdx) => {
  const locs = districtLocations[dist] || [`${dist} Main`];

  specialties.forEach((spec, specIdx) => {
    // shuffle locs to vary assignment
    const shuffledLocs = [...locs].sort(()=>Math.random()-0.5);

    // generate 20 doctors per spec per district (keeps dataset lighter)
    for(let i=0;i<20;i++){
      const id = `DOC-${distIdx+1}-${specIdx+1}-${i+1}`;
      const name = `Dr. ${firstNames[(docCounter)%firstNames.length]} ${lastNames[(docCounter+1)%lastNames.length]}`;
      const rating = parseFloat((3 + Math.random()*2).toFixed(1));
      const fee = (Math.floor(Math.random()*9) + 2) * 100; // 200..1000 by 100
      const experience = randomInt(2,30);
      const location = `${shuffledLocs[i % shuffledLocs.length]}`;
      // unavailable days (Option A) — pick random 0..4 days in next 30 days
      const unavailable = [];
      const count = randomInt(0,4);
      const base = new Date();
      for(let k=0;k<count;k++){
        const daysFromNow = randomInt(1,30);
        unavailable.push(dateToISO(addDays(base, daysFromNow)));
      }
      // unique
      const unavailableUnique = [...new Set(unavailable)];

      const slots = [
        {id:`${id}-S1`, time:'10:00 AM', bookedUntil: null},
        {id:`${id}-S2`, time:'11:00 AM', bookedUntil: null},
        {id:`${id}-S3`, time:'02:00 PM', bookedUntil: null},
        {id:`${id}-S4`, time:'03:00 PM', bookedUntil: null},
      ];

      doctors.push({
        id, name, domain: spec, district: dist, location, rating, fee, experience,
        unavailable: unavailableUnique, slots, img: `https://randomuser.me/api/portraits/${(docCounter%2?'men':'women')}/${(docCounter%90)+1}.jpg`
      });

      docCounter++;
    }
  });
});

/* -------------------------
   App state
--------------------------*/
let selectedDistrict = null;
let selectedSpecialty = null;
let selectedDoctor = null;

/* -------------------------
   DOM refs & helpers
--------------------------*/
function $id(id){ return document.getElementById(id); }
function showPage(n){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  $id(`page-${n}`).classList.add('active');
}

/* -------------------------
   Render Districts
--------------------------*/
function renderDistricts(filter=''){
  const box = $id('district-list'); 
  if(!box) return;
  box.innerHTML = '';
  districts.forEach(d=>{
    if(filter && !d.toLowerCase().includes(filter.toLowerCase())) return;
    const el = document.createElement('div'); 
    el.className='district-card'; 
    el.textContent=d;
    
    // MODIFIED: Clicking the card now sets the value AND confirms the district
    el.onclick=()=> {
      $id('district-search').value = d;
      confirmDistrict(); // Calls the confirmation function immediately
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
  renderSpecialtyGrid();
  showPage(1);
}

/* -------------------------
   Specialties rendering & search
--------------------------*/
function renderSpecialtyGrid(filter=''){
  const grid = document.querySelector('.specialty-grid');
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
function searchSpecialties(){ renderSpecialtyGrid($id('search-doctor').value.trim()); }

/* -------------------------
   Location suggestions helper
   - If user types location and no doc matches, show other nearby locations in district
--------------------------*/
function showLocationSuggestions(input){
  const suggestionsBox = $id('location-suggestions');
  suggestionsBox.innerHTML = '';
  if(!selectedDistrict) return;
  const locations = districtLocations[selectedDistrict] || [];
  // try to find matches containing input, else propose top 5 other locations
  const q = (input||'').trim().toLowerCase();
  let matches = [];
  if(q){
    matches = locations.filter(loc => loc.toLowerCase().includes(q));
  }
  if(matches.length === 0){
    // propose 5 nearest (just first 5 distinct)
    matches = [...locations].slice(0,6);
  }
  matches.slice(0,6).forEach(loc=>{
    const pill = document.createElement('div');
    pill.className = 'suggestion-pill';
    pill.textContent = loc;
    pill.onclick = ()=> {
      $id('location-filter').value = loc;
      renderDoctors(); // re-run filter with clicked suggestion
      suggestionsBox.innerHTML = '';
    };
    suggestionsBox.appendChild(pill);
  });
}

/* -------------------------
   Render doctors (Available first, Not Available after)
   Filter chain:
     - must match selectedDistrict & selectedSpecialty
     - if date selected, split unavailable/available by doctor's unavailable array
     - then apply location filter (if provided) — if none in that location, suggestions offered
--------------------------*/
function renderDoctors(){
  // make sure we have district + specialty
  if(!selectedDistrict){
    alert('Please choose a district first.'); showPage(0); return;
  }
  if(!selectedSpecialty){
    alert('Please choose a specialty.'); showPage(1); return;
  }

  const dateVal = $id('date-filter').value || null; // yyyy-mm-dd or ''
  const locationQ = ($id('location-filter').value || '').trim().toLowerCase();

  $id('page2-title').textContent = `${selectedSpecialty} in ${selectedDistrict}`;

  // gather candidates
  let candidates = doctors.filter(d => d.district === selectedDistrict && d.domain === selectedSpecialty);

  // if location filter present, narrow by exact contains match
  let byLocation = candidates;
  if(locationQ){
    byLocation = candidates.filter(d => d.location.toLowerCase().includes(locationQ));
  }

  // if no matches in byLocation and locationQ provided -> show suggestions
  if(locationQ && byLocation.length === 0){
    showLocationSuggestions(locationQ);
    $id('availability-summary').textContent = `No doctors at "${$id('location-filter').value}". Try a nearby location:`;
  } else {
    $id('location-suggestions').innerHTML = '';
    $id('availability-summary').textContent = '';
  }

  // choose listToUse: if locationQ provided and byLocation non-empty -> use byLocation; else use candidates
  const listToUse = (locationQ && byLocation.length>0) ? byLocation : candidates;

/* ------------------------------------------------------
   ⭐ ADD FILTERS HERE (FEE, EXPERIENCE, RATING)
---------------------------------------------------------*/

let finalList = listToUse;

/* FEE FILTER */
const feeFilter = $id("fee-filter").value;
if (feeFilter === "under400") {
    finalList = finalList.filter(d => d.fee < 400);
}
else if (feeFilter === "400to700") {
    finalList = finalList.filter(d => d.fee >= 400 && d.fee <= 700);
}
else if (feeFilter === "above700") {
    finalList = finalList.filter(d => d.fee > 700);
}

/* EXPERIENCE FILTER */
const expFilter = parseInt($id("exp-filter").value);
if (expFilter > 0) {
    finalList = finalList.filter(d => d.experience >= expFilter);
}

/* RATING FILTER */
const ratingFilter = parseFloat($id("rating-filter").value);
if (ratingFilter > 0) {
    finalList = finalList.filter(d => d.rating >= ratingFilter);
}

/* ------------------------------------------------------
   ⭐ DO NOT TOUCH ANYTHING BELOW THIS LINE
---------------------------------------------------------*/

const available = [];
const notAvailable = [];

finalList.forEach(d => {
    if (dateVal && d.unavailable.includes(dateVal)) notAvailable.push(d);
    else available.push(d);
});


  // sort each list by rating desc
  available.sort((a,b)=> b.rating - a.rating);
  notAvailable.sort((a,b)=> b.rating - a.rating);

  // render counts
  $id('availability-summary').textContent = `${available.length} available · ${notAvailable.length} not available` + (dateVal ? ` on ${dateVal}` : '');

  // render DOM
  const availBox = $id('available-list');
  const notBox = $id('not-available-list');
  availBox.innerHTML = '';
  notBox.innerHTML = '';

  // helper to create card element (with book button only for available)
  function makeCard(d, isAvailable){
    const card = document.createElement('div');
    card.className = 'doctor-card';
    card.innerHTML = `
      <h3>${d.name}</h3>
      <p style="font-size:13px;color:#374151"><strong>Rating:</strong> ⭐ ${d.rating} &nbsp; • &nbsp; <strong>Exp:</strong> ${d.experience} yrs</p>
      <p style="font-size:13px;color:#374151"><strong>Fee:</strong> ₹${d.fee}</p>
      <p style="font-size:13px;color:#374151"><strong>Location:</strong> ${d.location}</p>
    `;
    if(isAvailable){
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = 'Book';
      btn.onclick = ()=> {
        selectDoctor(d.id);
      };
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

      // add button to "Suggest nearest available" which will show other locations
      const suggestBtn = document.createElement('div');
      suggestBtn.className = 'suggestion-pill';
      suggestBtn.style.marginTop='8px';
      suggestBtn.style.background='#fff2f2';
      suggestBtn.style.color='#a00';
      suggestBtn.textContent = 'See nearest available';
      suggestBtn.onclick = ()=> {
        // show other locations in district that have available doctors for this specialty & date
        suggestNearestAvailable(d);
      };
      card.appendChild(suggestBtn);
    }
    return card;
  }

  // append available first
  available.forEach(d => availBox.appendChild(makeCard(d, true)));

  // then not available under it
  notAvailable.forEach(d => notBox.appendChild(makeCard(d, false)));
}

/* -------------------------
   Suggest nearest available:
   - when a doctor is not available at X location, we search other locations in district
     for available doctors same specialty and show suggestion pills below suggestions box
--------------------------*/
function suggestNearestAvailable(unavailableDoctor){
  // find distinct locations in district where same specialty has available doctors on selected date
  const dateVal = $id('date-filter').value || null;
  const allCandidates = doctors.filter(d => d.district === unavailableDoctor.district && d.domain === unavailableDoctor.domain);

  // find locations with available doctors
  const locationMap = {}; // loc -> count
  allCandidates.forEach(d => {
    const isUnavailable = dateVal && d.unavailable.includes(dateVal);
    if(!isUnavailable){
      locationMap[d.location] = (locationMap[d.location] || 0) + 1;
    }
  });

  // create suggestions sorted by count desc
  const locs = Object.keys(locationMap).sort((a,b)=> locationMap[b]-locationMap[a]);
  if(locs.length === 0){
    alert('No nearby doctors available for this date in this district.');
    return;
  }

  // show suggestion pills in the suggestion box
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
      renderDoctors(); // reload using loc
      sugBox.innerHTML = '';
    };
    sugBox.appendChild(pill);
  });

  // scroll user to top of doctors section
  setTimeout(()=> window.scrollTo({top: $id('available-list').offsetTop - 80, behavior:'smooth'}), 120);
}

/* -------------------------
   Location filter input handler
--------------------------*/
function onLocationFilterInput(){
  const q = ($id('location-filter').value || '').trim();
  if(!selectedDistrict) { $id('location-suggestions').innerHTML = ''; return; }
  if(q.length === 0) { $id('location-suggestions').innerHTML = ''; renderDoctors(); return; }
  showLocationSuggestions(q);
}

/* -------------------------
   Select doctor to book
--------------------------*/
function selectDoctor(id){
  selectedDoctor = doctors.find(d=> d.id === id);
  if(!selectedDoctor){ alert('Doctor not found'); return; }

  // populate selected-doctor-info
  const info = $id('selected-doctor-info');
  info.innerHTML = `
  <h3>${selectedDoctor.name}</h3>
  <p>${selectedDoctor.domain} • ${selectedDoctor.location}</p>
  <p>Fee: ₹${selectedDoctor.fee} • Exp: ${selectedDoctor.experience} yrs</p>
`;


  // populate slots
  const slotSel = $id('slot-select');
  slotSel.innerHTML = '';
  selectedDoctor.slots.forEach(s=>{
    // only show if not booked (simple bookedUntil check)
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

/* -------------------------
   Confirm booking (With Fake UPI Simulation)
--------------------------*/

 /* --- Payment Selection --- */
window.setPayMethod = function(method) {
  currentMethod = method;
  
  // Toggle tab buttons
  document.querySelectorAll('.pay-tab').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase().includes(method));
  });
  
  // Toggle visibility
  document.getElementById('upi-details').style.display = (method === 'upi') ? 'block' : 'none';
  document.getElementById('card-details').style.display = (method === 'card') ? 'block' : 'none';
};

/* --- Booking Logic --- */
window.confirmBooking = function() {
  const name = document.getElementById('patient-name').value.trim();
  const slotId = document.getElementById('slot-select').value;
  
  if (!name || !slotId) {
    alert("Please enter patient name and select a slot.");
    return;
  }

  // Simulate Card Verification
  if (currentMethod === 'card') {
    const cardNum = document.getElementById('card-num').value;
    if (cardNum.length < 16) { alert("Invalid Card Number"); return; }
  }

  // Show Loading
  const modal = document.getElementById('payment-modal');
  document.getElementById('status-text').textContent = `Processing ${currentMethod.toUpperCase()}...`;
  modal.style.display = 'flex';

  setTimeout(() => {
    const txId = 'TXN' + Math.floor(Math.random() * 1000000);
    const methodText = currentMethod === 'upi' ? "UPI" : "Card Ending ****" + document.getElementById('card-num').value.slice(-4);

    document.getElementById('confirmation-info').innerHTML = `
      <div class="confirmation-box">
        <h3 style="color:green">✅ Booking Successful</h3>
        <p><strong>Patient:</strong> ${name}</p>
        <p><strong>Payment:</strong> ${methodText}</p>
        <p><strong>Transaction ID:</strong> ${txId}</p>
        <p>Please arrive 15 mins early at the chamber.</p>
      </div>
    `;

    modal.style.display = 'none';
    showPage(4);
  }, 2000);
};
/* -------------------------
   Initialization wiring
--------------------------*/
function init(){
  // DOM refs exist as per HTML file
  renderDistricts();
  renderSpecialtyGrid = () => {
    // alias function for older code compatibility
    const q = ($id('search-doctor').value || '').trim();
    renderSpecialtyGridCore(q);
  };
  // implement renderSpecialtyGridCore used by older flows
  window.renderSpecialtyGridCore = function(q=''){ renderSpecialtyGridCore(q); };
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
    card.onclick = ()=> { selectedSpecialty = s; renderDoctors(); showPage(2); };
    grid.appendChild(card);
  });
}

/* expose helpful functions globally for HTML handlers */
window.confirmDistrict = confirmDistrict;
window.searchSpecialties = ()=> renderSpecialtyGridCore($id('search-doctor').value || '');
window.renderDoctors = renderDoctors;
window.onLocationFilterInput = onLocationFilterInput;
window.resetApp = resetApp;
window.showPage = showPage;

/* start */
renderDistricts();
renderSpecialtyGridCore('');
showPage(0);










function checkPasswordStrength() {
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

    return Object.values(rules).every(rule => rule);
}

function updateRule(id, valid) {
    const el = document.getElementById(id);
    if (valid) {
        el.innerHTML = "✅ " + el.innerText.substring(2);
        el.style.color = "green";
    } else {
        el.innerHTML = "❌ " + el.innerText.substring(2);
        el.style.color = "red";
    }
}

function registerUser() {
    if (!checkPasswordStrength()) {
        alert("Password does not meet required standards.");
        return;
    }

    alert("Registration Successful!");
}