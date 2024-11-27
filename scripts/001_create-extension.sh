#!/bin/bash

# Create extension directory
mkdir diff-extension && cd diff-extension

# Initialize package.json
npm init -y

# Install dependencies
npm install --save-dev \
  @types/chrome \
  @types/react \
  @types/react-dom \
  typescript \
  vite \
  @vitejs/plugin-react \
  react \
  react-dom

# Create directory structure
mkdir -p src/components public

# Create manifest.json
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
      "js": ["src/content.ts"]
    }
  ]
}
EOF

# Create tsconfig.json
cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
EOF

# Create vite.config.ts
cat > vite.config.ts << EOF
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: 'src/content.ts',
      output: {
        entryFileNames: '[name].js',
        format: 'iife'
      }
    }
  }
})
EOF

# Create content script
cat > src/content.ts << EOF
const init = () => {
  console.log('Extension loaded');
};

init();
EOF

# Update package.json scripts
npm pkg set scripts.dev="vite"
npm pkg set scripts.build="vite build"
npm pkg set scripts.watch="vite build --watch"

echo "Extension skeleton created successfully!"

