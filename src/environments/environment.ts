// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export const environment = {
  production: true,

  springApi: (window as any).__env?.SPRING_API || '',

  firebase: {
    apiKey: (window as any).__env?.FIREBASE_API_KEY || '',
    authDomain: (window as any).__env?.FIREBASE_AUTH_DOMAIN || '',
    projectId: (window as any).__env?.FIREBASE_PROJECT_ID || '',
    storageBucket: (window as any).__env?.FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: (window as any).__env?.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: (window as any).__env?.FIREBASE_APP_ID || ''
  }
};




