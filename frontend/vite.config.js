import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const BACKEND_URL = 'https://codeshares-backend-latest.onrender.com';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/codeshare': {
        target: BACKEND_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/codeshare/, ''),
      },
    },
  },
});
