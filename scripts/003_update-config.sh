#!/bin/bash

# Update manifest.json to use built files
cat > public/manifest.json << EOF
{
  "manifest_version": 3,
  "name": "Table Diff Extension",
  "version": "1.0.0",
  "description": "Adds difference column to tables",
  "permissions": ["activeTab"],
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ]
}
EOF

# Update vite.config.ts
cat > vite.config.ts << EOF
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
EOF
