import Badge from './Badge';
import './KpiCard.css';

/** tone: neutral | success | info | danger — color de la leyenda inferior y del ícono. */
export default function KpiCard({ label, icon: Icon, value, badge, badgeTone, caption, tone = 'neutral', valueTone }) {
  return (
    <article className="kpi card">
      <header className="kpi__head">
        <h3 className="kpi__label">{label}</h3>
        {Icon && <Icon size={18} strokeWidth={2} className={`kpi__icon kpi__icon--${tone}`} aria-hidden="true" />}
      </header>
      <div className="kpi__main">
        <span className={`kpi__value ${valueTone ? `kpi__value--${valueTone}` : ''}`}>{value}</span>
        <Badge tone={badgeTone}>{badge}</Badge>
      </div>
      <p className={`kpi__caption kpi__caption--${tone}`}>{caption}</p>
    </article>
  );
}
