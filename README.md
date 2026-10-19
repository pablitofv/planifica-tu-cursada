# Planificador de cursada · Diseño UdeSA

Herramienta orientativa para que estudiantes de la Licenciatura en Diseño revisen su inscripción y proyecten sus próximos semestres.

## Publicar en GitHub Pages
1. Subí el contenido de esta carpeta a la raíz del repositorio (rama `main`).
2. Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)`.
3. Settings → Pages → marcá **Enforce HTTPS**.

## Actualizar datos
Planes, correlativas, calendario y optativas viven en `datos/carrera.json`. Se editan sin tocar código.

## Repositorio
- Activá **branch protection** en `main` (requerir PR) y **2FA** para quienes tengan escritura.
- Activá *Secret scanning* y *Dependabot alerts* (Settings → Code security).
