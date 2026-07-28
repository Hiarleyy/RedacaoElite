import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.ico', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Redação Elite',
        short_name: 'RedaçãoElite',
        description: 'Plataforma de redações para o ENEM — Redação Elite',
        theme_color: '#1A1A1A',
        background_color: '#1A1A1A',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Minimal workbox — only precache the app shell (no offline API caching)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Skip caching large assets
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        // Don't cache API requests or external resources
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/],
      },
    }),
  ],
})
