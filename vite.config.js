import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'web',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: '../dist-web',
    rollupOptions: {
      input: resolve(__dirname, 'web/index.html')
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  esbuild: {
    // Handle TypeScript files
    include: /\.(tsx?|jsx?)$/,
    loader: 'ts'
  }
});
