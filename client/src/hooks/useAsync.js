import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Ejecuta `fn` al montar y cada vez que cambian `deps`.
 * Devuelve { data, loading, error, reload }. Ignora respuestas obsoletas.
 */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const counter = useRef(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const run = useCallback(() => {
    const id = ++counter.current;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    fnRef.current()
      .then((data) => {
        if (id === counter.current) setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (id === counter.current) setState((prev) => ({ ...prev, loading: false, error: err.message }));
      });
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(run, deps);

  return { ...state, reload: run };
}

//cargo datos con estado de loading y error