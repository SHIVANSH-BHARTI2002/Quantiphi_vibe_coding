import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxy /api to the Express backend in dev so the API key/backend stays hidden
// and there are no CORS surprises.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
