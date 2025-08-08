// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';

import Layout from './components/Layout.jsx';
import Sidebar from './components/Sidebar.jsx';
import Inicio from './pages/Inicio.jsx';
import Tropa from './pages/Tropa.jsx';
import DetalleTropa from './pages/DetalleTropa.jsx';
import Decomisos from './pages/Decomisos.jsx';
import Login from './pages/Login.jsx';

import FaenaPage from './pages/FaenaPage.jsx';
import DetalleFaenaPage from './pages/DetalleFaenaPage.jsx';
import RemanenteFaenaPage from './pages/RemanenteFaenaPage.jsx';

import ProvinciaAdmin from './pages/ProvinciaAdmin.jsx';
import LocalidadAdmin from './pages/LocalidadAdmin.jsx';
import TitularAdmin from './pages/TitularAdmin.jsx';
import AgregarUsuarioPage from './pages/AgregarUsuarioPage.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout general con Header y Sidebar */}
        <Route element={<Layout sidebar={<Sidebar />} />}>
          <Route path="/" element={<Navigate to="/inicio" replace />} />
          <Route path="inicio" element={<Inicio />} />
          <Route path="tropa" element={<Tropa />} />
          <Route path="tropa/detalle/:id" element={<DetalleTropa />} />
          <Route path="decomisos" element={<Decomisos />} />
          {/* Faena y sus subrutas */}
          <Route path="faena">
            <Route index element={<FaenaPage />} />
            <Route path="detalle" element={<DetalleFaenaPage />} />
            <Route path="remanente" element={<RemanenteFaenaPage />} />
          </Route>

          <Route
            path="admin/usuarios"
            element={
              <PrivateRoute allowedRoles={[1]}>
                <AgregarUsuarioPage />
              </PrivateRoute>
            }
          />

          <Route
            path="admin/provincias"
            element={
              <PrivateRoute>
                <ProvinciaAdmin />
              </PrivateRoute>
            }
          />
          <Route
            path="admin/localidades"
            element={
              <PrivateRoute>
                <LocalidadAdmin />
              </PrivateRoute>
            }
          />
          <Route
            path="admin/titulares"
            element={
              <PrivateRoute>
                <TitularAdmin />
              </PrivateRoute>
            }
          />
          {/* Fallback 404 */}
          <Route
            path="*"
            element={
              <h2 className="p-6 text-red-600">404 – Página no encontrada</h2>
            }
          />
        </Route>

        {/* Login fuera del layout */}
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
