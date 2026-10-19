import { describe, it, expect } from 'vitest';
import { validateData, safeUrl } from '../../src/datos.js';
import { CRUDO, DATOS } from './ayuda.js';

const copia = () => JSON.parse(JSON.stringify(CRUDO));

describe('datos/carrera.json', () => {
  it('pasa la validación y queda congelado', () => {
    expect(Object.isFrozen(DATOS)).toBe(true);
    expect(Object.isFrozen(DATOS.planes['2023'].materias[0])).toBe(true);
    expect(Object.isFrozen(DATOS.planes['2023'].materias[20].req)).toBe(true);
  });
  it('sin ids duplicados ni ciclos de correlativas, y sin correlativas de años posteriores', () => {
    for (const P of Object.values(DATOS.planes)) {
      const by = Object.fromEntries(P.materias.map(m => [m.id, m]));
      expect(new Set(P.materias.map(m => m.id)).size).toBe(P.materias.length);
      const reqs = m => [...(m.req || []), ...[].concat(...(m.reqAny || []))];
      P.materias.forEach(m => reqs(m).forEach(id => expect(by[id].anio, `${m.id} pide ${id}`).toBeLessThanOrEqual(m.anio)));
      const estado = {}, visita = id => { if (estado[id] === 1) throw new Error('ciclo en ' + id); if (estado[id] === 2) return; estado[id] = 1; reqs(by[id]).forEach(visita); estado[id] = 2; };
      P.materias.forEach(m => visita(m.id));
    }
  });
  it('carga por año: 2023 → 10·10·8·8 y 2027 → 8·10·10·8', () => {
    const porAnio = pid => [1, 2, 3, 4].map(a => DATOS.planes[pid].materias.filter(m => m.anio === a).length);
    expect(DATOS.planes['2023'].carga).toEqual([10, 10, 8, 8]);
    expect(DATOS.planes['2027'].carga).toEqual([8, 10, 10, 8]);
    expect(porAnio('2023')).toEqual([10, 10, 8, 8]);
    expect(porAnio('2027')).toEqual([8, 10, 10, 8]);
  });
  it('seminarios de 2023 pegados al taller de su año', () => {
    const by = Object.fromEntries(DATOS.planes['2023'].materias.map(m => [m.id, m]));
    ['k530', 'k531', 'k630', 'k631'].forEach(id => { const t = by[by[id].pegadaA]; expect(t.cat).toBe('taller'); expect(t.anio).toBe(by[id].anio); });
  });
  it('Pensamiento Proyectual: taller en 2027, Ciclo de Fundamentos en 2023', () => {
    expect(DATOS.planes['2027'].materias.find(m => m.id === 'f-pensamiento')).toMatchObject({ cat: 'taller', nombre: 'Taller de Pensamiento Proyectual' });
    expect(DATOS.planes['2023'].materias.find(m => m.id === 'k240')).toMatchObject({ cat: 'cf', nombre: 'Pensamiento Proyectual' });
  });
  it('equivalencias en la práctica del Plan 2023', () => {
    const by = Object.fromEntries(DATOS.planes['2023'].materias.map(m => [m.id, m]));
    expect(by.k430).toMatchObject({ nombre: 'Taller de Portafolio', dictadoComo: 'Taller de Sistemas Inteligentes' });
    expect(by.k342.dictadoComo).toBe('Entrepreneurship');
  });
  it('un solo Trabajo de Graduación por plan', () => {
    for (const P of Object.values(DATOS.planes)) expect(P.materias.filter(m => m.ultimo)).toHaveLength(1);
  });
});

describe('validateData rechaza datos rotos', () => {
  const rompe = f => { const d = copia(); f(d); return () => validateData(d); };
  it.each([
    ['sin planes', d => { delete d.planes; }],
    ['categoría desconocida', d => { d.planes['2023'].materias[0].cat = 'otra'; }],
    ['año fuera de rango', d => { d.planes['2027'].materias[0].anio = 5; }],
    ['correlativa inexistente', d => { d.planes['2023'].materias[20].req.push('no-existe'); }],
    ['reqAny de un solo elemento', d => { d.planes['2023'].materias[20].reqAny = [['k230']]; }],
    ['regla fuera de rango', d => { d.reglas.maxMaterias = 11; }],
    ['fecha mal escrita', d => { d.calendario[0].cambiosHasta = '21/08/2026'; }],
    ['semestre mal escrito', d => { d.calendario[0].id = '2026-3'; }],
  ])('%s', (_, f) => expect(rompe(f)).toThrow('datos'));
  it('recorta y limpia lo opcional', () => {
    const d = copia();
    d.planes['2023'].materias[0].codigo = 'DEMASIADO-LARGO-123';
    d.planes['2023'].materias[0].programa = 'javascript:alert(1)';
    d.optativas['2027-1'] = [{ titulo: 'X', codigo: 'mal' }, { titulo: '' }, 'texto'];
    const v = validateData(d);
    expect(v.planes['2023'].materias[0].codigo).toBe('');
    expect(v.optativas['2027-1']).toEqual([{ id: 'X', codigo: '', titulo: 'X', tema: '' }]);
  });
});

describe('safeUrl', () => {
  it.each([
    ['https://drive.google.com/drive/folders/abc', 'https://drive.google.com/drive/folders/abc'],
    ['https://docs.google.com/document/d/1', 'https://docs.google.com/document/d/1'],
    ['http://drive.google.com/x', null],
    ['https://drive.google.com.evil.com/x', null],
    ['https://user:pass@drive.google.com/x', null],
    ['https://drive.google.com:8443/x', null],
    ['javascript:alert(1)', null],
    ['no es una url', null],
  ])('%s', (u, esperado) => expect(safeUrl(u)).toBe(esperado));
});
