import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  let proxyString = 'http://localhost:3500';
  if (process.env.NODE_ENV === 'docker') {
    proxyString = 'http://192.168.0.3:3500';
  }

  return {
    server: {
      proxy: {
        '/api': proxyString,
      },
      host: '0.0.0.0',
      port: 3000,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    plugins: [react()],
  };
});
