import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";  
import { getFirestore, getDocs, collection, addDoc, orderBy, query, where } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged  } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js';

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

let user__uid = null;

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
    user__uid = user.uid;

    const usersRef = collection(db, "users");
    const userQuery = query(usersRef, where('user_uid', '==', user.uid));
  
    getDocs(userQuery)
    .then((querySnapshot) => {
      if (querySnapshot.size === 0) {
        console.log('No user found with the specified UID.');
      } else {
        querySnapshot.forEach((doc) => {
          console.log('Found user:', doc.data().role);
        });
      }
    })
    .catch((error) => {
      console.error('Error searching for user:', error);
    });

    console.log('está logado')
    document.getElementById('my-events').style.display = 'block';
    document.getElementById('register-event').style.display = 'block';
    document.getElementById('login').style.display = 'none';
    document.getElementById('logout').style.display = 'block';
    document.getElementById('login-modal').style.display = 'none';
  } else {
    document.getElementById('my-events').style.display = 'none';
    document.getElementById('register-event').style.display = 'none';
    document.getElementById('logout').style.display = 'none';
    document.getElementById('login').style.display = 'block';
    console.log('não está logado')
  }
});


//create your custom method
export const getMyColls = async () => {
  const runningsRef = collection(db, "runnings");
  const runningQuery = query(runningsRef, where('event_creator_uid', '==', user__uid));
  console.log(runningQuery)
  return getDocs(runningQuery);
};