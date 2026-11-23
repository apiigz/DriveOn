import { Building2 } from 'lucide-react';
import TableState from '../ui/TableState';
import { formatDateShort, formatKm, formatMoney } from '../../utils/format';
import './HistorialTarifas.css';

const formatValue = (campo, value) => {
  if (campo === 'tarifaSemanal' || campo === 'deposito' || campo === 'kmExcedente') return formatMoney(value);
  if (campo === 'kmSemanal') return formatKm(value);
  return String(value);
};

function labelFor(entry) {
  switch (entry.campo) {
    case 'tarifaSemanal':
      return 'Tarifa semanal ajustada';
    case 'deposito':
      return 'Depósito actualizado';
    case 'kmSemanal':
      return Number(entry.nuevo) > Number(entry.anterior) ? 'Km semanal ampliado' : 'Km semanal ajustado';
    case 'kmExcedente':
      return 'Km excedente ajustado';
    case 'categoria':
      return 'Categoría cambiada';
    default:
      return 'Valor modificado';
  }
}

function Detalle({ entry }) {
  return (
    <span>
      {labelFor(entry)} de <s className="detalle__old">{formatValue(entry.campo, entry.anterior)}</s> a{' '}
      <span className="detalle__new">{formatValue(entry.campo, entry.nuevo)}</span>
    </span>
  );
}

export default function HistorialTarifas({ state }) {
  const items = state.data ?? [];
  return (
    <div className="table-scroll">
      <table className="table historial-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Vehículo</th>
            <th>Detalle de modificación</th>
            <th>Responsable</th>
            <th>Motivo declarado</th>
          </tr>
        </thead>
        <tbody>
          {items.map((h) => (
            <tr key={h.id}>
              <td className="nowrap historial__fecha">{formatDateShort(h.fecha)}</td>
              <td className="nowrap">{h.vehiculo}</td>
              <td className="historial__detalle"><Detalle entry={h} /></td>
              <td className="nowrap">
                <span className="responsable">
                  <Building2 size={14} aria-hidden="true" />
                  {h.responsable}
                </span>
              </td>
              <td className="historial__motivo">{h.motivo}</td>
            </tr>
          ))}
          <TableState colSpan={5} loading={state.loading && !state.data} error={state.error} empty={!state.loading && !state.error && items.length === 0} onRetry={state.reload} />
        </tbody>
      </table>
    </div>
  );
}
