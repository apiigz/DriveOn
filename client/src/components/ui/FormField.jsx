import { useId } from 'react';
import './FormField.css';

/**
 * Campo de formulario con label, ayuda y error accesibles.
 * `children` es una función que recibe las props de accesibilidad del control.
 */
export default function FormField({ label, error, hint, upper = false, children }) {
  const id = useId();
  const errorId = `${id}-error`;
  const controlProps = {
    id,
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': error ? errorId : undefined,
    className: `form-control ${error ? 'form-control--error' : ''}`,
  };

  return (
    <div className="form-field">
      <label htmlFor={id} className={upper ? 'form-field__label form-field__label--upper' : 'form-field__label'}>
        {label}
      </label>
      {children(controlProps)}
      {hint && !error && <span className="form-field__hint">{hint}</span>}
      {error && (
        <span id={errorId} className="form-field__error">
          {error}
        </span>
      )}
    </div>
  );
}
