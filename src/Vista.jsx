// Vista de la app. Salió de la plantilla de la v8 (index.html + support.js) con un conversor que
// respeta su semántica: {{ }} → expresiones sobre `v`, <sc-if> → condicional, <sc-for> → map con clave
// por índice, style-hover/style-focus → clases de src/estilos.css.
import { Fragment } from 'react';

export default function Vista({ v }) {
  return (
    <div style={{ minHeight: "100vh", fontFamily: "Roboto,system-ui,sans-serif", color: "#1C1E22" }}>
      <input type="file" accept=".json,application/json" aria-label="Abrir archivo de progreso" tabIndex="-1" ref={v.fileRef} onChange={v.onFile} style={{ display: "none" }} />
      {v.isOnb ? (
        <div data-screen-label="Inicio" style={{ minHeight: "100vh", background: "#16171A", color: "#FFFFFF", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: `24px ${v.L.side}`, display: "flex", alignItems: "center", gap: "10px" }}>
            <span aria-hidden="true" style={{ flex: "none", width: "12px", height: "12px", background: "#FF0064", borderRadius: "2px" }}></span>
            <span style={{ display: "flex", alignItems: "baseline", gap: "6px", fontSize: "15px", lineHeight: "1.2", color: "#FFFFFF", whiteSpace: "nowrap" }}>
              <span style={{ fontWeight: "700" }}>Diseño</span>
              <span style={{ fontWeight: "400" }}>Universidad de San Andrés</span>
            </span>
          </div>
          <main style={{ flex: "1", display: "flex", alignItems: "center", padding: `24px ${v.L.side} 64px` }}>
            <div style={{ width: "100%", maxWidth: "880px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "40px" }}>
              {v.step0 ? (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <h1 style={{ margin: "0", fontSize: `${v.L.heroSize}`, lineHeight: ".92", fontWeight: "900", letterSpacing: "-.045em" }}>
                      Planificá
                      <br />
                      tu cursada
                      <span style={{ color: "#FF0064" }}>.</span>
                    </h1>
                    <p style={{ margin: "0", maxWidth: "540px", fontSize: "20px", lineHeight: "1.45", color: "#C9CBD0", textWrap: "pretty" }}>Cómo venís, si tu inscripción está en orden y cómo siguen tus próximos semestres.</p>
                  </div>
                  {v.errorShow ? (
                    <div role="alert" style={{ maxWidth: "560px", display: "flex", flexDirection: "column", gap: "4px", borderLeft: "4px solid #FFB547", background: "#24252A", padding: "14px 18px", borderRadius: "0 8px 8px 0" }}>
                      <span style={{ fontWeight: "700", fontSize: "15px" }}>{v.errorTitle}</span>
                      <span style={{ fontSize: "14px", lineHeight: "1.45", color: "#C9CBD0" }}>{v.error}</span>
                    </div>
                  ) : null}
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <button className="hv1 fo1" onClick={v.onEmpezar} style={{ all: "unset", cursor: "pointer", background: "#E0005A", color: "#FFFFFF", fontWeight: "700", fontSize: "17px", padding: "17px 32px", borderRadius: "10px" }}>Empezar</button>
                    <button className="hv2 fo1" onClick={v.onCargarClick} style={{ all: "unset", cursor: "pointer", whiteSpace: "nowrap", color: "#FFFFFF", fontWeight: "500", fontSize: "17px", padding: "15px 28px", borderRadius: "10px", border: "1.5px solid #4A4C53" }}>Tengo mi archivo</button>
                  </div>
                  <span style={{ fontSize: "14px", lineHeight: "1.5", color: "#9EA1A8", textWrap: "balance" }}>No guardamos información de tu cursada. Para retomarla otro día, descargá tu archivo.</span>
                </>
              ) : null}
              {v.stepN ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <button className="hv2 fo2" onClick={v.onVolver} aria-label="Volver" style={{ all: "unset", cursor: "pointer", width: "44px", height: "44px", borderRadius: "50%", border: "1.5px solid #4A4C53", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>←</button>
                    <div role="img" aria-label={v.stepAria} style={{ display: "flex", gap: "6px" }}>
                      <span style={{ width: "40px", height: "4px", borderRadius: "2px", background: "#FF0064" }}></span>
                      <span style={{ width: "40px", height: "4px", borderRadius: "2px", background: `${v.step2Bar}` }}></span>
                    </div>
                  </div>
                  <h1 style={{ margin: "0", fontSize: `${v.L.stepSize}`, lineHeight: "1", fontWeight: "900", letterSpacing: "-.035em" }}>{v.stepTitle}</h1>
                  {v.step1 ? (
                    <div style={{ display: "grid", gridTemplateColumns: `${v.L.planCols}`, gap: "16px" }}>
                      {v.planOpts.map((p, i) => (
                        <button key={i} className="hv3 fo1" onClick={p.onClick} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "flex", flexDirection: "column", gap: "10px", padding: "28px", borderRadius: "14px", background: "#22232A", border: "1.5px solid #34363D" }}>
                          <span style={{ fontSize: "48px", fontWeight: "900", letterSpacing: "-.03em", lineHeight: "1" }}>{p.label}</span>
                          <span style={{ fontSize: "15px", color: "#C9CBD0" }}>{p.sub}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {v.step2 ? (
                    <>
                      <div role="radiogroup" aria-label="Año que estás cursando" onKeyDown={v.onRadioKeys} style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: "12px", maxWidth: "640px" }}>
                        {v.anioOpts.map((o, i) => (
                          <button key={i} className="fo1" role="radio" aria-checked={o.sel} tabIndex={o.tab} onClick={o.onClick} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "4px", padding: "20px", borderRadius: "14px", background: `${o.bg}`, border: `1.5px solid ${o.bd}`, color: `${o.fg}` }}>
                            <span style={{ fontSize: `${v.L.anioSize}`, fontWeight: "900", letterSpacing: "-.03em", lineHeight: "1" }}>{o.n}°</span>
                            <span style={{ fontSize: "14px", fontWeight: "500" }}>año</span>
                          </button>
                        ))}
                      </div>
                      <button className="fo1" onClick={v.onContinuar} disabled={v.noAnio} style={{ all: "unset", cursor: "pointer", alignSelf: "flex-start", background: `${v.contBg}`, color: `${v.contFg}`, fontWeight: "700", fontSize: "17px", padding: "17px 32px", borderRadius: "10px" }}>Continuar</button>
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>
          </main>
          <div style={{ padding: `0 ${v.L.side} 24px`, display: "flex", justifyContent: "flex-end" }}>
            <img src="assets/logo-diseno-blanco.png" alt="Diseño UdeSA" width="46" height="37" style={{ display: "block", width: "46px", height: "auto", opacity: ".85" }} />
          </div>
        </div>
      ) : null}
      {v.isCarga ? (
        <div data-screen-label="Aprobadas" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <div style={{ width: "100%", maxWidth: "1440px", margin: "0 auto", padding: `24px ${v.L.side} 0`, display: "flex", alignItems: "center", gap: "10px" }}>
            <span aria-hidden="true" style={{ flex: "none", width: "12px", height: "12px", background: "#FF0064", borderRadius: "2px" }}></span>
            <span style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "0 6px", fontSize: `${v.L.lockFs}`, lineHeight: "1.2", color: "#1C1E22" }}>
              <span style={{ fontWeight: "700" }}>Diseño</span>
              <span style={{ fontWeight: "400" }}>Universidad de San Andrés</span>
            </span>
          </div>
          <div style={{ width: "100%", maxWidth: "1440px", margin: "0 auto", padding: `${v.L.cargaTop}`, display: "flex", flexDirection: "column", gap: "12px" }}>
            <button className="hv4 fo3" onClick={v.onVolverAnio} style={{ all: "unset", cursor: "pointer", alignSelf: "flex-start", fontSize: "14px", fontWeight: "500", color: "#4A4F58", padding: "6px 0", whiteSpace: "nowrap" }}>← {v.planNombre} · {v.anio}° año</button>
            <h1 style={{ margin: "0", fontSize: `${v.L.h1}`, fontWeight: "900", letterSpacing: "-.035em", lineHeight: "1" }}>¿Qué aprobaste?</h1>
            <p style={{ margin: "0", fontSize: "17px", color: "#3A3D44", lineHeight: "1.5", maxWidth: "620px", textWrap: "pretty" }}>{v.cargaSub}</p>
          </div>
          <div style={{ flex: "1", width: "100%", maxWidth: "1440px", margin: "0 auto", padding: `${v.L.cargaGrid}`, display: "grid", gridTemplateColumns: `${v.L.yearCols}`, gap: "20px", alignItems: "start" }}>
            {v.cargaCols.map((col, i) => (
              <section key={i} aria-label={col.title} style={{ minWidth: "0", display: "flex", flexDirection: "column", gap: "14px", background: "#FFFFFF", borderRadius: "14px", padding: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <h2 style={{ margin: "0", fontSize: "22px", fontWeight: "900", letterSpacing: "-.02em" }}>{col.title}</h2>
                  <button className="hv5 fo4" onClick={col.onAll} style={{ all: "unset", cursor: "pointer", fontSize: "13px", fontWeight: "700", padding: "8px 12px", borderRadius: "8px", background: "#EEEEEA" }}>{col.allLabel}</button>
                </div>
                {col.groups.map((g, i) => (
                  <div key={i} role="group" aria-label={g.label} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".08em", textTransform: "uppercase", color: "#5E636B" }}>{g.label}</span>
                    {g.items.map((k, i) => (
                      <button key={i} className="fo4" onClick={k.toggle} role="checkbox" aria-checked={k.on} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "flex", gap: "12px", alignItems: "center", minHeight: "44px", padding: "9px 12px", borderRadius: "8px", background: `${k.bg}`, border: `1.5px solid ${k.bd}` }}>
                        <span aria-hidden="true" style={{ flex: "none", width: "20px", height: "20px", borderRadius: "5px", border: `2px solid ${k.boxBd}`, background: `${k.boxBg}`, color: "#FFFFFF", fontSize: "13px", fontWeight: "900", display: "flex", alignItems: "center", justifyContent: "center" }}>{k.mark}</span>
                        <span style={{ minWidth: "0", fontSize: "14px", fontWeight: "500", lineHeight: "1.25", overflowWrap: "anywhere" }}>{k.nombre}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </section>
            ))}
          </div>
          <div style={{ position: "sticky", bottom: "0", background: "#16171A", color: "#FFFFFF" }}>
            {" "}
            <div style={{ maxWidth: "1440px", margin: "0 auto", padding: `14px ${v.L.side}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "16px" }}>
                <strong style={{ fontSize: "24px", fontWeight: "900" }}>{v.apN}</strong>
                {" de "}{v.total} aprobadas
              </span>
              <button className="hv1 fo1" onClick={v.onListo} style={{ all: "unset", cursor: "pointer", background: "#E0005A", color: "#FFFFFF", fontWeight: "700", fontSize: "16px", padding: "14px 28px", borderRadius: "10px" }}>Listo</button>
            </div>
            {" "}
          </div>
        </div>
      ) : null}
      {v.isApp ? (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <header style={{ position: "sticky", top: "0", zIndex: "30", background: "#FFFFFF", boxShadow: "0 1px 0 #E2E3DF" }}>
            {" "}
            <div style={{ maxWidth: "1680px", margin: "0 auto", padding: `12px ${v.L.side}`, display: "flex", alignItems: "center", gap: "12px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: "1 1 auto", minWidth: "0" }}>
                <span aria-hidden="true" style={{ flex: "none", width: "12px", height: "12px", background: "#FF0064", borderRadius: "2px" }}></span>
                <span style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "0 6px", fontSize: `${v.L.lockFs}`, lineHeight: "1.2", color: "#1C1E22" }}>
                  <span style={{ fontWeight: "700" }}>Diseño</span>
                  <span style={{ fontWeight: "400" }}>Universidad de San Andrés</span>
                </span>
              </div>
              <div style={{ flex: "none", display: "flex", gap: "4px 8px", alignItems: "center" }}>
                <button className="hv6 fo5" onClick={v.onReset} aria-label="Volver a empezar" title="Volver a empezar" style={{ all: "unset", boxSizing: "border-box", minHeight: "44px", display: "flex", alignItems: "center", cursor: "pointer", fontSize: "14px", fontWeight: "500", color: "#3A3D44", padding: "10px 12px", borderRadius: "8px", whiteSpace: "nowrap" }}>
                  {v.desk ? <>Volver a empezar</> : null}
                  {v.mob ? (
                    <span aria-hidden="true" style={{ fontSize: "20px", lineHeight: "1" }}>↺</span>
                  ) : null}
                </button>
                <button className="hv7 fo4" onClick={v.onExport} style={{ all: "unset", boxSizing: "border-box", minHeight: "44px", cursor: "pointer", display: "flex", gap: "8px", alignItems: "center", fontSize: "14px", fontWeight: "700", color: "#FFFFFF", background: "#E0005A", padding: "11px 18px", borderRadius: "9px", whiteSpace: "nowrap" }}>
                  <span aria-hidden="true" style={{ fontSize: "15px" }}>↓</span>
                  <span>Exportar</span>
                </button>
              </div>
            </div>
            {" "}
            <nav aria-label="Pasos" style={{ maxWidth: "1680px", margin: "0 auto", padding: `4px ${v.L.side} 14px`, display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: `${v.L.navGap}` }}>
              {v.steps.map((t, i) => (
                <button key={i} className="hv8 fo6" onClick={t.onClick} aria-current={t.cur} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", minWidth: "0", display: "flex", flexDirection: `${v.L.stepDir}`, alignItems: `${v.L.stepAlign}`, gap: `${v.L.stepInGap}`, padding: `${v.L.stepPad}`, borderRadius: "14px", background: `${t.bg}`, boxShadow: `inset 0 0 0 1.5px ${t.bd}` }}>
                  <span aria-hidden="true" style={{ flex: "none", width: "34px", height: "34px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "900", background: `${t.cBg}`, color: `${t.cFg}`, boxShadow: `inset 0 0 0 1.5px ${t.cBd}` }}>{t.n}</span>
                  <span style={{ minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
                    <span style={{ fontSize: `${v.L.stepFs}`, fontWeight: "900", letterSpacing: "-.01em", color: `${t.fg}`, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.label}</span>
                    {v.desk ? (
                      <span style={{ fontSize: "13px", color: `${t.subFg}`, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.sub}</span>
                    ) : null}
                  </span>
                </button>
              ))}
            </nav>
            {" "}
          </header>
          <main style={{ flex: "1", width: "100%", maxWidth: "1680px", margin: "0 auto", padding: `0 ${v.L.side} 32px` }}>
            {" "}
            {v.avisoShow ? (
              <>
                {" "}
                <div role="status" style={{ marginTop: "24px", maxWidth: "760px", display: "flex", alignItems: "flex-start", gap: "8px", borderLeft: "4px solid #E0005A", background: "#FFFFFF", padding: "12px 6px 12px 18px", borderRadius: "0 8px 8px 0", boxShadow: "inset 0 0 0 1px #E2E3DF" }}>
                  <span style={{ flex: "1", display: "flex", flexDirection: "column", gap: "4px", paddingTop: "2px" }}>
                    <span style={{ fontWeight: "700", fontSize: "15px" }}>{v.avisoTitulo}</span>
                    <span style={{ fontSize: "14px", lineHeight: "1.45", color: "#3A3D44" }}>{v.avisoTexto}</span>
                  </span>
                  <button className="hv9 fo4" onClick={v.onCerrarAviso} aria-label="Cerrar aviso" style={{ all: "unset", cursor: "pointer", flex: "none", width: "44px", height: "44px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", color: "#1C1E22" }}>×</button>
                </div>
                {" "}
              </>
            ) : null}
            {" "}
            {v.vHoy ? (
              <>
                {" "}
                <div data-screen-label="1 Hoy" style={{ display: "flex", flexDirection: "column", gap: "24px", paddingTop: "32px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "16px 32px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "0", flex: "1 1 560px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "700", letterSpacing: ".08em", textTransform: "uppercase", color: "#C2004C" }}>{v.inscSem}</span>
                      <h1 style={{ margin: "0", fontSize: `${v.L.h1}`, fontWeight: "900", letterSpacing: "-.035em", lineHeight: "1" }}>¿Qué vas a cursar?</h1>
                      <p style={{ margin: "0", fontSize: "17px", color: "#3A3D44", lineHeight: "1.5", textWrap: "balance" }}>{v.hoySub}</p>
                    </div>
                    <div style={{ flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "12px" }}>
                      <div aria-label={v.apAria} style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}>
                        <span style={{ fontSize: `${v.L.bigNum}`, fontWeight: "900", letterSpacing: "-.05em", lineHeight: ".74" }}>{v.apN}</span>
                        <span style={{ display: "flex", flexDirection: "column", fontSize: "16px", fontWeight: "500", color: "#3A3D44", lineHeight: "1.15", marginBottom: "-2px" }}>
                          <span>de {v.total}</span>
                          <span>aprobadas</span>
                        </span>
                      </div>
                      <button className="hv10 fo4" onClick={v.onEditAprob} style={{ all: "unset", cursor: "pointer", fontSize: "13.5px", fontWeight: "700", color: "#1C1E22", textDecoration: "underline", textUnderlineOffset: "3px", padding: "6px 0", margin: "-4px 0" }}>Editar lo aprobado</button>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: `${v.L.mainCols}`, gap: "24px", alignItems: "start" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px", minWidth: "0", order: `${v.L.gridOrder}` }}>
                      {v.desk ? (
                        <div ref={v.gridRef} onMouseLeave={v.onGridLeave} style={{ position: "relative", background: "#FFFFFF", borderRadius: "16px", overflow: "hidden" }}>
                          {" "}{v.linesEl}{" "}
                          <div style={{ display: "grid", gridTemplateColumns: `${v.L.laneCols}`, borderBottom: "1px solid #E2E3DF" }}>
                            <span style={{ background: "#FAFAF8" }}></span>
                            {v.yearHeads.map((yh, i) => (
                              <div key={i} style={{ minWidth: "0", padding: "16px 12px 14px", display: "flex", flexDirection: "column", gap: "10px", borderLeft: "1px solid #EEEEEA", background: `${yh.bg}` }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                                  <span style={{ fontSize: "20px", fontWeight: "900", letterSpacing: "-.02em" }}>{yh.label}</span>
                                  {yh.cur ? (
                                    <span style={{ fontSize: "10.5px", fontWeight: "900", letterSpacing: ".05em", textTransform: "uppercase", padding: "3px 8px", borderRadius: "999px", background: "#C2004C", color: "#FFFFFF" }}>Estás acá</span>
                                  ) : null}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <div aria-hidden="true" style={{ flex: "1", display: "flex", gap: "2px", height: "8px" }}>
                                    {yh.segs.map((sg, i) => (
                                      <span key={i} style={{ flex: "1", borderRadius: "2px", background: `${sg.bg}` }}></span>
                                    ))}
                                  </div>
                                  <span style={{ flex: "none", fontSize: "12.5px", fontWeight: "700" }}>{yh.txt}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          {" "}
                          {v.lanes.map((ln, i) => (
                            <Fragment key={i}>
                              {" "}
                              <div role="group" aria-label={ln.label} style={{ display: "grid", gridTemplateColumns: `${v.L.laneCols}`, borderBottom: "1px solid #EEEEEA" }}>
                                <div style={{ minWidth: "0", padding: "16px 10px 16px 16px", display: "flex", flexDirection: "column", gap: "3px", background: "#FAFAF8" }}>
                                  <span style={{ fontSize: `${v.L.laneSize}`, fontWeight: "900", letterSpacing: `${v.L.laneLs}`, textTransform: "uppercase", lineHeight: "1.25", hyphens: "none" }}>{ln.label}</span>
                                  <span style={{ fontSize: "12px", color: "#4A4F58" }}>{ln.count}</span>
                                </div>
                                {ln.cells.map((cell, i) => (
                                  <div key={i} style={{ minWidth: "0", padding: "14px 10px", display: "flex", flexDirection: "column", gap: "10px", borderLeft: "1px solid #EEEEEA", background: `${cell.bg}` }}>
                                    {cell.cards.map((c, i) => (
                                      <div key={i} data-mid={c.id} onMouseEnter={c.onEnter} style={{ position: "relative", zIndex: "2", display: "flex", gap: "4px", alignItems: "flex-start", minHeight: "60px", padding: "9px 6px 9px 11px", borderRadius: "9px", background: `${c.bg}`, boxShadow: `${c.sh}`, outline: `${c.ol}`, outlineOffset: "-1.5px", opacity: `${c.op}`, transition: "opacity .2s ease,box-shadow .2s ease" }}>
                                        {c.tagShow ? (
                                          <span style={{ position: "absolute", top: "-9px", left: "10px", fontSize: "10px", fontWeight: "900", letterSpacing: ".05em", textTransform: "uppercase", padding: "2px 7px", borderRadius: "999px", background: `${c.tagBg}`, color: "#FFFFFF" }}>{c.tag}</span>
                                        ) : null}
                                        <button className="hv11 fo7" onClick={c.onClick} onFocus={c.onEnter} aria-pressed={c.pressed} aria-label={c.aria} style={{ all: "unset", cursor: "pointer", flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "4px", paddingTop: "1px" }}>
                                          <span style={{ fontSize: "13.5px", fontWeight: "700", lineHeight: "1.22", color: `${c.fg}`, overflowWrap: "anywhere" }}>{c.nombre}</span>
                                          <span style={{ fontSize: "12px", lineHeight: "1.3", color: `${c.sub}`, overflowWrap: "anywhere" }}>{c.label}</span>
                                          {c.aliasShow ? (
                                            <span style={{ fontSize: "11.5px", lineHeight: "1.3", color: `${c.sub}`, overflowWrap: "anywhere" }}>{c.alias}</span>
                                          ) : null}
                                          {c.offShow ? (
                                            <span style={{ display: "flex", flexDirection: "column", gap: "3px", marginTop: "4px", paddingTop: "6px", borderTop: `1px solid ${c.offRule}` }}>
                                              <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".06em", textTransform: "uppercase", lineHeight: "1.2", color: `${c.sub}` }}>Se ofrecen</span>
                                              {c.offs.map((oferta, i) => (
                                                <span key={i} style={{ fontSize: "12px", fontWeight: "500", lineHeight: "1.3", color: `${c.fg}`, overflowWrap: "anywhere" }}>{oferta}</span>
                                              ))}
                                            </span>
                                          ) : null}
                                          {c.semShow ? (
                                            <span style={{ display: "flex", alignItems: "center", gap: "7px", marginTop: "4px", padding: "6px 8px", borderRadius: "7px", background: `${c.semBg}`, color: `${c.semFg}`, boxShadow: `inset 0 0 0 1px ${c.semBd}` }}>
                                              <span aria-hidden="true" style={{ flex: "none", width: "16px", height: "16px", borderRadius: "50%", background: `${c.semFg}`, color: `${c.semBg}`, fontSize: "12px", fontWeight: "900", lineHeight: "1", display: "flex", alignItems: "center", justifyContent: "center" }}>+</span>
                                              <span style={{ display: "flex", flexDirection: "column", gap: "0", minWidth: "0" }}>
                                                <span style={{ fontSize: "12.5px", fontWeight: "900", lineHeight: "1.2" }}>{c.semName}</span>
                                              </span>
                                            </span>
                                          ) : null}
                                        </button>
                                        {c.sideShow ? (
                                          <button className="fo8" onClick={c.onInfo} aria-label={c.infoLbl} title="Ver correlativas" style={{ all: "unset", cursor: "help", flex: "none", width: "30px", height: "30px", marginTop: "-5px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>
                                            <span aria-hidden="true" style={{ width: "20px", height: "20px", borderRadius: "50%", background: `${c.iBg}`, color: `${c.iFg}`, fontSize: "12px", fontWeight: "900", fontStyle: "italic", fontFamily: "Georgia,serif", lineHeight: "1", display: "flex", alignItems: "center", justifyContent: "center" }}>i</span>
                                          </button>
                                        ) : null}
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                              {" "}
                            </Fragment>
                          ))}
                          {" "}
                        </div>
                      ) : null}
                      {v.mob ? (
                        <>
                          <div role="tablist" aria-label="Año" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "6px" }}>
                            {v.yearTabs.map((yt, i) => (
                              <button key={i} role="tab" aria-selected={yt.cur} onClick={yt.onClick} style={{ all: "unset", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", padding: "10px 4px", borderRadius: "10px", background: `${yt.bg}`, color: `${yt.fg}` }}>
                                <span style={{ fontSize: "16px", fontWeight: "900" }}>{yt.label}</span>
                                <span style={{ fontSize: "11.5px", fontWeight: "500" }}>{yt.txt}</span>
                              </button>
                            ))}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "18px", background: "#FFFFFF", borderRadius: "14px", padding: "16px" }}>
                            {v.mobLanes.map((ln, i) => (
                              <div key={i} role="group" aria-label={ln.label} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                <span style={{ fontSize: "12px", fontWeight: "900", letterSpacing: ".06em", textTransform: "uppercase" }}>{ln.label}</span>
                                {ln.cards.map((c, i) => (
                                  <div key={i} style={{ display: "flex", gap: "6px", alignItems: "center", minHeight: "56px", padding: "6px 6px 6px 14px", borderRadius: "9px", background: `${c.bg}`, boxShadow: `${c.sh}`, outline: `${c.ol}`, outlineOffset: "-1.5px" }}>
                                    <button onClick={c.onClick} aria-label={c.aria} style={{ all: "unset", cursor: "pointer", flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "3px", padding: "4px 0" }}>
                                      {c.tagShow ? (
                                        <span style={{ alignSelf: "flex-start", fontSize: "10px", fontWeight: "900", letterSpacing: ".05em", textTransform: "uppercase", padding: "2px 7px", borderRadius: "999px", background: `${c.tagBg}`, color: "#FFFFFF" }}>{c.tag}</span>
                                      ) : null}
                                      <span style={{ fontSize: "15px", fontWeight: "700", lineHeight: "1.25", color: `${c.fg}` }}>{c.nombre}</span>
                                      <span style={{ fontSize: "13px", color: `${c.sub}` }}>{c.label}</span>
                                      {c.aliasShow ? (
                                        <span style={{ fontSize: "12.5px", lineHeight: "1.3", color: `${c.sub}` }}>{c.alias}</span>
                                      ) : null}
                                      {c.offShow ? (
                                        <span style={{ display: "flex", flexDirection: "column", gap: "3px", marginTop: "4px", paddingTop: "6px", borderTop: `1px solid ${c.offRule}` }}>
                                          <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".06em", textTransform: "uppercase", lineHeight: "1.2", color: `${c.sub}` }}>Se ofrecen</span>
                                          {c.offs.map((oferta, i) => (
                                            <span key={i} style={{ fontSize: "13px", fontWeight: "500", lineHeight: "1.3", color: `${c.fg}`, overflowWrap: "anywhere" }}>{oferta}</span>
                                          ))}
                                        </span>
                                      ) : null}
                                      {c.semShow ? (
                                        <span style={{ display: "flex", alignItems: "center", gap: "7px", marginTop: "4px", padding: "7px 10px", borderRadius: "7px", background: `${c.semBg}`, color: `${c.semFg}`, boxShadow: `inset 0 0 0 1px ${c.semBd}` }}>
                                          <span aria-hidden="true" style={{ flex: "none", width: "16px", height: "16px", borderRadius: "50%", background: `${c.semFg}`, color: `${c.semBg}`, fontSize: "12px", fontWeight: "900", lineHeight: "1", display: "flex", alignItems: "center", justifyContent: "center" }}>+</span>
                                          <span style={{ display: "flex", flexDirection: "column", gap: "0", minWidth: "0" }}>
                                            <span style={{ fontSize: "13.5px", fontWeight: "900", lineHeight: "1.2" }}>{c.semName}</span>
                                          </span>
                                        </span>
                                      ) : null}
                                    </button>
                                    {c.sideShow ? (
                                      <button onClick={c.onInfo} aria-label={c.infoLbl} style={{ all: "unset", cursor: "pointer", flex: "none", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px" }}>
                                        <span aria-hidden="true" style={{ width: "24px", height: "24px", borderRadius: "50%", background: `${c.iBg}`, color: `${c.iFg}`, fontSize: "13px", fontWeight: "900", fontStyle: "italic", lineHeight: "1", fontFamily: "Georgia,serif", display: "flex", alignItems: "center", justifyContent: "center" }}>i</span>
                                      </button>
                                    ) : null}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </>
                      ) : null}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", minHeight: "24px" }}>
                        {v.legendBase ? (
                          <ul aria-label="Referencias" style={{ listStyle: "none", margin: "0", padding: "0", display: "flex", gap: "8px 18px", flexWrap: "wrap", fontSize: "13px", color: "#3A3D44" }}>
                            <li style={{ display: "flex", gap: "7px", alignItems: "center" }}>
                              <span style={{ width: "14px", height: "14px", borderRadius: "3px", background: "#1C1E22" }}></span>
                              Aprobada
                            </li>
                            <li style={{ display: "flex", gap: "7px", alignItems: "center" }}>
                              <span style={{ width: "14px", height: "14px", borderRadius: "3px", background: "#E0005A" }}></span>
                              Vas a cursarla
                            </li>
                            <li style={{ display: "flex", gap: "7px", alignItems: "center" }}>
                              <span style={{ width: "16px", height: "16px", borderRadius: "50%", background: "#1C1E22", color: "#FFFFFF", fontSize: "10px", fontWeight: "900", fontStyle: "italic", fontFamily: "Georgia,serif", display: "flex", alignItems: "center", justifyContent: "center" }}>i</span>
                              Ver correlativas
                            </li>
                            <li style={{ display: "flex", gap: "7px", alignItems: "center" }}>
                              <span style={{ width: "14px", height: "14px", borderRadius: "3px", boxShadow: "inset 0 0 0 1.5px #1C1E22" }}></span>
                              Podés cursarla
                            </li>
                            <li style={{ display: "flex", gap: "7px", alignItems: "center" }}>
                              <span style={{ width: "14px", height: "14px", borderRadius: "3px", border: "1.5px dashed #8A8F98" }}></span>
                              Todavía no
                            </li>
                            <li style={{ display: "flex", gap: "7px", alignItems: "center" }}>
                              <span style={{ fontSize: "10px", fontWeight: "900", letterSpacing: ".05em", textTransform: "uppercase", padding: "2px 7px", borderRadius: "999px", background: "#C2004C", color: "#FFFFFF" }}>Debés</span>
                              De años anteriores
                            </li>
                          </ul>
                        ) : null}
                        {v.legendRel ? (
                          <div style={{ display: "flex", gap: "18px", flexWrap: "wrap", alignItems: "center", fontSize: "13.5px" }}>
                            <strong style={{ fontWeight: "900" }}>{v.actNombre}</strong>
                            <span style={{ display: "flex", gap: "7px", alignItems: "center" }}>
                              <span style={{ width: "22px", height: "3px", borderRadius: "2px", background: "#1C1E22" }}></span>
                              Necesita
                            </span>
                            <span style={{ display: "flex", gap: "7px", alignItems: "center" }}>
                              <span style={{ width: "22px", height: "3px", borderRadius: "2px", background: "#E0005A" }}></span>
                              Habilita
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    {v.ctaBottom ? (
                      <div style={{ order: "2", position: "sticky", bottom: "12px", zIndex: "20", display: "flex", flexDirection: "column", gap: "12px", background: "#16171A", color: "#FFFFFF", borderRadius: "16px", padding: "14px 14px 14px 18px", boxShadow: "0 10px 30px rgba(22,23,26,.28)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", alignItems: "center", gap: "12px" }}>
                          <div role="status" aria-label={v.trk.status} style={{ display: "flex", gap: "10px 14px", flexWrap: "wrap", alignItems: "flex-end" }}>
                            {v.trk.cats.map((tc, i) => (
                              <span key={i} aria-label={tc.aria} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: ".06em", textTransform: "uppercase", color: "#C9CBD0" }}>{tc.label}</span>
                                <span aria-hidden="true" style={{ display: "flex", gap: "4px" }}>
                                  {tc.slots.map((sl, i) => (
                                    <span key={i} style={{ width: "24px", height: "24px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "900", background: `${sl.bg}`, color: "#FFFFFF", boxShadow: `${sl.sh}` }}>{sl.mark}</span>
                                  ))}
                                </span>
                              </span>
                            ))}
                          </div>
                          <button className="hv7 fo2" onClick={v.goInsc} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", background: "#E0005A", color: "#FFFFFF", minHeight: "48px", padding: "0 18px", borderRadius: "10px", fontSize: "16px", fontWeight: "900" }}>
                            Revisar
                            <span aria-hidden="true" style={{ fontSize: "20px" }}>→</span>
                          </button>
                        </div>
                        <span style={{ fontSize: "13px", fontWeight: "500", color: "#E2E3DF" }}>{v.trk.status}</span>
                      </div>
                    ) : null}
                    <aside style={{ position: `${v.L.railPos}`, top: `${v.L.railTop}`, display: "flex", flexDirection: "column", gap: "12px", order: `${v.L.railOrder}`, minWidth: "0" }}>
                      {v.trkRail ? (
                        <section aria-labelledby="trk-h" style={{ display: "flex", flexDirection: "column", gap: "16px", background: "#16171A", color: "#FFFFFF", borderRadius: "16px", padding: "22px 20px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "10px" }}>
                            <h2 id="trk-h" style={{ margin: "0", fontSize: "24px", fontWeight: "900", letterSpacing: "-.025em", lineHeight: "1" }}>Tu semestre</h2>
                            <span style={{ fontSize: "13px", fontWeight: "500", color: "#C9CBD0" }}>{v.trk.count}</span>
                          </div>
                          {v.trk.isInt ? (
                            <span style={{ fontSize: "15px", lineHeight: "1.45", color: "#E2E3DF" }}>Te vas de intercambio. Las materias a reconocer se eligen en Próximos semestres.</span>
                          ) : null}
                          <ul role="list" aria-label="Lugares a cubrir" style={{ listStyle: "none", margin: "0", padding: "0", display: "flex", flexDirection: "column", gap: "12px" }}>
                            {v.trk.cats.map((tc, i) => (
                              <li key={i} aria-label={tc.aria} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                                <span style={{ display: "flex", flexDirection: "column", gap: "1px", minWidth: "0" }}>
                                  <span style={{ fontSize: "15.5px", fontWeight: "900" }}>{tc.label}</span>
                                  <span style={{ fontSize: "12.5px", color: `${tc.subFg}` }}>{tc.sub}</span>
                                </span>
                                <span aria-hidden="true" style={{ display: "flex", gap: "6px", flex: "none" }}>
                                  {tc.slots.map((sl, i) => (
                                    <span key={i} style={{ width: "30px", height: "30px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "900", background: `${sl.bg}`, color: "#FFFFFF", boxShadow: `${sl.sh}`, transition: "background .25s ease, transform .25s ease", transform: `scale(${sl.sc})` }}>{sl.mark}</span>
                                  ))}
                                </span>
                              </li>
                            ))}
                          </ul>
                          <div role="status" style={{ display: "flex", gap: "10px", alignItems: "center", borderTop: "1px solid #2E3036", paddingTop: "14px" }}>
                            <span aria-hidden="true" style={{ flex: "none", width: "26px", height: "26px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "900", background: `${v.trk.iconBg}`, color: "#16171A" }}>{v.trk.icon}</span>
                            <span style={{ fontSize: "14.5px", fontWeight: "700", lineHeight: "1.35" }}>{v.trk.status}</span>
                          </div>
                          <button className="hv7 fo1" onClick={v.goInsc} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", background: "#E0005A", color: "#FFFFFF", padding: "18px 22px", borderRadius: "14px" }}>
                            <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: ".08em", textTransform: "uppercase" }}>Siguiente</span>
                              <span style={{ fontSize: "19px", fontWeight: "900", letterSpacing: "-.01em" }}>Revisar mi inscripción</span>
                            </span>
                            <span aria-hidden="true" style={{ fontSize: "24px", fontWeight: "900" }}>→</span>
                          </button>
                        </section>
                      ) : null}
                      {v.faltaShow ? (
                        <section aria-label="Te falta" style={{ display: "flex", flexDirection: "column", gap: "16px", background: "#FFFFFF", borderRadius: "16px", padding: "22px 20px" }}>
                          <h2 style={{ margin: "0", fontSize: "24px", fontWeight: "900", letterSpacing: "-.025em", lineHeight: "1" }}>Te falta</h2>
                          <div style={{ display: "grid", gridTemplateColumns: `${v.L.faltaCols}`, gap: "14px 20px" }}>
                            {v.faltaCats.map((fc, i) => (
                              <div key={i} style={{ minWidth: "0", display: "flex", flexDirection: "column", gap: "6px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
                                  <span style={{ fontSize: "14.5px", fontWeight: "700" }}>{fc.label}</span>
                                  <span style={{ flex: "none", fontSize: "14px", color: "#3A3D44" }}>
                                    <strong style={{ fontSize: "18px", fontWeight: "900", color: "#1C1E22" }}>{fc.big}</strong>
                                    {" "}{fc.small}
                                  </span>
                                </div>
                                <div aria-hidden="true" style={{ display: "flex", gap: "2px", height: "8px" }}>
                                  {fc.segs.map((sg, i) => (
                                    <span key={i} style={{ flex: "1", borderRadius: "2px", background: `${sg.bg}` }}></span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                          {v.debesShow ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid #E2E3DF", paddingTop: "14px" }}>
                              <span style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "14.5px", fontWeight: "700" }}>
                                <span style={{ fontSize: "10px", fontWeight: "900", letterSpacing: ".05em", textTransform: "uppercase", padding: "2px 7px", borderRadius: "999px", background: "#C2004C", color: "#FFFFFF" }}>Debés</span>
                                {v.debesTitle}
                              </span>
                              {v.debes.map((d, i) => (
                                <button key={i} className="hv12 fo4" onClick={d.onClick} style={{ all: "unset", cursor: "pointer", display: "flex", justifyContent: "space-between", gap: "10px", fontSize: "14px", lineHeight: "1.35", padding: "3px 0" }}>
                                  <span style={{ minWidth: "0" }}>{d.nombre}</span>
                                  <span style={{ flex: "none", fontSize: "12.5px", color: "#4A4F58" }}>{d.anio}° año</span>
                                </button>
                              ))}
                              <span style={{ fontSize: "13px", color: "#3A3D44", lineHeight: "1.45" }}>Van primero en tu próxima inscripción.</span>
                            </div>
                          ) : null}
                        </section>
                      ) : null}
                      {v.detRail ? (
                        <section data-screen-label="Detalle" aria-label={v.det.nombre} style={{ background: "#FFFFFF", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "18px", boxShadow: "0 0 0 1.5px #1C1E22" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                            <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: ".05em", textTransform: "uppercase", color: "#4A4F58", paddingTop: "8px" }}>{v.det.eyebrow}</span>
                            <button className="hv5 fo4" onClick={v.onCloseDet} aria-label="Cerrar detalle" style={{ all: "unset", cursor: "pointer", width: "36px", height: "36px", flex: "none", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", background: "#F0F0EC" }}>×</button>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "-8px" }}>
                            <h2 style={{ margin: "0", fontSize: "26px", lineHeight: "1.08", fontWeight: "900", letterSpacing: "-.025em", textWrap: "pretty" }}>{v.det.nombre}</h2>
                            {v.det.aliasShow ? (
                              <span style={{ fontSize: "14px", fontStyle: "italic", color: "#3A3D44" }}>{v.det.alias}</span>
                            ) : null}
                            <span style={{ fontSize: "15px", fontWeight: "500" }}>{v.det.estado}</span>
                          </div>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                            <button className="fo4" onClick={v.det.onToggle} style={{ all: "unset", cursor: "pointer", alignSelf: "flex-start", fontSize: "14px", fontWeight: "700", padding: "11px 16px", borderRadius: "9px", background: `${v.det.btnBg}`, color: `${v.det.btnFg}`, boxShadow: `inset 0 0 0 1.5px ${v.det.btnBd}` }}>{v.det.toggleLbl}</button>
                            {v.det.progShow ? (
                              <a className="hv13 fo4" href={v.det.progUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "14px", fontWeight: "700", color: "#1C1E22", textDecoration: "none", padding: "11px 14px", borderRadius: "9px", boxShadow: "inset 0 0 0 1.5px #C9CBD0" }}>
                                {v.det.progLbl}
                                <span aria-hidden="true">↗</span>
                                <span style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)" }}>, se abre en otra pestaña</span>
                              </a>
                            ) : null}
                          </div>
                          {v.det.showNote ? (
                            <section aria-labelledby="op-h" style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", borderRadius: "14px", background: "#F4F4F1" }}>
                              <h3 id="op-h" style={{ margin: "0", fontSize: "16px", fontWeight: "900", letterSpacing: "-.01em" }}>¿Cuál cursaste?</h3>
                              {v.det.op.selShow ? (
                                <div role="status" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", padding: "10px 12px", borderRadius: "10px", background: "#1C1E22", color: "#FFFFFF" }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "0", fontSize: "14px", fontWeight: "700", lineHeight: "1.3" }}>
                                    <span aria-hidden="true" style={{ flex: "none", color: "#FF5C9A" }}>✓</span>
                                    <span style={{ overflowWrap: "anywhere" }}>{v.det.op.sel}</span>
                                  </span>
                                  <button className="fo9" onClick={v.det.op.onClear} style={{ all: "unset", cursor: "pointer", flex: "none", fontSize: "13px", fontWeight: "700", textDecoration: "underline", textUnderlineOffset: "3px", padding: "6px 2px" }}>Quitar</button>
                                </div>
                              ) : null}
                              {v.det.op.isSem ? (
                                <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: ".07em", textTransform: "uppercase", color: "#4A4F58" }}>Se ofrecieron en el {v.det.op.semLbl}</span>
                              ) : null}
                              {v.det.op.backShow ? (
                                <button className="hv10 fo4" onClick={v.det.op.onBack} style={{ all: "unset", cursor: "pointer", alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "700", color: "#1C1E22", padding: "4px 0" }}>
                                  <span aria-hidden="true">←</span>
                                  {v.det.op.backLbl}
                                </button>
                              ) : null}
                              {v.det.op.isSem ? (
                                <div role="tabpanel" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                  <div role="radiogroup" aria-label="Optativas" style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                    {v.det.op.semRows.map((o, i) => (
                                      <button key={i} className="hv14 fo10" role="radio" aria-checked={o.on} onClick={o.onClick} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "grid", gridTemplateColumns: "18px minmax(0,1fr)", alignItems: "center", columnGap: "12px", minHeight: "48px", padding: "8px 12px", borderRadius: "10px", background: `${o.bg}`, boxShadow: `inset 0 0 0 1.5px ${o.bd}` }}>
                                        <span aria-hidden="true" style={{ width: "18px", height: "18px", boxSizing: "border-box", borderRadius: "50%", background: `${o.dot}`, boxShadow: `inset 0 0 0 2px ${o.dotBd}, inset 0 0 0 5px ${o.dot}` }}></span>
                                        <span style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: "0" }}>
                                          <span style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                                            <span style={{ fontSize: "14.5px", fontWeight: "700", lineHeight: "1.3", color: "#1C1E22" }}>{o.titulo}</span>
                                            {o.codeShow ? (
                                              <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12px", fontWeight: "700", color: "#4A4F58" }}>{o.codigo}</span>
                                            ) : null}
                                          </span>
                                          {o.metaShow ? (
                                            <span style={{ fontSize: "12.5px", lineHeight: "1.35", color: "#4A4F58" }}>{o.meta}</span>
                                          ) : null}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ) : null}
                              {v.det.op.isSem ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px", borderTop: "1px solid #E2E3DF", paddingTop: "12px" }}>
                                  <span style={{ fontSize: "12.5px", color: "#3A3D44" }}>¿No está acá?</span>
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                    {v.det.op.alts.map((t, i) => (
                                      <button key={i} className="hv15 fo4" onClick={t.onClick} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "40px", padding: "0 14px", borderRadius: "9px", background: "#FFFFFF", boxShadow: "inset 0 0 0 1.5px #C9CBD0", fontSize: "13.5px", fontWeight: "700", color: "#1C1E22" }}>
                                        <span aria-hidden="true" style={{ fontSize: "14px", lineHeight: "1", color: "#4A4F58" }}>{t.icon}</span>
                                        {t.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ) : null}
                              {v.det.op.isAll ? (
                                <div role="tabpanel" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                  <input type="search" value={v.det.op.q === undefined ? "" : v.det.op.q} onChange={v.det.op.onQ} maxLength="40" aria-label="Buscar por nombre o código" placeholder="Buscar por nombre o código" style={{ font: "inherit", fontSize: "14px", minHeight: "44px", boxSizing: "border-box", padding: "0 12px", border: "1.5px solid #C9CBD0", borderRadius: "9px", background: "#FFFFFF", color: "#1C1E22" }} />
                                  <div style={{ maxHeight: "300px", overflowY: "auto", margin: "0 -4px", padding: "0 4px" }}>
                                    <div role="radiogroup" aria-label="Optativas" style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                      {v.det.op.allRows.map((o, i) => (
                                        <button key={i} className="hv14 fo10" role="radio" aria-checked={o.on} onClick={o.onClick} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "grid", gridTemplateColumns: "18px minmax(0,1fr)", alignItems: "center", columnGap: "12px", minHeight: "48px", padding: "8px 12px", borderRadius: "10px", background: `${o.bg}`, boxShadow: `inset 0 0 0 1.5px ${o.bd}` }}>
                                          <span aria-hidden="true" style={{ width: "18px", height: "18px", boxSizing: "border-box", borderRadius: "50%", background: `${o.dot}`, boxShadow: `inset 0 0 0 2px ${o.dotBd}, inset 0 0 0 5px ${o.dot}` }}></span>
                                          <span style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: "0" }}>
                                            <span style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                                              <span style={{ fontSize: "14.5px", fontWeight: "700", lineHeight: "1.3", color: "#1C1E22" }}>{o.titulo}</span>
                                              {o.codeShow ? (
                                                <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12px", fontWeight: "700", color: "#4A4F58" }}>{o.codigo}</span>
                                              ) : null}
                                            </span>
                                            {o.metaShow ? (
                                              <span style={{ fontSize: "12.5px", lineHeight: "1.35", color: "#4A4F58" }}>{o.meta}</span>
                                            ) : null}
                                          </span>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  {v.det.op.allNone ? (
                                    <span style={{ fontSize: "13px", color: "#3A3D44" }}>Ninguna coincide. Si es de otra carrera, cargala en Otra carrera.</span>
                                  ) : null}
                                </div>
                              ) : null}
                              {v.det.op.isMano ? (
                                <label role="tabpanel" style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", fontWeight: "500", color: "#3A3D44" }}>
                                  Nombre de la materia
                                  <input value={v.det.op.mano === undefined ? "" : v.det.op.mano} onChange={v.det.op.onMano} maxLength="80" placeholder="Por ejemplo, Microeconomía" style={{ font: "inherit", fontSize: "14px", minHeight: "44px", boxSizing: "border-box", padding: "0 12px", border: "1.5px solid #C9CBD0", borderRadius: "9px", background: "#FFFFFF", color: "#1C1E22" }} />
                                </label>
                              ) : null}
                              {v.det.op.isEq ? (
                                <div role="tabpanel">
                                  <div role="radiogroup" aria-label="Optativas" style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                    {v.det.op.eqRows.map((o, i) => (
                                      <button key={i} className="hv14 fo10" role="radio" aria-checked={o.on} onClick={o.onClick} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "grid", gridTemplateColumns: "18px minmax(0,1fr)", alignItems: "center", columnGap: "12px", minHeight: "48px", padding: "8px 12px", borderRadius: "10px", background: `${o.bg}`, boxShadow: `inset 0 0 0 1.5px ${o.bd}` }}>
                                        <span aria-hidden="true" style={{ width: "18px", height: "18px", boxSizing: "border-box", borderRadius: "50%", background: `${o.dot}`, boxShadow: `inset 0 0 0 2px ${o.dotBd}, inset 0 0 0 5px ${o.dot}` }}></span>
                                        <span style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: "0" }}>
                                          <span style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                                            <span style={{ fontSize: "14.5px", fontWeight: "700", lineHeight: "1.3", color: "#1C1E22" }}>{o.titulo}</span>
                                            {o.codeShow ? (
                                              <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12px", fontWeight: "700", color: "#4A4F58" }}>{o.codigo}</span>
                                            ) : null}
                                          </span>
                                          {o.metaShow ? (
                                            <span style={{ fontSize: "12.5px", lineHeight: "1.35", color: "#4A4F58" }}>{o.meta}</span>
                                          ) : null}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ) : null}
                            </section>
                          ) : null}
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <h3 style={{ margin: "0", display: "flex", gap: "8px", alignItems: "center", fontSize: "12px", fontWeight: "900", letterSpacing: ".06em", textTransform: "uppercase" }}>
                              <span style={{ width: "18px", height: "3px", borderRadius: "2px", background: "#1C1E22" }}></span>
                              Para cursarla necesitás
                            </h3>
                            {v.det.sinReq ? (
                              <span style={{ fontSize: "14px", color: "#3A3D44" }}>{v.det.sinReqText}</span>
                            ) : null}
                            {v.det.meters.map((mt, i) => (
                              <div key={i} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", fontSize: "14px" }}>
                                  <span style={{ fontWeight: "700" }}>{mt.label}</span>
                                  <span style={{ color: `${mt.fg}`, fontWeight: "500" }}>{mt.txt}</span>
                                </div>
                                <div aria-hidden="true" style={{ display: "flex", gap: "2px", height: "10px" }}>
                                  {mt.segs.map((sg, i) => (
                                    <span key={i} style={{ flex: "1", borderRadius: "2px", background: `${sg.bg}` }}></span>
                                  ))}
                                </div>
                              </div>
                            ))}
                            {v.det.reqs.map((q, i) => (
                              <button key={i} className="hv12 fo4" onClick={q.onClick} style={{ all: "unset", cursor: "pointer", display: "flex", gap: "10px", alignItems: "baseline", fontSize: "14px", lineHeight: "1.35", padding: "2px 0" }}>
                                <span aria-hidden="true" style={{ flex: "none", width: "14px", fontWeight: "900" }}>{q.glyph}</span>
                                <span style={{ flex: "1" }}>{q.nombre}</span>
                                <span style={{ fontSize: "12.5px", color: "#4A4F58" }}>{q.lbl}</span>
                              </button>
                            ))}
                          </div>
                          {v.det.habShow ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              <h3 style={{ margin: "0", display: "flex", gap: "8px", alignItems: "center", fontSize: "12px", fontWeight: "900", letterSpacing: ".06em", textTransform: "uppercase" }}>
                                <span style={{ width: "18px", height: "3px", borderRadius: "2px", background: "#E0005A" }}></span>
                                Habilita
                              </h3>
                              {v.det.sinHab ? (
                                <span style={{ fontSize: "14px", color: "#3A3D44" }}>No es correlativa de otras materias.</span>
                              ) : null}
                              {v.det.habs.map((q, i) => (
                                <button key={i} className="hv12 fo4" onClick={q.onClick} style={{ all: "unset", cursor: "pointer", display: "flex", gap: "10px", alignItems: "baseline", fontSize: "14px", lineHeight: "1.35", padding: "2px 0" }}>
                                  <span aria-hidden="true" style={{ flex: "none", width: "14px", fontWeight: "900", color: "#C2004C" }}>→</span>
                                  <span style={{ flex: "1" }}>{q.nombre}</span>
                                  <span style={{ fontSize: "12.5px", color: "#4A4F58" }}>{q.lbl}</span>
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </section>
                      ) : null}
                    </aside>
                  </div>
                </div>
                {" "}
              </>
            ) : null}
            {" "}
            {v.vInsc ? (
              <>
                {" "}
                <div data-screen-label="2 Inscripción" style={{ display: "grid", gridTemplateColumns: `${v.L.inscCols}`, gap: "28px", alignItems: "start", paddingTop: "32px" }}>
                  <section aria-labelledby="insc-h" style={{ display: "flex", flexDirection: "column", gap: "18px", minWidth: "0" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "700", letterSpacing: ".08em", textTransform: "uppercase", color: "#C2004C" }}>{v.inscSem}</span>
                      <h1 id="insc-h" style={{ margin: "0", fontSize: `${v.L.h1}`, fontWeight: "900", letterSpacing: "-.035em", lineHeight: "1" }}>Revisá tu inscripción</h1>
                      <p style={{ margin: "0", fontSize: "17px", color: "#3A3D44", lineHeight: "1.5", maxWidth: "620px", textWrap: "pretty" }}>{v.inscSub}</p>
                    </div>
                    {v.inscIsInt ? (
                      <div style={{ background: "#16171A", color: "#FFFFFF", borderRadius: "14px", padding: "22px", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span style={{ fontSize: "22px", fontWeight: "900" }}>Este semestre te vas de intercambio</span>
                        <span style={{ fontSize: "15px", color: "#C9CBD0" }}>Lo cambiás en Próximos semestres.</span>
                      </div>
                    ) : null}
                    <ol style={{ listStyle: "none", margin: "0", padding: "0", display: "flex", flexDirection: "column", gap: "10px" }}>
                      {v.rows.map((r, i) => (
                        <li key={i} style={{ display: "flex", flexDirection: "column", background: "#FFFFFF", borderRadius: "14px", boxShadow: `${r.sh}`, overflow: "hidden" }}>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center", padding: "14px 10px 14px 20px" }}>
                            <button className="fo11" onClick={r.onOpen} aria-expanded={r.open} aria-label={r.openLbl} style={{ all: "unset", cursor: "pointer", flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "6px", padding: "2px 0" }}>
                              <span style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "11px", fontWeight: "500", letterSpacing: ".09em", textTransform: "uppercase", color: "#4A4F58" }}>{r.catLbl}</span>
                                {r.tagShow ? (
                                  <span style={{ fontSize: "10px", fontWeight: "900", letterSpacing: ".05em", textTransform: "uppercase", padding: "2px 7px", borderRadius: "999px", background: `${r.tagBg}`, color: "#FFFFFF" }}>{r.tag}</span>
                                ) : null}
                              </span>
                              <span style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                <span style={{ minWidth: "0", display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap" }}>
                                  <span style={{ fontSize: `${v.L.rowSize}`, fontWeight: "900", letterSpacing: "-.02em", lineHeight: "1.15", color: `${r.nameFg}`, overflowWrap: "anywhere" }}>{r.nombre}</span>
                                  {r.codeShow ? (
                                    <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "13px", fontWeight: "700", letterSpacing: ".02em", color: "#4A4F58" }}>{r.code}</span>
                                  ) : null}
                                </span>
                                <span aria-hidden="true" style={{ flex: "none", width: "26px", height: "26px", borderRadius: "50%", background: "#F0F0EC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", transform: `rotate(${r.rot})`, transition: "transform .2s ease" }}>▼</span>
                              </span>
                              {r.subShow ? (
                                <span style={{ fontSize: "13px", lineHeight: "1.35", color: "#3A3D44" }}>{r.sub}</span>
                              ) : null}
                              {r.semShow ? (
                                <span style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "8px", marginTop: "2px", padding: "7px 12px 7px 8px", borderRadius: "8px", background: "#F0F0EC", boxShadow: "inset 0 0 0 1px #D5D6D2" }}>
                                  <span aria-hidden="true" style={{ flex: "none", width: "18px", height: "18px", borderRadius: "50%", background: "#1C1E22", color: "#F0F0EC", fontSize: "13px", fontWeight: "900", lineHeight: "1", display: "flex", alignItems: "center", justifyContent: "center" }}>+</span>
                                  <span style={{ fontSize: "15px", fontWeight: "900", lineHeight: "1.2" }}>{r.semName}</span>
                                </span>
                              ) : null}
                            </button>
                            {r.has ? (
                              <button className="hv6 fo5" onClick={r.onRemove} aria-label={r.rmLbl} style={{ all: "unset", cursor: "pointer", flex: "none", width: "44px", height: "44px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", color: "#3A3D44" }}>×</button>
                            ) : null}
                          </div>
                          {r.errShow ? (
                            <span style={{ margin: "-6px 20px 12px", fontSize: "13.5px", lineHeight: "1.4", color: "#B0003A", fontWeight: "700" }}>{r.err}</span>
                          ) : null}
                          {r.open ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "4px 20px 18px", background: "#FFFFFF" }}>
                              {r.groups.map((g, i) => (
                                <div key={i} role="group" aria-label={g.label} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                  <span style={{ fontSize: "11.5px", fontWeight: "900", letterSpacing: ".06em", textTransform: "uppercase", color: `${g.fg}` }}>{g.label}</span>
                                  <div style={{ display: "grid", gridTemplateColumns: `${v.L.pickCols}`, gap: "6px" }}>
                                    {g.opts.map((o, i) => (
                                      <button key={i} className="hv15 fo4" onClick={o.onClick} aria-pressed={o.on} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", minHeight: "48px", padding: "10px 12px", borderRadius: "9px", background: `${o.bg}`, color: `${o.fg}`, boxShadow: `inset 0 0 0 1.5px ${o.bd}` }}>
                                        <span style={{ minWidth: "0", display: "flex", flexDirection: "column", gap: "2px" }}>
                                          <span style={{ fontSize: "14.5px", fontWeight: "700", lineHeight: "1.25", overflowWrap: "anywhere" }}>{o.nombre}</span>
                                          <span style={{ fontSize: "12px", color: `${o.meta}` }}>{o.sub}</span>
                                        </span>
                                        <span aria-hidden="true" style={{ flex: "none", fontWeight: "900" }}>{o.mark}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                              {r.none ? (
                                <span style={{ fontSize: "14px", color: "#3A3D44" }}>No hay otras disponibles.</span>
                              ) : null}
                            </div>
                          ) : null}
                          {r.altsShow ? (
                            <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap", borderTop: "1px solid #EEEEEA", padding: "10px 20px 12px" }}>
                              <span style={{ fontSize: "12.5px", fontWeight: "500", color: "#3A3D44", marginRight: "2px" }}>{r.altsLbl}</span>
                              {r.alts.map((a, i) => (
                                <button key={i} className="hv5 fo4" onClick={a.onClick} aria-label={a.aria} style={{ all: "unset", boxSizing: "border-box", minHeight: "36px", cursor: "pointer", display: "flex", gap: "6px", alignItems: "center", fontSize: "13px", fontWeight: "500", padding: "7px 12px", borderRadius: "999px", background: "#F0F0EC" }}>{a.nombre}</button>
                              ))}
                            </div>
                          ) : null}
                        </li>
                      ))}
                    </ol>
                    {v.addShow ? (
                      <div style={{ display: "flex", flexDirection: "column", borderRadius: "14px", boxShadow: `inset 0 0 0 1.5px ${v.add.bd}`, background: `${v.add.bg}`, overflow: "hidden" }}>
                        <button className="fo12" onClick={v.add.onOpen} aria-expanded={v.add.open} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", padding: "14px 20px", fontSize: "15px", fontWeight: "700" }}>
                          <span aria-hidden="true" style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#1C1E22", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>{v.add.icon}</span>
                          {v.add.label}
                        </button>
                        {v.add.open ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "4px 20px 18px" }}>
                            {v.add.groups.map((g, i) => (
                              <div key={i} role="group" aria-label={g.label} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <span style={{ fontSize: "11.5px", fontWeight: "900", letterSpacing: ".06em", textTransform: "uppercase", color: "#3A3D44" }}>{g.label}</span>
                                <div style={{ display: "grid", gridTemplateColumns: `${v.L.pickCols}`, gap: "6px" }}>
                                  {g.opts.map((o, i) => (
                                    <button key={i} className="hv15 fo4" onClick={o.onClick} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "flex", flexDirection: "column", gap: "2px", minHeight: "48px", padding: "10px 12px", borderRadius: "9px", background: "#FFFFFF", boxShadow: "inset 0 0 0 1.5px #E2E3DF" }}>
                                      <span style={{ fontSize: "14.5px", fontWeight: "700", lineHeight: "1.25", overflowWrap: "anywhere" }}>{o.nombre}</span>
                                      <span style={{ fontSize: "12px", color: "#4A4F58" }}>{o.sub}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    {v.edited ? (
                      <button className="hv4 fo5" onClick={v.onRestore} style={{ all: "unset", cursor: "pointer", alignSelf: "flex-start", fontSize: "14px", fontWeight: "500", color: "#3A3D44", textDecoration: "underline", padding: "8px 0" }}>Volver a la propuesta</button>
                    ) : null}
                  </section>
                  <aside style={{ position: `${v.L.railPos}`, top: `${v.L.railTop}`, display: "flex", flexDirection: "column", gap: "12px", minWidth: "0" }}>
                    <section aria-label="Chequeo" aria-live="polite" style={{ background: "#16171A", color: "#FFFFFF", borderRadius: "16px", padding: "24px 22px", display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                        <span aria-hidden="true" style={{ flex: "none", width: "44px", height: "44px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "900", background: `${v.chk.iconBg}`, color: "#16171A" }}>{v.chk.icon}</span>
                        <h2 style={{ margin: "0", fontSize: "24px", fontWeight: "900", letterSpacing: "-.02em", lineHeight: "1.1" }}>{v.chk.title}</h2>
                      </div>
                      <ul style={{ listStyle: "none", margin: "0", padding: "0", display: "flex", flexDirection: "column" }}>
                        {v.chk.items.map((it, i) => (
                          <li key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "11px 0", borderTop: "1px solid #2E3036" }}>
                            <span aria-hidden="true" style={{ flex: "none", width: "22px", height: "22px", marginTop: "1px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "900", background: `${it.bg}`, color: "#16171A" }}>{it.icon}</span>
                            <span style={{ minWidth: "0", display: "flex", flexDirection: "column", gap: "2px" }}>
                              <span style={{ fontSize: "15px", fontWeight: "700", lineHeight: "1.3" }}>{it.title}</span>
                              {it.subShow ? (
                                <span style={{ fontSize: "13.5px", lineHeight: "1.45", color: "#C9CBD0", textWrap: "pretty" }}>{it.sub}</span>
                              ) : null}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {v.chk.mail ? (
                        <p style={{ margin: "0", fontSize: "13.5px", lineHeight: "1.5", color: "#C9CBD0", borderTop: "1px solid #2E3036", paddingTop: "14px" }}>
                          {v.chk.foot}
                          {v.chk.mail ? (
                            <>
                              {" "}
                              <a href="mailto:diseno@udesa.edu.ar" style={{ color: "#FFFFFF", fontWeight: "700" }}>diseno@udesa.edu.ar</a>
                            </>
                          ) : null}
                        </p>
                      ) : null}
                    </section>
                    <button className="hv7 fo13" onClick={v.goProy} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", background: "#E0005A", color: "#FFFFFF", padding: "18px 22px", borderRadius: "14px" }}>
                      <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: ".08em", textTransform: "uppercase" }}>Siguiente</span>
                        <span style={{ fontSize: "19px", fontWeight: "900", letterSpacing: "-.01em" }}>Próximos semestres</span>
                      </span>
                      <span aria-hidden="true" style={{ fontSize: "24px", fontWeight: "900" }}>→</span>
                    </button>
                  </aside>
                </div>
                {" "}
              </>
            ) : null}
            {" "}
            {v.vProy ? (
              <>
                {" "}
                <div data-screen-label="3 Próximos semestres" style={{ display: "flex", flexDirection: "column", gap: "22px", paddingTop: "32px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "16px 32px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "0", flex: "1 1 480px" }}>
                      <h1 style={{ margin: "0", fontSize: `${v.L.h1}`, fontWeight: "900", letterSpacing: "-.035em", lineHeight: "1" }}>{v.proyTitle}</h1>
                      <p style={{ margin: "0", fontSize: "17px", color: "#3A3D44", lineHeight: "1.5", textWrap: "pretty" }}>{v.proySub}</p>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "6px 16px", flexWrap: "wrap" }}>
                        {v.proyMetaShow ? (
                          <div aria-label={v.proyRange} style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px 14px", padding: "4px 0" }}>
                            <span style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                              <span style={{ fontSize: "34px", fontWeight: "900", letterSpacing: "-.04em", lineHeight: "1" }}>{v.proyN}</span>
                              <span style={{ fontSize: "15px", fontWeight: "500", color: "#3A3D44" }}>{v.proyNLbl}</span>
                            </span>
                            <span aria-hidden="true" style={{ width: "1px", alignSelf: "stretch", background: "#C9CBD0" }}></span>
                            {v.proySame ? (
                              <span style={{ display: "flex", flexDirection: "column", lineHeight: "1.1" }}>
                                <span style={{ fontSize: "11px", fontWeight: "500", letterSpacing: ".08em", textTransform: "uppercase", color: "#4A4F58", whiteSpace: "nowrap" }}>{v.proyA.h}</span>
                                <span style={{ fontSize: "17px", fontWeight: "900", letterSpacing: "-.01em" }}>{v.proyA.y}</span>
                              </span>
                            ) : null}
                            {v.proyRangeShow ? (
                              <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{ display: "flex", flexDirection: "column", lineHeight: "1.1" }}>
                                  <span style={{ fontSize: "11px", fontWeight: "500", letterSpacing: ".08em", textTransform: "uppercase", color: "#4A4F58", whiteSpace: "nowrap" }}>{v.proyA.h}</span>
                                  <span style={{ fontSize: "17px", fontWeight: "900", letterSpacing: "-.01em" }}>{v.proyA.y}</span>
                                </span>
                                <span aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: "0", color: "#8A8F98" }}>
                                  <span style={{ width: `${v.L.arrLen}`, height: "1.5px", background: "#8A8F98" }}></span>
                                  <span style={{ fontSize: "13px", lineHeight: "1", marginLeft: "-3px" }}>▸</span>
                                </span>
                                <span style={{ display: "flex", flexDirection: "column", lineHeight: "1.1" }}>
                                  <span style={{ fontSize: "11px", fontWeight: "500", letterSpacing: ".08em", textTransform: "uppercase", color: "#4A4F58", whiteSpace: "nowrap" }}>{v.proyB.h}</span>
                                  <span style={{ fontSize: "17px", fontWeight: "900", letterSpacing: "-.01em" }}>{v.proyB.y}</span>
                                </span>
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                        {v.manual ? (
                          <button className="hv10 fo4" onClick={v.onResetPlan} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "700", color: "#1C1E22", textDecoration: "underline", textUnderlineOffset: "3px", padding: "4px 0" }}>
                            <span aria-hidden="true" style={{ textDecoration: "none" }}>↺</span>
                            Reordenar automáticamente
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <button className="hv7 fo13" onClick={v.onExport} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", flex: "0 1 360px", minWidth: "260px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", background: "#E0005A", color: "#FFFFFF", padding: "18px 22px", borderRadius: "14px" }}>
                      <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: ".08em", textTransform: "uppercase" }}>Para imprimir o retomar</span>
                        <span style={{ fontSize: "19px", fontWeight: "900", letterSpacing: "-.01em" }}>Exportar mi plan</span>
                      </span>
                      <span aria-hidden="true" style={{ fontSize: "24px", fontWeight: "900" }}>↓</span>
                    </button>
                  </div>
                  {v.desk ? (
                    <section aria-label="Semestres" style={{ display: "flex", flexDirection: "row", gap: "12px", overflowX: "auto", paddingBottom: "14px", alignItems: "stretch" }}>
                      {v.poolShow ? (
                        <div onDragOver={v.pool.onDragOver} onDrop={v.pool.onDrop} style={{ flex: "none", width: `${v.L.semW}`, display: "flex", flexDirection: "column", gap: "8px", borderRadius: "14px", padding: "14px", background: `${v.pool.bg}`, boxShadow: `inset 0 0 0 1.5px ${v.pool.bd}` }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px", minHeight: "52px" }}>
                            <span style={{ fontSize: "11.5px", fontWeight: "900", letterSpacing: ".07em", textTransform: "uppercase", color: "#4A4F58" }}>Sin semestre</span>
                            <span style={{ fontSize: "20px", fontWeight: "900" }}>{v.pool.count}</span>
                          </div>
                          {v.pool.cards.map((it, i) => (
                            <div key={i} draggable="true" onDragStart={it.onDragStart} onDragEnd={it.onDragEnd} style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "9px 6px 6px 11px", borderRadius: "9px", background: "#FFFFFF", boxShadow: "inset 0 0 0 1.5px #C9CBD0", cursor: "grab", opacity: `${it.op}` }}>
                              <button className="fo4" onClick={it.onOpen} style={{ all: "unset", cursor: "pointer", display: "flex", flexDirection: "column", gap: "2px", paddingRight: "4px" }}>
                                <span style={{ fontSize: "10.5px", fontWeight: "700", letterSpacing: ".06em", textTransform: "uppercase", color: "#4A4F58" }}>{it.cat}</span>
                                <span style={{ fontSize: "14px", fontWeight: "700", lineHeight: "1.25" }}>{it.nombre}</span>
                              </button>
                              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                <button className="hv9 fo5" onClick={it.onNext} aria-label={it.nextLbl} style={{ all: "unset", cursor: "pointer", width: `${v.L.arrW}`, height: `${v.L.arrH}`, borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "900" }}>→</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      {v.proy.map((col, i) => (
                        <div key={i} onDragOver={col.onDragOver} onDrop={col.onDrop} aria-label={col.full} style={{ flex: "none", width: `${v.L.semW}`, display: "flex", flexDirection: "column", gap: "8px", borderRadius: "14px", padding: "14px", background: `${col.bg}`, color: `${col.fg}`, boxShadow: `inset 0 0 0 ${col.bdW} ${col.bd}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", minHeight: "52px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "3px", minWidth: "0" }}>
                              <span style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", justifyContent: "center", height: "20px", padding: "0 8px", boxSizing: "border-box", lineHeight: "1", fontSize: "10.5px", fontWeight: "900", letterSpacing: ".06em", textTransform: "uppercase", borderRadius: "999px", whiteSpace: "nowrap", background: `${col.eyeBg}`, color: `${col.eyeFg}` }}>{col.eyebrow}</span>
                              <span style={{ fontSize: "19px", fontWeight: "900", letterSpacing: "-.02em", whiteSpace: "nowrap" }}>{col.label}</span>
                            </div>
                            <span style={{ flex: "none", display: "flex", alignItems: "center", gap: "4px" }}>
                              <span style={{ fontSize: "12.5px", fontWeight: "500", color: `${col.cntFg}` }}>{col.count}</span>
                              {col.canDel ? (
                                <button className="hv6 fo5" onClick={col.onDel} aria-label={col.delLbl} title="Quitar semestre" style={{ all: "unset", cursor: "pointer", width: "28px", height: "28px", margin: "-4px -6px 0 0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", lineHeight: "1", color: "#3A3D44" }}>×</button>
                              ) : null}
                            </span>
                          </div>
                          {col.warns.map((wn, i) => (
                            <span key={i} role="status" style={{ fontSize: "12.5px", lineHeight: "1.4", fontWeight: "500", color: "#5C3000", background: "#FFF1DC", borderRadius: "7px", padding: "7px 9px" }}>{wn}</span>
                          ))}
                          {col.isInt ? (
                            <span style={{ fontSize: "22px", fontWeight: "900", letterSpacing: "-.01em", padding: "4px 0" }}>Intercambio</span>
                          ) : null}
                          {col.items.map((it, i) => (
                            <div key={i} draggable={it.drag} onDragStart={it.onDragStart} onDragEnd={it.onDragEnd} style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "9px 6px 6px 11px", borderRadius: "9px", background: `${it.bg}`, color: `${it.fg}`, boxShadow: `inset 0 0 0 1.5px ${it.bd}`, cursor: `${it.cursor}`, opacity: `${it.op}` }}>
                              <button className="fo14" onClick={it.onOpen} style={{ all: "unset", cursor: "pointer", display: "flex", flexDirection: "column", gap: "2px", paddingRight: "4px" }}>
                                <span style={{ fontSize: "11px", fontWeight: "500", letterSpacing: ".07em", textTransform: "uppercase", color: `${it.catFg}` }}>{it.cat}</span>
                                <span style={{ fontSize: "15.5px", fontWeight: "900", letterSpacing: "-.01em", lineHeight: "1.2", overflowWrap: "anywhere" }}>{it.nombre}</span>
                              </button>
                              {it.noteShow ? (
                                <span style={{ fontSize: "12.5px", lineHeight: "1.35", color: "#3A3D44" }}>{it.note}</span>
                              ) : null}
                              {it.warnShow ? (
                                <span style={{ fontSize: "12px", lineHeight: "1.35", color: "#5C3000", background: "#FFF1DC", borderRadius: "6px", padding: "5px 7px" }}>{it.warn}</span>
                              ) : null}
                              {it.drag ? (
                                <div style={{ display: "flex", justifyContent: "flex-end", gap: "2px" }}>
                                  <button className="hv9 fo5" onClick={it.onPrev} disabled={it.noPrev} aria-label={it.prevLbl} style={{ all: "unset", cursor: "pointer", width: `${v.L.arrW}`, height: `${v.L.arrH}`, borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "900", opacity: `${it.prevOp}` }}>←</button>
                                  <button className="hv9 fo5" onClick={it.onNext} aria-label={it.nextLbl} style={{ all: "unset", cursor: "pointer", width: `${v.L.arrW}`, height: `${v.L.arrH}`, borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "900" }}>→</button>
                                </div>
                              ) : null}
                            </div>
                          ))}
                          {col.empty ? (
                            <span style={{ flex: "1", minHeight: "80px", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontSize: "13px", color: "#4A4F58", border: "1.5px dashed #C9CBD0", borderRadius: "9px", padding: "12px" }}>Soltá materias acá</span>
                          ) : null}
                        </div>
                      ))}
                      <button className="hv16 fo4" onClick={v.onAddSem} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", flex: "none", width: `${v.L.addSemW}`, minHeight: `${v.L.addSemH}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", borderRadius: "14px", border: "1.5px dashed #8A8F98", color: "#1C1E22", fontSize: "14px", fontWeight: "700", textAlign: "center", padding: "14px" }}>
                        <span aria-hidden="true" style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#1C1E22", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>+</span>
                        Agregar semestre
                      </button>
                    </section>
                  ) : null}
                  {v.mob ? (
                    <section aria-label="Semestres" style={{ display: "flex", flexDirection: "column" }}>
                      {v.poolShow ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px", padding: "14px", borderRadius: "14px", boxShadow: "inset 0 0 0 1.5px #C9CBD0" }}>
                          <span style={{ fontSize: "15px", fontWeight: "900" }}>Sin semestre · {v.pool.count}</span>
                          {v.pool.cards.map((it, i) => (
                            <button key={i} className="fo4" onClick={it.onMove} aria-label={it.moveLbl} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", minHeight: "52px", padding: "8px 12px", borderRadius: "10px", background: "#FFFFFF", boxShadow: "inset 0 0 0 1.5px #E2E3DF" }}>
                              <span style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: "0" }}>
                                <span style={{ fontSize: "10.5px", fontWeight: "700", letterSpacing: ".06em", textTransform: "uppercase", color: "#4A4F58" }}>{it.cat}</span>
                                <span style={{ fontSize: "15px", fontWeight: "700", lineHeight: "1.25" }}>{it.nombre}</span>
                              </span>
                              <span aria-hidden="true" style={{ flex: "none", fontSize: "13px", fontWeight: "700" }}>Ubicar</span>
                            </button>
                          ))}
                        </div>
                      ) : null}
                      <ol style={{ listStyle: "none", margin: "0", padding: "0", display: "flex", flexDirection: "column" }}>
                        {v.proy.map((col, i) => (
                          <li key={i} aria-label={col.full} style={{ display: "grid", gridTemplateColumns: "22px minmax(0,1fr)", gap: "12px" }}>
                            <div aria-hidden="true" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                              <span style={{ flex: "none", width: "16px", height: "16px", marginTop: "4px", borderRadius: "50%", background: `${col.dot}`, boxShadow: `inset 0 0 0 2px ${col.dotBd}` }}></span>
                              <span style={{ flex: "1", width: "2px", background: "#C9CBD0", marginTop: "4px" }}></span>
                            </div>
                            <div style={{ minWidth: "0", display: "flex", flexDirection: "column", gap: "8px", paddingBottom: "22px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                                <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                  <span style={{ fontSize: "20px", fontWeight: "900", letterSpacing: "-.02em", lineHeight: "1.2" }}>{col.label}</span>
                                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", height: "20px", padding: "0 8px", boxSizing: "border-box", lineHeight: "1", fontSize: "10.5px", fontWeight: "900", letterSpacing: ".06em", textTransform: "uppercase", borderRadius: "999px", whiteSpace: "nowrap", background: `${col.eyeBg}`, color: `${col.eyeFg}` }}>{col.eyebrow}</span>
                                </span>
                                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                  <span style={{ fontSize: "13px", fontWeight: "500", color: "#3A3D44" }}>{col.count}</span>
                                  {col.canDel ? (
                                    <button className="fo5" onClick={col.onDel} aria-label={col.delLbl} style={{ all: "unset", cursor: "pointer", width: "44px", height: "44px", margin: "-12px -10px -12px 0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", color: "#3A3D44" }}>×</button>
                                  ) : null}
                                </span>
                              </div>
                              {col.warns.map((wn, i) => (
                                <span key={i} role="status" style={{ fontSize: "13px", lineHeight: "1.4", fontWeight: "500", color: "#5C3000", background: "#FFF1DC", borderRadius: "8px", padding: "8px 10px" }}>{wn}</span>
                              ))}
                              {col.isInt ? (
                                <span style={{ fontSize: "15px", fontWeight: "900", padding: "12px 14px", borderRadius: "10px", background: "#16171A", color: "#FFFFFF" }}>Intercambio</span>
                              ) : null}
                              {col.items.map((it, i) => (
                                <button key={i} className="fo4" onClick={it.onTap} aria-label={it.moveLbl} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "flex", flexDirection: "column", gap: "4px", minHeight: "52px", padding: "10px 14px", borderRadius: "10px", background: `${it.bg}`, color: `${it.fg}`, boxShadow: `inset 0 0 0 1.5px ${it.bd}` }}>
                                  <span style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center" }}>
                                    <span style={{ fontSize: "11px", fontWeight: "500", letterSpacing: ".07em", textTransform: "uppercase", color: `${it.catFg}` }}>{it.cat}</span>
                                    <span aria-hidden="true" style={{ fontSize: "16px", fontWeight: "900", letterSpacing: ".1em", color: `${it.catFg}` }}>···</span>
                                  </span>
                                  <span style={{ fontSize: "16px", fontWeight: "900", letterSpacing: "-.01em", lineHeight: "1.2", overflowWrap: "anywhere" }}>{it.nombre}</span>
                                  {it.noteShow ? (
                                    <span style={{ fontSize: "12.5px", lineHeight: "1.35", color: "#3A3D44" }}>{it.note}</span>
                                  ) : null}
                                  {it.warnShow ? (
                                    <span style={{ fontSize: "12.5px", lineHeight: "1.35", color: "#5C3000", background: "#FFF1DC", borderRadius: "6px", padding: "6px 8px" }}>{it.warn}</span>
                                  ) : null}
                                </button>
                              ))}
                              {col.empty ? (
                                <span style={{ fontSize: "13.5px", color: "#4A4F58", padding: "12px 14px", border: "1.5px dashed #C9CBD0", borderRadius: "10px" }}>Sin materias todavía.</span>
                              ) : null}
                            </div>
                          </li>
                        ))}
                      </ol>
                      <button className="fo4" onClick={v.onAddSem} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", minHeight: "56px", borderRadius: "12px", border: "1.5px dashed #8A8F98", fontSize: "15px", fontWeight: "700" }}>
                        <span aria-hidden="true" style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#1C1E22", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>+</span>
                        Agregar semestre
                      </button>
                    </section>
                  ) : null}
                  <section aria-labelledby="int-h" style={{ background: "#FFFFFF", borderRadius: "16px", padding: "18px 20px", display: "grid", gridTemplateColumns: `${v.L.intCols}`, gap: "16px 28px", alignItems: "start" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", minWidth: "0" }}>
                      <h2 id="int-h" style={{ margin: "0", fontSize: "19px", fontWeight: "900", letterSpacing: "-.015em" }}>¿Te vas de intercambio?</h2>
                      {v.intAvail ? (
                        <div role="radiogroup" aria-labelledby="int-h" onKeyDown={v.onRadioKeys} style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {v.intOpts.map((o, i) => (
                            <button key={i} className="fo4" role="radio" aria-checked={o.on} tabIndex={o.tab} onClick={o.onClick} style={{ all: "unset", boxSizing: "border-box", minHeight: "44px", display: "flex", alignItems: "center", cursor: "pointer", fontSize: "14px", fontWeight: "700", padding: "10px 14px", borderRadius: "9px", background: `${o.bg}`, color: `${o.fg}`, boxShadow: `inset 0 0 0 1.5px ${o.bd}` }}>{o.label}</button>
                          ))}
                        </div>
                      ) : null}
                      {v.intNo ? (
                        <span style={{ fontSize: "14.5px", color: "#3A3D44", lineHeight: "1.45" }}>Los intercambios son en el 2° semestre de 3° o el 1° de 4°.</span>
                      ) : null}
                    </div>
                    {v.intOn ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "0" }}>
                        <span style={{ fontSize: "14px", fontWeight: "700" }}>Materias para que te reconozcan</span>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                          {v.recSel.map((o, i) => (
                            <span key={i} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13.5px", fontWeight: "700", padding: "4px 4px 4px 12px", borderRadius: "999px", background: "#1C1E22", color: "#FFFFFF" }}>
                              {o.nombre}
                              <button className="hv17 fo15" onClick={o.onRemove} aria-label={o.rmLbl} style={{ all: "unset", cursor: "pointer", width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px" }}>×</button>
                            </span>
                          ))}
                          <button className="hv9 fo4" onClick={v.onRecOpen} aria-expanded={v.recOpen} style={{ all: "unset", cursor: "pointer", fontSize: "13.5px", fontWeight: "700", padding: "9px 14px", borderRadius: "999px", boxShadow: "inset 0 0 0 1.5px #1C1E22" }}>+ Sumar materia</button>
                        </div>
                        {v.recOpen ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "14px", borderRadius: "12px", background: "#FAFAF8", boxShadow: "inset 0 0 0 1px #E2E3DF" }}>
                            {v.recGroups.map((g, i) => (
                              <div key={i} role="group" aria-label={g.label} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <span style={{ fontSize: "11.5px", fontWeight: "900", letterSpacing: ".06em", textTransform: "uppercase", color: "#3A3D44" }}>{g.label}</span>
                                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                  {g.opts.map((o, i) => (
                                    <button key={i} className="hv15 fo4" onClick={o.onClick} disabled={o.dis} style={{ all: "unset", cursor: "pointer", fontSize: "13.5px", fontWeight: "500", padding: "8px 12px", borderRadius: "999px", background: "#FFFFFF", boxShadow: "inset 0 0 0 1.5px #E2E3DF", opacity: `${o.op}` }}>{o.nombre}</button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : null}
                        <span style={{ fontSize: "15px", fontWeight: "700", color: `${v.intFg}` }}>{v.intEfecto}</span>
                        <p style={{ margin: "0", fontSize: "13.5px", lineHeight: "1.5", color: "#3A3D44", background: "#F4F4F1", borderRadius: "9px", padding: "10px 12px" }}>
                          {"Lo que se reconoce lo define la carrera: hasta 2 optativas y, para obligatorias, se analiza el programa. Consultalo en "}
                          <a href="mailto:diseno@udesa.edu.ar" style={{ fontWeight: "700" }}>diseno@udesa.edu.ar</a>
                          .
                        </p>
                      </div>
                    ) : null}
                  </section>
                </div>
                {" "}
              </>
            ) : null}
            {" "}
          </main>
          <footer style={{ maxWidth: "1680px", width: "100%", margin: "0 auto", padding: `12px ${v.L.side} 28px`, display: "flex", justifyContent: "space-between", gap: "8px 24px", flexWrap: "wrap", fontSize: "13px", color: "#4A4F58", lineHeight: "1.5" }}>
            <span style={{ display: "flex", flexDirection: "column", gap: "2px", alignSelf: "flex-end", maxWidth: "620px" }}>
              <span>Esta es una proyección estimativa.</span>
              <span>No reemplaza la inscripción realizada por el sistema a cargo del Departamento de Alumnos.</span>
              <span>
                {"¿Dudas con tu inscripción? Escribí a "}
                <a href="mailto:diseno@udesa.edu.ar">diseno@udesa.edu.ar</a>
              </span>
            </span>
            <img src="assets/logo-diseno-negro.png" alt="Diseño UdeSA" width="56" height="46" style={{ flex: "none", display: "block", width: "56px", height: "auto", marginLeft: "auto", alignSelf: "flex-end", opacity: ".9" }} />
          </footer>
          {v.detSheet ? (
            <div onClick={v.onCloseDet} style={{ position: "fixed", inset: "0", zIndex: "50", background: "rgba(22,23,26,.45)", display: "flex", justifyContent: "flex-end", alignItems: `${v.L.shAlign}` }}>
              <section onClick={v.stop} role="dialog" aria-modal="true" aria-label={v.det.nombre} style={{ width: `${v.L.shW}`, maxHeight: `${v.L.shMaxH}`, overflowY: "auto", background: "#FFFFFF", borderRadius: `${v.L.shRad}`, padding: "18px 20px 28px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: ".05em", textTransform: "uppercase", color: "#4A4F58" }}>{v.det.eyebrow}</span>
                  <button className="fo4" onClick={v.onCloseDet} aria-label="Cerrar" style={{ all: "unset", cursor: "pointer", width: "44px", height: "44px", flex: "none", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", background: "#F0F0EC" }}>×</button>
                </div>
                <h2 style={{ margin: "0", fontSize: "28px", lineHeight: "1.08", fontWeight: "900", letterSpacing: "-.025em" }}>{v.det.nombre}</h2>
                {v.det.aliasShow ? (
                  <span style={{ fontSize: "14px", fontStyle: "italic", color: "#3A3D44" }}>{v.det.alias}</span>
                ) : null}
                <span style={{ fontSize: "15px", fontWeight: "500" }}>{v.det.estado}</span>
                {v.det.showNote ? (
                  <section aria-labelledby="op-h2" style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", borderRadius: "14px", background: "#F4F4F1" }}>
                    <h3 id="op-h2" style={{ margin: "0", fontSize: "16px", fontWeight: "900", letterSpacing: "-.01em" }}>¿Cuál cursaste?</h3>
                    {v.det.op.selShow ? (
                      <div role="status" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", padding: "10px 12px", borderRadius: "10px", background: "#1C1E22", color: "#FFFFFF" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "0", fontSize: "14px", fontWeight: "700", lineHeight: "1.3" }}>
                          <span aria-hidden="true" style={{ flex: "none", color: "#FF5C9A" }}>✓</span>
                          <span style={{ overflowWrap: "anywhere" }}>{v.det.op.sel}</span>
                        </span>
                        <button className="fo9" onClick={v.det.op.onClear} style={{ all: "unset", cursor: "pointer", flex: "none", fontSize: "13px", fontWeight: "700", textDecoration: "underline", textUnderlineOffset: "3px", padding: "6px 2px" }}>Quitar</button>
                      </div>
                    ) : null}
                    {v.det.op.isSem ? (
                      <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: ".07em", textTransform: "uppercase", color: "#4A4F58" }}>Se ofrecieron en el {v.det.op.semLbl}</span>
                    ) : null}
                    {v.det.op.backShow ? (
                      <button className="hv10 fo4" onClick={v.det.op.onBack} style={{ all: "unset", cursor: "pointer", alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "700", color: "#1C1E22", padding: "4px 0" }}>
                        <span aria-hidden="true">←</span>
                        {v.det.op.backLbl}
                      </button>
                    ) : null}
                    {v.det.op.isSem ? (
                      <div role="tabpanel" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div role="radiogroup" aria-label="Optativas" style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          {v.det.op.semRows.map((o, i) => (
                            <button key={i} className="hv14 fo10" role="radio" aria-checked={o.on} onClick={o.onClick} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "grid", gridTemplateColumns: "18px minmax(0,1fr)", alignItems: "center", columnGap: "12px", minHeight: "48px", padding: "8px 12px", borderRadius: "10px", background: `${o.bg}`, boxShadow: `inset 0 0 0 1.5px ${o.bd}` }}>
                              <span aria-hidden="true" style={{ width: "18px", height: "18px", boxSizing: "border-box", borderRadius: "50%", background: `${o.dot}`, boxShadow: `inset 0 0 0 2px ${o.dotBd}, inset 0 0 0 5px ${o.dot}` }}></span>
                              <span style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: "0" }}>
                                <span style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                                  <span style={{ fontSize: "14.5px", fontWeight: "700", lineHeight: "1.3", color: "#1C1E22" }}>{o.titulo}</span>
                                  {o.codeShow ? (
                                    <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12px", fontWeight: "700", color: "#4A4F58" }}>{o.codigo}</span>
                                  ) : null}
                                </span>
                                {o.metaShow ? (
                                  <span style={{ fontSize: "12.5px", lineHeight: "1.35", color: "#4A4F58" }}>{o.meta}</span>
                                ) : null}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {v.det.op.isSem ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", borderTop: "1px solid #E2E3DF", paddingTop: "12px" }}>
                        <span style={{ fontSize: "12.5px", color: "#3A3D44" }}>¿No está acá?</span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {v.det.op.alts.map((t, i) => (
                            <button key={i} className="hv15 fo4" onClick={t.onClick} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", minHeight: "40px", padding: "0 14px", borderRadius: "9px", background: "#FFFFFF", boxShadow: "inset 0 0 0 1.5px #C9CBD0", fontSize: "13.5px", fontWeight: "700", color: "#1C1E22" }}>
                              <span aria-hidden="true" style={{ fontSize: "14px", lineHeight: "1", color: "#4A4F58" }}>{t.icon}</span>
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {v.det.op.isAll ? (
                      <div role="tabpanel" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <input type="search" value={v.det.op.q === undefined ? "" : v.det.op.q} onChange={v.det.op.onQ} maxLength="40" aria-label="Buscar por nombre o código" placeholder="Buscar por nombre o código" style={{ font: "inherit", fontSize: "14px", minHeight: "44px", boxSizing: "border-box", padding: "0 12px", border: "1.5px solid #C9CBD0", borderRadius: "9px", background: "#FFFFFF", color: "#1C1E22" }} />
                        <div style={{ maxHeight: "300px", overflowY: "auto", margin: "0 -4px", padding: "0 4px" }}>
                          <div role="radiogroup" aria-label="Optativas" style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            {v.det.op.allRows.map((o, i) => (
                              <button key={i} className="hv14 fo10" role="radio" aria-checked={o.on} onClick={o.onClick} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "grid", gridTemplateColumns: "18px minmax(0,1fr)", alignItems: "center", columnGap: "12px", minHeight: "48px", padding: "8px 12px", borderRadius: "10px", background: `${o.bg}`, boxShadow: `inset 0 0 0 1.5px ${o.bd}` }}>
                                <span aria-hidden="true" style={{ width: "18px", height: "18px", boxSizing: "border-box", borderRadius: "50%", background: `${o.dot}`, boxShadow: `inset 0 0 0 2px ${o.dotBd}, inset 0 0 0 5px ${o.dot}` }}></span>
                                <span style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: "0" }}>
                                  <span style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                                    <span style={{ fontSize: "14.5px", fontWeight: "700", lineHeight: "1.3", color: "#1C1E22" }}>{o.titulo}</span>
                                    {o.codeShow ? (
                                      <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12px", fontWeight: "700", color: "#4A4F58" }}>{o.codigo}</span>
                                    ) : null}
                                  </span>
                                  {o.metaShow ? (
                                    <span style={{ fontSize: "12.5px", lineHeight: "1.35", color: "#4A4F58" }}>{o.meta}</span>
                                  ) : null}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                        {v.det.op.allNone ? (
                          <span style={{ fontSize: "13px", color: "#3A3D44" }}>Ninguna coincide. Si es de otra carrera, cargala en Otra carrera.</span>
                        ) : null}
                      </div>
                    ) : null}
                    {v.det.op.isMano ? (
                      <label role="tabpanel" style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", fontWeight: "500", color: "#3A3D44" }}>
                        Nombre de la materia
                        <input value={v.det.op.mano === undefined ? "" : v.det.op.mano} onChange={v.det.op.onMano} maxLength="80" placeholder="Por ejemplo, Microeconomía" style={{ font: "inherit", fontSize: "14px", minHeight: "44px", boxSizing: "border-box", padding: "0 12px", border: "1.5px solid #C9CBD0", borderRadius: "9px", background: "#FFFFFF", color: "#1C1E22" }} />
                      </label>
                    ) : null}
                    {v.det.op.isEq ? (
                      <div role="tabpanel">
                        <div role="radiogroup" aria-label="Optativas" style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          {v.det.op.eqRows.map((o, i) => (
                            <button key={i} className="hv14 fo10" role="radio" aria-checked={o.on} onClick={o.onClick} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "grid", gridTemplateColumns: "18px minmax(0,1fr)", alignItems: "center", columnGap: "12px", minHeight: "48px", padding: "8px 12px", borderRadius: "10px", background: `${o.bg}`, boxShadow: `inset 0 0 0 1.5px ${o.bd}` }}>
                              <span aria-hidden="true" style={{ width: "18px", height: "18px", boxSizing: "border-box", borderRadius: "50%", background: `${o.dot}`, boxShadow: `inset 0 0 0 2px ${o.dotBd}, inset 0 0 0 5px ${o.dot}` }}></span>
                              <span style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: "0" }}>
                                <span style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                                  <span style={{ fontSize: "14.5px", fontWeight: "700", lineHeight: "1.3", color: "#1C1E22" }}>{o.titulo}</span>
                                  {o.codeShow ? (
                                    <span style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: "12px", fontWeight: "700", color: "#4A4F58" }}>{o.codigo}</span>
                                  ) : null}
                                </span>
                                {o.metaShow ? (
                                  <span style={{ fontSize: "12.5px", lineHeight: "1.35", color: "#4A4F58" }}>{o.meta}</span>
                                ) : null}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </section>
                ) : null}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                  <button className="fo4" onClick={v.det.onToggle} style={{ all: "unset", cursor: "pointer", alignSelf: "flex-start", fontSize: "15px", fontWeight: "700", padding: "13px 18px", borderRadius: "10px", background: `${v.det.btnBg}`, color: `${v.det.btnFg}`, boxShadow: `inset 0 0 0 1.5px ${v.det.btnBd}` }}>{v.det.toggleLbl}</button>
                  {v.det.progShow ? (
                    <a className="hv13 fo4" href={v.det.progUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "14px", fontWeight: "700", color: "#1C1E22", textDecoration: "none", padding: "11px 14px", borderRadius: "9px", boxShadow: "inset 0 0 0 1.5px #C9CBD0" }}>
                      {v.det.progLbl}
                      <span aria-hidden="true">↗</span>
                      <span style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)" }}>, se abre en otra pestaña</span>
                    </a>
                  ) : null}
                </div>
                <h3 style={{ margin: "8px 0 0", display: "flex", gap: "8px", alignItems: "center", fontSize: "12px", fontWeight: "900", letterSpacing: ".06em", textTransform: "uppercase" }}>
                  <span style={{ width: "18px", height: "3px", background: "#1C1E22" }}></span>
                  Para cursarla necesitás
                </h3>
                {v.det.sinReq ? (
                  <span style={{ fontSize: "14px", color: "#3A3D44" }}>{v.det.sinReqText}</span>
                ) : null}
                {v.det.meters.map((mt, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", fontSize: "14px" }}>
                      <span style={{ fontWeight: "700" }}>{mt.label}</span>
                      <span style={{ color: `${mt.fg}`, fontWeight: "500" }}>{mt.txt}</span>
                    </div>
                    <div aria-hidden="true" style={{ display: "flex", gap: "2px", height: "10px" }}>
                      {mt.segs.map((sg, i) => (
                        <span key={i} style={{ flex: "1", borderRadius: "2px", background: `${sg.bg}` }}></span>
                      ))}
                    </div>
                  </div>
                ))}
                {v.det.reqs.map((q, i) => (
                  <button key={i} className="fo5" onClick={q.onClick} style={{ all: "unset", cursor: "pointer", display: "flex", gap: "10px", fontSize: "15px", minHeight: "36px", alignItems: "center" }}>
                    <span aria-hidden="true" style={{ fontWeight: "900" }}>{q.glyph}</span>
                    <span style={{ flex: "1" }}>{q.nombre}</span>
                    <span style={{ fontSize: "13px", color: "#4A4F58" }}>{q.lbl}</span>
                  </button>
                ))}
                {v.det.habShow ? (
                  <>
                    <h3 style={{ margin: "8px 0 0", display: "flex", gap: "8px", alignItems: "center", fontSize: "12px", fontWeight: "900", letterSpacing: ".06em", textTransform: "uppercase" }}>
                      <span style={{ width: "18px", height: "3px", background: "#E0005A" }}></span>
                      Habilita
                    </h3>
                    {v.det.sinHab ? (
                      <span style={{ fontSize: "14px", color: "#3A3D44" }}>No es correlativa de otras materias.</span>
                    ) : null}
                    {v.det.habs.map((q, i) => (
                      <button key={i} className="fo5" onClick={q.onClick} style={{ all: "unset", cursor: "pointer", display: "flex", gap: "10px", fontSize: "15px", minHeight: "36px", alignItems: "center" }}>
                        <span aria-hidden="true" style={{ fontWeight: "900", color: "#C2004C" }}>→</span>
                        <span style={{ flex: "1" }}>{q.nombre}</span>
                        <span style={{ fontSize: "13px", color: "#4A4F58" }}>{q.lbl}</span>
                      </button>
                    ))}
                  </>
                ) : null}
              </section>
            </div>
          ) : null}
          {v.moveShow ? (
            <div onClick={v.onMoveClose} style={{ position: "fixed", inset: "0", zIndex: "55", background: "rgba(22,23,26,.45)", display: "flex", alignItems: "flex-end" }}>
              <section onClick={v.stop} role="dialog" aria-modal="true" aria-labelledby="mv-h" style={{ width: "100%", maxHeight: "86vh", overflowY: "auto", background: "#FFFFFF", borderRadius: "18px 18px 0 0", padding: "16px 18px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: ".06em", textTransform: "uppercase", color: "#4A4F58" }}>Mover a</span>
                  <button className="fo4" onClick={v.onMoveClose} aria-label="Cerrar" style={{ all: "unset", cursor: "pointer", width: "44px", height: "44px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", background: "#F0F0EC" }}>×</button>
                </div>
                <h2 id="mv-h" style={{ margin: "-6px 0 0", fontSize: "24px", lineHeight: "1.1", fontWeight: "900", letterSpacing: "-.02em" }}>{v.moveNombre}</h2>
                <div role="group" aria-label="Semestres" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {v.moveOpts.map((o, i) => (
                    <button key={i} className="fo4" onClick={o.onClick} aria-pressed={o.on} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", minHeight: "52px", padding: "10px 14px", borderRadius: "10px", background: `${o.bg}`, color: `${o.fg}`, boxShadow: `inset 0 0 0 1.5px ${o.bd}` }}>
                      <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontSize: "16px", fontWeight: "700" }}>{o.label}</span>
                        {o.subShow ? (
                          <span style={{ fontSize: "12.5px", fontWeight: "500" }}>{o.sub}</span>
                        ) : null}
                      </span>
                      <span aria-hidden="true" style={{ fontWeight: "900" }}>{o.mark}</span>
                    </button>
                  ))}
                  <button className="fo4" onClick={v.onMoveNew} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", minHeight: "52px", padding: "10px 14px", borderRadius: "10px", border: "1.5px dashed #8A8F98", fontSize: "15px", fontWeight: "700" }}>+ A un semestre nuevo</button>
                </div>
                <button className="fo5" onClick={v.onMoveDet} style={{ all: "unset", cursor: "pointer", alignSelf: "flex-start", fontSize: "14px", fontWeight: "500", textDecoration: "underline", padding: "10px 0" }}>Ver correlativas y programa</button>
              </section>
            </div>
          ) : null}
          {v.modalShow ? (
            <div onClick={v.onCloseModal} style={{ position: "fixed", inset: "0", background: "rgba(22,23,26,.6)", zIndex: "60", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "16px", overflowY: "auto" }}>
              <div onClick={v.stop} role="dialog" aria-modal="true" aria-label={v.modalTitle} style={{ background: "#FFFFFF", borderRadius: "16px", width: "100%", maxWidth: `${v.modalW}`, margin: "auto 0", padding: `${v.L.cardPad}`, display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                  <h2 style={{ margin: "0", fontSize: "26px", fontWeight: "900", letterSpacing: "-.025em" }}>{v.modalTitle}</h2>
                  <button className="fo4" onClick={v.onCloseModal} aria-label="Cerrar" style={{ all: "unset", cursor: "pointer", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", background: "#F0F0EC" }}>×</button>
                </div>
                {v.mReset ? (
                  <>
                    <p style={{ margin: "0", fontSize: "16px", lineHeight: "1.5", color: "#3A3D44" }}>Se borra todo lo que cargaste. Si querés retomarlo, descargá antes tu archivo.</p>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <button className="fo4" onClick={v.onDescargarJson} style={{ all: "unset", cursor: "pointer", fontSize: "14px", fontWeight: "700", padding: "12px 16px", borderRadius: "9px", boxShadow: "inset 0 0 0 1.5px #C9CBD0" }}>Descargar archivo</button>
                      <button className="fo4" onClick={v.onReiniciar} style={{ all: "unset", cursor: "pointer", fontSize: "14px", fontWeight: "700", padding: "12px 18px", borderRadius: "9px", background: "#E0005A", color: "#FFFFFF" }}>Volver a empezar</button>
                    </div>
                  </>
                ) : null}
                {v.mExport ? (
                  <>
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>
                      <label style={{ flex: "1 1 260px", display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", fontWeight: "700" }}>
                        Tu nombre
                        <input value={v.nombreExp === undefined ? "" : v.nombreExp} onChange={v.onNombreExp} maxLength="80" autoComplete="name" placeholder="Nombre y apellido" style={{ font: "inherit", fontSize: "20px", fontWeight: "700", padding: "12px 14px", border: "1.5px solid #C9CBD0", borderRadius: "10px", color: "#1C1E22" }} />
                      </label>
                      <button className="hv7 fo4" onClick={v.onImprimir} style={{ all: "unset", cursor: "pointer", fontSize: "15px", fontWeight: "700", padding: "15px 20px", borderRadius: "10px", background: "#E0005A", color: "#FFFFFF" }}>Descargar PDF</button>
                      <button className="hv15 fo4" onClick={v.onDescargarJson} style={{ all: "unset", cursor: "pointer", fontSize: "15px", fontWeight: "700", padding: "15px 18px", borderRadius: "10px", boxShadow: "inset 0 0 0 1.5px #C9CBD0" }}>Archivo para retomar</button>
                    </div>
                    <div style={{ borderRadius: "10px", background: "#E8E8E4", padding: `${v.L.posterPad}`, overflow: "hidden" }}>
                      {" "}
                      <div ref={v.posterRef} style={{ width: "100%", height: `${v.posterH}`, position: "relative" }}>
                        {" "}
                        <div data-print="" style={{ position: "absolute", left: "0", top: "0", width: "1123px", height: "794px", transform: `scale(${v.posterScale})`, transformOrigin: "0 0", background: "#FFFFFF", color: "#1C1E22", padding: "44px 48px 36px", display: "flex", flexDirection: "column", gap: "22px", fontFamily: "Roboto,system-ui,sans-serif", boxShadow: "0 2px 16px rgba(22,23,26,.12)" }}>
                          <img src="assets/logo-diseno-negro.png" alt="Diseño UdeSA" style={{ position: "absolute", right: "0", bottom: "0", width: "84px", height: "auto", display: "block", opacity: ".92" }} />
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "32px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px", minWidth: "0" }}>
                              <span style={{ fontSize: "54px", fontWeight: "900", letterSpacing: "-.04em", lineHeight: ".95", color: `${v.posterNameFg}` }}>{v.posterName}</span>
                              <span style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "15px" }}>
                                <span style={{ width: "10px", height: "10px", background: "#FF0064", borderRadius: "2px" }}></span>
                                <strong style={{ fontWeight: "900" }}>Licenciatura en Diseño</strong>
                                <span style={{ color: "#3A3D44" }}>Universidad de San Andrés</span>
                              </span>
                            </div>
                            <span style={{ flex: "none", fontSize: "11px", fontWeight: "500", color: "#4A4F58", letterSpacing: ".02em", paddingTop: "6px" }}>{v.posterMeta}</span>
                          </div>
                          <div style={{ height: "2px", background: "#1C1E22" }}></div>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "104px repeat(4,minmax(0,1fr))" }}>
                              <span></span>
                              {v.pYears.map((py, i) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0 10px 7px", borderLeft: "1px solid #E4E4E0" }}>
                                  <span style={{ fontSize: "15px", fontWeight: "900", letterSpacing: "-.01em" }}>{py.label}</span>
                                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#4A4F58" }}>{py.txt}</span>
                                </div>
                              ))}
                            </div>
                            {v.pLanes.map((pl, i) => (
                              <div key={i} style={{ display: "grid", gridTemplateColumns: "104px repeat(4,minmax(0,1fr))", borderTop: "1px solid #E4E4E0" }}>
                                <span style={{ fontSize: "9.5px", fontWeight: "900", letterSpacing: ".07em", textTransform: "uppercase", lineHeight: "1.3", padding: "9px 8px 9px 0" }}>{pl.label}</span>
                                {pl.cells.map((pc, i) => (
                                  <div key={i} style={{ display: "flex", flexDirection: "column", gap: "3px", padding: "7px 10px", borderLeft: "1px solid #E4E4E0" }}>
                                    {pc.boxes.map((b, i) => (
                                      <span key={i} style={{ height: "20px", display: "flex", alignItems: "center", padding: "0 7px", borderRadius: "4px", fontSize: "10px", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", background: `${b.bg}`, color: `${b.fg}`, boxShadow: `inset 0 0 0 1.25px ${b.bd}` }}>{b.nombre}</span>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            ))}
                            <div style={{ display: "flex", gap: "16px", alignItems: "center", borderTop: "1px solid #E4E4E0", paddingTop: "9px", fontSize: "9.5px", color: "#3A3D44" }}>
                              <span style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                                <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#1C1E22" }}></span>
                                Aprobada
                              </span>
                              <span style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                                <span style={{ width: "10px", height: "10px", borderRadius: "2px", boxShadow: "inset 0 0 0 1.5px #E0005A" }}></span>
                                En tu inscripción
                              </span>
                              <span style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                                <span style={{ width: "10px", height: "10px", borderRadius: "2px", boxShadow: "inset 0 0 0 1.25px #C9CBD0" }}></span>
                                Por cursar
                              </span>
                            </div>
                          </div>
                          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "8px", paddingRight: "140px" }}>
                            <span style={{ fontSize: "10px", fontWeight: "900", letterSpacing: ".08em", textTransform: "uppercase" }}>{v.pSemsTitle}</span>
                            <div style={{ display: "flex", alignItems: "stretch" }}>
                              {v.pSems.map((ps, i) => (
                                <div key={i} style={{ flex: "0 1 136px", minWidth: "0", marginLeft: `${ps.ml}`, display: "flex", flexDirection: "column", gap: "4px", padding: "8px", borderRadius: "6px", background: `${ps.bg}`, color: `${ps.fg}` }}>
                                  <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: "900", marginBottom: "2px" }}>
                                    <span style={{ lineHeight: "1.2" }}>{ps.label}</span>
                                    {ps.isInt ? (
                                      <span aria-label="Intercambio" style={{ fontSize: "13px", lineHeight: "1" }}>✈︎</span>
                                    ) : null}
                                  </span>
                                  {ps.isInt ? (
                                    <span style={{ fontSize: "9px", fontWeight: "700", letterSpacing: ".06em", textTransform: "uppercase", color: "#C9CBD0" }}>Intercambio</span>
                                  ) : null}
                                  {ps.items.map((n, i) => (
                                    <span key={i} style={{ fontSize: "9.5px", lineHeight: "1.25", padding: "3px 6px", borderRadius: "3px", background: `${ps.itemBg}`, overflowWrap: "anywhere" }}>{n}</span>
                                  ))}
                                </div>
                              ))}
                            </div>
                            <span style={{ fontSize: "9.5px", color: "#4A4F58", marginTop: "2px" }}>
                              {"¿Dudas con tu inscripción? Escribí a "}
                              <strong style={{ fontWeight: "700", color: "#1C1E22" }}>diseno@udesa.edu.ar</strong>
                            </span>
                          </div>
                        </div>
                        {" "}
                      </div>
                      {" "}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
