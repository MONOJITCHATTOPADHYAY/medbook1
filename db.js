// db.js — MedBook persistent user database using IndexedDB
// Works offline, persists across sessions, survives page refresh & logout

const DB_NAME    = 'MedBookDB';
const DB_VERSION = 1;
const STORE_NAME = 'users';

let _db = null;

function openDB() {
  return new Promise((resolve, reject) => {
    if (_db) { resolve(_db); return; }

    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'email' });
        store.createIndex('email',  'email',  { unique: true });
        store.createIndex('mobile', 'mobile', { unique: false });
      }
    };

    req.onsuccess = (e) => { _db = e.target.result; resolve(_db); };
    req.onerror   = (e) => reject(e.target.error);
  });
}

// Save a new user (or overwrite if email exists)
async function dbSaveUser(user) {
  const db    = await openDB();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req   = store.put(user);          // put = insert or update
    req.onsuccess = () => resolve(true);
    req.onerror   = (e) => reject(e.target.error);
  });
}

// Get user by email
async function dbGetUser(email) {
  const db    = await openDB();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req   = store.get(email);
    req.onsuccess = (e) => resolve(e.target.result || null);
    req.onerror   = (e) => reject(e.target.error);
  });
}

// Check if email already registered
async function dbUserExists(email) {
  const user = await dbGetUser(email);
  return user !== null;
}

// Get all users (admin/debug use)
async function dbGetAllUsers() {
  const db    = await openDB();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req   = store.getAll();
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror   = (e) => reject(e.target.error);
  });
}
