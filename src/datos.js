// Validación de datos/carrera.json: si no cumple el esquema, la app no arranca. Devuelve una copia
// limpia y congelada (Object.freeze profundo).
export function validateData(d) {
  const fail = () => { throw new Error('datos'); };
  const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v), str = (v, n) => typeof v === 'string' && v.length > 0 && v.length <= (n || 120);
  const ISO = /^\d{4}-\d{2}-\d{2}$/, CAL = /^20\d{2}-[12]$/, CATS = ['taller', 'transversal', 'obligatoria', 'optativa', 'cf'];
  if (!isObj(d) || !isObj(d.planes) || !isObj(d.reglas) || !Array.isArray(d.calendario)) fail();
  const calendario = d.calendario.map(x => { if (!isObj(x) || !CAL.test(x.id) || !ISO.test(x.inicio) || !ISO.test(x.cambiosHasta)) fail(); return { id: x.id, inicio: x.inicio, cambiosHasta: x.cambiosHasta }; });
  const r = d.reglas, num = v => Number.isInteger(v) && v >= 0 && v <= 10;
  if (![r.maxMaterias, r.maxTalleres, r.maxOptativas, r.maxReconocerOptativas].every(num) || (r.maxTransversales != null && !num(r.maxTransversales)) || !Array.isArray(r.intercambio)) fail();
  const reglas = { maxMaterias: r.maxMaterias, maxTalleres: r.maxTalleres, maxOptativas: r.maxOptativas, maxReconocerOptativas: r.maxReconocerOptativas, maxTransversales: r.maxTransversales == null ? 1 : r.maxTransversales, intercambio: r.intercambio.map(p => { if (!Array.isArray(p) || !p.every(num)) fail(); return [p[0], p[1]]; }) };
  const planes = {};
  ['2023', '2027'].forEach(pid => {
    const P = d.planes[pid]; if (!isObj(P) || !Array.isArray(P.materias)) fail();
    const ids = new Set(P.materias.map(m => m && m.id));
    const materias = P.materias.map(m => {
      if (!isObj(m) || !str(m.id, 40) || !str(m.nombre) || !CATS.includes(m.cat) || ![1, 2, 3, 4].includes(m.anio)) fail();
      if (m.req != null && (!Array.isArray(m.req) || m.req.some(x => !ids.has(x)))) fail();
      if (m.reqAny != null && (!Array.isArray(m.reqAny) || m.reqAny.some(g => !Array.isArray(g) || g.length < 2 || g.some(x => !ids.has(x))))) fail();
      if (m.cant != null && (!isObj(m.cant) || !num(m.cant.talleres) || !Number.isInteger(m.cant.materias))) fail();
      return { id: m.id, codigo: str(m.codigo, 12) ? m.codigo : '', nombre: m.nombre, corto: str(m.corto) ? m.corto : m.nombre, cat: m.cat, anio: m.anio, req: m.req ? m.req.slice() : null, reqAny: m.reqAny ? m.reqAny.map(g => g.slice()) : null, pegadaA: str(m.pegadaA, 40) && ids.has(m.pegadaA) ? m.pegadaA : null, ultimo: m.ultimo === true, cant: m.cant ? { talleres: m.cant.talleres, materias: m.cant.materias } : null, sinDefinir: !!m.sinDefinir, programa: str(m.programa, 400) ? m.programa : null, dictadoComo: str(m.dictadoComo) ? m.dictadoComo : null };
    });
    const carga = Array.isArray(P.carga) && P.carga.length === 4 && P.carga.every(n => Number.isInteger(n) && n > 0 && n <= 12) ? P.carga.slice() : null;
    planes[pid] = { id: pid, nombre: str(P.nombre) ? P.nombre : 'Plan ' + pid, ingreso: str(P.ingreso) ? P.ingreso : '', materias, reglas, carga };
  });
  const optativas = {};
  if (isObj(d.optativas)) Object.keys(d.optativas).forEach(k => { if (CAL.test(k) && Array.isArray(d.optativas[k])) optativas[k] = d.optativas[k].filter(o => isObj(o) && str(o.titulo, 80)).slice(0, 30).map(o => ({ id: String(o.id || o.titulo).slice(0, 40), codigo: typeof o.codigo === 'string' && /^[A-Z]\d{3}$/.test(o.codigo) ? o.codigo : '', titulo: o.titulo, tema: str(o.tema, 200) ? o.tema : '' })); });
  const programas = { carpeta: isObj(d.programas) && str(d.programas.carpeta, 400) ? d.programas.carpeta : null };
  const freeze = o => { Object.values(o).forEach(v => { if (v && typeof v === 'object') freeze(v); }); return Object.freeze(o); };
  return freeze({ planes, calendario, reglas, optativas, programas });
}

// Enlaces a programas: solo https a drive.google.com o docs.google.com, sin usuario, clave ni puerto.
export function safeUrl(u) { try { const x = new URL(u); return x.protocol === 'https:' && !x.username && !x.password && !x.port && ['drive.google.com', 'docs.google.com'].includes(x.hostname) ? x.href : null; } catch (e) { return null; } }
