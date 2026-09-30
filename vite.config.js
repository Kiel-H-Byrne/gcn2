import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        windCalculator: path.resolve(__dirname, 'golf-clash-wind-calculator.html'),
        ringSystem: path.resolve(__dirname, 'golf-clash-ring-system.html'),
        apocChart: path.resolve(__dirname, 'golf-clash-apocalypse-wind-chart.html'),
        sniperChart: path.resolve(__dirname, 'golf-clash-sniper-wind-chart.html'),
        thorsHammerChart: path.resolve(__dirname, 'golf-clash-thors-hammer-wind-chart.html'),
        grizzlyChart: path.resolve(__dirname, 'golf-clash-grizzly-wind-chart.html'),
        windChart: path.resolve(__dirname, 'golf-clash-wind-chart.html'),
        elevationCalc: path.resolve(__dirname, 'golf-clash-elevation-calculator.html'),
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'The Caddie\'s Compass – Golf Clash Wind Chart Calculator',
        short_name: 'GC Wind Chart',
        description: 'Free Golf Clash wind chart calculator and ring adjustment tool. Build your bag, set club levels, and get instant wind adjustments for every club.',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        categories: ['games', 'utilities'],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
});
