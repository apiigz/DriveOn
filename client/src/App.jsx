import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import InicioPage from './pages/InicioPage';
import FlotaPage from './pages/FlotaPage';
import TarifasPage from './pages/TarifasPage';
import ContratosPage from './pages/ContratosPage';
import CobranzasPage from './pages/CobranzasPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<InicioPage />} />
        <Route path="flota" element={<FlotaPage />} />
        <Route path="tarifas" element={<TarifasPage />} />
        <Route path="contratos" element={<ContratosPage />} />
        <Route path="cobranzas" element={<CobranzasPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

//defino las rutas con / 