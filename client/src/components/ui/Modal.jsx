import { useId } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useDialog } from '../../hooks/useDialog';
import './Modal.css';

/** Diálogo modal accesible: role="dialog", Escape, foco inicial y clic fuera para cerrar. */
export default function Modal({ title, icon: Icon, onClose, children, footer, initialFocus, width = 480 }) {
  const titleId = useId();
  const ref = useDialog(onClose, initialFocus);

  return createPortal(
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={ref}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={{ maxWidth: width }}
      >
        <header className="modal__head">
          <h2 id={titleId} className="modal__title">
            {Icon && <Icon size={18} className="modal__icon" aria-hidden="true" />}
            {title}
          </h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Cerrar">
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        <div className="modal__body">{children}</div>
        {footer && <footer className="modal__foot">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
