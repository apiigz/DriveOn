import { useNavigate } from 'react-router-dom';
import { CalendarClock, ClipboardCheck, Gauge, TriangleAlert } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import './AlertasPanel.css';

const TIPO = {
  mora: { icon: TriangleAlert, color: 'var(--color-danger)', tone: 'danger' },
  kilometraje: { icon: Gauge, color: 'var(--color-primary)', tone: 'info' },
  renovacion: { icon: CalendarClock, color: 'var(--color-primary)', tone: 'info' },
  disponible: { icon: ClipboardCheck, color: 'var(--color-text)', tone: 'active' },
};

function AlertaItem({ alerta }) {
  const navigate = useNavigate();
  const { icon: Icon, color, tone } = TIPO[alerta.tipo] ?? TIPO.kilometraje;
  // En mora y renovación el código es el N° de contrato y el subtítulo el conductor.
  const esContrato = alerta.tipo === 'mora' || alerta.tipo === 'renovacion';

  return (
    <li className="alerta">
      <Icon size={20} style={{ color }} className="alerta__icon" aria-hidden="true" />
      <div className="alerta__body">
        <p className="alerta__head">
          <span className="alerta__title">{alerta.titulo}</span>
          {alerta.codigo && (esContrato ? <span className="alerta__codigo">#{alerta.codigo}</span> : <span className="chip">{alerta.codigo}</span>)}
          {alerta.subtitulo && (
            <span className="alerta__subtitle">• {esContrato ? 'Conductor: ' : ''}{alerta.subtitulo}</span>
          )}
        </p>
        <p className="alerta__desc">{alerta.descripcion}</p>
      </div>
      <div className="alerta__actions">
        <Badge tone={tone} className="alerta__tag">{alerta.etiqueta}</Badge>
        <Button variant="ghost" size="sm" className="alerta__btn" onClick={() => navigate(alerta.ruta)}>
          {alerta.accion}
        </Button>
      </div>
    </li>
  );
}

export default function AlertasPanel({ alertas, loading }) {
  const count = alertas?.length ?? 0;

  return (
    <section className="card alertas" aria-labelledby="alertas-title">
      <header className="alertas__head">
        <div>
          <p className="eyebrow">Acciones inmediatas</p>
          <h2 id="alertas-title" className="alertas__title">Alertas Operativas y Notificaciones</h2>
        </div>
        {alertas && <Badge tone="danger">{count} {count === 1 ? 'requerida' : 'requeridas'}</Badge>}
      </header>

      {loading && !alertas && <p className="table-state" role="status">Cargando…</p>}
      {alertas && count === 0 && <p className="table-state">No hay alertas pendientes</p>}
      {count > 0 && (
        <ul className="alertas__list">
          {alertas.map((a) => (
            <AlertaItem key={a.id} alerta={a} />
          ))}
        </ul>
      )}
    </section>
  );
}
