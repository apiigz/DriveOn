import { useState } from 'react';
import { CheckCircle2, Plus } from 'lucide-react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import SearchInput from '../components/ui/SearchInput';
import Select from '../components/ui/Select';
import TableState from '../components/ui/TableState';
import { useToast } from '../components/ui/Toast';
import { useAsync } from '../hooks/useAsync';
import { useDebounce } from '../hooks/useDebounce';
import { api } from '../services/api';
import { formatKm, formatNumber, pluralize } from '../utils/format';
import { toneForVehiculo } from '../utils/tones';
import './FlotaPage.css';

const PAGE_SIZE = 7;
const ESTADOS = ['Disponible', 'Alquilado', 'En taller'];

function Asignacion({ asignacion }) {
  if (!asignacion) return null;
  if (asignacion.tipo === 'disponible') {
    return (
      <span className="asignacion asignacion--ok">
        <CheckCircle2 size={14} aria-hidden="true" />
        Disponible de inmediato
      </span>
    );
  }
  if (asignacion.tipo === 'contrato') {
    return (
      <span className="asignacion">
        {asignacion.conductor} <span className="asignacion__contrato">(Contrato #{asignacion.contrato})</span>
      </span>
    );
  }
  return (
    <span className="asignacion asignacion--taller">
      En taller mecánico{asignacion.nota ? ` (${asignacion.nota})` : ''}
    </span>
  );
}

export default function FlotaPage() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [sucursal, setSucursal] = useState('');
  const [estado, setEstado] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const catalogos = useAsync(api.getCatalogos, []);
  const { data, loading, error, reload } = useAsync(
    () => api.getVehiculos({ search: debouncedSearch.trim(), sucursal, estado, page, pageSize: PAGE_SIZE }),
    [debouncedSearch, sucursal, estado, page],
  );

  // Total sin filtros para el subtítulo (la consulta principal cambia con los controles).
  const flota = useAsync(() => api.getVehiculos({ page: 1, pageSize: 1 }), []);
  const totalFlota = flota.data ? flota.data.total : null;

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const resumen = data?.resumen;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = (page - 1) * PAGE_SIZE + items.length;

  const resetPage = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const sucursalOptions = [
    { value: '', label: 'Todas las sucursales' },
    ...(catalogos.data?.sucursales ?? []).map((s) => ({ value: s.id, label: s.nombre })),
  ];
  const estadoOptions = [{ value: '', label: 'Todos los estados' }, ...ESTADOS.map((e) => ({ value: e, label: e }))];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Gestión de Flota</h1>
          <p className="page-subtitle">
            {totalFlota === null
              ? 'Cargando unidades…'
              : `${formatNumber(totalFlota)} ${pluralize(totalFlota, 'unidad registrada', 'unidades registradas')}`}
          </p>
        </div>
        <Button icon={Plus} onClick={toast.soon}>
          Agregar vehículo
        </Button>
      </div>

      <section className="card">
        <div className="filters">
          <SearchInput
            label="Buscar por patente o modelo"
            placeholder="Buscar por patente o modelo..."
            value={search}
            onChange={resetPage(setSearch)}
            className="filters__search"
          />
          <Select label="Sucursal" hideLabel value={sucursal} onChange={resetPage(setSucursal)} options={sucursalOptions} className="filters__select" />
          <Select label="Estado" hideLabel value={estado} onChange={resetPage(setEstado)} options={estadoOptions} className="filters__select" />
          <p className="resumen" aria-label="Resumen de la flota">
            <span className="resumen__ok">Disponibles: {resumen?.disponibles ?? '—'}</span>
            <span className="resumen__info">Alquilados: {resumen?.alquilados ?? '—'}</span>
            <span className="resumen__danger">En taller: {resumen?.enTaller ?? '—'}</span>
          </p>
        </div>

        <div className="table-scroll">
          <table className="table flota-table">
            <thead>
              <tr>
                <th>Patente</th>
                <th>Modelo</th>
                <th>Sucursal</th>
                <th>Estado</th>
                <th className="num">Kilometraje</th>
                <th>Conductor asignado / Disponibilidad</th>
                <th className="num">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((v) => (
                <tr key={v.id}>
                  <td className="nowrap"><strong>{v.patente}</strong></td>
                  <td className="nowrap">{v.modelo}</td>
                  <td>{v.sucursal}</td>
                  <td><Badge tone={toneForVehiculo(v.estado)}>{v.estado}</Badge></td>
                  <td className="num">{formatKm(v.kilometraje)}</td>
                  <td><Asignacion asignacion={v.asignacion} /></td>
                  <td className="num">
                    <button type="button" className="link-action acciones-flota" onClick={toast.soon}>
                      Ver ficha / Disponibilidad
                    </button>
                  </td>
                </tr>
              ))}
              <TableState colSpan={7} loading={loading && !data} error={error} empty={!loading && !error && items.length === 0} onRetry={reload} />
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>
            Mostrando {from}-{to} de {formatNumber(total)} {pluralize(total, 'vehículo', 'vehículos')}
          </span>
          <Pagination page={page} totalPages={Math.max(data?.totalPages ?? 1, 1)} onChange={setPage} />
        </div>
      </section>
    </div>
  );
}
