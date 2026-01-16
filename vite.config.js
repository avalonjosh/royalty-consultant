import { defineConfig } from 'vite';

export default defineConfig({
  root: 'web',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: '../dist-web'
  }
});
