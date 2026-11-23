import { useState } from 'react';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import SearchInput from '../components/ui/SearchInput';
import Select from '../components/ui/Select';
import StatusDot from '../components/ui/StatusDot';
import TableState from '../components/ui/TableState';
import { useToast } from '../components/ui/Toast';
import RegistrarCobroModal from '../components/cobranzas/RegistrarCobroModal';
import CuentaCorrientePanel from '../components/cobranzas/CuentaCorrientePanel';
import { useAsync } from '../hooks/useAsync';
import { useDebounce } from '../hooks/useDebounce';
import { api } from '../services/api';
import { formatDateLong, formatMoney, pluralize } from '../utils/format';
import { toneForCobranza } from '../utils/tones';
import './CobranzasPage.css';

const PAGE_SIZE = 7;
const ESTADOS = [
  { value: '', label: 'Todos los estados' },
  { value: 'Al día', label: 'Al día' },
  { value: 'Pendiente', label: 'Pendiente' },
  { value: 'En mora', label: 'En mora' },
];

export default function CobranzasPage() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [page, setPage] = useState(1);
  const [cobro, setCobro] = useState(null);
  const [cuenta, setCuenta] = useState(null);
  const [panelKey, setPanelKey] = useState(0);
  const debouncedSearch = useDebounce(search, 300);

  const { data, loading, error, reload } = useAsync(
    () => api.getCobranzas({ search: debouncedSearch.trim(), estado, page, pageSize: PAGE_SIZE }),
    [debouncedSearch, estado, page],
  );
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const mora = data?.mora;

  const handleCobrado = () => {
    setCobro(null);
    toast.success('Cobro registrado correctamente');
    reload();
    setPanelKey((k) => k + 1);
  };

  return (
    <div className="page">
      <header className="card cobranzas-head">
        <div>
          <h1 className="page-title">Gestión de Cobranzas Semanales</h1>
          <p className="page-subtitle">Seguimiento de cánones de alquiler y estados de cuenta en tiempo real.</p>
        </div>
        <div className="cobranzas-head__filters">
          <SearchInput
            label="Buscar por conductor o contrato"
            placeholder="Buscar por conductor o contrato..."
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
          />
          <Select
            label="Estado de cobranza"
            hideLabel
            value={estado}
            onChange={(v) => {
              setEstado(v);
              setPage(1);
            }}
            options={ESTADOS}
          />
        </div>
      </header>

      <article className="card mora-card" aria-label="Cartera en mora">
        <div className="mora-card__top">
          <p className="mora-card__label">Cartera en mora</p>
          {mora && (
            <Badge tone={mora.casos > 0 ? 'danger' : 'neutral'}>
              {mora.casos} {pluralize(mora.casos, 'caso', 'casos')}
            </Badge>
          )}
        </div>
        <div className="mora-card__main">
          <span className={`mora-card__amount ${mora && mora.casos === 0 ? 'mora-card__amount--none' : ''}`}>
            {mora ? formatMoney(mora.monto) : '—'}
          </span>
          {mora && (
            <span className={mora.casos > 0 ? 'mora-card__risk' : 'mora-card__risk mora-card__risk--none'}>
              {mora.casos > 0 ? 'Riesgo Alto' : 'Sin riesgo'}
            </span>
          )}
        </div>
        <span className={`mora-card__bar ${mora && mora.casos === 0 ? 'mora-card__bar--none' : ''}`} aria-hidden="true" />
      </article>

      <section className="card" aria-labelledby="registro-pagos">
        <div className="registro-head">
          <h2 id="registro-pagos" className="registro-head__title">Registro de Pagos y Saldos Semanales</h2>
          <ul className="leyenda" aria-label="Leyenda de estados">
            <li className="leyenda__ok"><StatusDot /> Al día</li>
            <li className="leyenda__info"><StatusDot /> Pendiente</li>
            <li className="leyenda__danger"><StatusDot /> En mora</li>
          </ul>
        </div>

        <div className="table-scroll">
          <table className="table cobranzas-table">
            <thead>
              <tr>
                <th>Conductor</th>
                <th>N° Contrato</th>
                <th className="num">Importe semanal</th>
                <th className="num">Vencimiento</th>
                <th className="num">Saldo pendiente</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => {
                const enMora = c.estado === 'En mora';
                return (
                  <tr key={c.contratoId} className={enMora ? 'row--mora' : undefined}>
                    <td>
                      <div className="conductor">
                        <Avatar initials={c.conductor.iniciales} variant={enMora ? 'danger' : 'info'} />
                        <div>
                          <p className="conductor__name">{c.conductor.nombre}</p>
                          <p className={enMora ? 'conductor__dni conductor__dni--mora' : 'conductor__dni'}>DNI: {c.conductor.dni}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="chip">#{c.numero}</span></td>
                    <td className="num">{formatMoney(c.importeSemanal)}</td>
                    <td className={enMora ? 'num text-danger' : 'num'}>
                      <span className={enMora ? 'strong' : undefined}>{formatDateLong(c.vencimiento)}</span>
                      {enMora && <span className="sub">(Hace {c.diasAtraso} {pluralize(c.diasAtraso, 'día', 'días')})</span>}
                    </td>
                    <td className={enMora ? 'num text-danger' : 'num'}>
                      <span className={enMora ? 'strong' : undefined}>{formatMoney(c.saldo)}</span>
                      {enMora && <span className="sub">({c.cuotasAdeudadas} {pluralize(c.cuotasAdeudadas, 'cuota', 'cuotas')})</span>}
                    </td>
                    <td><Badge tone={toneForCobranza(c.estado)} dot>{c.estado}</Badge></td>
                    <td>
                      <div className="acciones-cobro">
                        <Button size="sm" variant={enMora ? 'danger' : 'primary'} onClick={() => setCobro(c)}>
                          Registrar cobro
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => setCuenta(c)}>
                          Ver c/c
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              <TableState colSpan={7} loading={loading && !data} error={error} empty={!loading && !error && items.length === 0} onRetry={reload} />
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>Mostrando {items.length} de {total} registros activos</span>
          <Pagination page={page} totalPages={Math.max(data?.totalPages ?? 1, 1)} onChange={setPage} />
        </div>
      </section>

      {cobro && <RegistrarCobroModal cobranza={cobro} onClose={() => setCobro(null)} onSaved={handleCobrado} />}
      {cuenta && <CuentaCorrientePanel cobranza={cuenta} refreshKey={panelKey} onClose={() => setCuenta(null)} />}
    </div>
  );
}
