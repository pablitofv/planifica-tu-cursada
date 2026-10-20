# Planificador de cursada · Diseño UdeSA

Herramienta orientativa para que estudiantes de la Licenciatura en Diseño revisen su inscripción y proyecten sus próximos semestres.

Sitio: https://pablitofv.github.io/planifica-tu-cursada/

## Cómo está hecho
Sitio estático armado con Vite y React. No hay backend ni nada que se cargue desde otros sitios.

- `src/motor.js`: reglas de la carrera (sugerencia de inscripción, proyección de semestres, chequeo). No toca el navegador.
- `src/App.js`: estado de la app y lo que muestra cada pantalla.
- `src/Vista.jsx`: la interfaz.
- `src/datos.js` y `src/importar.js`: validación de `carrera.json` y del archivo para retomar.
- `src/estilos.css`, `src/fuentes.css` y `src/fuentes/`: estilos y Roboto (servida desde el sitio).
- `public/`: lo que se publica tal cual (datos, logos, `robots.txt`, licencia de la fuente).

## Actualizar datos
Planes, correlativas, calendario y optativas viven en `public/datos/carrera.json`. Se editan sin tocar código. La app los valida al cargar y los tests revisan que sigan cumpliendo las reglas.

## Trabajar en el código
Con Node 24:

```bash
npm ci
```

```bash
npm run dev
```

Antes de abrir un PR, correr todo (tests del motor, simulación de 1.000 casos, build y e2e a 360, 768 y 1280 px):

```bash
npm run check
```

La primera vez, Playwright necesita su navegador: `npx playwright install chromium`.

## Publicar
Lo publica GitHub Actions (`.github/workflows/pages.yml`): en cada PR corre los tests, y cuando algo llega a `main` arma el sitio y lo sube a GitHub Pages. No hace falta subir archivos a mano.

Configuración del repositorio, una sola vez:
1. Settings → Actions → General: permitir solo acciones de GitHub (*Allow actions created by GitHub*) y exigir que estén fijadas por commit (*Require actions to be pinned to a full-length commit SHA*).
2. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. Settings → Pages: dejá marcado **Enforce HTTPS**.

Si Pages vuelve a *Deploy from a branch*, el sitio queda en blanco: publicaría el código fuente sin armar.

## Repositorio
- `main` protegida (requiere PR) y 2FA para quienes tengan escritura.
- *Secret scanning*, *Dependabot alerts* y reporte privado de vulnerabilidades activos (Settings → Code security).
