import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.denazen.com',
  trailingSlash: 'always',
  build: {
    format: 'directory'
  },
  vite: {
    server: {
      allowedHosts: ['.trycloudflare.com', '.ngrok-free.app', '.ngrok.app']
    }
  }
});
