import { createRoot } from 'react-dom/client';
import './estilos.css';
import App from './App.js';
import Vista from './Vista.jsx';
import { conLogica } from './logica.js';

const Raiz = conLogica(App, Vista);
createRoot(document.getElementById('root')).render(<Raiz />);
