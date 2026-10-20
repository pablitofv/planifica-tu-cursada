// Lógica de la app: estado, eventos y armado de lo que muestra la vista (renderVals).
// Las reglas de la carrera viven en motor.js.
import React from 'react';
import { Logica } from './logica.js';
import { Motor, CAT, LANES, ORD, SHOW, libre } from './motor.js';
import { validateData, safeUrl } from './datos.js';
import { leerProgreso, ARCHIVO_INVALIDO } from './importar.js';

export default class App extends Logica {
  static CAT = CAT;
  static LANES = LANES;
  static ORD = ORD;
  static SHOW = SHOW;

  fresh() { return { screen: 'inicio', step: 0, planId: null, anio: null, aprob: {}, insc: null, plan: null, semCount: 0, intSem: null, intRec: {}, notas: {}, view: 'hoy', sel: null, hover: null, mYear: 1, modal: null, error: null, aviso: null, nombreExp: '', pick: null, recOpen: false, drag: null, dropOver: null, moveId: null }; }
  state = Object.assign({ ready: false, loadErr: false, w: window.innerWidth, lines: [] }, this.fresh());
  motor = new Motor({ datos: () => this.D, estado: () => this.state });
  fileRef = React.createRef();
  gridRef = el => { this.gridEl = el; };
  posterRef = el => {
    if (this._ro) { this._ro.disconnect(); this._ro = null; }
    if (!el) return;
    const upd = () => { const pw = el.getBoundingClientRect().width; if (pw && Math.abs(pw - (this.state.pw || 0)) > .5) this.setState({ pw }); };
    this._ro = new ResizeObserver(upd); this._ro.observe(el); upd();
  };

  componentDidMount() {
    document.documentElement.lang = 'es-AR'; document.title = 'Planificador de cursada · Diseño UdeSA';
    this._r = () => this.setState({ w: window.innerWidth });
    this._k = e => { if (e.key === 'Tab') return this.trap(e); if (e.key !== 'Escape') return; if (this.state.moveId) return this.setState({ moveId: null }); const s = this.state; if (s.pick || s.recOpen) this.setState({ pick: null, recOpen: false }); else if (s.modal) this.setState({ modal: null }); else if (s.sel) this.setState({ sel: null }); };
    window.addEventListener('resize', this._r); window.addEventListener('keydown', this._k);
    this.loadData();
  }
  componentWillUnmount() { if (this._ro) this._ro.disconnect(); window.removeEventListener('resize', this._r); window.removeEventListener('keydown', this._k); clearInterval(this._t); cancelAnimationFrame(this._raf); }
  componentDidUpdate(pp, ps) {
    const dlgOpen = st => !!(st.modal || st.moveId || (st.sel && !(st.w >= 1180 && st.view === 'hoy')));
    const isOpen = dlgOpen(this.state), was = !!this._dlgWas; this._dlgWas = isOpen;
    if (isOpen && !was) { this._lastFocus = document.activeElement; setTimeout(() => { const d = [...document.querySelectorAll('[role=dialog]')].pop(); const b = d && (d.querySelector('button[aria-label^="Cerrar"]') || d.querySelector('button,a[href],input')); if (b) b.focus(); }, 30); }
    else if (!isOpen && was && this._lastFocus && document.contains(this._lastFocus)) this._lastFocus.focus();
    cancelAnimationFrame(this._raf); this._raf = requestAnimationFrame(() => this.measure());
  }

  loadData() {
    fetch('datos/carrera.json', { cache: 'no-cache', credentials: 'same-origin' })
      .then(r => { if (!r.ok) throw new Error('http'); return r.json(); })
      .then(d => { this.D = validateData(d); this.setState({ ready: true, loadErr: false }); })
      .catch(() => this.setState({ loadErr: true }));
  }
  progOf(m) { const own = m.programa && safeUrl(m.programa), all = this.D && this.D.programas.carpeta && safeUrl(this.D.programas.carpeta), url = own || all; return { progUrl: url || '', progShow: !!url, progLbl: own ? 'Programa' : 'Programas' }; }
  optPicker(m) {
    const s = this.state, cur = s.notas[m.id] || '', i0 = this.motor.semAt(0), k0 = this.motor.sIdx(i0.cal), O = this.D.optativas;
    const past = Object.keys(O).filter(k => this.motor.sIdx(k) < k0).sort((a, b) => this.motor.sIdx(b) - this.motor.sIdx(a));
    const sibs = this.motor.P3()[s.planId].materias.filter(x => x.cat === 'optativa' && x.anio === m.anio), half = sibs.indexOf(m) % 2 === 1 ? 2 : 1;
    const back = ((s.anio - 1) * 2 + (i0.half - 1)) - ((m.anio - 1) * 2 + (half - 1));
    let exp = back > 0 ? this.motor.sId(k0 - back) : null; if (exp && !O[exp]) exp = null; if (!exp) exp = past[0] || null;
    const all = {}; past.slice().reverse().forEach(k => O[k].forEach(o => { const t = all[o.titulo] || (all[o.titulo] = { codigo: o.codigo, titulo: o.titulo, sems: [] }); t.sems.push(k); }));
    const EQ = { 'Por equivalencia: intercambio': 'Intercambio', 'Por equivalencia: otra titulación de UdeSA': 'Otra titulación de UdeSA' };
    const isCat = !!all[cur], isEq = !!EQ[cur];
    const tab0 = s.opl && s.opl.id === m.id ? s.opl.l : cur && !isCat ? (isEq ? 'eq' : 'mano') : cur && exp && !O[exp].some(o => o.titulo === cur) ? 'all' : 'sem';
    const tab = tab0 === 'sem' && !exp ? 'all' : tab0;
    const pick = v => this.setState(x => ({ notas: { ...x.notas, [m.id]: v } }));
    const short = k => { const [y, hh] = k.split('-'); return hh + '° ' + y; };
    const row = (t, meta, codigo, val) => { const on = cur === val; return { titulo: t, codigo: codigo || '', codeShow: !!codigo, meta: meta || '', metaShow: !!meta, on, dot: on ? '#E0005A' : '#FFFFFF', dotBd: on ? '#E0005A' : '#8A8F98', bg: on ? '#FFFFFF' : 'transparent', bd: on ? '#1C1E22' : 'transparent', onClick: () => pick(val) }; };
    const q = (s.optQ || '').trim(), norm = t => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const allL = Object.values(all).sort((a, b) => a.titulo.localeCompare(b.titulo, 'es')).filter(o => !q || norm(o.titulo + ' ' + o.codigo).includes(norm(q)));
    const tabs = [['sem', exp ? this.motor.sLbl(exp) : 'Del semestre'], ['all', 'Todas'], ['mano', 'Otra carrera'], ['eq', 'Equivalencia']].filter(t => t[0] !== 'sem' || exp)
      .map(([id, label]) => { const on = tab === id; return { id, label, on, sel: on ? 'true' : 'false', tab: on ? 0 : -1, bg: on ? '#1C1E22' : 'transparent', fg: on ? '#FFFFFF' : '#1C1E22', onClick: () => this.setState({ opl: { id: m.id, l: id }, optQ: '' }) }; });
    const sel = cur ? (isEq ? 'Por equivalencia · ' + EQ[cur] : (all[cur] && all[cur].codigo ? all[cur].codigo + ' · ' : '') + cur) : '';
    return { selShow: !!cur, sel, onClear: () => pick(''), tabs,
      onTabKeys: e => { const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return; e.preventDefault(); const b = [...e.currentTarget.querySelectorAll('[role=tab]')], k = Math.max(0, b.indexOf(document.activeElement)), n = b[(k + d + b.length) % b.length]; n.focus(); n.click(); },
      isSem: tab === 'sem', semRows: exp ? O[exp].map(o => row(o.titulo, '', o.codigo, o.titulo)) : [],
      semLbl: exp ? this.motor.sLbl(exp) : '', alts: [['all', 'Buscar en todas', '⌕'], ['mano', 'De otra carrera', '+'], ['eq', 'Por equivalencia', '⇄']].map(([id, label, icon]) => ({ label, icon, onClick: () => this.setState({ opl: { id: m.id, l: id }, optQ: '' }) })),
      backShow: tab !== 'sem' && !!exp, backLbl: exp ? 'Volver al ' + this.motor.sLbl(exp) : '', onBack: () => this.setState({ opl: { id: m.id, l: 'sem' }, optQ: '' }),
      isAll: tab === 'all', q, onQ: e => this.setState({ optQ: String(e.target.value).slice(0, 40) }), allRows: allL.map(o => row(o.titulo, o.sems.map(short).join(' · '), o.codigo, o.titulo)), allNone: !allL.length,
      isMano: tab === 'mano', mano: isCat || isEq ? '' : cur, onMano: e => pick(String(e.target.value).slice(0, 80)),
      isEq: tab === 'eq', eqRows: Object.keys(EQ).map(k => row(EQ[k], k.includes('intercambio') ? 'Te la reconocieron de otra universidad' : 'Te la reconocieron de otra carrera de UdeSA', '', k)) };
  }
  chooseOff(c, rid, slot, o) { if (!slot) return; const cur = this.motor.inscIds(c).slice(); if (!rid && !cur.includes(slot)) cur.push(slot); this.setState(s => ({ insc: cur, pick: null, notas: { ...s.notas, [rid || slot]: o.titulo } })); }
  trap(e) {
    const d = [...document.querySelectorAll('[role=dialog]')].pop(); if (!d) return;
    const f = [...d.querySelectorAll('button:not([disabled]),a[href],input,select,[tabindex]:not([tabindex="-1"])')].filter(x => x.offsetParent !== null);
    if (!f.length) return; const i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && (i === -1 || i === f.length - 1)) { e.preventDefault(); f[0].focus(); }
  }
  removeSem(c, cal) {
    const s = this.state, M = this.motor.materialize(c), k = this.motor.calK(cal), sh = x => this.motor.sId(this.motor.sIdx(x) - 1), plan = {};
    Object.keys(M.plan).forEach(id => { const v = M.plan[id]; plan[id] = this.motor.calK(v) > k ? sh(v) : v; });
    this.setState({ plan, insc: M.insc, semCount: Math.max(1, M.semCount - 1), intSem: s.intSem && this.motor.calK(s.intSem) > k ? sh(s.intSem) : s.intSem });
  }
  moveTo(c, id, cal) {
    const s = this.state; if (cal && cal === s.intSem) return;
    const M = this.motor.materialize(c), c0 = this.motor.semAt(0).cal;
    if ((cal === c0 && M.insc.includes(id)) || (cal && cal !== c0 && M.plan[id] === cal) || (!cal && !M.insc.includes(id) && !M.plan[id])) return this.setState({ drag: null, dropOver: null });
    const insc = M.insc.filter(i => i !== id); delete M.plan[id];
    if (cal === c0) insc.push(id); else if (cal) M.plan[id] = cal;
    this.setState({ plan: M.plan, insc, semCount: M.semCount, drag: null, dropOver: null });
  }
  measure() {
    const s = this.state, g = this.gridEl, act = s.sel || s.hover; let lines = [];
    if (g && act && s.planId && s.screen === 'app' && s.view === 'hoy' && s.w >= 760) {
      const c = this.motor.build(), m = c.by[act];
      if (m) {
        const gr = g.getBoundingClientRect();
        const pos = id => { const el = g.querySelector('[data-mid="' + id + '"]'); if (!el) return null; const r = el.getBoundingClientRect(); return { l: r.left - gr.left, r: r.right - gr.left, y: r.top - gr.top + r.height / 2 }; };
        const cv = (x1, y1, x2, y2) => { const dx = Math.max(24, (x2 - x1) * .5); return 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' C' + (x1 + dx).toFixed(1) + ' ' + y1.toFixed(1) + ',' + (x2 - dx).toFixed(1) + ' ' + y2.toFixed(1) + ',' + x2.toFixed(1) + ' ' + y2.toFixed(1); };
        const b = pos(act);
        if (b) {
          const any = new Set([].concat(...(m.reqAny || [])).filter(id => !(m.req || []).includes(id)));
          this.motor.allReq(m).forEach(id => { const a = pos(id); if (a) lines.push({ d: cv(a.r, a.y, b.l, b.y), k: any.has(id) ? 'any' : 'in', x: b.l, y: b.y }); });
          c.kids[act].forEach(id => { const a = pos(id); if (a) lines.push({ d: cv(b.r, b.y, a.l, a.y), k: 'out', x: a.l, y: a.y }); });
        }
      }
    }
    const key = JSON.stringify(lines);
    if (key !== this._lk) { this._lk = key; this.setState({ lines }); }
  }

  setAprob(id, v) { this.setState(s => { const aprob = { ...s.aprob }; if (v) aprob[id] = true; else delete aprob[id]; const plan = s.plan ? { ...s.plan } : null; if (plan) delete plan[id]; return { aprob, plan, insc: s.insc ? s.insc.filter(x => x !== id) : null }; }); }
  select(id) { this.setState(s => ({ sel: s.sel === id ? null : id, hover: null })); }
  editInsc(c, fn) { const cur = this.motor.inscIds(c).slice(); this.setState({ insc: fn(cur), pick: null }); }
  exportObj() {
    const s = this.state, notas = {}; Object.keys(s.notas).forEach(k => { if (s.notas[k]) notas[k] = s.notas[k]; });
    return { version: 2, plan: s.planId, anio: s.anio, inscripcionSemestre: this.motor.semAt(0).cal, nombre: s.nombreExp || undefined, aprobadas: this.motor.keys(s.aprob), inscripcion: s.insc, semestres: s.plan, cantidadSemestres: s.semCount || undefined, intercambio: s.intSem ? { semestre: s.intSem, reconocer: this.motor.keys(s.intRec) } : null, notas };
  }
  download() {
    const blob = new Blob([JSON.stringify(this.exportObj(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'mi-cursada-plan-' + this.state.planId + '.json';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  loadFile(e) {
    if (!this.D) return;
    const f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return;
    const fail = msg => this.setState(Object.assign(this.fresh(), { error: msg }));
    if (f.size > 100 * 1024) return fail('El archivo es demasiado grande. ' + ARCHIVO_INVALIDO);
    const rd = new FileReader();
    rd.onerror = () => fail(ARCHIVO_INVALIDO);
    rd.onload = () => { const r = leerProgreso(String(rd.result), this.motor.P3(), this.motor); if (r.error) return fail(r.error); this.setState(Object.assign(this.fresh(), r.estado)); };
    rd.readAsText(f);
  }

  cardVM(m, c, rel) {
    const s = this.state, st = c.st(m.id), isAct = (s.sel || s.hover) === m.id, owed = st !== 'aprobada' && !libre(m) && m.anio < s.anio, on = st === 'aprobada';
    const v = Object.assign({}, {
      aprobada: { bg: '#1C1E22', fg: '#FFFFFF', sub: '#C9CBD0', ol: 'none', sh: 'none', label: 'Aprobada' },
      disponible: { bg: '#FFFFFF', fg: '#1C1E22', sub: '#3A3D44', ol: 'none', sh: 'inset 0 0 0 1.5px #1C1E22', label: m.anio > s.anio && !(libre(m) && s.anio >= 2) ? 'Podrías adelantarla' : 'Podés cursarla' },
      bloqueada: { bg: '#F4F4F1', fg: '#3A3D44', sub: '#3A3D44', ol: '1.5px dashed #8A8F98', sh: 'none', label: this.motor.falta(c.ev[m.id], c.by) },
    }[st]);
    const picked = !on && this._pick && this._pick.has(m.id), pickable = !on && st === 'disponible' && !this._isInt;
    if (picked) Object.assign(v, { bg: '#E0005A', fg: '#FFFFFF', sub: '#FFFFFF', ol: 'none', sh: 'none', label: 'A cursar el próximo semestre' });
    if (isAct) { v.sh = (on ? '0 0 0 3px #FFFFFF, 0 0 0 5px #1C1E22' : 'inset 0 0 0 3px #1C1E22') + ', 0 6px 18px rgba(22,23,26,.18)'; v.ol = 'none'; }
    let tag = owed ? 'Debés' : '', tagBg = '#C2004C', op = 1;
    if (rel) { tag = ''; if (rel.any.has(m.id)) { const n = rel.any.get(m.id); tag = n === 2 ? 'Una de dos' : 'Una de ' + n; tagBg = '#4A4F58'; } else if (rel.in.has(m.id)) { tag = 'Necesita'; tagBg = '#1C1E22'; } else if (rel.out.has(m.id)) { tag = 'Habilita'; tagBg = '#C2004C'; } else if (!isAct) op = .45; }
    const offNow = m.cat === 'optativa' && !on && this.motor.ofertas(this.motor.semAt(0).cal), nota = m.cat === 'optativa' && s.notas[m.id];
    const offL = !nota && offNow && (picked || pickable) && m.anio === this._optAnio ? offNow.map(o => o.titulo) : null, alias = nota ? nota : !offL && m.dictadoComo ? 'Se dicta como ' + m.dictadoComo : '';
    return Object.assign(v, { id: m.id, nombre: m.corto, alias, aliasShow: !!alias, offs: offL || [], offShow: !!offL, offRule: picked ? 'rgba(255,255,255,.35)' : '#E2E3DF', semShow: !!c.att[m.id], semName: c.att[m.id] ? c.att[m.id].nombre.replace('Seminario de Profundización Tecnológica', 'Seminario') : '', semBg: on ? '#3A3C43' : picked ? '#B8004A' : '#F0F0EC', semFg: on || picked ? '#FFFFFF' : '#1C1E22', semBd: on ? '#4A4D55' : picked ? '#9E0040' : '#D5D6D2', op, tag, tagShow: !!tag, tagBg, pressed: picked || pickable ? !!picked : s.sel === m.id, on,
      iBg: picked ? '#FFFFFF' : '#1C1E22', iFg: picked ? '#E0005A' : '#FFFFFF', focus: on || picked ? '#FFFFFF' : '#1C1E22', chkHov: on ? '#3A3C43' : picked ? '#C2004C' : '#F0F0EC', boxBd: on || picked ? '#FFFFFF' : '#5E636B', sideShow: pickable || picked, infoLbl: 'Correlativas de ' + m.nombre, onInfo: () => this.select(m.id),
      aria: m.nombre + '. ' + v.label + (owed ? '. La debés, es de ' + m.anio + '° año' : '') + (picked ? '. Sacar de tu inscripción' : pickable ? '. Sumar a tu inscripción' : '. Ver correlativas'),
      onClick: () => { if (picked || pickable) { const c2 = this.motor.build(); this.editInsc(c2, cur => cur.includes(m.id) ? cur.filter(x => x !== m.id) : cur.concat(m.id)); if (this.state.sel && this.state.sel !== m.id) this.setState({ sel: null }); } else this.select(m.id); }, onEnter: () => { if (!this.state.sel && this.state.hover !== m.id) this.setState({ hover: m.id }); } });
  }

  renderVals() {
    const s = this.state, K = App, w = s.w, mob = w < 760, wide = w >= 1180;
    const L = {
      side: mob ? '16px' : '32px', brandFs: mob ? '18px' : '21px', arrLen: mob ? '14px' : '26px', lockFs: mob ? '13px' : '15px', brandUni: mob ? 'UdeSA' : 'Universidad de San Andrés', navGap: mob ? '6px' : '12px', stepPad: mob ? '10px 10px' : '14px 18px', stepFs: mob ? '14px' : '18px', stepDir: mob ? 'column' : 'row', stepAlign: mob ? 'flex-start' : 'center', stepInGap: mob ? '6px' : '10px', arrW: mob ? '44px' : '32px', arrH: mob ? '44px' : '28px', heroSize: mob ? '60px' : (w < 1100 ? '104px' : '136px'), stepSize: mob ? '38px' : '64px', h1: mob ? '38px' : '56px',
      planCols: mob ? '1fr' : '1fr 1fr', anioSize: mob ? '34px' : '56px', stepGap: mob ? '10px' : '28px',
      cargaTop: mob ? '20px 16px 16px' : '28px 32px 24px', cargaGrid: mob ? '0 16px 24px' : '0 32px 32px', yearCols: mob ? '1fr' : (w < 1180 ? 'repeat(2,minmax(0,1fr))' : 'repeat(4,minmax(0,1fr))'),
      bigNum: mob ? '72px' : '104px', mainCols: wide ? 'minmax(0,1fr) 340px' : '1fr', gridOrder: wide ? 0 : 1, railOrder: wide ? 1 : 3, railPos: wide ? 'sticky' : 'static', railTop: '150px', 
      laneCols: (w < 1000 ? '116px' : '132px') + ' repeat(4,minmax(0,1fr))', laneSize: w < 1000 ? '11px' : '12px', laneLs: w < 1000 ? '.02em' : '.05em', faltaCols: wide ? '1fr' : 'repeat(auto-fit,minmax(170px,1fr))',
      inscCols: wide ? 'minmax(0,1fr) 400px' : '1fr', rowSize: mob ? '19px' : '22px', pickCols: mob ? '1fr' : 'repeat(auto-fill,minmax(220px,1fr))',
      intCols: wide ? 'minmax(260px,auto) minmax(0,1fr)' : '1fr',
      boardDir: mob ? 'column' : 'row', semW: mob ? '100%' : '232px', addSemW: mob ? '100%' : '160px', addSemH: mob ? '72px' : '240px',
      cardPad: mob ? '18px' : '28px', posterPad: mob ? '10px' : '20px',
      shAlign: mob ? 'flex-end' : 'stretch', shW: mob ? '100%' : '440px', shMaxH: mob ? '86vh' : '100vh', shRad: mob ? '18px 18px 0 0' : '0',
    };
    const P3 = this.motor.P3();
    const base = {
      L, mob, desk: !mob, fileRef: this.fileRef, onFile: e => this.loadFile(e), stop: e => e.stopPropagation(),
      isOnb: s.screen === 'inicio', isCarga: s.screen === 'carga' && !!s.planId && s.ready, isApp: s.screen === 'app' && !!s.planId && s.ready,
      avisoShow: !!s.aviso, avisoTitulo: s.aviso ? s.aviso.titulo : '', avisoTexto: s.aviso ? s.aviso.texto : '', onCerrarAviso: () => this.setState({ aviso: null }),
      step0: s.step === 0, stepN: s.step > 0, step1: s.step === 1, step2: s.step === 2, errorShow: !!s.error || !!s.loadErr, errorTitle: s.loadErr ? 'No pudimos cargar el plan de estudios' : 'No pudimos abrir ese archivo', error: s.loadErr ? 'Revisá tu conexión y recargá la página.' : (s.error || ''),
      onRadioKeys: e => { const k = e.key, d = k === 'ArrowRight' || k === 'ArrowDown' ? 1 : k === 'ArrowLeft' || k === 'ArrowUp' ? -1 : 0; if (!d) return; e.preventDefault(); const r = [...e.currentTarget.querySelectorAll('[role=radio]')], i = Math.max(0, r.indexOf(document.activeElement)), n = r[(i + d + r.length) % r.length]; n.focus(); n.click(); },
      stepTitle: s.step === 1 ? '¿Qué plan cursás?' : '¿Qué año estás cursando?', stepAria: 'Paso ' + s.step + ' de 2', step2Bar: s.step === 2 ? '#FF0064' : '#3A3C43',
      onEmpezar: () => this.setState({ step: 1, error: null }), onCargarClick: () => this.fileRef.current && this.fileRef.current.click(),
      onVolver: () => this.setState({ step: s.step - 1 }),
      planOpts: s.ready ? ['2023', '2027'].map(id => ({ label: P3[id].nombre, sub: P3[id].ingreso, onClick: () => this.setState({ planId: id, anio: null, step: 2 }) })) : [],
      anioOpts: [1, 2, 3, 4].map(n => { const on = s.anio === n; return { n, sel: on, tab: on || (!s.anio && n === 1) ? 0 : -1, bg: on ? '#FFFFFF' : '#22232A', fg: on ? '#16171A' : '#FFFFFF', bd: on ? '#FFFFFF' : '#34363D', onClick: () => this.setState({ anio: n }) }; }),
      noAnio: !s.anio, contBg: s.anio ? '#E0005A' : '#34363D', contFg: s.anio ? '#FFFFFF' : '#9EA1A8',
      onContinuar: () => { if (!s.anio) return; const aprob = Object.fromEntries(P3[s.planId].materias.filter(m => m.anio < s.anio).map(m => [m.id, true])); this.setState({ aprob, insc: null, plan: null, semCount: 0, screen: 'carga' }); },
      planNombre: s.planId && s.ready ? P3[s.planId].nombre : '', anio: s.anio || '',
    };
    if (!s.ready || !s.planId) return base;

    const c = this.motor.build(), semAll = Object.values(c.att), total = c.mats.length + semAll.length, apN = c.ap.size, R = c.P.reglas;

    // Carga
    const prev = s.anio === 2 ? '1° año' : '1° a ' + (s.anio - 1) + '° año';
    const cargaCols = [1, 2, 3, 4].map(a => {
      const items = c.mats.filter(m => m.anio === a), allOn = items.every(m => s.aprob[m.id]);
      return { title: a + '° año', allLabel: allOn ? 'Desmarcar' : 'Marcar todo',
        onAll: () => this.setState(st => { const aprob = { ...st.aprob }; items.forEach(m => { if (allOn) delete aprob[m.id]; else aprob[m.id] = true; }); return { aprob }; }),
        groups: K.LANES.map(([cat, label]) => ({ label, items: items.filter(m => m.cat === cat).map(m => { const on = !!s.aprob[m.id];
          return { nombre: m.corto, on, bg: on ? '#F4F4F1' : '#FFFFFF', bd: on ? '#1C1E22' : '#E2E3DF', mark: on ? '✓' : '', boxBg: on ? '#1C1E22' : 'transparent', boxBd: on ? '#1C1E22' : '#8A8F98', toggle: () => this.setAprob(m.id, !on) }; }) })).filter(g => g.items.length) };
    });
    const cargaSub = s.anio > 1 ? 'Marcamos ' + prev + '. Destildá lo que debas y sumá lo que ya aprobaste de ' + s.anio + '°.' : 'Marcá lo que ya aprobaste.';

    // Pasos
    const order = ['hoy', 'insc', 'proy'], curI = order.indexOf(s.view);
    const info0 = this.motor.semAt(0), isIntNow = info0.cal === s.intSem;
    this._pick = new Set(this.motor.inscIds(c)); this._isInt = isIntNow;
    // Las ofertas de optativas se muestran solo en las del año más próximo: son las que podrías cursar ahora
    const optP = c.pend.filter(m => m.cat === 'optativa'); this._optAnio = optP.length ? Math.min(...optP.map(m => m.anio)) : 0;
    const steps = [['hoy', 'Hoy', 'Elegí qué cursar'], ['insc', 'Inscripción', 'Revisala y ajustala'], ['proy', mob ? 'Semestres' : 'Próximos semestres', 'Cómo sigue tu cursada']].map(([id, label, sub], i) => { const on = s.view === id, done = i < curI;
      return { n: done ? '✓' : String(i + 1), label, sub, cur: on ? 'step' : 'false', bg: on ? '#1C1E22' : '#FFFFFF', bd: on ? '#1C1E22' : '#D5D6D2', subFg: on ? '#C9CBD0' : '#4A4F58', fg: on ? '#FFFFFF' : '#1C1E22', bar: on ? '#E0005A' : done ? '#1C1E22' : '#E2E3DF',
        cBg: on ? '#E0005A' : done ? '#1C1E22' : '#FFFFFF', cFg: on || done ? '#FFFFFF' : '#1C1E22', cBd: on ? '#E0005A' : done ? '#1C1E22' : '#8A8F98',
        onClick: () => this.setState({ view: id, sel: null, hover: null, pick: null }) }; });

    // Hoy
    const act = s.sel || s.hover, am = act && c.by[act];
    const rel = am && c.hasReq && (this.motor.allReq(am).length || c.kids[act].length) ? { in: new Set(this.motor.allReq(am)), out: new Set(c.kids[act]), any: new Map((am.reqAny || []).flatMap(g => g.filter(id => !(am.req || []).includes(id)).map(id => [id, g.length]))) } : null;
    const yearSegs = a => c.mats.concat(semAll).filter(m => m.anio === a && !libre(m)).map(m => { const ap = c.ap.has(m.id), owed = !ap && a < s.anio; return { bg: ap ? '#1C1E22' : owed ? '#C2004C' : '#E2E3DF' }; });
    const yTxt = a => { const ms = c.mats.concat(semAll).filter(m => m.anio === a && !libre(m)); return ms.filter(m => c.ap.has(m.id)).length + '/' + ms.length; };
    const yearHeads = [1, 2, 3, 4].map(a => ({ label: a + '° año', cur: a === s.anio, txt: yTxt(a), segs: yearSegs(a), bg: a === s.anio ? '#FCEFF4' : 'transparent' }));
    const lanes = K.LANES.map(([cat, label]) => { const ms = c.mats.filter(m => m.cat === cat);
      return { label, count: ms.filter(m => c.ap.has(m.id)).length + ' de ' + ms.length, cells: [1, 2, 3, 4].map(a => ({ bg: a === s.anio ? '#FDF7F9' : 'transparent', cards: ms.filter(m => m.anio === a).map(m => this.cardVM(m, c, rel)) })) }; }).filter(l => l.cells.some(x => x.cards.length));
    const mobLanes = K.LANES.map(([cat, label]) => ({ label, cards: c.mats.filter(m => m.cat === cat && m.anio === s.mYear).map(m => this.cardVM(m, c, null)) })).filter(l => l.cards.length);
    const yearTabs = [1, 2, 3, 4].map(a => ({ label: a + '°', txt: yTxt(a), cur: s.mYear === a, bg: s.mYear === a ? '#1C1E22' : '#FFFFFF', fg: s.mYear === a ? '#FFFFFF' : '#1C1E22', onClick: () => this.setState({ mYear: a }) }));
    const fLanes = semAll.length ? [K.LANES[0], ['seminario', 'Seminarios'], ...K.LANES.slice(1)] : K.LANES;
    const faltaCats = fLanes.map(([cat, label]) => { const ms = cat === 'seminario' ? semAll : c.mats.filter(m => m.cat === cat), h = ms.filter(m => c.ap.has(m.id)).length;
      return { label, left: ms.length - h, total: ms.length, big: ms.length - h ? String(ms.length - h) : '✓', small: ms.length - h ? 'de ' + ms.length : 'Completo', segs: ms.map((m, i) => ({ bg: i < h ? '#1C1E22' : '#E2E3DF' })) }; }).filter(x => x.total > 0);
    const owedNow = c.pend.filter(m => !libre(m) && m.anio < s.anio).sort((a, b) => a.anio - b.anio);

    let det = {}; const dm = s.sel && c.by[s.sel];
    if (dm) {
      const st = c.st(dm.id), e = c.ev[dm.id], isAp = c.ap.has(dm.id);
      const reqs = [...(dm.reqAny || []).map(g => { const ok = g.some(id => c.ap.has(id)); return { nombre: g.map(id => c.by[id].nombre).join(' o '), glyph: ok ? '✓' : '○', lbl: ok ? 'Aprobada' : 'Una de las dos', onClick: () => this.select(g[0]) }; })].concat((dm.req || []).map(id => { const ok = c.ap.has(id); return { nombre: c.by[id].nombre, glyph: ok ? '✓' : '○', lbl: ok ? 'Aprobada' : 'Por cursar', onClick: () => this.select(id) }; }));
      const meters = dm.cant ? [['talleres aprobados', e.haveT, e.needT], ['materias aprobadas', e.haveN, e.needN]].filter(x => x[2] > 0).map(([lbl, h, n]) => ({ label: n + ' ' + lbl, txt: h >= n ? '✓ Cumplido' : 'Tenés ' + h, fg: h >= n ? '#1C1E22' : '#B0003A', segs: Array.from({ length: n }, (_, i) => ({ bg: i < h ? '#1C1E22' : '#E2E3DF' })) })) : [];
      const habs = c.kids[dm.id].map(id => ({ nombre: c.by[id].nombre, lbl: c.by[id].anio + '° año', onClick: () => this.select(id) }));
      const owed = !isAp && !libre(dm) && dm.anio < s.anio;
      det = Object.assign(this.progOf(dm), { alias: [dm.dictadoComo && 'Se dicta como ' + dm.dictadoComo, c.att[dm.id] && 'Se cursa junto con ' + c.att[dm.id].nombre].filter(Boolean).join(' · '), aliasShow: !!(dm.dictadoComo || c.att[dm.id]) }); Object.assign(det, { nombre: dm.nombre, eyebrow: [K.CAT[dm.cat], dm.anio + '° año', dm.codigo].filter(Boolean).join(' · '),
        estado: { aprobada: '✓ Aprobada', disponible: dm.anio > s.anio && !(libre(dm) && s.anio >= 2) ? '○ Podrías adelantarla' : '○ Podés cursarla', bloqueada: '⊘ ' + this.motor.falta(e, c.by) }[st] + (owed ? ' · La debés' : ''),
        toggleLbl: isAp ? 'Marcar por cursar' : 'Marcar aprobada', btnBg: isAp ? '#FFFFFF' : '#1C1E22', btnFg: isAp ? '#1C1E22' : '#FFFFFF', btnBd: isAp ? '#C9CBD0' : '#1C1E22',
        onToggle: () => this.setAprob(dm.id, !isAp),
        showNote: dm.cat === 'optativa' && isAp, op: dm.cat === 'optativa' && isAp ? this.optPicker(dm) : null, note: s.notas[dm.id] || '', onNote: ev2 => { const v = String(ev2.target.value).slice(0, 80); this.setState(x => ({ notas: { ...x.notas, [dm.id]: v } })); },
        reqs, meters, sinReq: !reqs.length && !meters.length, sinReqText: dm.sinDefinir ? 'Correlativas a definir.' : 'Nada: se puede cursar desde el inicio.',
        habShow: c.hasReq, habs, sinHab: !habs.length });
    }

    // Inscripción
    const tpl0 = this.motor.tpl(c, info0.year, info0.half), ids = this.motor.inscIds(c), idSet = new Set(ids), rec = this.motor.recIds(c), recSet = new Set(rec);
    const sug = this.motor.suggestion(c), edited = !!s.insc && ids.slice().sort().join() !== sug.slice().sort().join();
    const availNow = this.motor.disponibles(c);
    const ya = m => libre(m) ? Math.max(2, info0.year) : m.anio;
    const yTag = m => libre(m) ? 'De 2° a 4° año' : m.anio < info0.year ? 'Debés · ' + m.anio + '° año' : m.anio > info0.year ? 'Adelantás · ' + m.anio + '° año' : m.anio + '° año';
    const byCat = {}; ids.forEach(id => (byCat[c.by[id].cat] = byCat[c.by[id].cat] || []).push(id));
    const rows = [];
    K.LANES.forEach(([cat]) => { const have = byCat[cat] || [], n = Math.max(tpl0[cat] || 0, have.length); for (let i = 0; i < n; i++) rows.push({ key: cat + i, cat, id: have[i] || null }); });
    const rowVMs = rows.map(r => {
      const m = r.id && c.by[r.id], open = s.pick === r.key;
      const swap = nid => this.editInsc(c, cur => { if (r.id) { const i = cur.indexOf(r.id); if (nid) cur[i] = nid; else cur.splice(i, 1); } else if (nid) cur.push(nid); return cur; });
      const opts = availNow.filter(x => x.cat === r.cat && (!idSet.has(x.id) || x.id === r.id));
      const gdef = [['Debés de años anteriores', x => ya(x) < info0.year, '#B0003A'], ['De ' + info0.year + '° año', x => ya(x) === info0.year, '#3A3D44'], ['Para adelantar', x => ya(x) > info0.year, '#3A3D44']];
      const offs = r.cat === 'optativa' ? this.motor.ofertas(info0.cal) : null, slotFor = r.id || (opts[0] && opts[0].id);
      const groups = offs ? [{ label: 'Se ofrecen en el ' + this.motor.sLbl(info0.cal), fg: '#3A3D44', opts: offs.map(o => { const on = !!r.id && s.notas[r.id] === o.titulo; return { nombre: o.titulo, sub: o.tema, on, mark: on ? '✓' : '', bg: on ? '#1C1E22' : '#FFFFFF', fg: on ? '#FFFFFF' : '#1C1E22', meta: on ? '#C9CBD0' : '#4A4F58', bd: on ? '#1C1E22' : '#E2E3DF', onClick: () => this.chooseOff(c, r.id, slotFor, o) }; }) }] : gdef.map(([label, f, fg]) => ({ label, fg, opts: opts.filter(f).map(x => { const on = x.id === r.id;
        return { nombre: x.nombre, sub: x.anio + '° año' + (c.att[x.id] ? ' · + ' + c.att[x.id].nombre.replace('Seminario de Profundización Tecnológica', 'Seminario') : '') + (x.cat !== 'taller' && x.codigo ? ' · ' + x.codigo : ''), on, mark: on ? '✓' : '', bg: on ? '#1C1E22' : '#FFFFFF', fg: on ? '#FFFFFF' : '#1C1E22', meta: on ? '#C9CBD0' : '#4A4F58', bd: on ? '#1C1E22' : '#E2E3DF', onClick: () => swap(x.id) }; }) })).filter(g => g.opts.length);
      const alts = opts.filter(x => x.id !== r.id && !idSet.has(x.id) && !x.ultimo && ya(x) <= info0.year).slice(0, 3), altsOff = offs ? offs.filter(o => !(r.id && s.notas[r.id] === o.titulo)).slice(0, 3) : null;
      const e = m && c.ev[m.id], err = e && !e.ok ? 'No la podés cursar todavía: ' + this.motor.falta(e, c.by).toLowerCase() + '.' : '';
      const tag = m && !libre(m) ? (m.anio < info0.year ? 'Debés · ' + m.anio + '° año' : m.anio > info0.year ? 'Adelantás · ' + m.anio + '° año' : '') : '';
      const art = r.cat === 'taller' ? 'un taller' : r.cat === 'transversal' ? 'un taller transversal' : r.cat === 'cf' ? 'una del Ciclo de Fundamentos' : 'una ' + K.CAT[r.cat].toLowerCase();
      return { code: m && m.codigo ? m.codigo : '', codeShow: !!(m && m.codigo), semShow: !!(m && c.att[m.id]), semName: m && c.att[m.id] ? c.att[m.id].nombre.replace('Seminario de Profundización Tecnológica', 'Seminario') : '', catLbl: K.CAT[r.cat], has: !!m, sub: m ? (offs && s.notas[m.id] ? 'Cuenta como ' + m.nombre : m.dictadoComo ? 'Se dicta como ' + m.dictadoComo : '') : '', subShow: !!m && !!((offs && s.notas[m.id]) || m.dictadoComo), nombre: m ? (offs && s.notas[m.id] ? s.notas[m.id] : m.nombre) : (opts.length ? 'Elegí ' + art : 'No hay disponibles'), nameFg: m ? '#1C1E22' : '#4A4F58',
        tag: m ? tag : 'Lugar libre', tagShow: !m || !!tag, tagBg: !m ? '#5E636B' : m.anio < info0.year ? '#C2004C' : '#3A3D44', open, rot: open ? '180deg' : '0deg',
        openLbl: (m ? K.CAT[r.cat] + ': ' + m.nombre + '. Cambiar' : 'Elegir ' + art), onOpen: () => this.setState({ pick: open ? null : r.key }),
        onRemove: () => swap(null), rmLbl: m ? 'Quitar ' + m.nombre : '', groups, none: !groups.length,
        err, errShow: !!err, sh: err ? '0 0 0 2px #B0003A' : open ? '0 0 0 2px #1C1E22, 0 8px 24px rgba(22,23,26,.10)' : 'none',
        // Un lugar sin materia se ve vacío: borde punteado, sin fondo y con el tag Lugar libre
        bg: m || open ? '#FFFFFF' : 'transparent', ol: m || open || err ? 'none' : '1.5px dashed #8A8F98',
        altsShow: !open && (altsOff ? altsOff.length : alts.length) > 0, altsLbl: altsOff ? 'Disponibles este semestre:' : m ? 'Alternativas:' : 'Podés tomar:', alts: altsOff ? altsOff.map(o => ({ nombre: o.titulo, aria: 'Elegir ' + o.titulo, onClick: () => this.chooseOff(c, r.id, slotFor, o) })) : alts.map(x => ({ nombre: x.corto + (c.att[x.id] ? ' + ' + c.att[x.id].nombre.replace('Seminario de Profundización Tecnológica', 'Seminario') : ''), aria: (m ? 'Cambiar por ' : 'Elegir ') + x.nombre, onClick: () => swap(x.id) })) };
    });
    const addOpen = s.pick === 'add', addPool = availNow.filter(m => !idSet.has(m.id));
    const add = { open: addOpen, icon: addOpen ? '−' : '+', label: addOpen ? 'Cerrar' : 'Sumar materia', bd: addOpen ? '#1C1E22' : '#8A8F98', bg: addOpen ? '#FFFFFF' : 'transparent',
      onOpen: () => this.setState({ pick: addOpen ? null : 'add' }),
      groups: K.LANES.map(([cat, label]) => ({ label, opts: addPool.filter(m => m.cat === cat).map(m => ({ nombre: m.nombre, sub: yTag(m), onClick: () => this.editInsc(c, cur => cur.concat(m.id)) })) })).filter(g => g.opts.length) };

    // Chequeo
    const { items, extra } = this.motor.chequeo(c), ms = ids.map(id => c.by[id]);
    this._extra = extra ? 'Con esta inscripción tu cursada suma un semestre.' : '';
    const nBad = items.filter(i => i.t === 'bad').length, nWarn = items.filter(i => i.t === 'warn').length;
    const IC = { ok: ['✓', '#7FD3A0'], warn: ['!', '#FFB547'], bad: ['×', '#FF6B8F'] };
    const chk = { icon: nBad ? '×' : nWarn ? '!' : '✓', iconBg: nBad ? '#FF6B8F' : nWarn ? '#FFB547' : '#7FD3A0',
      title: info0.cal === s.intSem ? 'Semestre de intercambio' : !ms.length ? (c.pend.length ? 'Todavía no sumaste materias' : '¡Aprobaste todo el plan!') : nBad ? 'Inscripción fuera de regla' : nWarn ? (nWarn === 1 ? 'Revisá una cosa' : 'Revisá ' + nWarn + ' cosas') : 'Tu inscripción está en orden',
      items: items.map(i => ({ icon: IC[i.t][0], bg: IC[i.t][1], title: i.title, sub: i.sub || '', subShow: !!i.sub })),
      mail: !!(nBad || nWarn), foot: nBad || nWarn ? 'Para pedir cambios o autorizaciones, escribile a la carrera:' : '' };

    // Próximos semestres
    const pr = this.motor.project(c), manual = !!s.plan, cals = pr.sems.filter(x => !x.isInt).map(x => x.cal);
    const dz = cal => ({
      onDragOver: e => { if (cal && cal === s.intSem) return; e.preventDefault(); const k = cal || 'pool'; if (this.state.dropOver !== k) this.setState({ dropOver: k }); },
      onDrop: e => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain') || this.state.drag; if (id) this.moveTo(c, id, cal); else this.setState({ dropOver: null }); } });
    const dragH = id => ({ onDragStart: e => { e.dataTransfer.setData('text/plain', id); e.dataTransfer.effectAllowed = 'move'; this.setState({ drag: id }); }, onDragEnd: () => this.setState({ drag: null, dropOver: null }) });
    const yOf = x => { const ys = x.ids.map(id => c.by[id] && c.by[id].anio).filter(Boolean); if (!ys.length) return Math.min(4, x.yearReal); const f = {}; ys.forEach(y => f[y] = (f[y] || 0) + 1); return +Object.keys(f).sort((a, b) => f[b] - f[a] || b - a)[0]; };
    let acc = new Set(c.ap);
    const lastF = pr.sems.filter(x => x.ids.length && !x.isInt).map(x => x.cal).pop();
    const proy = pr.sems.map((x, i) => {
      const before = new Set(acc); x.ids.forEach(id => { acc.add(id); if (c.att[id]) acc.add(c.att[id].id); });
      const first = i === 0, isInt = !!x.isInt, over = s.dropOver === x.cal, ci = cals.indexOf(x.cal);
      const ms2 = x.ids.map(id => c.by[id]).filter(Boolean).sort((a, b) => K.SHOW[a.cat] - K.SHOW[b.cat]), t2 = ms2.filter(m => m.cat === 'taller').length, warns = [];
      if (first && !manual && this._extra) warns.push(this._extra);
      if (!isInt && t2 > 1) warns.push('Para cursar ' + t2 + ' talleres necesitás una excepción de la carrera. Escribí a diseno@udesa.edu.ar.');
      const w2 = ms2.reduce((q, m) => q + 1 + (c.att[m.id] ? 1 : 0), 0);
      if (!isInt && w2 > R.maxMaterias) warns.push('No están permitidas más de ' + R.maxMaterias + ' materias.');
      else if (!isInt && x.k != null && t2 <= 1 && ms2.reduce((q, m) => q + 1 + (c.att[m.id] ? 1 : 0), 0) > this.motor.semNorm(c, x.k, new Set(c.ap), new Set()).cap) warns.push('Lo recomendado son ' + this.motor.semNorm(c, x.k, new Set(c.ap), new Set()).cap + ' materias. Consultalo con la carrera.');
      return Object.assign({ dot: first ? '#E0005A' : isInt ? '#1C1E22' : '#FFFFFF', dotBd: first ? '#E0005A' : '#1C1E22', eyebrow: first ? 'En tu inscripción' : (yOf(x) <= 4 ? yOf(x) + '° año' : 'Después de 4°'), label: this.motor.sLbl(x.cal), full: this.motor.sLbl(x.cal), isInt,
        eyeBg: first ? '#E0005A' : isInt ? '#3A3C43' : '#F0F0EC', eyeFg: first || isInt ? '#FFFFFF' : '#1C1E22',
        count: isInt ? '' : x.ids.length ? this.motor.pl(x.ids.reduce((q, id) => q + 1 + (c.att[id] ? 1 : 0), 0), 'materia') : '', canDel: !first && !isInt && !x.ids.length, delLbl: 'Quitar el ' + this.motor.sLbl(x.cal), onDel: () => this.removeSem(c, x.cal), cntFg: isInt ? '#C9CBD0' : '#3A3D44',
        bg: isInt ? '#16171A' : over ? '#FFF0F5' : '#FFFFFF', fg: isInt ? '#FFFFFF' : '#1C1E22', bd: over ? '#E0005A' : '#1C1E22', bdW: over ? '2px' : first ? '2px' : '0',
        warns, empty: !isInt && !x.ids.length,
        items: ms2.map(m => {
          const e = this.motor.evalRule(m, before, c.by), notLast = m.ultimo && !isInt && x.cal !== lastF, note = notLast ? 'Te sugerimos cursarla en tu último semestre.' : '', warn = notLast ? '' : !isInt && !e.ok ? 'Antes necesitás ' + (e.ids.length ? this.motor.join(e.ids.map(id => this.motor.reqName(id, c.by))) : this.motor.join([e.t && this.motor.pl(e.t, 'taller', 'talleres'), e.n && this.motor.pl(e.n, 'materia')].filter(Boolean)) + ' más') : '';
          const prevCal = ci > 0 ? cals[ci - 1] : null, nextCal = ci >= 0 && ci < cals.length - 1 ? cals[ci + 1] : null;
          return Object.assign({ nombre: (m.cat === 'optativa' && s.notas[m.id]) || m.corto, cat: isInt ? 'A reconocer' : K.CAT[m.cat], drag: !isInt, cursor: isInt ? 'default' : 'grab', op: s.drag === m.id ? .4 : 1,
            bg: isInt ? '#26272E' : '#FFFFFF', fg: isInt ? '#FFFFFF' : '#1C1E22', catFg: isInt ? '#C9CBD0' : '#4A4F58', bd: isInt ? '#26272E' : warn ? '#E39A2D' : '#E2E3DF', focus: isInt ? '#FFFFFF' : '#1C1E22',
            warn, warnShow: !!warn, note, noteShow: !!note, onOpen: () => this.setState({ sel: m.id }), onTap: () => this.setState(isInt ? { sel: m.id } : { moveId: m.id }), moveLbl: isInt ? m.nombre + ', a reconocer en intercambio' : m.nombre + ', en el ' + this.motor.sLbl(x.cal) + '. Mover',
            noPrev: !prevCal, prevVis: ci > 0 ? 'visible' : 'hidden', prevOp: prevCal ? 1 : .3, prevLbl: 'Mover ' + m.nombre + ' al semestre anterior', nextLbl: 'Mover ' + m.nombre + ' al semestre siguiente',
            onPrev: () => { if (prevCal) this.moveTo(c, m.id, prevCal); },
            onNext: () => { if (nextCal) this.moveTo(c, m.id, nextCal); else { const M = this.motor.materialize(c); const nk = M.semCount; let cal = this.motor.semAt(nk).cal; this.setState({ semCount: nk + 1 }, () => this.moveTo(c, m.id, cal)); } } }, dragH(m.id));
        }) }, dz(x.cal));
    });
    const pool = Object.assign({ count: this.motor.pl(pr.unplaced.length, 'materia'), bg: s.dropOver === 'pool' ? '#FFF0F5' : 'transparent', bd: s.dropOver === 'pool' ? '#E0005A' : '#C9CBD0',
      cards: pr.unplaced.map(id => { const m = c.by[id]; return Object.assign({ onMove: () => this.setState({ moveId: id }), moveLbl: 'Ubicar ' + m.nombre, nombre: m.corto, cat: K.CAT[m.cat], op: s.drag === id ? .4 : 1, onOpen: () => this.setState({ sel: id }), nextLbl: 'Mover ' + m.nombre + ' al ' + this.motor.sLbl(cals[0]), onNext: () => this.moveTo(c, id, cals[0]) }, dragH(id)); }) }, dz(null));
    const filled = pr.sems.filter(x => x.ids.length || x.isInt), lastCal = filled.length ? filled[filled.length - 1].cal : null;
    const proyStats = filled.length ? [1] : [], proyRange = filled.length ? this.motor.pl(filled.length, 'semestre') + ', del ' + this.motor.sLbl(cals[0]) + ' al ' + this.motor.sLbl(lastCal) : '', semParts = cal => { const [y, hh] = (cal || '-').split('-'); return { h: hh + '° semestre', y }; };
    const proySub = mob ? 'Tocá una materia para moverla de semestre.' : 'Arrastrá materias entre semestres para armarlo a tu manera.';

    const intCands = [];
    for (let k = 0; k < 10; k++) { const x = this.motor.semAt(k); if (R.intercambio.some(([y, h]) => x.yearReal === y && x.half === h)) intCands.push(x); }
    const intOpts = [{ label: 'No', cal: null }, ...intCands.map(x => ({ label: this.motor.sLbl(x.cal) + ' · ' + x.yearReal + '° año', cal: x.cal }))].map(o => { const on = (s.intSem || null) === o.cal;
      return { label: o.label, on, tab: on ? 0 : -1, bg: on ? '#1C1E22' : '#FFFFFF', fg: on ? '#FFFFFF' : '#1C1E22', bd: on ? '#1C1E22' : '#C9CBD0', onClick: () => this.setState(this.motor.conIntercambio(this.motor.build(), o.cal)) }; });
    const recOptN = rec.filter(id => c.by[id].cat === 'optativa').length;
    const recSel = rec.map(id => ({ nombre: c.by[id].corto, rmLbl: 'Quitar ' + c.by[id].nombre, onRemove: () => this.setState(x => { const intRec = { ...x.intRec }; delete intRec[id]; return { intRec }; }) }));
    const recPool = c.pend.filter(m => !recSet.has(m.id));
    const addRec = id => this.setState(x => { const plan = x.plan ? { ...x.plan } : null; if (plan) delete plan[id]; return { intRec: { ...x.intRec, [id]: true }, plan, insc: x.insc ? x.insc.filter(i => i !== id) : null, recOpen: false }; });
    const recGroups = [['Optativas', m => m.cat === 'optativa'], ['Otras materias', m => m.cat !== 'optativa']].map(([label, f]) => ({ label, opts: recPool.filter(f).map(m => { const dis = m.cat === 'optativa' && recOptN >= R.maxReconocerOptativas; return { nombre: m.nombre, dis, op: dis ? .45 : 1, onClick: () => { if (!dis) addRec(m.id); } }; }) })).filter(g => g.opts.length);
    let intEfecto = '', later = false;
    if (s.intSem) { const a = this.motor.autoProject(c, null, []).filter(x => x.ids.length).length, b = this.motor.autoProject(c, s.intSem, rec).filter(x => x.ids.length || x.isInt).length; later = b > a; intEfecto = later ? (b - a === 1 ? 'Con el intercambio sumás un semestre.' : 'Con el intercambio sumás ' + (b - a) + ' semestres.') : 'El intercambio no suma semestres.'; }

    // Póster
    const posterScale = Math.min(1, (s.pw || Math.min(w - 120, 1000)) / 1123);
    const pSet = new Set(ids);
    const pYears = [1, 2, 3, 4].map(a => ({ label: a + '° año', txt: yTxt(a) }));
    const pLanes = K.LANES.map(([cat, label]) => ({ label, cells: [1, 2, 3, 4].map(a => ({ boxes: c.mats.filter(m => m.cat === cat && m.anio === a).map(m => { const ap = c.ap.has(m.id), nx = pSet.has(m.id);
      return { nombre: m.corto + (s.notas[m.id] ? ' · ' + s.notas[m.id] : ''), bg: ap ? '#1C1E22' : '#FFFFFF', fg: ap ? '#FFFFFF' : '#1C1E22', bd: ap ? '#1C1E22' : nx ? '#E0005A' : '#C9CBD0' }; }) })) })).filter(l => l.cells.some(x => x.boxes.length));
    const pSemsAll = pr.sems.filter(x => x.ids.length || x.isInt).slice(0, 7);
    const pSemsTitle = pSemsAll.filter(x => !x.isInt).length === 1 ? 'Último semestre' : 'Próximos semestres';
    const pSems = pSemsAll.map((x, i) => { const yr = x.cal.split('-')[0], prevYr = i ? pSemsAll[i - 1].cal.split('-')[0] : yr; return { label: this.motor.sLbl(x.cal), isInt: !!x.isInt, ml: i === 0 ? '0' : yr !== prevYr ? '18px' : '6px', items: x.ids.map(id => (c.by[id].cat === 'optativa' && s.notas[id]) || c.by[id].corto), bg: x.isInt ? '#1C1E22' : i === 0 ? '#FCEFF4' : '#F4F4F1', fg: x.isInt ? '#FFFFFF' : '#1C1E22', itemBg: x.isInt ? '#2E3036' : '#FFFFFF' }; });

    const lineCol = { in: '#1C1E22', any: '#1C1E22', out: '#E0005A' };
    const linesEl = React.createElement('svg', { 'aria-hidden': 'true', width: '100%', height: '100%', style: { position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, overflow: 'visible' } },
      s.lines.map((l, i) => React.createElement('g', { key: i },
        React.createElement('path', { d: l.d, fill: 'none', stroke: '#FFFFFF', strokeWidth: 6, strokeLinecap: 'round' }),
        React.createElement('path', { d: l.d, fill: 'none', stroke: lineCol[l.k], strokeWidth: 2.25, strokeLinecap: 'round', strokeDasharray: l.k === 'any' ? '2 5' : undefined }),
        React.createElement('circle', { cx: l.x, cy: l.y, r: 3.5, fill: lineCol[l.k] }))));

    const detRail = !!dm && wide && s.view === 'hoy';
    const mv = s.moveId && c.by[s.moveId], where = {}; pr.sems.forEach(x => x.ids.forEach(id => where[id] = x.cal));
    const moveOpts = mv ? [...cals.map((cal, i) => ({ cal, label: this.motor.sLbl(cal), sub: i === 0 ? 'En tu inscripción' : '' })), { cal: null, label: 'Sin semestre', sub: '' }].map(o => { const on = (where[mv.id] || null) === o.cal;
      return { label: o.label, sub: o.sub, subShow: !!o.sub, on, mark: on ? '✓' : '', bg: on ? '#1C1E22' : '#FFFFFF', fg: on ? '#FFFFFF' : '#1C1E22', bd: on ? '#1C1E22' : '#E2E3DF', onClick: () => { this.setState({ moveId: null }); if (!on) this.moveTo(c, mv.id, o.cal); } }; }) : [];
    return Object.assign(base, {
      moveShow: !!mv, moveNombre: mv ? mv.nombre : '', moveOpts, onMoveClose: () => this.setState({ moveId: null }), onMoveDet: () => this.setState({ sel: s.moveId, moveId: null }),
      onMoveNew: () => { if (!mv) return; const M = this.motor.materialize(c), cal = this.motor.semAt(M.semCount).cal; this.setState({ semCount: M.semCount + 1, moveId: null }, () => this.moveTo(c, mv.id, cal)); },
      apN, total, apAria: apN + ' de ' + total + ' materias aprobadas', cargaCols, cargaSub, onListo: () => this.setState({ screen: 'app', view: 'hoy', sel: null, mYear: s.anio }), onVolverAnio: () => this.setState({ screen: 'inicio', step: 2 }),
      glyph: [{ bg: '#FF0064', sh: 'none', sc: 1 }, ...[0, 1, 2].map(i => { const ci = ['hoy', 'insc', 'proy'].indexOf(s.view); return i < ci ? { bg: '#FFFFFF', sh: 'none', sc: 1 } : i === ci ? { bg: 'transparent', sh: 'inset 0 0 0 2px #FFFFFF', sc: 1 } : { bg: '#3A3C43', sh: 'none', sc: .78 }; })],
      steps, vHoy: s.view === 'hoy', vInsc: s.view === 'insc', vProy: s.view === 'proy',
      onReset: () => this.setState({ modal: 'reset' }), onExport: () => this.setState({ modal: 'export' }),
      yearHeads, lanes, mobLanes, yearTabs, legendBase: !rel || mob, legendRel: !!rel && !mob, legendAny: !!rel && rel.any.size > 0, actNombre: am ? am.corto : '',
      gridRef: this.gridRef, onGridLeave: () => { if (this.state.hover) this.setState({ hover: null }); }, linesEl,
      trk: (() => {
        const T = {}; const sugIds = [].concat(this.motor.suggestion(c) || []); sugIds.forEach(id => { const m = c.by[id]; if (m) T[m.cat] = (T[m.cat] || 0) + 1; }); const pk = [...this._pick].map(id => c.by[id]).filter(Boolean), cnt = {}; pk.forEach(m => cnt[m.cat] = (cnt[m.cat] || 0) + 1);
        const NM = { taller: ['Taller', 'Talleres'], transversal: ['Taller transversal', 'Talleres transversales'], obligatoria: ['Obligatoria', 'Obligatorias'], optativa: ['Optativa', 'Optativas'], cf: ['Ciclo de Fundamentos', 'Ciclo de Fundamentos'] };
        const semTpl = sugIds.filter(id => c.att[id]).length, semHave = pk.filter(m => c.att[m.id]).length;
        if (semTpl || semHave) { T.seminario = semTpl; cnt.seminario = semHave; NM.seminario = ['Seminario', 'Seminarios']; }
        const cats = ['taller', ...(semTpl || semHave ? ['seminario'] : []), 'transversal', 'obligatoria', 'optativa', 'cf'].filter(cat => (T[cat] || 0) > 0 || cnt[cat]).map(cat => { const n = T[cat] || 0, have = cnt[cat] || 0, slots = [];
          for (let i = 0; i < Math.max(n, have); i++) { const f = i < have, extra = i >= n; slots.push({ bg: f ? (extra ? '#FFB547' : '#E0005A') : 'transparent', sh: f ? 'none' : 'inset 0 0 0 1.5px #5E636B', mark: f ? (extra ? '+' : '✓') : '', sc: f ? 1 : .92 }); }
          const lack = Math.max(0, n - have), over = Math.max(0, have - n);
          return { label: NM[cat][n > 1 || have > 1 ? 1 : 0], slots, lack, sub: lack ? (cat === 'seminario' ? 'Viene con el taller' : lack === 1 ? 'Lugar libre' : lack + ' lugares libres') : over ? (n ? over + ' de más' : 'No va este semestre') : '✓ Cubierto', subFg: lack ? '#C9CBD0' : over ? '#FFB547' : '#7FD3A0', aria: NM[cat][1] + ': ' + have + ' de ' + n }; });
        // El estado sale del mismo chequeo que el paso 2, así los dos pasos dicen lo mismo
        const overT = cats.some(x => x.subFg === '#FFB547'), top = items.find(i => i.t === 'bad') || items.find(i => i.t === 'warn'), sumar = items.find(i => i.sub && i.sub.includes('Todavía podés sumar'));
        const txt = i => i.title + '.' + (i.sub ? ' ' + i.sub : '');
        const [icon, iconBg, status] = isIntNow ? ['✓', '#7FD3A0', 'Semestre de intercambio'] : top ? (top.t === 'bad' ? ['×', '#FF6B8F', 'Inscripción fuera de regla. ' + txt(top)] : ['!', '#FFB547', txt(top)]) : sumar ? ['…', '#C9CBD0', sumar.sub] : overT ? ['!', '#FFB547', 'Tenés más de lo recomendado.'] : ['✓', '#7FD3A0', 'Están todos los lugares cubiertos.'];
        return { isInt: isIntNow, cats: isIntNow ? [] : cats, count: isIntNow ? '' : this.motor.pl(pk.reduce((q, m) => q + 1 + (c.att[m.id] ? 1 : 0), 0), 'materia'), icon, iconBg, status,
          // En la barra de abajo (celular y tablet) va solo el título: el detalle está en el paso 2
          statusCorto: !isIntNow && top ? (top.t === 'bad' ? 'Inscripción fuera de regla. ' : '') + top.title + '.' : status };
      })(),
      trkRail: wide && !detRail,
      hoySub: isIntNow ? 'Este semestre te vas de intercambio.' : 'Arrancás con una propuesta que cuida tus correlativas: tocá cualquier materia para sumarla o sacarla.',
      onEditAprob: () => this.setState({ screen: 'carga', sel: null, hover: null }),
      faltaShow: !detRail, faltaCats, debes: owedNow.map(m => ({ nombre: m.nombre, anio: m.anio, onClick: () => this.select(m.id) })), debesShow: owedNow.length > 0, debesTitle: owedNow.length === 1 ? '1 de años anteriores' : owedNow.length + ' de años anteriores',
      ctaRail: wide, ctaBottom: !wide, detRail, detSheet: !!dm && !detRail, det, onCloseDet: () => this.setState({ sel: null }),
      goInsc: () => this.setState({ view: 'insc', sel: null, hover: null }), goProy: () => this.setState({ view: 'proy', pick: null }),
      inscSem: this.motor.sLbl(info0.cal), inscFecha: this.motor.fechaCambios(info0.cal), inscFechaShow: !!this.motor.fechaCambios(info0.cal), inscYear: info0.yearReal <= 4 ? info0.yearReal + '° año' : 'Lo que te queda',
      inscSub: edited ? 'Si algo no coincide con lo que te asignó el Departamento de Alumnos, cambialo acá para chequearlo.' : 'Compará con lo que te asignó el Departamento de Alumnos y cambiá lo que sea distinto para chequearlo.',
      inscIsInt: info0.cal === s.intSem, rows: info0.cal === s.intSem ? [] : rowVMs, inscCuentaShow: info0.cal !== s.intSem && rowVMs.length > 0, inscCuenta: (() => { const nW = ids.reduce((a, id) => a + 1 + (c.att[id] ? 1 : 0), 0), semis = ids.filter(id => c.att[id]).map(id => 'el ' + c.att[id].nombre.replace('Seminario de Profundización Tecnológica', 'Seminario')), libres = rowVMs.filter(r => !r.has).length;
        return { n: this.motor.pl(nW, 'materia'), resto: (semis.length ? ', contando ' + this.motor.join(semis) : '') + (libres ? ' · ' + (libres === 1 ? '1 lugar libre' : libres + ' lugares libres') : '') }; })(), addShow: addPool.length > 0 && info0.cal !== s.intSem, add,
      edited, onRestore: () => this.setState({ insc: null, pick: null }), chk,
      manual, onResetPlan: () => this.setState({ plan: null, semCount: 0 }), proyRange, proyTitle: filled.length === 1 ? 'Último semestre' : 'Próximos semestres', proySame: filled.length === 1, proyRangeShow: filled.length !== 1, proyN: String(filled.length), proyNLbl: filled.length === 1 ? 'semestre' : 'semestres', proyA: semParts(cals[0]), proyB: semParts(lastCal), proyMetaShow: proyStats.length > 0, proySub, proy, poolShow: pr.unplaced.length > 0, pool,
      onAddSem: () => { const M = this.motor.materialize(c); this.setState({ plan: M.plan, insc: M.insc, semCount: M.semCount + 1 }); },
      intAvail: intCands.length > 0, intNo: !intCands.length, intOpts, intOn: !!s.intSem, recSel, recOpen: s.recOpen, onRecOpen: () => this.setState({ recOpen: !s.recOpen }), recGroups, intEfecto, intFg: later ? '#8A4500' : '#1C1E22',
      modalShow: !!s.modal, mReset: s.modal === 'reset', mExport: s.modal === 'export', modalTitle: s.modal === 'reset' ? '¿Volver a empezar?' : 'Exportar', modalW: s.modal === 'export' ? '1100px' : '520px',
      onCloseModal: () => this.setState({ modal: null }), onDescargarJson: () => this.download(), onReiniciar: () => this.setState(this.fresh()),
      nombreExp: s.nombreExp, onNombreExp: ev2 => this.setState({ nombreExp: String(ev2.target.value).slice(0, 80) }), onImprimir: () => window.print(),
      posterScale: posterScale.toFixed(4), posterH: Math.round(794 * posterScale) + 'px', posterName: s.nombreExp || 'Tu nombre', posterNameFg: s.nombreExp ? '#1C1E22' : '#C9CBD0',
      posterMeta: new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }),
      pYears, pLanes, pSems, pSemsTitle, pSemN: Math.max(1, pSems.length), posterRef: this.posterRef,
    });
  }
}
