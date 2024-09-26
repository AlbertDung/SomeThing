import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth} from 'firebase/auth';
const firebaseConfig = {
  apiKey: "AIzaSyBJIzZ-kSQjn1DBBRt8DaInQoZuK-SywLw",
  authDomain: "servicemanage-25726.firebaseapp.com",
  projectId: "servicemanage-25726",
  storageBucket: "servicemanage-25726.appspot.com",
  messagingSenderId: "237470942524",
  appId: "1:237470942524:web:181f2977f3b31344a30a39"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
// Initialize Firestore
export const db = getFirestore(app);
export { analytics };