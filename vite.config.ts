import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 9999,
    host: true,
    hmr: {
      port: 9999
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
