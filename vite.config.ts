
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Ensure that the output directory matches what's configured in netlify.toml
    outDir: 'dist',
  },
  // Ensure the base path is correct for deployment if not deploying to root
  // For Netlify root deployment, usually not necessary to set explicitly
  // base: '/',
});
    