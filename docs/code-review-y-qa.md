# Planificador de cursada · Code review y QA
Versión revisada: `Planificador de cursada v4.dc.html` + `planes-v3.js` · 8 oct 2026

Estado: **(✓)** corregido en esta revisión · **(→)** pendiente para producción

---

## 1. Seguridad y hardening

### Superficie de ataque
La herramienta es 100 % cliente: no hay backend, cuentas, cookies ni almacenamiento. Los datos entran por dos lugares: lo que marca el estudiante y el archivo `.json` que importa. El riesgo real se concentra en (a) el archivo importado, (b) los scripts de terceros y (c) cómo se publica.

### Crítico / alto
| # | Hallazgo | Riesgo | Estado |
|---|---|---|---|
| S1 | **Importación sin validar tipos.** Se chequeaban los ids, pero no los tipos: `notas` con un objeto como valor rompía el render (DoS), y `semestres`/`intercambio.semestre` con strings arbitrarios generaban NaN y la UI quedaba vacía. | Un archivo manipulado (compartido entre compañeros) deja la app inutilizable. | ✓ Validación estricta: plan con `hasOwnProperty`, arrays de strings con tope de largo y cantidad, semestres con regex `^20\d{2}-[12]$`, notas solo string y solo de ids válidos, recortadas a 80 caracteres, números enteros acotados. |
| S2 | **Archivo sin límite de tamaño.** | Un `.json` de cientos de MB congela la pestaña. | ✓ Rechaza más de 100 KB. Se agregó `onerror` al lector. |
| S3 | **Prototype pollution.** Las claves importadas (`__proto__`, `constructor`) podían terminar en objetos. | Bajo, porque los ids se cruzaban contra un `Set`. | ✓ Ahora solo se copian claves presentes en el plan, a objetos nuevos. |
| S4 | **Datos de los planes mutables** (`window.PLANES3`). | Cualquier script inyectado o extensión podía alterar correlativas. | ✓ `deepFreeze` sobre todo el catálogo. |
| S5 | **Runtime de prototipado en producción.** `support.js` compila plantillas y la lógica en el navegador, lo que exige `unsafe-eval` en la CSP. | Impide una CSP estricta. | → Compilar a un bundle estático (React/Preact + Vite) antes de publicar. Es el cambio de mayor impacto en seguridad. |
| S6 | **`image-slot.js` en producción.** Hace `fetch` a un archivo de estado y `postMessage` al editor. | Código de prototipado con canal de escritura. | → Reemplazar por el logo como asset estático (SVG inline). |

### Medio
| # | Hallazgo | Recomendación |
|---|---|---|
| S7 | Sin **Content-Security-Policy**. | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob:; connect-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'`. `'unsafe-inline'` para estilos solo mientras se usen estilos inline; con el bundle se puede usar hash. |
| S8 | **Google Fonts** desde terceros. | Self-host de Roboto (woff2): saca la dependencia, elimina la filtración de IP/referrer y deja `font-src 'self'`. |
| S9 | Sin **headers de transporte**. | HTTPS + HSTS (`max-age=31536000; includeSubDomains`), `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, `Permissions-Policy` sin cámara, micrófono ni geolocalización, `Cross-Origin-Opener-Policy: same-origin`. |
| S10 | Scripts sin **SRI**. | Con self-hosting no hace falta; si queda algún CDN, `integrity` + `crossorigin`. |
| S11 | **Ganchos de prueba** (`escenario`, `momento`) presentes en el código. | Quitarlos del build de producción con un flag. |
| S12 | **Datos personales en el `.json` exportado** (nombre + historial académico). | Avisar en el modal que el archivo contiene su historial. Opcional: firmar el archivo (HMAC con clave pública de versión) solo para detectar corrupción, no para autenticar. |

### Bajo / bien resuelto
- **XSS:** todo el contenido que ingresa el estudiante (nombre, notas, `.json`) se renderiza como texto con React: no hay `innerHTML`, `eval` ni `dangerouslySetInnerHTML` en el código propio. ✓
- **Descarga de archivos:** Blob + `revokeObjectURL`. ✓
- **Enlaces:** solo `mailto:` estático. ✓
- **Reloj del cliente:** define el semestre actual. Manipularlo solo afecta al propio usuario. → En producción, tomar el calendario académico de un JSON publicado por la carrera.
- **Inputs con tope:** nombre y notas con `maxLength=80` y recorte en el handler. ✓

---

## 2. Calidad de código

| # | Hallazgo | Recomendación |
|---|---|---|
| C1 | `renderVals()` concentra unas 400 líneas de lógica de negocio y vista. | Separar el **motor de reglas** (`evalRule`, `fill`, `autoProject`, checks de inscripción) en un módulo puro con tests unitarios. Es la parte que la carrera va a querer auditar. |
| C2 | Las **reglas de inscripción** están en código (`maxTalleres`, doble excepción, etc.). | Llevarlas a `reglas` declarativas en el JSON del plan, para que la carrera las cambie sin tocar código. |
| C3 | `autoProject` corre 3 a 4 veces por render (proyección y efecto del intercambio con y sin). | Memorizar por hash de `(aprobadas, insc, intSem, intRec)`. |
| C4 | `measure()` llama a `build()` en cada `requestAnimationFrame` posterior a un update. | Solo medir cuando cambia `sel`/`hover` o el tamaño. |
| C5 | Los ids de materias son estables pero no versionados. | Agregar `version` al plan y al `.json`, con migración si cambian ids. |
| C6 | Sin tests. | Unit tests del motor (casos: 1°, 3° que debe de 1°, 4° último tramo, intercambio, doble excepción) + e2e con Playwright en los anchos de §3. |

---

## 3. QA por dispositivo
Probado en 375 px (iPhone SE/13 mini), 909 px (tablet/ventana partida) y desktop ancho.

| # | Dispositivo | Hallazgo | Estado |
|---|---|---|---|
| Q1 | 375 | Pasos truncados ("Inscripci…", "Próximo…"). | ✓ En móvil, número arriba y etiqueta debajo; el paso 3 se llama "Semestres". |
| Q2 | 375–1179 | El botón "Revisar mi inscripción" quedaba **antes** de la grilla. | ✓ En pantallas no anchas va al final, después de la grilla. |
| Q3 | 375 | Flechas ← → de semestres de 32×28 px, debajo del mínimo táctil. | ✓ 44×44 en móvil. |
| Q4 | Todos | "Te falta · Ciclo de Fundamentos 0 de 12" con la barra llena: lectura contradictoria. | ✓ Muestra "✓ Completo". |
| Q5 | Todos | Al abrir un modal o hoja, el foco no entraba y no volvía al cerrar. | ✓ Foco al botón Cerrar y retorno al elemento de origen. → Falta el *focus trap* (Tab cíclico dentro del diálogo). |
| Q6 | Teclado | `role="radio"` sin navegación con flechas. | → Implementar roving tabindex en plan, año e intercambio. |
| Q7 | Touch | El drag & drop nativo HTML5 no funciona en iOS/Android. | Mitigado con flechas. → Pointer events para arrastre táctil real. |
| Q8 | Impresión | El PDF depende del diálogo de impresión del navegador; Safari ignora a veces `@page landscape`. | → Generar el PDF en cliente (pdf-lib) o avisar "Elegí horizontal". |
| Q9 | 909 | La vista previa del póster se escala bien. El texto del póster queda en 9,5–11 px a tamaño real. | OK para A4 impreso (unos 7–8 pt). → Si se imprime en A3, subir un punto. |
| Q10 | Lectores de pantalla | Las líneas de correlativas son decorativas (`aria-hidden`) y la relación se expone en el detalle. | ✓ |
| Q11 | Contraste | Todo el texto ≥ 4.5:1. La única excepción es el placeholder del nombre en el póster (`#C9CBD0`, decorativo). | ✓ |
| Q12 | `prefers-reduced-motion` | Respetado. | ✓ |

---

## 4. Checklist para salir a producción
1. Bundle estático sin runtime de prototipado (S5) y sin `image-slot` (S6).
2. Self-host de fuentes y logo (S8).
3. CSP y headers (S7, S9) en el hosting (Netlify/Vercel/Cloudflare Pages o el servidor de UdeSA).
4. Catálogo de planes, reglas y calendario académico como JSON versionado y publicado por la carrera (C2, C5).
5. Tests del motor + e2e en los tres anchos (C6).
6. Quitar los escenarios de prueba (S11).
7. Revisión de copy y de reglas con la coordinación.

---

## 5. v5 · Cambios implementados (8 oct 2026)
- **Datos oficiales** en `datos/carrera.json` (planes, reglas, calendario, optativas, programas). La app los carga con `fetch` sin credenciales y valida su estructura; si algo no cuadra, no arranca y lo avisa. Ya no hay datos en `window`.
- **Calendario académico**: el semestre a inscribir sale de `calendario[].cambiosHasta`, no del reloj. La fecha límite de cambios se ve en Inscripción.
- **Optativas con tema**: el lugar de optativa ofrece el catálogo del semestre (título + tema). La elegida se ve en la inscripción, en los semestres y en el póster.
- **Convivencia de planes**: `dictadoComo` muestra los dos nombres ("Se dicta como …") sin señalar qué plan es el anterior. Cargado solo para K331; falta la tabla de equivalencias.
- **Programas**: un enlace en el detalle de cada materia (`programa` por materia, o la carpeta general). Solo se aceptan URLs https de drive.google.com o docs.google.com; se abren con `noopener noreferrer`.
- **Accesibilidad**: *focus trap* en todos los diálogos, flechas del teclado en los grupos de opciones (roving tabindex), y en móvil "Mover a…" con botones de 52 px en lugar de arrastrar.
- **Móvil**: Próximos semestres pasa a ser un timeline vertical.

Pendiente: bundle de producción y headers (§4), tabla de equivalencias, URLs individuales de los programas, arrastre táctil por gesto.

---

## 6. QA extremo · 15 oct 2026

### Método
- **Motor de asignación con fuzzing:** más de 10.000 escenarios aleatorios entre los dos planes, años 1° a 4°, momento del año, historiales al día, atrasados e inconsistentes, intercambio en distintos semestres e inscripciones cargadas a mano.
- **Invariantes chequeadas en cada escenario:**
  - En la inscripción sugerida y en cada semestre proyectado: hasta 5 materias, 1 taller y 1 optativa.
  - Correlativas y requisitos por cantidad cumplidos.
  - Ninguna materia repetida ni ya aprobada.
  - Todas las materias pendientes quedan ubicadas.
  - Ningún "+2 semestres" sobre el mínimo teórico.
  - La sugerencia propia de la app siempre da ✓ en su propio chequeo.
  - El render no tira errores ni muestra "NaN" o "undefined", en las 3 vistas y en 375 y 1280 px.
- **Chequeo de inscripciones manuales:** 2 talleres + 5 materias, 6 materias, doble excepción y materia sin correlativas tienen que dar ×; 2 talleres + 4 materias tiene que dar "!".
- **16 casos canónicos** (estudiante al día, por plan, año y semestre): la proyección tiene que coincidir con los semestres nominales.

### Bugs encontrados y corregidos
| # | Hallazgo | Corrección |
|---|---|---|
| M1 | Semestres con 1 o 2 materias, aunque había materias disponibles que entraban (por ejemplo, 2° sem. con solo "Electiva de Arte"). | Si sobra lugar, se completa con materias del año siguiente. |
| M2 | Taller y optativa (1 por semestre) se postergaban detrás de otras materias y estiraban la cursada hasta 2 semestres. | El taller disponible entra siempre. La optativa reserva su lugar cuando se vuelve el camino largo. |
| M3 | Trabajo de Graduación quedaba solo en un semestre extra. | A igualdad de año y categoría, va primero la materia con requisitos más exigentes. |
| M4 | El reparto por categoría (redondeo hacia arriba en el 1° sem. y hacia abajo en el 2°) dejaba materias del año colgadas (Plan 2027, 2° año: 6/4 en vez de 5/5). | La carga esperable es la mitad de las materias del año (mín. 4, máx. 5). El año se cierra en su 2° semestre. |
| M5 | **La sugerencia propia de la app salía marcada como problema en su propio chequeo**: "excepcional", "Priorizalas", "Sin taller", "Adelantás", "Lo esperable es 4". | El motor y el chequeo usan la misma carga esperable (`semNorm`). Las advertencias solo aparecen si hay algo que realmente entraría en su lugar. |
| M6 | Si el intercambio caía en el semestre de inscripción, el chequeo decía "Sin taller / Lo esperable es 4". | Muestra "Semestre de intercambio" con las materias a reconocer. |
| M7 | Copy: "Te faltan 1 taller más y 2 materias más". | "Te falta aprobar 1 taller y 2 materias más". |
| A1 | Botones de 37 px en móvil: Volver a empezar, opciones de intercambio, Rehacer. | 44 px. Los chips "También vale" quedan en 36 px (WCAG 2.2 AA pide 24). |

### Resultado final
- **3.185 escenarios aleatorios + 736 inscripciones manuales:** 0 violaciones.
- **Sugerencia propia:** 2.208 de 2.208 dan ✓.
- **Casos canónicos:** 16 de 16 coinciden con los semestres nominales.
- **Desvío promedio:** 0,27 semestres sobre el mínimo teórico, que es optimista porque ignora los requisitos por cantidad.

### Accesibilidad verificada
- Ningún control queda sin nombre accesible y no hay ids duplicados.
- Encabezados en orden: h1 → h2.
- **Diálogos:** el foco entra al abrir (botón Cerrar), Tab y Shift+Tab ciclan adentro, y Escape cierra y devuelve el foco a la tarjeta de origen.
- Los grupos de opciones se recorren con las flechas del teclado.
- El chequeo de inscripción es una región `aria-live`.
- Sin desborde horizontal en 375 px.

### Pendiente (no bloqueante)
- En móvil, el chequeo queda debajo de las materias: al sumar una, el resultado no se ve sin scroll. Propuesta: una barra fija abajo con el estado (✓ / ! / ×).
- Cuando hay dos problemas a la vez (por ejemplo, 6 materias con 2 talleres), solo se muestra el más grave.
- Falta probar con lectores de pantalla reales (VoiceOver iOS y NVDA).

---

## 6. v6 · QA extensivo y seguridad (16 oct 2026)

### Seguridad
- **Código propio:** sin `innerHTML`, `eval`, `new Function`, `dangerouslySetInnerHTML` ni `localStorage`. Un solo `fetch` (`datos/carrera.json`, sin credenciales). El único `target=_blank` lleva `noopener noreferrer`. ✓
- **`carrera.json` hostil (10 variantes):** estructura rota, `__proto__` como id, correlativa inexistente y regla fuera de rango se rechazan. Un `programa: javascript:` o una carpeta en otro dominio se descartan y se usa el enlace de respaldo. ✓
- **`safeUrl`:** rechaza http, subdominios falsos (`drive.google.com.evil.com`) y `javascript:`. Ahora también rechaza URLs con usuario, contraseña o puerto. ✓ (corregido)
- **Archivo importado (13 variantes):** archivo de más de 100 KB, JSON inválido, array, `plan: "__proto__"` / `"toString"`, ids ajenos y semestres mal formados se rechazan. Notas con objetos se ignoran, el año se acota a 1–4 y el nombre a 80 caracteres. **Corregido:** una inscripción con ids repetidos o ya aprobados se aceptaba tal cual (6× la misma materia). Ahora se deduplica, se filtra y se limita a 8.
- **Sigue pendiente para producción:** §4 (bundle sin runtime de prototipado, CSP, fuentes propias, headers).

### Motor (fuzz)
- **828 renders** (2 planes × 4 años × 2 momentos × 3 vistas × 3 anchos, con historiales al azar): ninguna excepción y ningún `undefined`/`NaN` en el texto. **La sugerencia pasó el chequeo de Inscripción en 276 de 276 casos.**
- **Corregido:** el contador "Tu semestre" usaba la plantilla teórica del año. Cuando la sugerencia reemplazaba con criterio un lugar que ya no tenía materias (por ejemplo, Ciclo de Fundamentos ya completo), marcaba "Falta" o "de más" aunque la inscripción fuera válida (401 de 960 casos). Ahora la meta sale de la propia sugerencia, seminarios incluidos: **960 de 960 en ✓**.

### Interfaz
- **Desbordes horizontales:** ninguno en 375, 909 y 1400 px, en ninguna pantalla de los dos planes.
- **Accesibilidad:**
  - Todos los botones con nombre accesible, todas las imágenes con `alt` y un `h1` por pantalla.
  - Áreas táctiles de 44 px o más en móvil. El mail del pie es un enlace dentro del texto, que la norma exceptúa.
  - Los diálogos llevan el foco al botón Cerrar, mantienen el Tab adentro, cierran con Escape y devuelven el foco al botón de origen. "Volver a empezar" pide confirmación.
- **Contraste:** un único fallo, "Vas a cursarla" sobre fucsia (4,05:1). Corregido a blanco (4,86:1).

### Abierto
- **Plan 2027:** hoy ofrece 2°, 3° y 4° año, que no existen hasta 2028.

---

## 6. QA final · v8 (18 oct 2026)

### Motor de asignación: 1.016 casos (2 planes × 4 años × 2 momentos + 1.000 al azar)
- Las inscripciones se probaron tal cual, con una materia de menos, con la optativa cambiada por una obligatoria, con una de más, sin optativa y vacías.
- **0** materias sin ubicar, correlativas rotas, 2 talleres juntos, semestres de más de 5 materias o Graduación fuera del último semestre.
- La sugerencia de los 14 casos canónicos con materias por cursar da "Tu inscripción está en orden". Los otros 2 tienen todo aprobado.
- Optativas amontonadas (un semestre con ≥2 y otro con 0): 2 de 1.016.
- ✓ El seminario cuenta como materia en la carga: taller + seminario = 2.
- ✓ La plantilla por semestre ahora suma la carga del plan (2027 · 2°: 5 + 5, antes pedía 6).
- ✓ Con todo aprobado: "¡Aprobaste todo el plan!".

### Pantallas
- ✓ Sin desbordes horizontales a 360, 768 y 1280 px en inicio, plan, carga, Hoy, Inscripción, Semestres y exportar.
- ✓ El rango "1° semestre 2027 → …" ya no se parte palabra por palabra en celular.
- ✓ "Editar lo aprobado": área táctil más alta.
- ✓ Rótulos en mayúsculas de 10 → 11 px.

### Accesibilidad
- ✓ Contraste: 0 textos debajo de 4.5:1 (3:1 en títulos) en Hoy, Inscripción y Semestres.
- ✓ `lang="es-AR"` y `<title>` del documento.
- ✓ El input de archivo oculto tiene nombre accesible y queda fuera del orden de tabulación.
- ✓ Un solo `h1` por pantalla y landmark `main`.
- Pendiente (→): auditoría con VoiceOver/NVDA en dispositivo real, arrastre táctil en Semestres (hoy se usa "Mover a…").

### Publicación (GitHub Pages)
Es un sitio 100 % estático:
`index.html` (la v8) + `support.js` + `datos/carrera.json` + `assets/`.
Antes de publicar: §4 (CSP por `<meta>`, ya que Pages no permite headers propios; fuentes propias; sin `image-slot.js`; sin escenarios de prueba).
