import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import NavBar           from './components/NavBar';
import Login            from './pages/Login';
import Dashboard        from './pages/Dashboard';
import HojasProcesoPage from './pages/HojasProcesoPage';
import ParadasPage      from './pages/ParadasPage';
import RecursosPage     from './pages/RecursosPage';
import CostosPage       from './pages/CostosPage';
import SplashScreen     from './components/SplashScreen';

function App() {
  const [token, setToken] = useState(localStorage.getItem('mecapro_token'));
  const [operario, setOperario] = useState(localStorage.getItem('mecapro_nombre'));
  const [loadingSplash, setLoadingSplash] = useState(true);

  const handleLoginSuccess = () => {
    setToken(localStorage.getItem('mecapro_token'));
    setOperario(localStorage.getItem('mecapro_nombre'));
  };

  const handleLogout = () => {
    localStorage.removeItem('mecapro_token');
    localStorage.removeItem('mecapro_dni');
    localStorage.removeItem('mecapro_nombre');
    localStorage.removeItem('mecapro_user');
    setToken(null);
    setOperario(null);
  };

  if (loadingSplash) {
    return <SplashScreen onComplete={() => setLoadingSplash(false)} />;
  }

  if (!token) {
    return (
      <Login onLoginSuccess={handleLoginSuccess} />
    );
  }

  return (
    <Router>
      <div className="app-layout">
        <NavBar operario={operario} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/"              element={<Dashboard />} />
            <Route path="/hps"           element={<HojasProcesoPage />} />
            <Route path="/paradas"       element={<ParadasPage />} />
            <Route path="/recursos"      element={<RecursosPage />} />
            {/* backward-compat redirects */}
            <Route path="/epps"          element={<Navigate to="/recursos" replace />} />
            <Route path="/herramientas"  element={<Navigate to="/recursos" replace />} />
            <Route path="/costos"        element={<CostosPage />} />
            <Route path="*"              element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;