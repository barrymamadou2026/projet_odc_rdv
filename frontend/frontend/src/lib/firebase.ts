/**
 * Notifications push web via Firebase Cloud Messaging (FCM).
 * Contourne complètement les fournisseurs email (Brevo/SendGrid/Mailjet/etc.) pour
 * les notifications de rendez-vous (créneau, confirmation, annulation, rappel).
 *
 * Variables d'environnement requises (Vercel) — récupérées dans Firebase Console >
 * Paramètres du projet > Général > "Vos applications" > app Web :
 *   VITE_FIREBASE_API_KEY
 *   VITE_FIREBASE_AUTH_DOMAIN
 *   VITE_FIREBASE_PROJECT_ID
 *   VITE_FIREBASE_STORAGE_BUCKET
 *   VITE_FIREBASE_MESSAGING_SENDER_ID
 *   VITE_FIREBASE_APP_ID
 * Et dans Firebase Console > Cloud Messaging > "Certificats Web Push" :
 *   VITE_FIREBASE_VAPID_KEY
 *
 * Si ces variables ne sont pas configurées, les fonctions ci-dessous échouent
 * silencieusement (log console uniquement) — l'app continue de fonctionner
 * normalement sans notifications push.
 */
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported, Messaging } from 'firebase/messaging';
import { userApi } from './api';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

function isConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId && VAPID_KEY);
}

/**
 * Demande la permission de notification au navigateur, récupère le jeton FCM,
 * et l'enregistre côté backend pour l'utilisateur connecté. À appeler une fois
 * après la connexion (voir AuthContext). Ne fait rien si Firebase n'est pas
 * configuré ou si le navigateur ne supporte pas les notifications push.
 */
export async function initPushNotifications(): Promise<void> {
  if (!isConfigured()) {
    console.info('Notifications push non configurées (variables VITE_FIREBASE_* manquantes).');
    return;
  }
  if (!(await isSupported())) {
    console.info('Notifications push non supportées par ce navigateur.');
    return;
  }
  try {
    if (!app) app = initializeApp(firebaseConfig);
    if (!messaging) messaging = getMessaging(app);

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.info('Permission de notification refusée par l\'utilisateur.');
      return;
    }

    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });

    if (token) {
      await userApi.updateFcmToken(token);
    }

    // Notifications reçues pendant que l'onglet est ouvert au premier plan.
    onMessage(messaging, (payload) => {
      const title = payload.notification?.title || 'MedConnect ODC';
      const body = payload.notification?.body || '';
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/odc-logo.png' });
      }
    });
  } catch (error) {
    console.warn('Échec de l\'initialisation des notifications push:', error);
  }
}
