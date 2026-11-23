import { NavLink } from 'react-router-dom';
import { Car, Banknote, FileText, LayoutGrid, Wallet } from 'lucide-react';
import './Sidebar.css';

const ITEMS = [
  { to: '/', label: 'Inicio', icon: LayoutGrid, end: true },
  { to: '/flota', label: 'Flota', icon: Car },
  { to: '/tarifas', label: 'Tarifas', icon: Banknote },
  { to: '/contratos', label: 'Cotizaciones y Contratos', icon: FileText },
  { to: '/cobranzas', label: 'Cobranzas', icon: Wallet },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__sticky">
      <div className="sidebar__brand">
        <span className="sidebar__logo">DriveOn S.A</span>
      </div>
      <nav aria-label="Navegación principal">
        <p className="sidebar__section">Navegación</p>
        <ul className="sidebar__list">
          {ITEMS.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink to={to} end={end} className="sidebar__link">
                <Icon size={18} aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      </div>
    </aside>
  );
}
