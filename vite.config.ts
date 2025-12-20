import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  // Prioritize Vercel's process.env, fallback to local .env
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || env.YOUTUBE_API_KEY || '';

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.YOUTUBE_API_KEY': JSON.stringify(YOUTUBE_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
