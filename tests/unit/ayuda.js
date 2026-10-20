import { readFileSync } from 'node:fs';
import { validateData } from '../../src/datos.js';
import { Motor } from '../../src/motor.js';

export const CRUDO = JSON.parse(readFileSync(new URL('../../public/datos/carrera.json', import.meta.url), 'utf8'));
export const DATOS = validateData(CRUDO);

export const estado = over => ({ planId: '2023', anio: 1, aprob: {}, insc: null, plan: null, semCount: 0, intSem: null, intRec: {}, notas: {}, ...over });

// Motor sobre un estado fijo y una fecha fija (por defecto, el día de la publicación)
export function motor(est, fecha = '2026-10-19T12:00:00') {
  const d = new Date(fecha);
  return new Motor({ datos: () => DATOS, estado: () => est, hoy: () => d });
}

export const ids = (pid, f) => Object.fromEntries(DATOS.planes[pid].materias.filter(f).map(m => [m.id, true]));

// Peso de un semestre: los seminarios pegados al taller cuentan como materia
export const peso = (c, lista) => lista.reduce((a, id) => a + 1 + (c.att[id] ? 1 : 0), 0);

// Recorre la proyección y devuelve las violaciones de las invariantes del CLAUDE.md
export function violaciones(M, c, sems, rec) {
  const R = c.P.reglas, out = [], set = new Set(c.ap), visto = new Map(), recSet = new Set(rec);
  sems.forEach((x, i) => {
    if (x.isInt) { x.ids.forEach(id => set.add(id)); return; }
    const ms = x.ids.map(id => c.by[id]);
    if (ms.filter(m => m.cat === 'taller').length > R.maxTalleres) out.push(`semestre ${x.cal}: más de ${R.maxTalleres} taller`);
    if (ms.filter(m => m.cat === 'transversal').length > R.maxTransversales) out.push(`semestre ${x.cal}: más de ${R.maxTransversales} transversal`);
    if (peso(c, x.ids) > R.maxMaterias) out.push(`semestre ${x.cal}: más de ${R.maxMaterias} materias`);
    ms.forEach(m => { const e = M.evalRule(m, set, c.by); if (!e.ok) out.push(`${m.id} en ${x.cal} sin correlativas`); });
    ms.forEach(m => { if (visto.has(m.id)) out.push(`${m.id} repetida`); visto.set(m.id, i); set.add(m.id); if (c.att[m.id]) set.add(c.att[m.id].id); });
  });
  c.pend.forEach(m => { if (!recSet.has(m.id) && !visto.has(m.id)) out.push(`${m.id} sin ubicar`); });
  const ultimo = sems.map((x, i) => (!x.isInt && x.ids.length ? i : -1)).filter(i => i >= 0).pop();
  c.pend.filter(m => m.ultimo && visto.has(m.id)).forEach(m => { if (visto.get(m.id) !== ultimo) out.push(`${m.id} fuera del último semestre`); });
  return out;
}
