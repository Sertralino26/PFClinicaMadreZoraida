import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAW9CYXIGmpY1hAUAVvkA80FBk0yZ1NuAg",
  authDomain: "clinica-app-f4587.firebaseapp.com",
  projectId: "clinica-app-f4587",
  storageBucket: "clinica-app-f4587.firebasestorage.app",
  messagingSenderId: "145852207477",
  appId: "1:145852207477:web:0004a36df0710987bc833c"
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
