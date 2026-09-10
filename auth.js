// Module central Firebase : authentification + favoris/historique de quiz sauvegardes dans le cloud.
// Importe avec un chemin relatif ("./auth.js" depuis la racine, "../auth.js" depuis ateliers/).
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut, sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc,
  arrayUnion, arrayRemove, collection, addDoc,
  query, orderBy, getDocs
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

export function watchAuth(cb) { return onAuthStateChanged(auth, cb); }
export function login(email, password) { return signInWithEmailAndPassword(auth, email, password); }
export function register(email, password) { return createUserWithEmailAndPassword(auth, email, password); }
export function logout() { return signOut(auth); }
export function resetPassword(email) { return sendPasswordResetEmail(auth, email); }
export function currentUser() { return auth.currentUser; }

export async function getCloudFavorites(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data().favorites || []) : [];
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

export async function getQuizHistory(uid) {
  const q = query(collection(db, "users", uid, "quizResults"), orderBy("date", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
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
