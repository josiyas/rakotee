// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAtTHPD1xxqiMNvjyLUbu9g_5wEtHSmVMM",
  authDomain: "rakotee-df6e3.firebaseapp.com",
  projectId: "rakotee-df6e3",
  storageBucket: "rakotee-df6e3.appspot.com",
  messagingSenderId: "133337901662",
  appId: "1:133337901662:web:57872329a4bb5dfde162cf",
  measurementId: "G-C09BGQWLMG"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
