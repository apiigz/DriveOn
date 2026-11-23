import { useState } from 'react';
import { User } from 'lucide-react';
import SearchInput from '../ui/SearchInput';
import Avatar from '../ui/Avatar';
import { useToast } from '../ui/Toast';
import './Header.css';

export default function Header() {
  const [query, setQuery] = useState('');
  const toast = useToast();

  const handleSubmit = (event) => {
    event.preventDefault();
    toast.soon();
  };

  return (
    <header className="app-header">
      <form className="app-header__search" role="search" onSubmit={handleSubmit}>
        <SearchInput
          label="Buscador global"
          placeholder="Buscar patente, conductor, contrato..."
          value={query}
          onChange={setQuery}
        />
      </form>
      <div className="app-header__user">
        <div className="app-header__user-text">
          <span className="app-header__name">Juan Lopez</span>
          <span className="app-header__role">Gerente Comercial</span>
        </div>
        <Avatar variant="user">
          <User size={18} />
        </Avatar>
      </div>
    </header>
  );
}
