import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        content: 'src/content.ts'
      },
      output: {
        entryFileNames: '[name].js',
        format: 'iife'
      }
    }
  }
});
