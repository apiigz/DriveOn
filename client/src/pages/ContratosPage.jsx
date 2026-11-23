import { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Eye, FilePlus2, FolderOpen, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import Badge from '../components/ui/Badge';
import TableState from '../components/ui/TableState';
import { useToast } from '../components/ui/Toast';
import NuevoContratoForm from '../components/contratos/NuevoContratoForm';
import { useAsync } from '../hooks/useAsync';
import { api } from '../services/api';
import { formatMoney, pluralize } from '../utils/format';
import { toneForContrato } from '../utils/tones';
import './ContratosPage.css';

const PAGE_SIZE = 4;
const ESTADOS = ['Activo', 'Por vencer', 'Pendiente entrega'];

export default function ContratosPage() {
  const toast = useToast();
  const [estado, setEstado] = useState('');
  const [page, setPage] = useState(1);

  const { data, loading, error, reload } = useAsync(
    () => api.getContratos({ estado, page, pageSize: PAGE_SIZE }),
    [estado, page],
  );
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(data?.totalPages ?? 1, 1);

  const handleCreated = () => {
    if (page === 1) reload();
    else setPage(1);
  };

  return (
    <div className="page">
      <div className="page-head">
        <h1 className="page-title">Emisión y Contratos Vigentes</h1>
        <span className="validador">
          <ShieldCheck size={14} aria-hidden="true" />
          Validador AFIP / Seguros Activo
        </span>
      </div>

      <section aria-labelledby="nueva-cotizacion" className="contratos-section">
        <h2 id="nueva-cotizacion" className="section-title">
          <FilePlus2 size={18} aria-hidden="true" />
          Nueva Cotización / Emisión de Contrato
        </h2>
        <NuevoContratoForm onCreated={handleCreated} />
      </section>

      <section aria-labelledby="contratos-vigentes" className="contratos-section">
        <div className="contratos-head">
          <h2 id="contratos-vigentes" className="section-title">
            <FolderOpen size={18} aria-hidden="true" />
            Contratos Vigentes y Recientes
          </h2>
          <label className="filtro-estado">
            <SlidersHorizontal size={14} aria-hidden="true" />
            <span>Filtrar por estado:</span>
            <select
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Todos</option>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="card">
          <div className="table-scroll">
            <table className="table contratos-table">
              <thead>
                <tr>
                  <th>N° Contrato</th>
                  <th>Conductor</th>
                  <th>Patente</th>
                  <th>Sucursal</th>
                  <th>Duración</th>
                  <th className="num">Tarifa semanal</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id}>
                    <td className="nowrap">
                      <button type="button" className="link-action" onClick={toast.soon}>#{c.numero}</button>
                    </td>
                    <td className="nowrap">{c.conductor}</td>
                    <td><span className="chip">{c.patente}</span></td>
                    <td>{c.sucursal}</td>
                    <td className="nowrap">{c.duracionSemanas} {pluralize(c.duracionSemanas, 'semana', 'semanas')}</td>
                    <td className="num">{formatMoney(c.tarifaSemanal)}</td>
                    <td><Badge tone={toneForContrato(c.estado)} dot>{c.estado}</Badge></td>
                    <td>
                      <div className="acciones">
                        <button type="button" className="link-action" onClick={toast.soon}>
                          <Eye size={14} aria-hidden="true" />
                          Ver detalle
                        </button>
                        <button type="button" className="icon-btn" onClick={toast.soon} aria-label={`Descargar contrato ${c.numero}`}>
                          <Download size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                <TableState colSpan={8} loading={loading && !data} error={error} empty={!loading && !error && items.length === 0} onRetry={reload} />
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span>
              Mostrando {items.length} de {total} {pluralize(total, 'contrato registrado', 'contratos registrados')}
            </span>
            <nav className="pager" aria-label="Paginación de contratos">
              <button type="button" className="icon-btn" disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Página anterior">
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <span className="pager__label">Página {page} / {totalPages}</span>
              <button type="button" className="icon-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)} aria-label="Página siguiente">
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </section>
    </div>
  );
}
