// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, 
        signInWithPopup, 
        GoogleAuthProvider,
        onAuthStateChanged,
        User } from "firebase/auth" 
import { callbackify } from "util";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDYfsbFUKuUNO5KL2INLxGB3f-G08HBkYs",
  authDomain: "yt-clone-ab1a3.firebaseapp.com",
  projectId: "yt-clone-ab1a3",
  appId: "1:674771848058:web:c307333f1bd36253b2e4c3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export function signInWithGoogle() {
    return signInWithPopup(auth, new GoogleAuthProvider());
}

export function signOut() {
    return auth.signOut();
}

export function onAuthStateChangedHelper(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}