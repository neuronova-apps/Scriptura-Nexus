import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://neuronova-apps.github.io',
  base: '/Scriptura-Nexus',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
