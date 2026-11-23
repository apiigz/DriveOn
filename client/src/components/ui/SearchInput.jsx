import { Search } from 'lucide-react';
import './SearchInput.css';

export default function SearchInput({ label, value, onChange, placeholder, onSubmit, className = '' }) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && onSubmit) {
      event.preventDefault();
      onSubmit(value);
    }
  };

  return (
    <label className={`search-input ${className}`}>
      <span className="sr-only">{label}</span>
      <Search size={16} aria-hidden="true" />
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </label>
  );
}
