import Button from './Button';

/** Fila de estado (cargando / error / vacío) para usar dentro de <tbody>. */
export default function TableState({ colSpan, loading, error, empty, onRetry }) {
  if (error) {
    return (
      <tr>
        <td colSpan={colSpan} className="table-state table-state--error">
          <p role="alert">{error}</p>
          {onRetry && (
            <Button variant="secondary" size="sm" onClick={onRetry} className="table-state__retry">
              Reintentar
            </Button>
          )}
        </td>
      </tr>
    );
  }
  if (loading) {
    return (
      <tr>
        <td colSpan={colSpan} className="table-state">
          <p role="status">Cargando…</p>
        </td>
      </tr>
    );
  }
  if (empty) {
    return (
      <tr>
        <td colSpan={colSpan} className="table-state">
          <p>No hay resultados para los filtros aplicados</p>
        </td>
      </tr>
    );
  }
  return null;
}
