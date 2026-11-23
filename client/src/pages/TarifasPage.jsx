import { useState } from 'react';
import { Car, Pencil, Plus, Table2, History, ArrowRight } from 'lucide-react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import TableState from '../components/ui/TableState';
import { useToast } from '../components/ui/Toast';
import EditarTarifaModal from '../components/tarifas/EditarTarifaModal';
import HistorialTarifas from '../components/tarifas/HistorialTarifas';
import { useAsync } from '../hooks/useAsync';
import { api } from '../services/api';
import { formatDateShort, formatKm, formatMoney } from '../utils/format';
import './TarifasPage.css';

export default function TarifasPage() {
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const tarifas = useAsync(api.getTarifas, []);
  const historial = useAsync(() => api.getHistorialTarifas(5), []);
  const items = tarifas.data ?? [];

  const handleSaved = () => {
    setEditing(null);
    toast.success('Tarifa actualizada correctamente');
    tarifas.reload();
    historial.reload();
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Tarifas y Condiciones Semanales</h1>
          <p className="page-subtitle tarifas-desc">Esquemas de cobro semanal y garantías por modelo de vehículo.</p>
        </div>
        <Button icon={Plus} onClick={toast.soon}>
          Nueva tarifa
        </Button>
      </div>

      <article className="card flota-tarifada">
        <div>
          <p className="eyebrow">Flota tarifada</p>
          <p className="flota-tarifada__value">{tarifas.data ? items.length : '—'} Modelos</p>
          <p className="flota-tarifada__caption">100% activos en rotación</p>
        </div>
        <span className="flota-tarifada__icon" aria-hidden="true">
          <Car size={20} />
        </span>
      </article>

      <section className="card" aria-labelledby="tarifas-vigentes">
        <h2 id="tarifas-vigentes" className="section-title card-title">
          <Table2 size={18} className="text-primary" aria-hidden="true" />
          Tabla de Tarifas Vigentes
        </h2>
        <div className="table-scroll">
          <table className="table tarifas-table">
            <thead>
              <tr>
                <th>Modelo de vehículo</th>
                <th>Categoría</th>
                <th className="num">Tarifa semanal</th>
                <th className="num">Depósito en garantía</th>
                <th className="num">Km semanal incluido</th>
                <th className="num">Km excedente</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div className="modelo">
                      <span className="modelo__icon" aria-hidden="true"><Car size={16} /></span>
                      <div>
                        <p className="modelo__name">{t.modelo} / {t.tipo}</p>
                        <p className="modelo__desc">{t.descripcionMotor}</p>
                      </div>
                    </div>
                  </td>
                  <td><Badge tone="info">{t.categoria}</Badge></td>
                  <td className="num">
                    <span className="tarifa">{formatMoney(t.tarifaSemanal)}</span>
                    <span className="unit"> / sem</span>
                    {t.proximoCambio && (
                      <span className="programado">Programado desde {formatDateShort(t.proximoCambio.vigenteDesde)}</span>
                    )}
                  </td>
                  <td className="num">{formatMoney(t.deposito)}</td>
                  <td className="num">{formatKm(t.kmSemanal)}<span className="unit"> / sem</span></td>
                  <td className="num">{formatMoney(t.kmExcedente)}<span className="unit"> / km</span></td>
                  <td>
                    <button type="button" className="link-action" onClick={() => setEditing(t)} aria-label={`Editar tarifa de ${t.modelo}`}>
                      <Pencil size={14} aria-hidden="true" />
                      Editar tarifa
                    </button>
                  </td>
                </tr>
              ))}
              <TableState colSpan={7} loading={tarifas.loading && !tarifas.data} error={tarifas.error} empty={!tarifas.loading && !tarifas.error && items.length === 0} onRetry={tarifas.reload} />
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" aria-labelledby="tarifas-historial">
        <div className="card-title card-title--split">
          <h2 id="tarifas-historial" className="section-title">
            <History size={18} aria-hidden="true" />
            Historial de Modificaciones de Tarifas
          </h2>
          <span className="eyebrow">Auditoría del sistema</span>
        </div>
        <HistorialTarifas state={historial} />
        <div className="historial-footer">
          <button type="button" className="link-action" onClick={toast.soon}>
            Ver historial completo
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        </div>
      </section>

      {editing && <EditarTarifaModal tarifa={editing} onClose={() => setEditing(null)} onSaved={handleSaved} />}
    </div>
  );
}
