# Seguridad

Si encontrás una vulnerabilidad, escribí a diseno@udesa.edu.ar. No abras un issue público.

## Modelo
- Sitio 100 % estático. No hay backend, cuentas, cookies, analytics ni almacenamiento en el navegador.
- Los datos del estudiante solo existen en la pestaña abierta y en el archivo .json que él mismo descarga.
- El archivo importado se valida campo por campo (tipos, largo, ids contra el plan, tope de 100 KB).
- `public/datos/carrera.json` se valida al cargar; si no cumple el esquema, la app no arranca.

## Política de contenido (CSP, vía <meta>)
`default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data: blob:; connect-src 'self'; base-uri 'none'; form-action 'none'; object-src 'none'; upgrade-insecure-requests`

- Sitio armado con Vite: React, los estilos y la fuente Roboto se sirven desde el propio sitio. No se carga nada de terceros y no hace falta `'unsafe-eval'` ni `'unsafe-inline'`.
- La app no expone ninguna API en `window`.
- Dependencias con versión fija y `package-lock.json`. Las acciones de GitHub que publican el sitio van fijadas por commit.
- GitHub Pages no permite headers propios: `frame-ancestors`, HSTS y `X-Content-Type-Options` no se pueden fijar desde acá (Pages ya sirve HTTPS con HSTS).
