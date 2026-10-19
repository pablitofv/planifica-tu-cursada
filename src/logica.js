// Base de la lógica y su componente React. Mantiene la semántica del runtime de la v8:
// setState aplica el cambio en el momento (this.state ya lo ve en la línea siguiente) y después
// re-renderiza; el callback corre cuando React terminó de pintar.
import React from 'react';

export class Logica {
  constructor(props) { this.props = props || {}; this.state = {}; this.host = null; }
  setState(update, cb) { if (this.host) this.host.setLogicState(update, cb); }
  forceUpdate() { if (this.host) this.host.forceUpdate(); }
  componentDidMount() {}
  componentDidUpdate(_prevProps) {}
  componentWillUnmount() {}
  // Lo que la vista renderiza (se mezcla sobre las props)
  renderVals() { return {}; }
}

const llamar = fn => { try { fn(); } catch (e) { console.error(e); } };

// Componente que monta una clase Logica y le pasa a Vista el resultado de renderVals() como `v`
export function conLogica(L, Vista) {
  return class Host extends React.Component {
    constructor(props) {
      super(props);
      this.state = { v: 0 };
      this.logic = new L(props);
      this.logic.host = this;
    }
    setLogicState(update, cb) {
      const prev = this.logic.state, patch = typeof update === 'function' ? update(prev) : update;
      this.logic.state = { ...prev, ...patch };
      this.setState(s => ({ v: s.v + 1 }), cb);
    }
    componentDidMount() { llamar(() => this.logic.componentDidMount()); }
    componentDidUpdate(prevProps) { this.logic.props = this.props; llamar(() => this.logic.componentDidUpdate(prevProps)); }
    componentWillUnmount() { llamar(() => this.logic.componentWillUnmount()); }
    render() {
      this.logic.props = this.props;
      return React.createElement(Vista, { v: { ...this.props, ...this.logic.renderVals() } });
    }
  };
}
