/**
 * Service worker Firebase Cloud Messaging — nécessaire pour recevoir les
 * notifications push quand l'onglet du navigateur est fermé ou en arrière-plan.
 *
 * IMPORTANT : ce fichier est servi tel quel (dossier public/, non traité par
 * Vite), donc les variables VITE_FIREBASE_* ne sont PAS disponibles ici.
 * Remplacez les valeurs ci-dessous par celles de votre projet Firebase
 * (Firebase Console > Paramètres du projet > Général > "Vos applications").
 * Ce sont des identifiants publics (pas des secrets), sans risque à exposer
 * côté client — les mêmes valeurs que dans les variables d'environnement Vercel.
 */
importScripts('https://www.gstatic.com/firebasejs/11.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.2.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBFJF2I1nordjCn2WW8kuDxE9arUXDYNNk",
  authDomain: "medconnect-2eea5.firebaseapp.com",
  projectId: "medconnect-2eea5",
  storageBucket: "medconnect-2eea5.firebasestorage.app",
  messagingSenderId: "686786901091",
  appId: "1:686786901091:web:93a794953d04b26d403456",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || 'MedConnect ODC';
  const body = (payload.notification && payload.notification.body) || '';
  self.registration.showNotification(title, {
    body,
    icon: '/odc-logo.png',
  });
});
