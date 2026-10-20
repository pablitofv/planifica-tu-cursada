# Contexto para Claude Code · Planificador de cursada (Diseño UdeSA)

## Qué es
Herramienta web **orientativa** para estudiantes de la Licenciatura en Diseño de la Universidad de San Andrés. Sirve para:
1. Marcar lo aprobado y ver cómo vienen.
2. Revisar si la inscripción que les asignó el Departamento de Alumnos está bien (los estudiantes NO se inscriben solos: los anota el sistema y ellos piden cambios).
3. Proyectar los próximos semestres y exportar un póster A4 apaisado.

No es transaccional. Nunca sugerir que "inscribe" o "guarda". Contacto único: **diseno@udesa.edu.ar**.

## Estado
Sitio estático con Vite + React 18 (desde la v9). Lo publica GitHub Actions en GitHub Pages al llegar a `main` (ver `README.md`).
- `src/motor.js`: motor de reglas puro (`evalRule`, `tpl`, `semNorm`, `suggestion`, `fill`, `autoProject`, `planTail`, `balance`, `project`, `chequeo`). Lee datos, estado y fecha de una `fuente`; no toca el DOM.
- `src/App.js`: estado, eventos y `renderVals()` (lo que muestra cada pantalla). Extiende `Logica` (`src/logica.js`), que conserva la semántica de la v8: `setState` actualiza `this.state` en el momento y después re-renderiza.
- `src/Vista.jsx`: la interfaz. Salió de la plantilla de la v8 con un conversor que respetó su semántica; los hover y foco son clases `hvN`/`foN` de `src/estilos.css`.
- `src/datos.js` (`validateData`, `safeUrl`) y `src/importar.js` (`leerProgreso`): validación de `carrera.json` y del archivo para retomar.
- `public/datos/carrera.json`: planes 2023 y 2027, correlativas, reglas, carga por año, calendario y optativas por semestre. Lo edita la carrera.
- `public/assets/`: logos de Diseño UdeSA. `src/fuentes/`: Roboto (los mismos archivos que servía Google Fonts).
- `tests/unit/`: motor, datos, importación y simulación de 1.000 casos (Vitest). `tests/e2e/`: Playwright a 360, 768 y 1280 px sobre el build.
- `docs/code-review-y-qa.md`: historial de revisiones de seguridad y QA.

## Próximo trabajo
1. Reemplazar las fechas de ejemplo de `calendario` y los programas por materia cuando la carrera los pase.
2. Antes de cambiar el motor, correr `npm run check`: la simulación verifica las invariantes de abajo.

## Invariantes del motor (no romper)
- Un **taller** por semestre. Dos talleres = excepción de la carrera (rojo si coincide con otra excepción).
- Máximo 5 materias. Por encima de la carga recomendada: "consultalo con la carrera", sin prohibir.
- **Seminarios** (Plan 2023, K530/K531/K630/K631) se cursan pegados al taller de su año y **cuentan como materia** en la carga.
- Carga por año (total del año): 2023 → 10·10·8·8; 2027 → 8·10·10·8.
- Las optativas **pueden ser más de una por semestre**. La sugerencia reparte una por semestre cuando se puede.
- **Trabajo de Graduación**: la proyección lo pone al final. Si el estudiante lo mueve, solo una nota suave: "Te sugerimos cursarla en tu último semestre."
- Prioridad: cursar primero las materias de los años que corresponden (no las que habilitan más correlativas).
- Optativas ya aprobadas: solo se ofrecen las de semestres **ya terminados**. Primero el semestre en que le tocaba; después "Todas", "De otra carrera" o "Por equivalencia".
- **Talleres transversales** (Plan 2027, A, B y C, categoría `transversal`): obligatorios los tres, en cualquier orden y en cualquier año de 2° a 4°. No ocupan el lugar del taller, pero cuentan como materia en la carga. Uno por semestre (`reglas.maxTransversales`): la propuesta pone uno por año y, si hay dos, el chequeo avisa sin prohibir. Nunca son "Debés" ni "Adelantás". En Hoy tienen fila propia y no suman en el total de cada año.
- Pensamiento Proyectual: en 2027 es **Taller de Pensamiento Proyectual** (categoría taller); en 2023, Ciclo de Fundamentos.
- Equivalencias en la práctica (Plan 2023): Portafolio → se dicta como Sistemas Inteligentes; Entrepreneurship y Sistema Industrial → Modelos de Negocio.
- Resultado de la última simulación (1.000 casos, `tests/unit/simulacion.test.js`): 0 materias sin ubicar, 0 correlativas rotas, 0 semestres con 2 talleres o más de 5 materias, 0 casos con Graduación fuera del último semestre, 0 semestres con dos talleres transversales, y la propuesta nunca da el chequeo en rojo ni avisa que adelanta materias.

## Tono y copy (español rioplatense, voseo)
- Breve, sin explicar features ni comparar planes.
- No hablar de "atrasadas" ni de "recibirse": hablar de "próximos semestres".
- No generar ansiedad: si cursan menos, "Todavía podés sumar una materia más".
- Nada que suene a trámite hecho: en Hoy, lo elegido es "A cursar el próximo semestre" (nunca "Vas a cursarla"). Lo de años posteriores: "Podrías adelantarla".
- Chequeo en rojo: "Inscripción fuera de regla". Si adelanta algo dejando pendiente una del año (también un taller), se avisa y se sugiere consultarlo con la carrera.
- En Inscripción: arriba de la lista, el total ("4 materias · 1 lugar libre"), y un lugar sin materia se ve vacío ("Lugar libre", borde punteado). El chequeo desglosa por tipo ("1 Taller", "1 Seminario", "2 materias del Ciclo de Fundamentos") y, si queda lugar, cierra con un punto con ojo: "Todavía podés sumar una materia más.". No escribir "cuenta como materia".
- El panel "Tu semestre" (paso 1) sale del mismo chequeo que el paso 2: los dos tienen que decir lo mismo.
- Correlativas "una de dos" (`reqAny`): en Hoy van con el tag "Una de dos" y línea punteada, no como "Necesita".
- Pie: "Esta es una proyección estimativa. / No reemplaza la inscripción realizada por el sistema a cargo del Departamento de Alumnos."
- Semestres: "1° semestre 2027".

- Intercambio con plan armado a mano: lo planeado desde ese semestre se corre uno para adelante (`conIntercambio`), nunca se borra.

## Diseño
- Roboto; tinta #1C1E22, fondo #F4F4F1, fucsia #E0005A (hover #C2004C), negro de pantallas oscuras #16171A.
- Sello: cuadrado fucsia + "**Diseño** Universidad de San Andrés", arriba a la izquierda, en todas las pantallas. El logo va abajo a la derecha.
- Accesibilidad AA: contraste ≥ 4.5:1, objetivos táctiles ≥ 44 px en celular, foco visible, trampa de foco en diálogos, flechas en grupos de opciones, `prefers-reduced-motion`.

## Seguridad (mantener)
- Sin backend, cookies, analytics ni localStorage.
- Importación de `.json`: tope de 100 KB, validación estricta de tipos, ids cruzados contra el plan y recorte de textos a 80 caracteres.
- Datos de la carrera congelados (`Object.freeze` profundo).
- Enlaces a programas: solo `https://drive.google.com` y `https://docs.google.com`, con `noopener noreferrer`.
- CSP en `<meta>`, la agrega `vite.config.js` solo al hacer el build: `script-src 'self'`, `style-src 'self'`, `font-src 'self'`, sin `'unsafe-eval'` ni `'unsafe-inline'`. Nada en línea ni de terceros: no sumar `<style>` ni `<script>` en el HTML. GitHub Pages no permite headers propios (no hay `frame-ancestors` ni `X-Content-Type-Options`).
- No exponer nada en `window`.
- `robots.txt` bloquea la indexación. Vulnerabilidades: ver `SECURITY.md`.
