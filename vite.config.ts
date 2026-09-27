import { defineConfig } from 'vite';

// Each content script is a standalone IIFE, which can't share a build,
// so `--mode page` builds the page-world script into the same dist/.
const entries: Record<string, string> = {
  content: 'src/content.ts',
  page: 'src/page.ts'
};

export default defineConfig(({ mode }) => {
  const name = mode === 'page' ? 'page' : 'content';
  return {
    build: {
      outDir: 'dist',
      emptyOutDir: name === 'content',
      rollupOptions: {
        input: {
          [name]: entries[name]
        },
        output: {
          entryFileNames: '[name].js',
          format: 'iife'
        }
      }
    }
  };
});
