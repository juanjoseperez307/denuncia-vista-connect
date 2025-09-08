import { defineConfig } from 'vite';

export default defineConfig({
  root: 'demos/fixed',
  server: {
    port: 8080
  },
  build: {
    outDir: '../../dist'
  }
});