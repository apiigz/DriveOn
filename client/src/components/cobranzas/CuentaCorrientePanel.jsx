import { ScrollText, Printer } from 'lucide-react';
import Button from '../ui/Button';
import SidePanel from '../ui/SidePanel';
import { useToast } from '../ui/Toast';
import { useAsync } from '../../hooks/useAsync';
import { api } from '../../services/api';
import { formatDateLong, formatMoney } from '../../utils/format';
import './CuentaCorrientePanel.css';

const nombreDe = (conductor) => (typeof conductor === 'string' ? conductor : conductor?.nombre ?? '—');

export default function CuentaCorrientePanel({ cobranza, refreshKey, onClose }) {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(
    () => api.getCuentaCorriente(cobranza.contratoId),
    [cobranza.contratoId, refreshKey],
  );

  return (
    <SidePanel
      title="Cuenta Corriente"
      subtitle={`#${cobranza.numero} • ${formatMoney(cobranza.importeSemanal)} semanal`}
      icon={ScrollText}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
          <Button variant="navy" icon={Printer} onClick={toast.soon}>Imprimir Extracto</Button>
        </>
      }
    >
      <dl className="cc-box">
        <div>
          <dt>Conductor</dt>
          <dd>{nombreDe(data?.conductor ?? cobranza.conductor)}</dd>
        </div>
        <div className="cc-box__right">
          <dt>Estado actual</dt>
          <dd>{data?.estado ?? cobranza.estado}</dd>
        </div>
      </dl>

      {error && (
        <div className="cc-state cc-state--error" role="alert">
          <p>{error}</p>
          <Button variant="secondary" size="sm" onClick={reload}>Reintentar</Button>
        </div>
      )}
      {loading && !data && <p className="cc-state" role="status">Cargando…</p>}

      {data && (
        <>
          <section className="cc-movs" aria-labelledby="cc-movs-title">
            <h3 id="cc-movs-title" className="eyebrow">Últimos movimientos</h3>
            {data.movimientos.length === 0 ? (
              <p className="cc-state">Sin movimientos registrados</p>
            ) : (
              <ul className="cc-movs__list">
                {data.movimientos.map((m) => {
                  const pago = m.tipo === 'pago';
                  return (
                    <li key={m.id} className="mov">
                      <div>
                        <p className="mov__concepto">{m.concepto}</p>
                        <p className="mov__detalle">{formatDateLong(m.fecha)} • {m.detalle}</p>
                      </div>
                      <span className={`mov__monto ${pago ? 'mov__monto--pago' : 'mov__monto--cargo'}`}>
                        {pago ? '+' : '-'}{formatMoney(m.monto)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <dl className="cc-resumen">
            <div>
              <dt>Garantía en custodia:</dt>
              <dd>{formatMoney(data.resumen.garantia)}</dd>
            </div>
            <div>
              <dt>Infracciones pendientes:</dt>
              <dd>{formatMoney(data.resumen.infracciones)}</dd>
            </div>
            <div className="cc-resumen__total">
              <dt>Saldo consolidado:</dt>
              <dd>{formatMoney(data.resumen.saldo)}</dd>
            </div>
          </dl>
        </>
      )}
    </SidePanel>
  );
}
