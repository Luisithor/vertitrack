import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto', // <--- ESTA ES LA CLAVE: El plugin inyecta el registro solo
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Vertitrack - Gestión de Elevadores',
        short_name: 'Vertitrack',
        description: 'Sistema de mantenimiento de elevadores 2026',
        theme_color: '#dc3545',
        icons: [
          {
            src: 'android/launchericon-192-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'android/launchericon-512-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'ios/180.png',
            sizes: '180x180',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})