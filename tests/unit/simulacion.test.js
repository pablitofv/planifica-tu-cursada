// Simulación de 1.000 estudiantes al azar (semilla fija) contra las invariantes del CLAUDE.md:
// 0 materias sin ubicar, 0 correlativas rotas, 0 semestres con 2 talleres o más de 5 materias y
// 0 casos con Trabajo de Graduación fuera del último semestre. Además, la propuesta del semestre
// actual nunca da un chequeo en rojo.
import { describe, it, expect } from 'vitest';
import { DATOS, estado, motor, violaciones } from './ayuda.js';

const CASOS = 1000;

function azar(semilla) { // mulberry32
  let a = semilla >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function generar(r) {
  const pid = r() < .5 ? '2023' : '2027', anio = 1 + Math.floor(r() * 4);
  const dia = new Date(2026, 1, 1 + Math.floor(r() * 365 * 4), 12);
  const P = DATOS.planes[pid], by = Object.fromEntries(P.materias.map(m => [m.id, m]));
  // Historia posible: solo se aprueba lo que tiene sus correlativas; casi todo lo de años anteriores
  const aprob = {}, set = new Set();
  const M0 = motor(estado({ planId: pid, anio }), dia);
  [1, 2, 3, 4].forEach(a => P.materias.filter(m => m.anio === a && !m.pegadaA).forEach(m => {
    const p = a < anio ? .88 : a === anio ? .12 : 0;
    if (r() < p && M0.evalRule(m, set, by).ok) { aprob[m.id] = true; set.add(m.id); }
  }));
  const est = estado({ planId: pid, anio, aprob });
  const M = motor(est, dia), c = M.build();
  // Intercambio en uno de los semestres permitidos, con hasta 2 materias a reconocer
  if (r() < .25) {
    const cands = []; for (let k = 0; k < 10; k++) { const x = M.semAt(k); if (c.P.reglas.intercambio.some(([y, h]) => x.yearReal === y && x.half === h)) cands.push(x.cal); }
    if (cands.length) {
      est.intSem = cands[Math.floor(r() * cands.length)];
      const pool = c.pend.filter(m => m.cat === 'optativa' || r() < .1);
      for (let i = 0, n = Math.floor(r() * 3); i < n && pool.length; i++) est.intRec[pool.splice(Math.floor(r() * pool.length), 1)[0].id] = true;
    }
  }
  // Algunos editan la inscripción: un taller como mucho y hasta la carga máxima
  let editada = false;
  if (r() < .2) {
    const disp = M.disponibles(c).filter(m => !m.ultimo), insc = []; let w = 0, t = 0;
    disp.sort(() => r() - .5).forEach(m => { const wm = 1 + (c.att[m.id] ? 1 : 0); if (w + wm <= 5 && !(m.cat === 'taller' && t >= 1) && r() < .6) { insc.push(m.id); w += wm; if (m.cat === 'taller') t++; } });
    est.insc = insc; editada = true;
  }
  return { est, dia, editada };
}

describe(`simulación de ${CASOS} casos`, () => {
  const r = azar(20261019), resultados = [];
  for (let i = 0; i < CASOS; i++) {
    const { est, dia, editada } = generar(r);
    const M = motor(est, dia), c = M.build(), rec = M.recIds(c);
    const { sems } = M.project(c);
    const v = violaciones(M, c, sems, rec);
    if (!editada) {
      const s0 = sems[0];
      if (!s0.isInt && s0.ids.join() !== M.suggestion(c).join()) v.push('el semestre actual no es la sugerencia');
      if (M.chequeo(c).items.some(x => x.t === 'bad')) v.push('la propuesta da un chequeo en rojo');
    }
    resultados.push({ caso: i, plan: est.planId, anio: est.anio, dia: dia.toISOString().slice(0, 10), v });
  }
  const conProblemas = resultados.filter(x => x.v.length);
  const cuenta = txt => conProblemas.reduce((a, x) => a + x.v.filter(s => s.includes(txt)).length, 0);

  it('cubre los dos planes y los cuatro años', () => {
    for (const p of ['2023', '2027']) for (const a of [1, 2, 3, 4]) expect(resultados.some(x => x.plan === p && x.anio === a)).toBe(true);
  });
  it('0 materias sin ubicar', () => expect(cuenta('sin ubicar')).toBe(0));
  it('0 correlativas rotas', () => expect(cuenta('sin correlativas')).toBe(0));
  it('0 semestres con 2 talleres o más de 5 materias', () => expect(cuenta('taller') + cuenta('materias')).toBe(0));
  it('0 casos con Trabajo de Graduación fuera del último semestre', () => expect(cuenta('último semestre')).toBe(0));
  it('sin materias repetidas, y la propuesta coincide con el semestre actual y nunca da rojo', () => {
    expect(conProblemas.slice(0, 5)).toEqual([]);
  });
});
