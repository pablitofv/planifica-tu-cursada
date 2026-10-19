// Lectura del "Archivo para retomar" (.json exportado). Valida campo por campo: tipos, largo, ids
// contra el plan y textos recortados a 80 caracteres. El tope de 100 KB se controla antes de leerlo.
export const ARCHIVO_INVALIDO = 'Tiene que ser el archivo .json que descargaste del planificador.';

// Devuelve { error } con el mensaje para el estudiante, o { estado } con lo que se suma al estado inicial.
export function leerProgreso(texto, planes) {
  const BAD = ARCHIVO_INVALIDO;
  let d; try { d = JSON.parse(texto); } catch (x) { return { error: BAD }; }
  const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const isIds = v => Array.isArray(v) && v.length <= 60 && v.every(x => typeof x === 'string' && x.length <= 40);
  const CAL = /^20\d{2}-[12]$/;
  if (!isObj(d) || typeof d.plan !== 'string' || !Object.prototype.hasOwnProperty.call(planes, d.plan)) return { error: BAD };
  const P = planes[d.plan], ok = new Set(P.materias.map(m => m.id));
  const int = d.intercambio == null ? null : d.intercambio, plan = d.semestres == null ? null : d.semestres;
  if (!isIds(d.aprobadas) || (d.inscripcion != null && !isIds(d.inscripcion)) || (plan && !isObj(plan)) || (int && (!isObj(int) || (int.semestre != null && (typeof int.semestre !== 'string' || !CAL.test(int.semestre))) || (int.reconocer != null && !isIds(int.reconocer))))) return { error: BAD };
  const planKeys = plan ? Object.keys(plan) : [];
  if (planKeys.length > 60 || planKeys.some(k => typeof plan[k] !== 'string' || !CAL.test(plan[k]))) return { error: BAD };
  if ([...d.aprobadas, ...(d.inscripcion || []), ...((int && int.reconocer) || []), ...planKeys].some(id => !ok.has(id))) return { error: 'Tiene materias que no son del ' + P.nombre + '. Revisá que sea tu archivo de progreso.' };
  const o = a => { const r = {}; (a || []).forEach(i => { if (ok.has(i)) r[i] = true; }); return r; };
  const cleanPlan = plan ? planKeys.reduce((r, k) => (r[k] = plan[k], r), {}) : null;
  const notas = {}; if (isObj(d.notas)) Object.keys(d.notas).forEach(k => { if (ok.has(k) && typeof d.notas[k] === 'string') notas[k] = d.notas[k].slice(0, 80); });
  const aprobSet = new Set(d.aprobadas);
  const anio = Math.min(4, Math.max(1, Math.trunc(Number(d.anio)) || 1)), semCount = Math.min(16, Math.max(0, Math.trunc(Number(d.cantidadSemestres)) || 0));
  return { estado: { screen: 'app', planId: P.id, anio, mYear: anio, nombreExp: typeof d.nombre === 'string' ? d.nombre.slice(0, 80) : '', aprob: o(d.aprobadas), insc: d.inscripcion ? [...new Set(d.inscripcion)].filter(id => !aprobSet.has(id)).slice(0, 8) : null, plan: cleanPlan, semCount, intSem: int && int.semestre ? int.semestre : null, intRec: o(int && int.reconocer), notas } };
}
