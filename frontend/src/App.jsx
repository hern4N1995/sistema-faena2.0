/* import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';

import Header from './components/Header.jsx';
import FeatureCards from './components/FeatureCards.jsx';
import Footer from './components/Footer.jsx';
import Layout from './components/Layout.jsx';
import Inicio from './pages/Inicio.jsx';
import Faena from './pages/Tropa.jsx';
import Decomisos from './pages/Decomisos.jsx';
import Remanentes from './pages/Remanentes.jsx';
import Login from './pages/Login.jsx';
import Faenados from './pages/Faenados.jsx';
import ProvinciaAdmin from './pages/ProvinciaAdmin.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import LocalidadAdmin from './pages/LocalidadAdmin.jsx';
import TitularAdmin from './pages/TitularAdmin.jsx';
import AgregarUsuarioPage from './pages/AgregarUsuarioPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/inicio" replace />} />
        <Route
          path="/inicio"
          element={
            <Layout>
              <Inicio />
            </Layout>
          }
        />
        <Route path="/faena" element={<Faena />} />
        <Route path="/faenados" element={<Faenados />} />
        <Route path="/decomisos" element={<Decomisos />} />
        <Route path="/remanentes" element={<Remanentes />} />
        <Route
          path="/login"
          element={
            <Layout>
              <Login />
            </Layout>
          }
        />
        <Route
          path="/admin/agregar-usuario"
          element={
            <PrivateRoute>
              <AgregarUsuarioPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/provincias"
          element={
            <PrivateRoute>
              <ProvinciaAdmin />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/localidades"
          element={
            <PrivateRoute>
              <LocalidadAdmin />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/titulares"
          element={
            <PrivateRoute>
              <TitularAdmin />
            </PrivateRoute>
          }
        />

        <Route
          path="*"
          element={
            <Layout>
              <h2>404 – Página no encontrada</h2>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
 */

// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';

import Layout from './components/Layout.jsx';
import Inicio from './pages/Inicio.jsx';
import Tropa from './pages/Tropa.jsx';
import Decomisos from './pages/Decomisos.jsx';
import Remanentes from './pages/Remanentes.jsx';
import Login from './pages/Login.jsx';
import Faenados from './pages/Faenados.jsx';
import ProvinciaAdmin from './pages/ProvinciaAdmin.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import LocalidadAdmin from './pages/LocalidadAdmin.jsx';
import TitularAdmin from './pages/TitularAdmin.jsx';
import AgregarUsuarioPage from './pages/AgregarUsuarioPage.jsx';
import DetalleTropa from './pages/DetalleTropa.jsx';
import Sidebar from './components/Sidebar.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/inicio" replace />} />
        <Route path="/" element={<Layout />}>
          <Route path="inicio" element={<Inicio />} />
          <Route path="tropa" element={<Tropa />} />
          <Route path="faenados" element={<Faenados />} />
          <Route path="decomisos" element={<Decomisos />} />
          <Route path="remanentes" element={<Remanentes />} />
          <Route path="tropa/detalle/:id" element={<DetalleTropa />} />

          <Route path="login" element={<Login />} />
          <Route
            path="admin/agregar-usuario"
            element={
              <PrivateRoute>
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
          <Route path="*" element={<h2>404 – Página no encontrada</h2>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
