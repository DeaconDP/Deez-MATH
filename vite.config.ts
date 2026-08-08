import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon-32.png',
        'favicon-16.png',
        'apple-touch-icon.png',
        'glyph.svg',
      ],
      manifest: {
        name: 'Deez-MATH',
        short_name: 'Deez-MATH',
        description:
          'Explore OpenAI’s ten Astra math advances with plain language, deeper math, and application demos.',
        theme_color: '#0a0f0e',
        background_color: '#0a0f0e',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icon-192-maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  server: {
    port: 5204,
    strictPort: true,
    host: '127.0.0.1',
  },
  preview: {
    port: 5204,
    strictPort: true,
    host: '127.0.0.1',
  },
})
