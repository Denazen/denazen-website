import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.denazen.com',
  trailingSlash: 'always',
  build: {
    format: 'directory'
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: {
      prefixDefaultLocale: false
    }
  },
  vite: {
    server: {
      allowedHosts: ['.trycloudflare.com', '.ngrok-free.app', '.ngrok.app']
    }
  }
});
