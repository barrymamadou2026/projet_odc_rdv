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
 *
 * IMPORTANT (navigateurs) : Notification.requestPermission() ne peut être appelé
 * que de façon synchrone à l'intérieur d'un gestionnaire d'évènement généré par
 * l'utilisateur (clic), sinon Firefox (et parfois Chrome) refuse silencieusement
 * la demande ("may only be requested from inside a short running user-generated
 * event handler"). C'est pour ça qu'on sépare :
 *   - initPushNotifications() : sans danger à appeler n'importe quand (au
 *     chargement de page, après login/signup) — ne redemande JAMAIS la
 *     permission, se contente de resynchroniser le jeton si elle est déjà
 *     accordée.
 *   - requestNotificationPermission() : à appeler UNIQUEMENT depuis un vrai
 *     clic (bouton "Activer les notifications").
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

async function ensureMessaging(): Promise<Messaging | null> {
  if (!isConfigured()) return null;
  if (!(await isSupported())) return null;
  if (!app) app = initializeApp(firebaseConfig);
  if (!messaging) messaging = getMessaging(app);
  return messaging;
}

async function registerToken(msg: Messaging): Promise<void> {
  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  const token = await getToken(msg, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
  if (token) {
    await userApi.updateFcmToken(token);
  }
  onMessage(msg, (payload) => {
    const title = payload.notification?.title || 'MedConnect ODC';
    const body = payload.notification?.body || '';
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/odc-logo.png' });
    }
  });
}

/**
 * Sans danger à appeler à tout moment (chargement de page, après login/signup).
 * Ne montre JAMAIS de popup de permission : si la permission est déjà "granted"
 * (accordée lors d'une visite précédente), resynchronise juste le jeton FCM côté
 * backend. Si elle est "default" (jamais demandée) ou "denied", ne fait rien.
 */
export async function initPushNotifications(): Promise<void> {
  try {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
      return;
    }
    const msg = await ensureMessaging();
    if (!msg) return;
    await registerToken(msg);
  } catch (error) {
    console.warn('Échec de la resynchronisation des notifications push:', error);
  }
}

/**
 * À appeler UNIQUEMENT depuis un vrai clic utilisateur (ex: bouton "Activer
 * les notifications"). Déclenche la vraie demande de permission au navigateur.
 * Retourne true si la permission a été accordée et le jeton enregistré.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof Notification === 'undefined') return false;
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.info("Permission de notification refusée par l'utilisateur.");
      return false;
    }
    const msg = await ensureMessaging();
    if (!msg) return false;
    await registerToken(msg);
    return true;
  } catch (error) {
    console.warn("Échec de l'activation des notifications push:", error);
    return false;
  }
}

/** Utilitaire pour l'UI : état actuel de la permission ('default' | 'granted' | 'denied' | 'unsupported'). */
export function getNotificationPermissionState(): 'default' | 'granted' | 'denied' | 'unsupported' {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission;
}

export function isPushConfigured(): boolean {
  return isConfigured();
}
