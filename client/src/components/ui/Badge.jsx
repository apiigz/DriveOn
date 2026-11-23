import StatusDot from './StatusDot';
import './Badge.css';

/** tone: available | info | danger | active | ok | neutral */
export default function Badge({ tone = 'info', dot = false, children, className = '' }) {
  return (
    <span className={`badge badge--${tone} ${className}`}>
      {dot && <StatusDot />}
      {children}
    </span>
  );
}
