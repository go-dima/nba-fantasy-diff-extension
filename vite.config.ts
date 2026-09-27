import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';

// Each content script is a standalone IIFE, which can't share a build,
// so `--mode page` builds the page-world script into the same dist/.
const entries: Record<string, string> = {
  content: 'src/content.ts',
  page: 'src/page.ts'
};

const git = (command: string) =>
  execSync(`git ${command}`, { encoding: 'utf8' }).trim();

// Chrome requires a numeric `version`, so the build identity goes into
// `version_name`: "<version>-<8-char commit hash>", plus "-dirty" when
// built from uncommitted changes.
const stampVersionName = (): Plugin => ({
  name: 'stamp-version-name',
  closeBundle() {
    const path = 'dist/manifest.json';
    const manifest = JSON.parse(readFileSync(path, 'utf8'));
    try {
      const hash = git('rev-parse --short=8 HEAD');
      const dirty = git('status --porcelain') ? '-dirty' : '';
      manifest.version_name = `${manifest.version}-${hash}${dirty}`;
    } catch {
      return;
    }
    writeFileSync(path, JSON.stringify(manifest, null, 2) + '\n');
  }
});

export default defineConfig(({ mode }) => {
  const name = mode === 'page' ? 'page' : 'content';
  return {
    // Only the first pass copies public/ (and stamps its manifest)
    publicDir: name === 'content' ? 'public' : false,
    plugins: name === 'content' ? [stampVersionName()] : [],
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
