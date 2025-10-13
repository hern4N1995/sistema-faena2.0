// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import './index.css';
import Layout from './components/Layout.jsx';
import Sidebar from './components/Sidebar.jsx';
import Inicio from './pages/Inicio.jsx';
import Tropa from './pages/Tropa.jsx';
import DetalleTropa from './pages/DetalleTropa.jsx';
import InformeTropa from './pages/InformeTropa.jsx';
import Login from './pages/Login.jsx';
import TropasCargadas from './pages/TropasCargadas.jsx';
import FaenaPage from './pages/FaenaPage.jsx';
import DetalleFaenaPage from './pages/DetalleFaenaPage.jsx';
import FaenasRealizadasPage from './pages/FaenasRealizadasPage.jsx';
import ProvinciaAdmin from './pages/ProvinciaAdmin.jsx';
import TitularAdmin from './pages/TitularAdmin.jsx';
import AgregarUsuarioPage from './pages/AgregarUsuarioPage.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import DepartamentoAdmin from './pages/DepartamentoAdmin.jsx';
import PlantaAdmin from './pages/PlantaAdmin.jsx';
import ProductorAdmin from './pages/ProductorAdmin.jsx';
import DecomisoPage from './pages/DecomisoPage.jsx';

import FaenasADecomisar from './pages/FaenasADecomisar.jsx';
import AfeccionesAdmin from './pages/AfeccionesAdmin.jsx';
import VeterinariosPage from './pages/veterinariosPage.jsx';
import TipoParteDecomisadaAdmin from './pages/tipoParteDecomisadaAdmin.jsx';
import ParteDecomisadaAdmin from './pages/ParteDecomisadaAdmin.jsx';
import EspecieAdmin from './pages/EspecieAdmin';
import CategoriaEspecieAdmin from './pages/CategoriaEspecieAdmin';
import DecomisoResumenPage from './pages/DecomisoResumenPage';
import DecomisosCargadosPage from './pages/DecomisosCargadosPage.jsx';
import PerfilPage from './pages/PerfilPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout general con Header y Sidebar */}
        <Route element={<Layout sidebar={<Sidebar />} />}>
          <Route path="perfil" element={<PerfilPage />} />
          <Route path="/" element={<Navigate to="/inicio" replace />} />
          <Route path="inicio" element={<Inicio />} />
          <Route path="tropa" element={<Tropa />} />
          <Route path="tropas-cargadas" element={<TropasCargadas />} />
          <Route
            path="tropas-cargadas/modificar/:id"
            element={<DetalleTropa />}
          />
          <Route
            path="/tropas-cargadas/resumen/:id"
            element={<InformeTropa />}
          />

          {/* Decomiso y sus subrutas */}
          <Route path="decomisos">
            <Route index element={<FaenasADecomisar />} />
            <Route path="nuevo/:id_faena" element={<DecomisoPage />} />
            {/* <Route path="detalle/:idFaena" element={<DetalleDecomisoPage />} /> */}

            <Route path="detalle/:id" element={<DecomisoResumenPage />} />
            <Route path="cargados" element={<DecomisosCargadosPage />} />
          </Route>

          {/* Faena y sus subrutas */}
          <Route path="faena">
            <Route index element={<FaenaPage />} />
            <Route path="nueva/:idTropa" element={<DetalleFaenaPage />} />{' '}
            {/* modo creación */}
            <Route path=":idFaena" element={<DetalleFaenaPage />} />{' '}
            {/* modo edición */}
            <Route
              path="/faena/faenas-realizadas"
              element={<FaenasRealizadasPage />}
            />
          </Route>

          <Route
            path="admin/usuarios"
            element={
              <PrivateRoute allowedRoles={[1, 2]}>
                <AgregarUsuarioPage />
              </PrivateRoute>
            }
          />

          {/*Veterinarios*/}
          <Route
            path="admin/veterinarios"
            element={
              <PrivateRoute allowedRoles={[1, 2]}>
                <VeterinariosPage />
              </PrivateRoute>
            }
          />

          <Route
            path="admin/provincias"
            element={
              <PrivateRoute allowedRoles={[1, 2]}>
                <ProvinciaAdmin />
              </PrivateRoute>
            }
          />
          <Route
            path="admin/departamentos"
            element={
              <PrivateRoute allowedRoles={[1, 2]}>
                <DepartamentoAdmin />
              </PrivateRoute>
            }
          />
          <Route
            path="admin/titulares"
            element={
              <PrivateRoute allowedRoles={[1, 2]}>
                <TitularAdmin />
              </PrivateRoute>
            }
          />
          <Route
            path="admin/plantas"
            element={
              <PrivateRoute allowedRoles={[1, 2]}>
                <PlantaAdmin />
              </PrivateRoute>
            }
          />
          <Route
            path="admin/productores"
            element={
              <PrivateRoute allowedRoles={[1, 2]}>
                <ProductorAdmin />
              </PrivateRoute>
            }
          />
          <Route
            path="admin/afecciones"
            element={
              <PrivateRoute allowedRoles={[1, 2]}>
                <AfeccionesAdmin />
              </PrivateRoute>
            }
          />

          <Route
            path="admin/partes-decomisadas"
            element={
              <PrivateRoute allowedRoles={[1, 2]}>
                <ParteDecomisadaAdmin />
              </PrivateRoute>
            }
          />

          <Route
            path="admin/tipos-parte-decomisada"
            element={
              <PrivateRoute allowedRoles={[1, 2]}>
                <TipoParteDecomisadaAdmin />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/especies"
            element={
              <PrivateRoute allowedRoles={[1, 2]}>
                <EspecieAdmin />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/categorias-especie"
            element={
              <PrivateRoute allowedRoles={[1, 2]}>
                <CategoriaEspecieAdmin />
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
