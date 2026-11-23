import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import Modal from '../ui/Modal';
import { api } from '../../services/api';
import { todayISO } from '../../utils/format';
import './EditarTarifaModal.css';

const CATEGORIAS = ['Económico', 'Sedán Compacto', 'Sedán Estándar', 'Sedán Amplio', 'Plus'];
const NUMERIC = [
  ['tarifaSemanal', 'Tarifa semanal ($)'],
  ['deposito', 'Depósito en garantía ($)'],
  ['kmSemanal', 'Km semanal incluido'],
  ['kmExcedente', 'Km excedente ($/km)'],
];

const isPositiveInt = (v) => /^\d+$/.test(v.trim()) && Number(v) > 0;

export function validateTarifa(values, today) {
  const errors = {};
  NUMERIC.forEach(([key]) => {
    if (!isPositiveInt(values[key])) errors[key] = 'Ingresá un número entero mayor a 0';
  });
  if (!values.categoria) errors.categoria = 'Seleccioná una categoría';
  if (!values.vigenteDesde) errors.vigenteDesde = 'Ingresá la fecha de vigencia';
  else if (values.vigenteDesde < today) errors.vigenteDesde = 'La fecha no puede ser anterior a hoy';
  if (values.motivo.trim().length < 5) errors.motivo = 'El motivo debe tener al menos 5 caracteres';
  return errors;
}

export default function EditarTarifaModal({ tarifa, onClose, onSaved }) {
  const today = todayISO();
  const [values, setValues] = useState({
    categoria: tarifa.categoria,
    tarifaSemanal: String(tarifa.tarifaSemanal),
    deposito: String(tarifa.deposito),
    kmSemanal: String(tarifa.kmSemanal),
    kmExcedente: String(tarifa.kmExcedente),
    vigenteDesde: today,
    motivo: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  const setField = (key) => (event) => setValues((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validateTarifa(values, today);
    setErrors(found);
    setServerError('');
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      await api.updateTarifa(tarifa.id, {
        categoria: values.categoria,
        tarifaSemanal: Number(values.tarifaSemanal),
        deposito: Number(values.deposito),
        kmSemanal: Number(values.kmSemanal),
        kmExcedente: Number(values.kmExcedente),
        vigenteDesde: values.vigenteDesde,
        motivo: values.motivo.trim(),
      });
      onSaved();
    } catch (err) {
      setServerError(err.message);
      setSaving(false);
    }
  };

  const numberField = ([key, label]) => (
    <FormField key={key} label={label} error={errors[key]} upper>
      {(props) => (
        <input {...props} type="text" inputMode="numeric" value={values[key]} onChange={setField(key)} />
      )}
    </FormField>
  );

  return (
    <Modal
      title="Gestión de Tarifa Semanal"
      icon={SlidersHorizontal}
      onClose={onClose}
      initialFocus="select"
      width={560}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="editar-tarifa-form" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </>
      }
    >
      <form id="editar-tarifa-form" className="tarifa-form" onSubmit={handleSubmit} noValidate>
        <div className="tarifa-form__full">
          <FormField label="Modelo de vehículo" upper>
            {(props) => <input {...props} type="text" value={`${tarifa.modelo} / ${tarifa.tipo}`} readOnly />}
          </FormField>
        </div>

        <FormField label="Categoría" error={errors.categoria} upper>
          {(props) => (
            <select {...props} value={values.categoria} onChange={setField('categoria')}>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
        </FormField>
        {numberField(NUMERIC[0])}
        {numberField(NUMERIC[1])}
        {numberField(NUMERIC[2])}
        {numberField(NUMERIC[3])}

        <FormField label="Vigente desde" error={errors.vigenteDesde} upper>
          {(props) => (
            <input {...props} type="date" min={today} value={values.vigenteDesde} onChange={setField('vigenteDesde')} />
          )}
        </FormField>

        <div className="tarifa-form__full">
          <FormField label="Motivo del ajuste (auditoría)" error={errors.motivo} upper>
            {(props) => (
              <textarea
                {...props}
                rows={3}
                placeholder="Describa el motivo del cambio..."
                value={values.motivo}
                onChange={setField('motivo')}
              />
            )}
          </FormField>
        </div>

        {serverError && (
          <p className="tarifa-form__full form-error" role="alert">{serverError}</p>
        )}
      </form>
    </Modal>
  );
}
