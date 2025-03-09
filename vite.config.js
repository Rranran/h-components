import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// import requireTransform from 'vite-plugin-require-transform';
// https://vitejs.dev/config/
export default defineConfig({
  base: '/fhxtjxyxkb-w',
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  server: {
    proxy: {
      '/fhxtjxyxkbapi': {
        target: 'https://dev.boating.cool/',
        // target: 'http://10.22.102.87:8320',
        // target: 'http://localhost:7001/',
        changeOrigin: true,
      },
    },
  },
});
