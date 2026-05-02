import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyCqOZagQ0aQrt0toSMHOg2La1QKq6b2l-o",
    authDomain: "vertitrack-f6f00.firebaseapp.com",
    projectId: "vertitrack-f6f00",
    storageBucket: "vertitrack-f6f00.firebasestorage.app",
    messagingSenderId: "406370468247",
    appId: "1:406370468247:web:d01754c3909ea3ef82c4d2"
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