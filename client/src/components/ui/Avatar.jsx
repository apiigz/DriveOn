import './Avatar.css';

/** variant: info | danger | user (amarillo, se pasa un ícono como children) */
export default function Avatar({ initials, variant = 'info', children }) {
  return (
    <span className={`avatar avatar--${variant}`} aria-hidden="true">
      {children ?? initials}
    </span>
  );
}
