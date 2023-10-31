import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";  
import { getFirestore, getDocs, collection, addDoc, orderBy, query } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged  } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';

//add your credentials from firebase project
const firebaseConfig = {
    apiKey: "AIzaSyAw6Irefu7YfUXx_s-6cmXEDkckC7qpgHI",
    authDomain: "worldrunningmap.firebaseapp.com",
    databaseURL: "https://worldrunningmap-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "worldrunningmap",
    storageBucket: "worldrunningmap.appspot.com",
    messagingSenderId: "363965467950",
    appId: "1:363965467950:web:8d0f8b11a92c83f2647ebf",
    measurementId: "G-YR67QSP01D"
 };

const app = initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth(app);
//create your custom method
export const getColl = async (coll, orderByField) => {
    const collectionRef = collection(db, coll);
    const q = query(collectionRef, orderBy(orderByField, "asc"));
    return getDocs(q);
  };

export const publishRef = (coll, data) => {
    const collectionRef = collection(db, coll);
    addDoc(collectionRef, data);
}

export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signOut = () => {
  console.log('oi')
  return auth.signOut();
};

export const authUser = () => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is authenticated
        resolve(user);
      } else {
        // User is not authenticated
        resolve(null);
      }
    }, reject);
  });
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('está logado')
    document.getElementById('login').style.display = 'none';
    document.getElementById('logout').style.display = 'block';
    document.getElementById('login-modal').style.display = 'none';
  } else {
    document.getElementById('logout').style.display = 'none';
    document.getElementById('login').style.display = 'block';
    console.log('não está logado')
  }
});