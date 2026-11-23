import { useId } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useDialog } from '../../hooks/useDialog';
import './SidePanel.css';

/** Panel lateral derecho (ancho 448px) con overlay. Cierra con X, Escape, clic fuera o desde el footer. */
export default function SidePanel({ title, subtitle, icon: Icon, onClose, children, footer }) {
  const titleId = useId();
  const ref = useDialog(onClose);

  return createPortal(
    <div className="side-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside ref={ref} className="side-panel" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <header className="side-panel__head">
          <div>
            <h2 id={titleId} className="side-panel__title">
              {Icon && <Icon size={18} aria-hidden="true" />}
              {title}
            </h2>
            {subtitle && <p className="side-panel__subtitle">{subtitle}</p>}
          </div>
          <button type="button" className="side-panel__close" onClick={onClose} aria-label="Cerrar panel">
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        <div className="side-panel__body">{children}</div>
        {footer && <footer className="side-panel__foot">{footer}</footer>}
      </aside>
    </div>,
    document.body,
  );
}
