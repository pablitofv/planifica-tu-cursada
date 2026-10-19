// Lectura del "Archivo para retomar" (.json exportado). Valida campo por campo: tipos, largo, ids
// contra el plan y textos recortados a 80 caracteres. El tope de 100 KB se controla antes de leerlo.
export const ARCHIVO_INVALIDO = 'Tiene que ser el archivo .json que descargaste del planificador.';

// Devuelve { error } con el mensaje para el estudiante, o { estado } con lo que se suma al estado inicial.
// motor: para saber cuál es el semestre actual (un archivo puede ser de un semestre que ya pasó).
export function leerProgreso(texto, planes, motor) {
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
  const notas = {}; if (isObj(d.notas)) Object.keys(d.notas).forEach(k => { if (ok.has(k) && typeof d.notas[k] === 'string') notas[k] = d.notas[k].slice(0, 80); });
  const aprobSet = new Set(d.aprobadas);
  const anio = Math.min(4, Math.max(1, Math.trunc(Number(d.anio)) || 1));
  let semCount = Math.min(16, Math.max(0, Math.trunc(Number(d.cantidadSemestres)) || 0));
  // Un archivo de un semestre anterior: lo planeado para el semestre actual pasa a ser la inscripción,
  // lo que quedó en semestres pasados o fuera de rango va a "Sin semestre" y la inscripción vieja se descarta.
  const cur = motor.nextId(), ci = motor.sIdx(cur), dk = cal => motor.sIdx(cal) - ci;
  const fs = typeof d.inscripcionSemestre === 'string' && CAL.test(d.inscripcionSemestre) ? d.inscripcionSemestre : null;
  let intSem = int && int.semestre ? int.semestre : null, intRec = o(int && int.reconocer);
  const stale = fs ? dk(fs) < 0 : planKeys.some(k => dk(plan[k]) <= 0) || (!!intSem && dk(intSem) < 0);
  let insc = d.inscripcion && !stale ? [...new Set(d.inscripcion)].filter(id => !aprobSet.has(id)).slice(0, 8) : null;
  const ahora = [], cleanPlan = {}; let fuera = 0;
  planKeys.forEach(k => { if (aprobSet.has(k)) return; const x = dk(plan[k]); if (x === 0 && stale) ahora.push(k); else if (x > 0 && x <= 16) cleanPlan[k] = plan[k]; else fuera++; });
  if (ahora.length) insc = ahora.slice(0, 8);
  const keepPlan = Object.keys(cleanPlan).length > 0;
  if (fs && stale) semCount = Math.max(0, semCount + dk(fs));
  const msgs = [];
  if (stale) msgs.push('Marcá lo que aprobaste desde entonces en "Editar lo aprobado".');
  if (ahora.length) msgs.push('Lo que habías planeado para el ' + motor.sLbl(cur) + ' quedó como tu inscripción.');
  if (intSem && (dk(intSem) < 0 || dk(intSem) > 16)) { msgs.push(dk(intSem) < 0 ? 'Tu intercambio del ' + motor.sLbl(intSem) + ' ya pasó: si te reconocieron materias, marcalas como aprobadas.' : 'El semestre de intercambio de tu archivo no corresponde: volvé a elegirlo.'); intSem = null; intRec = {}; }
  if (keepPlan && fuera) msgs.push(motor.pl(fuera, 'materia') + (fuera === 1 ? ' quedó sin semestre: ubicala' : ' quedaron sin semestre: ubicalas') + ' en Semestres.');
  const aviso = msgs.length ? { titulo: stale ? (fs ? 'Tu archivo es del ' + motor.sLbl(fs) : 'Tu archivo es de un semestre anterior') : 'Revisamos tu archivo', texto: msgs.join(' ') } : null;
  return { estado: { screen: 'app', planId: P.id, anio, mYear: anio, nombreExp: typeof d.nombre === 'string' ? d.nombre.slice(0, 80) : '', aprob: o(d.aprobadas), insc, plan: keepPlan ? cleanPlan : null, semCount, intSem, intRec, notas, aviso } };
}
