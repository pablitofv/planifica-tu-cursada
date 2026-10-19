# Seguridad

Si encontrás una vulnerabilidad, escribí a diseno@udesa.edu.ar. No abras un issue público.

## Modelo
- Sitio 100 % estático. No hay backend, cuentas, cookies, analytics ni almacenamiento en el navegador.
- Los datos del estudiante solo existen en la pestaña abierta y en el archivo .json que él mismo descarga.
- El archivo importado se valida campo por campo (tipos, largo, ids contra el plan, tope de 100 KB).
- `datos/carrera.json` se valida al cargar; si no cumple el esquema, la app no arranca.

## Política de contenido (CSP, vía <meta>)
`default-src 'none'; script-src 'self' https://unpkg.com 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; base-uri 'none'; form-action 'none'; object-src 'none'; upgrade-insecure-requests`

- React se carga desde unpkg con Subresource Integrity (sha384).
- `'unsafe-eval'` es necesario porque el runtime compila plantillas en el navegador. Para quitarlo, compilar a un bundle estático.
- GitHub Pages no permite headers propios: `frame-ancestors`, HSTS y `X-Content-Type-Options` no se pueden fijar desde acá (Pages ya sirve HTTPS con HSTS).
