import { useNavigate } from 'react-router-dom';
import { Car, CheckCircle2, KeyRound, ClipboardList, TriangleAlert, Plus } from 'lucide-react';
import Button from '../components/ui/Button';
import KpiCard from '../components/ui/KpiCard';
import AlertasPanel from '../components/inicio/AlertasPanel';
import { useAsync } from '../hooks/useAsync';
import { api } from '../services/api';
import { formatNumber } from '../utils/format';
import './InicioPage.css';

const pct = (n) => `${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 }).format(Number(n) || 0)}%`;

export default function InicioPage() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsync(api.getDashboard, []);
  const kpis = data?.kpis;
  const dash = (v) => (kpis ? v : '—');

  return (
    <div className="page">
      <div className="page-head">
        <h1 className="page-title">Panel de Control</h1>
        <Button icon={Plus} onClick={() => navigate('/contratos')}>
          Nuevo Contrato
        </Button>
      </div>

      {error && (
        <div className="inline-error" role="alert">
          <span>{error}</span>
          <Button variant="secondary" size="sm" onClick={reload}>Reintentar</Button>
        </div>
      )}

      <section className="kpi-grid" aria-label="Indicadores principales" aria-busy={loading}>
        <KpiCard
          label="Flota total"
          icon={Car}
          value={dash(formatNumber(kpis?.flotaTotal))}
          badge="100% flota"
          badgeTone="info"
          caption="Unidades registradas activas"
        />
        <KpiCard
          label="En circulación"
          icon={CheckCircle2}
          value={dash(formatNumber(kpis?.alquilados))}
          badge={pct(kpis?.pctAlquilados)}
          badgeTone="active"
          caption="Contratos activos"
          tone="success"
        />
        <KpiCard
          label="Listos para entrega"
          icon={KeyRound}
          value={dash(formatNumber(kpis?.disponibles))}
          badge={pct(kpis?.pctDisponibles)}
          badgeTone="info"
          caption="Vehículos libres"
          tone="info"
        />
        <KpiCard
          label="Por cobrar semana"
          icon={ClipboardList}
          value={dash(formatNumber(kpis?.pagosPendientes))}
          badge={kpis?.contratosEnMora > 0 ? 'Con atraso' : 'En término'}
          badgeTone={kpis?.contratosEnMora > 0 ? 'danger' : 'info'}
          caption="Pagos pendientes"
          tone="info"
        />
        <KpiCard
          label="En mora"
          icon={TriangleAlert}
          value={dash(formatNumber(kpis?.contratosEnMora))}
          valueTone={kpis?.contratosEnMora > 0 ? 'danger' : undefined}
          badge={kpis?.contratosEnMora > 0 ? 'Crítico' : 'Sin mora'}
          badgeTone={kpis?.contratosEnMora > 0 ? 'danger' : 'active'}
          caption="Contratos en mora"
          tone="danger"
        />
      </section>

      <AlertasPanel alertas={data?.alertas} loading={loading} />
    </div>
  );
}
