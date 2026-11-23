import './Select.css';

/** options: [{ value, label, disabled? }]. Con `hideLabel` la etiqueta queda solo para lectores de pantalla. */
export default function Select({ label, hideLabel = false, value, onChange, options, className = '', ...rest }) {
  return (
    <label className={`select ${className}`}>
      <span className={hideLabel ? 'sr-only' : 'select__label'}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} {...rest}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
