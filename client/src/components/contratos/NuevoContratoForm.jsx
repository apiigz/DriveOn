import { useEffect, useState } from 'react';
import { Bookmark, FileText, Gauge, ShieldCheck, Wrench } from 'lucide-react';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import { useToast } from '../ui/Toast';
import { useAsync } from '../../hooks/useAsync';
import { api } from '../../services/api';
import { formatKm, formatMoney, pluralize } from '../../utils/format';
import './NuevoContratoForm.css';

const DURACION_LABEL = {
  1: '1 semana',
  2: '2 semanas',
  4: '4 semanas (1 mes)',
  8: '8 semanas (2 meses)',
  12: '12 semanas (3 meses)',
};
const durationLabel = (n) => DURACION_LABEL[n] ?? `${n} ${pluralize(n, 'semana', 'semanas')}`;

const EMPTY = { conductorId: '', sucursalId: '', vehiculoId: '', duracionSemanas: '4' };

export default function NuevoContratoForm({ onCreated }) {
  const toast = useToast();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  const catalogos = useAsync(api.getCatalogos, []);
  const disponibles = useAsync(
    () => (values.sucursalId ? api.getVehiculosDisponibles(values.sucursalId) : Promise.resolve([])),
    [values.sucursalId],
  );
  const [cotizacion, setCotizacion] = useState({ data: null, error: '' });

  // Cotización calculada por el servidor (solo lectura).
  useEffect(() => {
    if (!values.vehiculoId || !values.duracionSemanas) {
      setCotizacion({ data: null, error: '' });
      return undefined;
    }
    let active = true;
    api
      .getCotizacion({ vehiculoId: values.vehiculoId, duracionSemanas: values.duracionSemanas })
      .then((data) => active && setCotizacion({ data, error: '' }))
      .catch((err) => active && setCotizacion({ data: null, error: err.message }));
    return () => {
      active = false;
    };
  }, [values.vehiculoId, values.duracionSemanas]);

  const conductores = catalogos.data?.conductores ?? [];
  const sucursales = catalogos.data?.sucursales ?? [];
  const duraciones = catalogos.data?.duraciones ?? [1, 2, 4, 8, 12];
  const vehiculos = disponibles.data ?? [];
  const cot = cotizacion.data;
  const sinVehiculos = values.sucursalId && !disponibles.loading && !disponibles.error && vehiculos.length === 0;

  const setField = (key) => (event) => {
    const value = event.target.value;
    setValues((prev) => ({ ...prev, [key]: value, ...(key === 'sucursalId' ? { vehiculoId: '' } : {}) }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setServerError('');
  };

  const validate = () => {
    const found = {};
    if (!values.conductorId) found.conductorId = 'Seleccioná un conductor';
    if (!values.sucursalId) found.sucursalId = 'Seleccioná una sucursal';
    if (!values.vehiculoId) found.vehiculoId = 'Seleccioná un vehículo disponible';
    if (!values.duracionSemanas) found.duracionSemanas = 'Seleccioná la duración';
    return found;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    setServerError('');
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      const contrato = await api.createContrato({
        conductorId: Number(values.conductorId),
        sucursalId: values.sucursalId,
        vehiculoId: Number(values.vehiculoId),
        duracionSemanas: Number(values.duracionSemanas),
      });
      toast.success(`Contrato #${contrato.numero} emitido`);
      setValues((prev) => ({ ...prev, vehiculoId: '', conductorId: '' }));
      disponibles.reload();
      onCreated?.();
    } catch (err) {
      setServerError(err.message);
      // El vehículo pudo dejar de estar disponible: se limpia la selección
      setValues((prev) => ({ ...prev, vehiculoId: '' }));
      disponibles.reload();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card nuevo-contrato" onSubmit={handleSubmit} noValidate>
      <div className="nuevo-contrato__grid">
        <FormField label="Conductor asignado" error={errors.conductorId} upper>
          {(props) => (
            <select {...props} value={values.conductorId} onChange={setField('conductorId')}>
              <option value="">Seleccionar conductor…</option>
              {conductores.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre} - DNI {c.dni}</option>
              ))}
            </select>
          )}
        </FormField>

        <FormField label="Sucursal de retiro" error={errors.sucursalId} upper>
          {(props) => (
            <select {...props} value={values.sucursalId} onChange={setField('sucursalId')}>
              <option value="">Seleccionar sucursal…</option>
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>Sucursal {s.nombre} ({s.direccion})</option>
              ))}
            </select>
          )}
        </FormField>

        <FormField label="Vehículo disponible" error={errors.vehiculoId} upper>
          {(props) => (
            <select
              {...props}
              value={values.vehiculoId}
              onChange={setField('vehiculoId')}
              disabled={!values.sucursalId || disponibles.loading}
            >
              <option value="">
                {values.sucursalId ? 'Seleccionar vehículo…' : 'Elegí primero una sucursal'}
              </option>
              {sinVehiculos && <option disabled value="__none">Sin vehículos disponibles en esta sucursal</option>}
              {vehiculos.map((v) => (
                <option key={v.id} value={v.id}>{v.modelo} - Patente {v.patente}</option>
              ))}
            </select>
          )}
        </FormField>

        <FormField label="Duración del alquiler" error={errors.duracionSemanas} upper>
          {(props) => (
            <select {...props} value={values.duracionSemanas} onChange={setField('duracionSemanas')}>
              {duraciones.map((d) => (
                <option key={d} value={d}>{durationLabel(d)}</option>
              ))}
            </select>
          )}
        </FormField>
      </div>

      <dl className="parametros">
        <div className="parametros__item">
          <Gauge size={16} aria-hidden="true" />
          <div>
            <dt>Límite semanal</dt>
            <dd>{cot ? `${formatKm(cot.kmSemanal)} s/cargo` : '—'}</dd>
          </div>
        </div>
        <div className="parametros__item">
          <ShieldCheck size={16} aria-hidden="true" />
          <div>
            <dt>Cobertura</dt>
            <dd>Todo Riesgo Flota</dd>
          </div>
        </div>
        <div className="parametros__item">
          <Wrench size={16} aria-hidden="true" />
          <div>
            <dt>Mantenimiento</dt>
            <dd>Incluido C/10.000 km</dd>
          </div>
        </div>
      </dl>

      <div className="cotizacion" aria-live="polite">
        <dl className="cotizacion__list">
          <div>
            <dt>Tarifa semanal</dt>
            <dd>{cot ? formatMoney(cot.tarifaSemanal) : '—'}</dd>
          </div>
          <div>
            <dt>Depósito en garantía</dt>
            <dd>{cot ? formatMoney(cot.deposito) : '—'}</dd>
          </div>
          <div className="cotizacion__total">
            <dt>Total del contrato</dt>
            <dd>{cot ? formatMoney(cot.totalContrato) : '—'}</dd>
          </div>
        </dl>
        <p className="cotizacion__note">
          {cotizacion.error || 'Valores calculados según tarifa vigente — no editables.'}
        </p>
      </div>

      {serverError && <p className="form-error" role="alert">{serverError}</p>}

      <div className="nuevo-contrato__actions">
        <Button variant="secondary" icon={Bookmark} onClick={toast.soon}>Guardar borrador</Button>
        <Button type="submit" icon={FileText} disabled={saving}>
          {saving ? 'Generando…' : 'Generar contrato PDF'}
        </Button>
      </div>
    </form>
  );
}
