import { useEffect, useRef } from 'react';

const FOCUSABLE =
  'input:not([disabled]):not([readonly]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

/**
 * Comportamiento común de diálogos: foco inicial, cierre con Escape,
 * trampa de foco con Tab y devolución del foco al elemento previo.
 * `initialSelector` permite elegir el primer elemento a enfocar dentro del contenedor.
 */
export function useDialog(onClose, initialSelector) {
  const ref = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const container = ref.current;
    const previous = document.activeElement;
    const initial = (initialSelector && container.querySelector(initialSelector)) || container.querySelector(FOCUSABLE);
    (initial || container).focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = Array.from(container.querySelectorAll(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (previous && previous.focus) previous.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}

//tecla de Escape en los modales 