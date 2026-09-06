import { defineConfig } from 'vite';

// Optional local preview; dist remains the authored, deployable static site.
export default defineConfig({
  root: 'dist',
  server: {
    host: '0.0.0.0',
    allowedHosts: ['terminal.local'],
  },
});
