import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "vertitrack-f6f00.firebaseapp.com",
  projectId: "vertitrack-f6f00",
  storageBucket: "vertitrack-f6f00.firebasestorage.app",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const obtenerTokenPush = async () => {
  try {
    const permiso = await Notification.requestPermission();
    if (permiso === "granted") {
      const token = await getToken(messaging, { 
        vapidKey: "BF-TBxOz3GpCZW4iczgoDS8j05pcCEGAc80ThHOhzK_EdYKh4SAhMuG9ZMhWzjp0Um386lyfDOL-As6QfWwK6pg" 
      });
      return token;
    }
  } catch (error) {
    console.error("Error al obtener token:", error);
  }
  return null;
};