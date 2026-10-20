import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages no permite headers propios: la política va en un <meta>. Solo scripts, estilos y
// fuentes del propio sitio; nada en línea, nada de terceros.
export const CSP = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "font-src 'self'",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const csp = {
  name: 'csp',
  apply: 'build',
  transformIndexHtml: html => html.replace(/<!-- CSP:[^>]*-->/, `<meta http-equiv="Content-Security-Policy" content="${CSP}">`),
};

export default defineConfig({
  base: './',
  plugins: [react(), csp],
  build: { assetsDir: 'app', modulePreload: { polyfill: false } },
  test: { include: ['tests/unit/**/*.test.js'] },
});
