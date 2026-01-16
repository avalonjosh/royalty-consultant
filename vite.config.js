import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: 'web',
  server: {
    port: 3000,
    open: true
  },
  build: {
    // Output to project-root/dist (not web/dist)
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  esbuild: {
    include: /\.(tsx?|jsx?)$/,
    loader: 'ts'
  }
});
