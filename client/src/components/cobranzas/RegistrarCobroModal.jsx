import { useState } from 'react';
import { Check, CreditCard } from 'lucide-react';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import Modal from '../ui/Modal';
import { api } from '../../services/api';
import { formatMoney, todayISO } from '../../utils/format';
import './RegistrarCobroModal.css';

const MEDIOS = ['Transferencia Bancaria', 'Efectivo Caja', 'Depósito Bancario', 'Mercado Pago'];

export default function RegistrarCobroModal({ cobranza, onClose, onSaved }) {
  const today = todayISO();
  const saldo = cobranza.saldo;
  const sinSaldo = saldo <= 0;

  const [values, setValues] = useState({
    monto: sinSaldo ? '' : String(saldo),
    medio: MEDIOS[0],
    referencia: '',
    fecha: today,
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  const setField = (key) => (event) => setValues((prev) => ({ ...prev, [key]: event.target.value }));

  const validate = () => {
    const found = {};
    if (!/^\d+$/.test(values.monto.trim()) || Number(values.monto) <= 0) found.monto = 'Ingresá un monto entero mayor a 0';
    else if (Number(values.monto) > saldo) found.monto = `El monto no puede superar el saldo (${formatMoney(saldo)})`;
    if (!values.medio) found.medio = 'Seleccioná un medio de pago';
    if (!values.fecha) found.fecha = 'Ingresá la fecha de imputación';
    else if (values.fecha > today) found.fecha = 'La fecha no puede ser futura';
    return found;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (sinSaldo) return;
    const found = validate();
    setErrors(found);
    setServerError('');
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      await api.registrarPago(cobranza.contratoId, {
        monto: Number(values.monto),
        medio: values.medio,
        referencia: values.referencia.trim(),
        fecha: values.fecha,
      });
      onSaved();
    } catch (err) {
      setServerError(err.message);
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Registrar Cobro"
      icon={CreditCard}
      onClose={onClose}
      initialFocus=".cobro-form input"
      width={440}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="registrar-cobro-form" icon={Check} disabled={saving || sinSaldo}>
            {saving ? 'Confirmando…' : 'Confirmar Cobro'}
          </Button>
        </>
      }
    >
      <form id="registrar-cobro-form" className="cobro-form" onSubmit={handleSubmit} noValidate>
        <dl className="cobro-resumen">
          <div>
            <dt>Conductor</dt>
            <dd>{cobranza.conductor.nombre}</dd>
          </div>
          <div className="cobro-resumen__right">
            <dt>Contrato</dt>
            <dd className="cobro-resumen__contrato">#{cobranza.numero}</dd>
          </div>
        </dl>

        {sinSaldo && (
          <p className="cobro-aviso" role="status">Este contrato no tiene saldo pendiente</p>
        )}

        <FormField label="Monto a Imputar ($)" error={errors.monto}>
          {(props) => (
            <input
              {...props}
              type="text"
              inputMode="numeric"
              value={values.monto}
              onChange={setField('monto')}
              disabled={sinSaldo}
            />
          )}
        </FormField>

        <FormField label="Medio de Pago" error={errors.medio}>
          {(props) => (
            <select {...props} value={values.medio} onChange={setField('medio')} disabled={sinSaldo}>
              {MEDIOS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          )}
        </FormField>

        <FormField label="N° Comprobante / Referencia Bancaria">
          {(props) => (
            <input
              {...props}
              type="text"
              placeholder="Ej: TRF-992144820"
              value={values.referencia}
              onChange={setField('referencia')}
              disabled={sinSaldo}
            />
          )}
        </FormField>

        <FormField label="Fecha de Imputación" error={errors.fecha}>
          {(props) => (
            <input {...props} type="date" max={today} value={values.fecha} onChange={setField('fecha')} disabled={sinSaldo} />
          )}
        </FormField>

        {serverError && <p className="form-error" role="alert">{serverError}</p>}
      </form>
    </Modal>
  );
}
