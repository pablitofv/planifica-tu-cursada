// Motor de reglas del planificador: inscripción sugerida, proyección de semestres y chequeo.
// No toca el DOM ni React. Lee los datos de la carrera, el estado del estudiante y la fecha de
// `fuente` en cada llamada, así ve siempre el estado vigente.
export const CAT = { taller: 'Taller', obligatoria: 'Obligatoria', optativa: 'Optativa', cf: 'Ciclo de Fundamentos' };
export const LANES = [['taller', 'Talleres'], ['obligatoria', 'Obligatorias'], ['optativa', 'Optativas'], ['cf', 'Ciclo de Fundamentos']];
export const ORD = { taller: 0, obligatoria: 1, optativa: 2, cf: 3 };
export const SHOW = { taller: 0, obligatoria: 1, cf: 2, optativa: 3 };

export class Motor {
  // fuente: { datos: () => carrera validada, estado: () => estado del estudiante, hoy?: () => Date }
  constructor(fuente) { this.fuente = fuente; }
  get datos() { return this.fuente.datos(); }
  get estado() { return this.fuente.estado(); }
  hoy() { return this.fuente.hoy ? this.fuente.hoy() : new Date(); }

  keys(o) { return Object.keys(o).filter(k => o[k]); }
  pl(n, s, p) { return n + ' ' + (n === 1 ? s : (p || s + 's')); }
  join(a) { return a.length <= 1 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' y ' + a[a.length - 1]; }
  sId(i) { return Math.floor(i / 2) + '-' + (i % 2 + 1); }
  sIdx(id) { const [y, h] = id.split('-').map(Number); return y * 2 + h - 1; }
  sLbl(id) { if (!id) return ''; const [y, h] = id.split('-'); return h + '° semestre ' + y; }
  P3() { return this.datos ? this.datos.planes : null; }
  ofertas(cal) { const o = this.datos && this.datos.optativas[cal]; return o && o.length ? o : null; }
  todayISO() { const d = this.hoy(), z = n => String(n).padStart(2, '0'); return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()); }
  nextId() {
    const d = this.hoy(), y = d.getFullYear(), late = d.getMonth() >= 6;
    const t = this.todayISO(), s = this.datos && this.datos.calendario.find(x => t <= x.cambiosHasta);
    return s ? s.id : (late ? (y + 1) + '-1' : y + '-2');
  }
  fechaCambios(cal) { const s = this.datos && this.datos.calendario.find(x => x.id === cal); if (!s) return ''; const [y, mo, da] = s.cambiosHasta.split('-').map(Number); return 'Hasta el ' + new Date(y, mo - 1, da).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).replace(',', '') + ' podés pedir cambios a Alumnos'; }
  h0() { return this.nextId().endsWith('-1') ? 2 : 1; }
  nextCal() { return this.sIdx(this.nextId()); }
  calK(cal) { return this.sIdx(cal) - this.nextCal(); }
  semAt(k) { const p = (this.estado.anio - 1) * 2 + (this.h0() === 2 ? 0 : 1) + k; const yr = Math.floor(p / 2) + 1; return { k, cal: this.sId(this.nextCal() + k), year: Math.min(4, yr), yearReal: yr, half: p % 2 + 1 }; }
  tpl(c, year, half) {
    const n = {}; c.mats.filter(m => m.anio === year).forEach(m => n[m.cat] = (n[m.cat] || 0) + 1);
    const tot = Object.values(n).reduce((s, v) => s + v, 0), T1 = Math.ceil(tot / 2), h1 = {};
    Object.keys(n).forEach(k => h1[k] = Math.floor(n[k] / 2));
    let left = T1 - Object.values(h1).reduce((s, v) => s + v, 0);
    ['taller', 'seminario', 'optativa', 'obligatoria', 'cf'].concat(Object.keys(n)).forEach(k => { if (left > 0 && n[k] && n[k] % 2 && h1[k] * 2 < n[k]) { h1[k]++; left--; } });
    const o = {}; Object.keys(n).forEach(k => o[k] = half === 1 ? h1[k] : n[k] - h1[k]); return o;
  }

  evalRule(m, set, by) {
    const o = { ok: true, ids: [], t: 0, n: 0, haveT: 0, haveN: 0, needT: 0, needN: 0 };
    (m.req || []).forEach(id => { if (!set.has(id)) o.ids.push(id); });
    (m.reqAny || []).forEach(g => { if (!g.some(id => set.has(id))) o.ids.push(g.join('|')); });
    if (m.cant) { let t = 0, n = 0; set.forEach(id => { const x = by[id]; if (x) { n++; if (x.cat === 'taller') t++; } }); Object.assign(o, { haveT: t, haveN: n, needT: m.cant.talleres, needN: m.cant.materias, t: Math.max(0, m.cant.talleres - t), n: Math.max(0, m.cant.materias - n) }); }
    o.ok = !o.ids.length && !o.t && !o.n; return o;
  }
  reqName(id, by) { return by[id] ? by[id].corto : id.split('|').map(x => by[x] ? by[x].corto : x).join(' o '); }
  allReq(m) { return [...(m.req || []), ...[].concat(...(m.reqAny || []))]; }
  falta(e, by) {
    const p = e.ids.map(id => this.reqName(id, by));
    if (e.t) p.push(this.pl(e.t, 'taller', 'talleres'));
    if (e.n) p.push(this.pl(e.n, 'materia'));
    if (e.ids.length > 2) return 'Te faltan ' + e.ids.length + ' correlativas';
    return 'Te falta aprobar ' + this.join(p) + (e.t || e.n ? ' más' : '');
  }

  build() {
    const s = this.estado, P = this.P3()[s.planId], all = P.materias, by = {}, att = {};
    all.forEach(m => { by[m.id] = m; if (m.pegadaA) att[m.pegadaA] = m; });
    const mats = all.filter(m => !m.pegadaA);
    const ap = new Set(this.keys(s.aprob).filter(id => by[id] && !by[id].pegadaA));
    Object.keys(att).forEach(t => { if (ap.has(t)) ap.add(att[t].id); });
    const pend = mats.filter(m => !ap.has(m.id));
    const ev = {}; mats.forEach(m => ev[m.id] = this.evalRule(m, ap, by));
    const kids = {}; mats.forEach(m => kids[m.id] = []);
    mats.forEach(m => this.allReq(m).forEach(id => kids[id] && kids[id].push(m.id)));
    const st = id => ap.has(id) ? 'aprobada' : ev[id].ok ? 'disponible' : 'bloqueada';
    return { P, mats, by, att, ap, pend, ev, kids, st, hasReq: mats.some(m => m.req || m.reqAny) };
  }
  fill(c, set, k, excl) {
    // Taller y optativa primero: son 1 por semestre, si se postergan estiran la cursada
    const { year, half } = this.semAt(k), O = { taller: 0, optativa: 1, obligatoria: 2, cf: 3 }, R = c.P.reglas;
    const rest = c.pend.filter(m => !set.has(m.id) && !excl.has(m.id));
    if (!rest.length) return [];
    // Si ya no quedan materias de este año, el semestre sigue el modelo del año más bajo pendiente
    const { ey, cap } = this.semNorm(c, k, set, excl);
    const tpl = this.tpl(c, ey, half), tot = Math.min(cap, Object.values(tpl).reduce((a, b) => a + b, 0));
    const tgM = rest.find(m => m.ultimo && this.evalRule(m, set, c.by).ok);
    const cands = rest.filter(m => !m.ultimo && this.evalRule(m, set, c.by).ok).sort((a, b) => a.anio - b.anio || O[a.cat] - O[b.cat] || ((b.cant && b.cant.materias) || 0) - ((a.cant && a.cant.materias) || 0));
    const low = cands.filter(m => m.anio <= ey), pick = [], cnt = {};
    const W = m => 1 + (c.att[m.id] ? 1 : 0), wt = () => pick.reduce((a, m) => a + W(m), 0);
    const can = (m, L) => !pick.includes(m) && wt() + W(m) <= (L || cap) && !(m.cat === 'taller' && (cnt.taller || 0) >= R.maxTalleres) && !(m.cat === 'optativa' && (cnt.optativa || 0) >= R.maxOptativas);
    const add = m => { pick.push(m); cnt[m.cat] = (cnt[m.cat] || 0) + 1; };
    // El taller es el eje y va uno por semestre: si hay uno disponible, entra siempre
    const tl = cands.find(m => m.cat === 'taller'); if (tl) add(tl);
    // La optativa también va una por semestre: si quedan tantas como talleres, se vuelve el camino largo y se reserva su lugar
    const pT = rest.filter(m => m.cat === 'taller').length, pO = rest.filter(m => m.cat === 'optativa').length;
    const semsLeft = (4 - year) * 2 + (half === 1 ? 2 : 1);
    if (pO && pO >= pT && pO >= semsLeft) { const op = cands.find(m => m.cat === 'optativa'); if (op && can(op)) add(op); }
    // Después, lo adeudado de años anteriores
    low.filter(m => m.anio < year).forEach(m => { if (can(m)) add(m); });
    Object.keys(tpl).sort((a, b) => O[a] - O[b]).forEach(cat => low.filter(m => m.cat === cat).forEach(m => { if ((cnt[cat] || 0) < tpl[cat] && can(m)) add(m); }));
    if (wt() < tot) low.forEach(m => { if (wt() < tot && can(m)) add(m); });
    // Al cerrar el año, lo que quede de ese año entra antes de pasar al siguiente
    if (half === 2) low.forEach(m => { if (can(m)) add(m); });
    // Taller y optativa son 1 por semestre: si queda el lugar libre, se adelanta uno del año siguiente para no estirar la cursada
    const next = cands.filter(m => m.anio <= ey + 1);
    ['taller', 'optativa'].forEach(cat => { if (!cnt[cat]) { const m = next.find(x => x.cat === cat && can(x)); if (m) add(m); } });
    next.forEach(m => { if (can(m)) add(m); });
    // El Trabajo de Graduación va solo en el último semestre
    if (tgM && rest.every(m => m.ultimo || pick.includes(m)) && can(tgM)) add(tgM);
    return pick.map(m => m.id);
  }
  // Carga esperable del semestre: la mitad de las materias del año que corresponde (mín. 4, máx. el reglamentario)
  semNorm(c, k, set, excl) {
    const { year, half } = this.semAt(k), rest = c.pend.filter(m => !set.has(m.id) && !excl.has(m.id));
    const ey = Math.min(4, rest.length ? Math.max(year, Math.min(...rest.map(m => m.anio))) : year), N = c.P.carga ? c.P.carga[ey - 1] : c.mats.filter(m => m.anio === ey).length;
    return { ey, cap: Math.min(c.P.reglas.maxMaterias, Math.max(c.P.carga ? 1 : 4, half === 1 ? Math.ceil(N / 2) : Math.floor(N / 2))) };
  }
  recIds(c) { const s = this.estado; return s.intSem ? this.keys(s.intRec).filter(id => c.by[id] && !c.ap.has(id)) : []; }
  suggestion(c) { return this.fill(c, new Set(c.ap), 0, new Set(this.recIds(c))); }
  inscIds(c) {
    const s = this.estado; if (this.semAt(0).cal === s.intSem) return [];
    if (s.insc) return s.insc.filter(id => c.by[id] && !c.ap.has(id));
    return this.suggestion(c);
  }
  autoProject(c, intSem, rec, inscOver) {
    const excl = new Set(rec), set = new Set(c.ap), sems = [], insc = (inscOver || this.inscIds(c)).filter(id => !excl.has(id));
    const i0 = this.semAt(0);
    if (i0.cal === intSem) { rec.forEach(id => set.add(id)); sems.push(Object.assign({ isInt: true, ids: rec }, i0)); }
    else { insc.forEach(id => { set.add(id); if (c.att[id]) set.add(c.att[id].id); }); sems.push(Object.assign({ ids: insc }, i0)); }
    if (i0.cal !== intSem && !insc.length && c.pend.every(m => set.has(m.id))) return sems;
    const rest = c.pend.filter(m => !set.has(m.id) && !excl.has(m.id));
    if (!rest.length && !(intSem && this.calK(intSem) > 0)) return sems;
    const tail = this.planTail(c, set, excl, rest, intSem, rec);
    return sems.concat(tail);
  }
  // Ubica lo que falta en la menor cantidad de semestres: calcula para cada materia el último semestre posible
  // (por sus correlativas hacia adelante) y llena cada semestre con lo urgente, después taller y optativa, después por año
  // Empareja la carga: pasa materias de semestres cargados a otros más livianos que vienen después, sin romper correlativas
  balance(c, set0, out) {
    const R = c.P.reglas, real = out.filter(x => !x.isInt), WL = x => x.ids.reduce((a, id) => a + 1 + (c.att[id] ? 1 : 0), 0);
    const valid = () => { const set = new Set(set0); for (const x of out) { if (x.isInt) { x.ids.forEach(id => set.add(id)); continue; } const ms = x.ids.map(id => c.by[id]);
      if (ms.filter(m => m.cat === 'taller').length > R.maxTalleres || WL(x) > R.maxMaterias) return false;
      if (ms.some(m => !this.evalRule(m, set, c.by).ok)) return false; ms.forEach(m => { set.add(m.id); if (c.att[m.id]) set.add(c.att[m.id].id); }); } return true; };
    const nOpt = x => x.ids.filter(id => c.by[id].cat === 'optativa').length;
    const swap = (a, b, ia, ib) => { a.ids = a.ids.map(x => x === ia ? ib : x); b.ids = b.ids.map(x => x === ib ? ia : x); };
    const spread = () => { for (let guard = 0; guard < 30; guard++) {
      let done = false;
      for (let i = 0; i < real.length && !done; i++) for (let j = 0; j < real.length && !done; j++) {
        if (i === j || nOpt(real[i]) < 2 || nOpt(real[j]) > 0) continue;
        const oi = real[i].ids.filter(id => c.by[id].cat === 'optativa'), oj = real[j].ids.filter(id => { const m = c.by[id]; return m.cat !== 'optativa' && m.cat !== 'taller' && !m.ultimo; });
        for (const a of oi) { for (const b of oj) { swap(real[i], real[j], a, b); if (valid()) { done = true; break; } swap(real[i], real[j], b, a); } if (done) break; }
        if (!done && WL(real[j]) <= WL(real[i]) && WL(real[j]) < 5) for (const a of oi) { real[i].ids = real[i].ids.filter(x => x !== a); real[j].ids = real[j].ids.concat(a); if (valid()) { done = true; break; } real[j].ids = real[j].ids.filter(x => x !== a); real[i].ids = real[i].ids.concat(a); }
      }
      if (!done) break;
    } };
    spread();
    for (let guard = 0; guard < 40; guard++) {
      let moved = false;
      for (let j = real.length - 1; j > 0 && !moved; j--) {
        for (let i = 0; i < j && !moved; i++) {
          if (WL(real[i]) - WL(real[j]) < 2) continue;
          const cand = real[i].ids.map(id => c.by[id]).filter(m => !m.ultimo && m.cat !== 'taller' && !(m.cat === 'optativa' && nOpt(real[i]) < 2 && nOpt(real[j]) > 0)).sort((a, b) => b.anio - a.anio || (a.cat === 'optativa') - (b.cat === 'optativa'));
          for (const m of cand) {
            real[i].ids = real[i].ids.filter(x => x !== m.id); real[j].ids = real[j].ids.concat(m.id);
            if (valid()) { moved = true; break; }
            real[j].ids = real[j].ids.filter(x => x !== m.id); real[i].ids = real[i].ids.concat(m.id);
          }
        }
      }
      if (!moved) break;
    }
    for (let guard = 0; guard < 20; guard++) {
      const L = real[real.length - 1]; let moved = false;
      for (let i = real.length - 2; i >= 0 && !moved && real.length > 1; i--) {
        if (WL(L) <= WL(real[i])) continue;
        for (const id of L.ids.filter(x => !c.by[x].ultimo && c.by[x].cat !== 'taller')) { L.ids = L.ids.filter(x => x !== id); real[i].ids = real[i].ids.concat(id); if (valid()) { moved = true; break; } real[i].ids = real[i].ids.filter(x => x !== id); L.ids = L.ids.concat(id); }
      }
      if (!moved) break;
    }
    spread();
    for (let guard = 0; guard < 60; guard++) {
      let sw = false;
      for (let i = 0; i < real.length - 1 && !sw; i++) for (let k = i + 1; k < real.length && !sw; k++) {
        const A = real[i].ids.filter(id => c.by[id].cat !== 'taller' && !c.by[id].ultimo).sort((x, y) => c.by[y].anio - c.by[x].anio);
        const B = real[k].ids.filter(id => c.by[id].cat !== 'taller' && !c.by[id].ultimo).sort((x, y) => c.by[x].anio - c.by[y].anio);
        for (const a of A) { for (const bb of B) { if (c.by[a].anio <= c.by[bb].anio) break; const oa = nOpt(real[i]), ob = nOpt(real[k]);
          swap(real[i], real[k], a, bb); if (valid() && !((nOpt(real[i]) === 0 || nOpt(real[k]) === 0) && (nOpt(real[i]) > 1 || nOpt(real[k]) > 1) && !(oa === 0 || ob === 0))) { sw = true; break; } swap(real[i], real[k], bb, a); } if (sw) break; }
      }
      if (!sw) break;
    }
    return out;
  }
  planTail(c, set0, excl, rest, intSem, rec) {
    const R = c.P.reglas, O = { taller: 0, optativa: 1, obligatoria: 2, cf: 3 }, ids = new Set(rest.map(m => m.id));
    const T = rest.filter(m => m.cat === 'taller').length, Op = rest.filter(m => m.cat === 'optativa').length;
    const lb = Math.max(1, T, Math.ceil(rest.length / R.maxMaterias));
    const intK = intSem ? this.calK(intSem) : -1;
    for (let S = lb; S <= lb + 10; S++) {
      const slots = []; for (let k = 1; slots.length < S; k++) if (k !== intK) slots.push(k);
      const d = {}; rest.forEach(m => d[m.id] = S);
      for (let it = 0; it < rest.length; it++) { let ch = false; rest.forEach(m => { (c.kids[m.id] || []).forEach(k2 => { if (ids.has(k2) && d[k2] - 1 < d[m.id]) { d[m.id] = d[k2] - 1; ch = true; } }); }); if (!ch) break; }
      if (rest.some(m => d[m.id] < 1)) continue;
      const set = new Set(set0), placed = new Set(), out = []; let ok = true;
      const lastK = slots[S - 1];
      for (let i = 1; i <= S && ok; i++) {
        const k = slots[i - 1], info = this.semAt(k);
        if (intK > 0 && intK < k && !out.some(x => x.isInt)) { rec.forEach(id => set.add(id)); out.push(Object.assign({ isInt: true, ids: rec }, this.semAt(intK))); }
        const cap = this.semNorm(c, k, set, excl).cap, pick = [], cnt = {};
        const avail = rest.filter(m => !placed.has(m.id) && !m.ultimo && this.evalRule(m, set, c.by).ok);
        const W = m => 1 + (c.att[m.id] ? 1 : 0), wt = () => pick.reduce((a, m) => a + W(m), 0), ey = this.semNorm(c, k, set, excl).ey;
        const can = m => !pick.includes(m) && wt() + W(m) <= cap && !(m.cat === 'taller' && (cnt.taller || 0) >= R.maxTalleres);
        const add = m => { pick.push(m); cnt[m.cat] = (cnt[m.cat] || 0) + 1; };
        const byD = (a, b) => d[a.id] - d[b.id] || a.anio - b.anio || O[a.cat] - O[b.cat];
        avail.filter(m => d[m.id] <= i).sort(byD).forEach(m => { if (can(m)) add(m); else ok = false; });
        if (!ok) break;
        ['taller', 'optativa'].forEach(cat => { const m = avail.filter(x => x.cat === cat && (cat === 'taller' || x.anio <= ey)).sort(byD)[0]; if (m && can(m)) add(m); });
        const byY = avail.slice().sort((a, b) => a.anio - b.anio || d[a.id] - d[b.id] || O[a.cat] - O[b.cat]);
        byY.forEach(m => { if (!(m.cat === 'optativa' && (cnt.optativa || 0) >= 1) && can(m)) add(m); });
        byY.forEach(m => { if (can(m)) add(m); });
        const tg = rest.find(m => m.ultimo && !placed.has(m.id));
        if (tg && rest.every(m => m.ultimo || placed.has(m.id) || pick.includes(m)) && this.evalRule(tg, set, c.by).ok && wt() < Math.max(cap, 1)) add(tg);
        pick.forEach(m => { placed.add(m.id); set.add(m.id); if (c.att[m.id]) set.add(c.att[m.id].id); });
        out.push(Object.assign({ ids: pick.map(m => m.id) }, info));
      }
      if (ok && rest.every(m => placed.has(m.id))) {
        if (intK > 0 && !out.some(x => x.isInt)) out.push(Object.assign({ isInt: true, ids: rec }, this.semAt(intK)));
        while (out.length && !out[out.length - 1].isInt && !out[out.length - 1].ids.length) out.pop();
        return this.balance(c, set0, out);
      }
    }
    // Respaldo: el armado semestre a semestre
    const set = new Set(set0), out = [];
    for (let k = 1; k < 16; k++) { if (rest.every(m => set.has(m.id))) break; const info = this.semAt(k);
      if (info.cal === intSem) { rec.forEach(id => set.add(id)); out.push(Object.assign({ isInt: true, ids: rec }, info)); continue; }
      const ids2 = this.fill(c, set, k, excl); if (!ids2.length) break; ids2.forEach(id => { set.add(id); if (c.att[id]) set.add(c.att[id].id); }); out.push(Object.assign({ ids: ids2 }, info)); }
    return out;
  }
  project(c) {
    const s = this.estado, rec = this.recIds(c);
    if (!s.plan) { const sems = this.autoProject(c, s.intSem, rec); for (let k = sems.length; k < s.semCount; k++) sems.push(Object.assign({ ids: [] }, this.semAt(k))); return { sems, unplaced: [] }; }
    const insc = this.inscIds(c), used = new Set([...insc, ...rec]), plan = {};
    Object.keys(s.plan).forEach(id => { if (c.by[id] && !c.ap.has(id) && !used.has(id)) plan[id] = s.plan[id]; });
    const maxK = Math.max(0, s.semCount - 1, ...Object.values(plan).map(x => this.calK(x)), s.intSem ? this.calK(s.intSem) : 0);
    const sems = [];
    for (let k = 0; k <= maxK; k++) { const info = this.semAt(k);
      if (info.cal === s.intSem) sems.push(Object.assign({ isInt: true, ids: rec }, info));
      else sems.push(Object.assign({ ids: k === 0 ? insc : Object.keys(plan).filter(id => plan[id] === info.cal) }, info)); }
    return { sems, unplaced: c.pend.filter(m => !used.has(m.id) && !plan[m.id]).map(m => m.id) };
  }
  materialize(c) {
    const s = this.estado, pr = this.project(c), plan = s.plan ? { ...s.plan } : {};
    if (!s.plan) pr.sems.forEach(x => { if (x.k > 0 && !x.isInt) x.ids.forEach(id => plan[id] = x.cal); });
    return { plan, insc: this.inscIds(c).slice(), semCount: Math.max(s.semCount, pr.sems.length) };
  }
  // Lo que se puede cursar ahora (correlativas en regla), sin lo que se reconoce en el intercambio
  disponibles(c) { const recSet = new Set(this.recIds(c)); return c.pend.filter(m => c.ev[m.id].ok && !recSet.has(m.id)).sort((a, b) => a.anio - b.anio || ORD[a.cat] - ORD[b.cat]); }
  // Chequeo de la inscripción del semestre actual. Cada ítem es { t: 'ok' | 'warn' | 'bad', title, sub }.
  // extra: la inscripción alarga la cursada respecto de la propuesta.
  chequeo(c) {
    const s = this.estado, R = c.P.reglas, info0 = this.semAt(0), ids = this.inscIds(c), idSet = new Set(ids), rec = this.recIds(c), recSet = new Set(rec), availNow = this.disponibles(c);
    const ms = ids.map(id => c.by[id]), nT = ms.filter(m => m.cat === 'taller').length, nO = ms.filter(m => m.cat === 'optativa').length;
    const norm = this.semNorm(c, 0, new Set(c.ap), recSet).cap, addPool = availNow.filter(m => !idSet.has(m.id)), addFit = addPool.filter(m => !(m.cat === 'taller' && nT >= R.maxTalleres) && !(m.cat === 'optativa' && nO >= R.maxOptativas)).length;
    const items = [], push = (t, title, sub) => items.push({ t, title, sub });
    const nW = ms.reduce((a, m) => a + 1 + (c.att[m.id] ? 1 : 0), 0);
    const exc = (nT > 1 ? 1 : 0) + (nW > norm ? 1 : 0);
    const tallerAvail = availNow.some(m => m.cat === 'taller');
    if (nW > R.maxMaterias) push('bad', nW + ' materias', 'El máximo es ' + R.maxMaterias + '.');
    else if (nT > 1 && nW >= 5) push('bad', nT + ' talleres y ' + nW + ' materias', 'No se permite: 5 materias es solo para quien cursa un taller.');
    else if (exc >= 2) push('bad', 'Dos excepciones juntas', 'No se permite. Quitá una materia.');
    else {
      if (nT > 1) push('warn', nT + ' talleres', 'Necesitás una excepción de la carrera.');
      if (nW > norm) push('warn', nW + ' materias', 'La carga recomendada para este semestre es de ' + norm + '. Si querés sumar una más, consultalo con la carrera.');
    }
    const lenOf = ins => this.autoProject(c, s.intSem, this.recIds(c), ins).filter(x => x.ids.length || x.isInt).length;
    const sugI = this.suggestion(c), extra = nW && info0.cal !== s.intSem ? lenOf(ids) - lenOf(sugI) : 0;
    if (extra > 0) push('warn', 'Suma un semestre', 'Volviendo a la propuesta, no pasa.');
    if (nT === 1) push('ok', 'Un taller'); else if (!nT && tallerAvail) push('warn', 'Sin taller', 'Tenés uno disponible.');
    if (nW && nW <= norm && !(nW < norm && addFit)) push('ok', nW + ' materias');
    else if (nW < norm && addFit) push('ok', this.pl(nW, 'materia'), norm - nW === 1 ? 'Todavía podés sumar una más.' : 'Todavía podés sumar ' + (norm - nW) + ' más.');
    const blocked = ms.filter(m => !c.ev[m.id].ok);
    if (blocked.length) push('bad', blocked.length === 1 ? blocked[0].corto + ', todavía no' : this.pl(blocked.length, 'materia') + ', todavía no', 'Te faltan correlativas.');
    else if (ms.length) push('ok', 'Correlativas en regla');
    // Solo se reclama lo adeudado que entraría: hay lugar, o se puede cambiar por algo de un año posterior
    const owedAvail = availNow.filter(m => m.anio < info0.year), owedOut = owedAvail.filter(m => !idSet.has(m.id) && !(m.cat === 'taller' && nT >= R.maxTalleres) && !(m.cat === 'optativa' && nO >= R.maxOptativas) && (ms.length < norm || ms.some(x => x.anio > m.anio && x.cat !== 'taller' && x.cat !== 'optativa')));
    if (owedOut.length) push('warn', owedOut.length === 1 ? 'Falta ' + owedOut[0].nombre : 'Faltan ' + owedOut.length + ' materias que debés', (owedOut.length === 1 ? 'Es de ' + owedOut[0].anio + '° año.' : this.join(owedOut.map(m => m.corto)) + '.') + ' Priorizala' + (owedOut.length > 1 ? 's' : '') + ' para no trabarte después.');
    else if (owedAvail.length && owedAvail.every(m => idSet.has(m.id))) push('ok', 'Incluye lo que debés');
    else if (owedAvail.length) push('ok', 'Prioriza lo que debés', 'Lo que no entra queda para el semestre que viene.');
    // Adelantar solo se marca si deja afuera algo de tu año (o anterior) que entraría en su lugar
    const fits = m => !idSet.has(m.id) && !(m.cat === 'taller' && nT >= R.maxTalleres) && !(m.cat === 'optativa' && nO >= R.maxOptativas);
    const ahead = ms.filter(m => m.anio > info0.year && m.cat !== 'taller' && availNow.some(x => x.anio <= info0.year && fits(x)));
    if (ahead.length) push('warn', 'Adelantás ' + this.join(ahead.map(m => m.corto)), 'Se puede, pero conviene priorizar las de ' + info0.year + '° año.');
    const ord = { bad: 0, warn: 1, ok: 2 }; items.sort((a, b) => ord[a.t] - ord[b.t]);
    if (info0.cal === s.intSem) { items.length = 0; push('ok', 'Este semestre te vas de intercambio', rec.length ? this.pl(rec.length, 'materia') + ' a reconocer.' : 'Confirmá con la carrera qué te reconocen.'); }
    return { items, extra: extra > 0 };
  }
}
