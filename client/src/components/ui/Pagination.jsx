import Button from './Button';
import './Pagination.css';

/** Anterior / página actual / Siguiente. */
export default function Pagination({ page, totalPages, onChange }) {
  return (
    <nav className="pagination" aria-label="Paginación">
      <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Anterior
      </Button>
      <span className="pagination__page" aria-current="page">{page}</span>
      <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Siguiente
      </Button>
    </nav>
  );
}
