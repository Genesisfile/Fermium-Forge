import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Essential for Netlify to correctly resolve assets for a single-page app with hash routing
  build: {
    outDir: 'dist',
  },
});