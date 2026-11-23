import './StatusDot.css';

/** Punto de color; por defecto hereda el color del texto (currentColor). */
export default function StatusDot({ color }) {
  return <span className="status-dot" style={color ? { background: color } : undefined} aria-hidden="true" />;
}
