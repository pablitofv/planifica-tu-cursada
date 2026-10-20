import { describe, it, expect } from 'vitest';
import { leerProgreso, ARCHIVO_INVALIDO } from '../../src/importar.js';
import { DATOS, estado, motor } from './ayuda.js';

const leer = (obj, fecha) => leerProgreso(typeof obj === 'string' ? obj : JSON.stringify(obj), DATOS.planes, motor(estado(), fecha));
const ok = { plan: '2023', anio: 3, aprobadas: ['k030', 'k031'] };

describe('archivo para retomar', () => {
  it('lee un archivo válido', () => {
    const r = leer({ ...ok, nombre: 'Ana', inscripcion: ['k330', 'k030', 'k330'], semestres: { k331: '2027-2' }, cantidadSemestres: 3, intercambio: { semestre: '2028-1', reconocer: ['opt-1'] }, notas: { 'opt-1': 'Micro', k030: 5 } });
    expect(r.estado).toEqual({ screen: 'app', planId: '2023', anio: 3, mYear: 3, nombreExp: 'Ana', aprob: { k030: true, k031: true }, insc: ['k330'], plan: { k331: '2027-2' }, semCount: 3, intSem: '2028-1', intRec: { 'opt-1': true }, notas: { 'opt-1': 'Micro' }, aviso: null });
  });
  it('un archivo de un semestre que ya pasó: lo planeado para ahora pasa a ser la inscripción', () => {
    const archivo = { version: 2, ...ok, inscripcionSemestre: '2027-1', inscripcion: ['k330', 'k341'], semestres: { k331: '2027-2', 'opt-1': '2027-2', k441: '2028-1' }, cantidadSemestres: 4 };
    const r = leer(archivo, '2027-05-10T12:00:00').estado;
    expect(r.insc).toEqual(['k331', 'opt-1']);
    expect(r.plan).toEqual({ k441: '2028-1' });
    expect(r.semCount).toBe(3);
    expect(r.aviso).toEqual({ titulo: 'Tu archivo es del 1° semestre 2027', texto: 'Marcá lo que aprobaste desde entonces en "Editar lo aprobado". Lo que habías planeado para el 2° semestre 2027 quedó como tu inscripción.' });
    expect(leer(archivo, '2026-10-19T12:00:00').estado).toMatchObject({ insc: ['k330', 'k341'], aviso: null });
  });
  it('semestres fuera de rango van a "Sin semestre" y un intercambio pasado se descarta', () => {
    const r = leer({ ...ok, semestres: { k331: '2099-2', k441: '2027-2' }, intercambio: { semestre: '2026-2', reconocer: ['opt-1'] } }).estado;
    expect(r.plan).toEqual({ k441: '2027-2' });
    expect(r).toMatchObject({ intSem: null, intRec: {} });
    expect(r.aviso.texto).toContain('Tu intercambio del 2° semestre 2026 ya pasó');
    expect(r.aviso.texto).toContain('1 materia quedó sin semestre: ubicala en Semestres.');
  });
  it.each([
    ['JSON roto', '{nope'],
    ['no es un objeto', '[1,2]'],
    ['plan inexistente', { ...ok, plan: '1999' }],
    ['plan heredado del prototipo', { ...ok, plan: 'constructor' }],
    ['aprobadas no es lista', { ...ok, aprobadas: 'k030' }],
    ['ids demasiado largos', { ...ok, aprobadas: ['x'.repeat(41)] }],
    ['más de 60 ids', { ...ok, aprobadas: Array(61).fill('k030') }],
    ['semestre mal escrito', { ...ok, semestres: { k330: '2027-3' } }],
    ['intercambio mal escrito', { ...ok, intercambio: { semestre: 2028 } }],
  ])('rechaza: %s', (_, x) => expect(leer(x)).toEqual({ error: ARCHIVO_INVALIDO }));
  it('materias de otro plan', () => {
    expect(leer({ ...ok, plan: '2027' })).toEqual({ error: 'Tiene materias que no son del Plan 2027. Revisá que sea tu archivo de progreso.' });
  });
  it('recorta textos a 80 caracteres y acota año y semestres', () => {
    const r = leer({ ...ok, nombre: 'n'.repeat(200), notas: { 'opt-1': 'm'.repeat(200) }, anio: 9.7, cantidadSemestres: 99 }).estado;
    expect(r.nombreExp).toHaveLength(80);
    expect(r.notas['opt-1']).toHaveLength(80);
    expect(r.anio).toBe(4);
    expect(r.semCount).toBe(16);
  });
  it('un nombre con HTML queda como texto', () => {
    expect(leer({ ...ok, nombre: '<img src=x onerror=alert(1)>' }).estado.nombreExp).toBe('<img src=x onerror=alert(1)>');
  });
  it('no copia claves fuera del plan (sin prototype pollution)', () => {
    const r = leer('{"plan":"2023","aprobadas":["k030"],"notas":{"__proto__":{"x":1},"k030":"a"}}').estado;
    expect(Object.keys(r.notas)).toEqual(['k030']);
    expect({}.x).toBeUndefined();
  });
});
