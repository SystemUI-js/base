import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@system-ui-js/base': fileURLToPath(
        new URL('./src/lib/index.ts', import.meta.url),
      ),
    },
  },
  build: {
    outDir: 'dist-demo',
  },
});
