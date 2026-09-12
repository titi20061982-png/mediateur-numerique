// Module central Firebase : authentification + favoris/historique de quiz sauvegardes dans le cloud.
// Importe avec un chemin relatif ("./auth.js" depuis la racine, "../auth.js" depuis ateliers/).
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut, sendPasswordResetEmail,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, deleteDoc,
  arrayUnion, arrayRemove, collection, addDoc,
  query, orderBy, getDocs, increment
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCrbSeqOEpVNcW31qF0V-FsXxZI8Q7CbJM",
  authDomain: "mediation-numerique-1798e.firebaseapp.com",
  projectId: "mediation-numerique-1798e",
  storageBucket: "mediation-numerique-1798e.firebasestorage.app",
  messagingSenderId: "356682881833",
  appId: "1:356682881833:web:93730a2bc8dedef4aa3538",
  measurementId: "G-MDY03V11ZF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export const MODERATOR_EMAIL = "waltenercedric@proton.me";
export function isModerator(user) { return !!user && user.email === MODERATOR_EMAIL; }

export function watchAuth(cb) {
  return onAuthStateChanged(auth, function (user) {
    if (user) {
      const ref = doc(db, "users", user.uid);
      const data = { isAnonymous: !!user.isAnonymous };
      if (user.email) data.email = user.email;
      if (user.isAnonymous) {
        setDoc(ref, data, { merge: true }).catch(function () {});
        ensureLocationInfo(user.uid).catch(function () {});
        cb(user);
      } else {
        getDoc(ref).then(function (snap) {
          const prev = snap.exists() ? snap.data() : {};
          const today = new Date().toISOString().slice(0, 10);
          if (prev.lastActiveDay !== today) {
            let streak = 1;
            if (prev.lastActiveDay) {
              const diffDays = Math.round((new Date(today) - new Date(prev.lastActiveDay)) / 86400000);
              if (diffDays === 1) streak = (prev.streak || 0) + 1;
            }
            data.lastActiveDay = today;
            data.streak = streak;
          }
          return setDoc(ref, data, { merge: true });
        }).catch(function () {
          return setDoc(ref, data, { merge: true }).catch(function () {});
        }).then(function () {
          cb(user);
        });
      }
    } else {
      signInAnonymously(auth).catch(function () {});
      cb(user);
    }
  });
}

export async function ensureLocationInfo(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists() && snap.data().location) return;
  const resp = await fetch('https://ipapi.co/json/');
  if (!resp.ok) return;
  const geo = await resp.json();
  if (geo.error) return;
  await setDoc(ref, {
    location: {
      city: geo.city || '',
      region: geo.region || '',
      country: geo.country_name || ''
    }
  }, { merge: true });
}

export function login(email, password) { return signInWithEmailAndPassword(auth, email, password); }
export function register(email, password) { return createUserWithEmailAndPassword(auth, email, password); }
export function logout() { return signOut(auth); }
export function resetPassword(email) { return sendPasswordResetEmail(auth, email); }
export function currentUser() { return auth.currentUser; }

export async function getCloudFavorites(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data().favorites || []) : [];
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : {};
}

export async function setUsername(uid, username) {
  await setDoc(doc(db, "users", uid), { username }, { merge: true });
}

export async function setCloudFavorites(uid, favorites) {
  await setDoc(doc(db, "users", uid), { favorites }, { merge: true });
}

export async function addCloudFavorite(uid, key) {
  await setDoc(doc(db, "users", uid), { favorites: arrayUnion(key) }, { merge: true });
}

export async function removeCloudFavorite(uid, key) {
  await setDoc(doc(db, "users", uid), { favorites: arrayRemove(key) }, { merge: true });
}

export async function saveQuizResult(uid, result) {
  await addDoc(collection(db, "users", uid, "quizResults"), {
    ...result,
    date: new Date().toISOString()
  });
}

export async function logQuizStart(uid, slug, level) {
  const key = slug + '_' + level;
  await setDoc(doc(db, "users", uid), { quizStarts: { [key]: increment(1) } }, { merge: true });
}

export async function getQuizHistory(uid) {
  const q = query(collection(db, "users", uid, "quizResults"), orderBy("date", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
}

export async function resetUserQuizHistory(uid) {
  const snap = await getDocs(collection(db, "users", uid, "quizResults"));
  await Promise.all(snap.docs.map(function (d) { return deleteDoc(d.ref); }));
}

export async function deleteUserAccount(uid) {
  await resetUserQuizHistory(uid);
  await deleteDoc(doc(db, "users", uid));
}

export async function getAllUsersWithData() {
  const usersSnap = await getDocs(collection(db, "users"));
  const results = [];
  for (const userDoc of usersSnap.docs) {
    const data = userDoc.data();
    if (data.email === MODERATOR_EMAIL) continue;
    let history = [];
    try {
      const q = query(collection(db, "users", userDoc.id, "quizResults"), orderBy("date", "desc"));
      const historySnap = await getDocs(q);
      history = historySnap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
    } catch (e) {}
    results.push({
      uid: userDoc.id,
      email: data.email || "",
      username: data.username || "",
      isAnonymous: !!data.isAnonymous || !data.email,
      location: data.location || null,
      quizStarts: data.quizStarts || {},
      favorites: data.favorites || [],
      history: history
    });
  }
  return results;
}

function authErrorMessage(err) {
  const code = err && err.code ? err.code : '';
  const map = {
    'auth/email-already-in-use': 'Cette adresse e-mail est déjà utilisée.',
    'auth/invalid-email': 'Adresse e-mail invalide.',
    'auth/weak-password': 'Le mot de passe doit faire au moins 6 caractères.',
    'auth/user-not-found': 'Aucun compte avec cette adresse e-mail.',
    'auth/wrong-password': 'Mot de passe incorrect.',
    'auth/invalid-credential': 'E-mail ou mot de passe incorrect.',
    'auth/too-many-requests': 'Trop de tentatives, réessayez plus tard.',
    'auth/network-request-failed': 'Problème de connexion réseau.'
  };
  return map[code] || 'Une erreur est survenue. Réessayez.';
}
export { authErrorMessage };
