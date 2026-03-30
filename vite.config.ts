import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
   plugins: [react(), tailwindcss(), VitePWA({
     registerType: 'autoUpdate',
     devOptions: { enabled: true },
     workbox: {
       // ❗ IMPORTANTE: Service Worker NÃO deve interceptar rotas de API/OAuth
       // Sem isso, o SW serve index.html em cache para /api/auth/google
       // bloqueando o redirect do OAuth para o Google.
       navigateFallbackDenylist: [/^\/api\//],
       // Também não fazer cache de rotas de API
       runtimeCaching: [
         {
           urlPattern: /^\/api\//,
           handler: 'NetworkOnly',
         },
       ],
     },
     manifest: {
       name: 'Naka OS',
       short_name: 'Naka OS',
       description: 'Sistema Operacional para Estúdios Criativos',
       theme_color: '#121212',
       background_color: '#121212',
       display: 'standalone',
       icons: [
         {
           src: 'favicon.ico',
           sizes: '64x64 32x32 24x24 16x16',
           type: 'image/x-icon'
         }
       ]
     }
   }), cloudflare()],
   define: {
     'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
   },
   resolve: {
     alias: {
       '@': path.resolve(__dirname, '.'),
     },
   },
   server: {
     hmr: process.env.DISABLE_HMR !== 'true',
     proxy: {
       '/api': {
         target: 'http://localhost:3001',
         changeOrigin: true,
       },
       '/uploads': {
         target: 'http://localhost:3001',
         changeOrigin: true,
       },
     },
   },
 };
});