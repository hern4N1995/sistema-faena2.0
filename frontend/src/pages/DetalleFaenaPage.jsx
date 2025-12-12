import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import DetalleFaenaForm from '../components/DetalleFaenaForm';

const DetableFaenaPage = () => {
  const { idTropa } = useParams();
  const navigate = useNavigate();
  const [faena, setFaena] = useState(null);
  const [modo] = useState('crear');
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTropaYDetalle = async () => {
      if (!idTropa) {
        console.error('[DetalleFaenaPage] idTropa no proporcionado');
        setError('ID de tropa inválido');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Obtener datos generales de la tropa
        const tropaRes = await api.get(`/tropas/${idTropa}`);
        const tropa = tropaRes.data?.data || tropaRes.data || {};
        console.log('[DetalleFaenaPage] Datos tropa:', tropa);
        
        // Obtener detalle/categorías
        const detalleRes = await api.get(`/tropas/${idTropa}/detalle`);
        let detalleData = detalleRes.data;
        console.log('[DetalleFaenaPage] Respuesta detalle raw:', detalleRes.data);
        
        if (detalleData && typeof detalleData === 'object') {
          if (detalleData.data) detalleData = detalleData.data;
          if (!Array.isArray(detalleData)) {
            detalleData = detalleData.categorias || [];
          }
        }
        
        // Normalizar categorías: agregar campos faltantes
        const categoriasNormalizadas = Array.isArray(detalleData) 
          ? detalleData.map(cat => ({
              ...cat,
              id_tropa_detalle: cat.id_tropa_detalle || cat.id || null,
              nombre: cat.nombre || cat.nombre_categoria || cat.nombre_cat || cat.categoria || 'Categoría sin nombre',
              cantidad: cat.cantidad || 0,
              remanente: cat.remanente ?? cat.remanente_total ?? (cat.cantidad || 0),
              especie: cat.especie || cat.nombre_especie || '',
            }))
          : [];
        
        console.log('[DetalleFaenaPage] Categorías normalizadas:', categoriasNormalizadas);
        
        // Normalizar especie
        let especie = tropa.especie || tropa.nombre_especie || '';
        if (!especie && categoriasNormalizadas.length > 0) {
          especie = categoriasNormalizadas[0].especie || '';
        }
        
        // Construir objeto faena
        setFaena({
          id_tropa: idTropa,
          n_tropa: tropa.n_tropa || tropa.nTropa || '',
          dte_dtu: tropa.dte_dtu || tropa.dte || tropa.dtu || '',
          fecha: tropa.fecha || tropa.fecha_ingreso || new Date().toISOString(),
          especie: especie || 'Especie',
          categorias: categoriasNormalizadas,
        });
        setError(null);
      } catch (err) {
        console.error('[DetalleFaenaPage] Error al cargar datos:', err);
        setError('Error al cargar datos de la tropa');
        setFaena(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTropaYDetalle();
  }, [idTropa]);

  const handleSubmit = async (datos) => {
    if (!faena?.id_tropa) {
      alert('❌ No se pudo obtener el ID de la tropa');
      return;
    }

    const payload = {
      id_tropa: faena.id_tropa,
      fecha_faena: datos.fecha,
      categorias: datos.categorias
        .filter((c) => c.cantidad > 0)
        .map((c) => ({
          id_tropa_detalle: c.id_tropa_detalle,
          cantidad: c.cantidad,
        })),
    };

    if (!payload.categorias.length) {
      alert('⚠️ Debes ingresar al menos una categoría con cantidad');
      return;
    }

    try {
      console.log('[DetalleFaenaPage] Enviando payload:', payload);

      const res = await api.post('/faena/registrar', payload);

      console.log('[DetalleFaenaPage] Respuesta exitosa:', res.data);
      alert('✅ Faena registrada correctamente');

      setResumen({
        id_faena: res.data.id_faena,
        fecha: datos.fecha,
        n_tropa: faena.n_tropa,
        especie: faena.especie,
        categorias: datos.categorias,
      });
    } catch (err) {
      console.error('[DetalleFaenaPage] Error al guardar faena:', err);

      if (err.response?.status === 401) {
        alert('⚠️ Sesión expirada. Volvé a iniciar sesión.');
        navigate('/login');
        return;
      }

      if (err.response?.status === 403) {
        alert('🚫 No tenés permisos para registrar faenas');
        return;
      }

      if (err.response?.status === 400) {
        const errorMsg = err.response?.data?.error || 'Datos inválidos';
        alert(`❌ Error: ${errorMsg}`);
        return;
      }

      alert('❌ No se pudo guardar la faena. Intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 text-center mb-8">
          Faena
        </h1>

        {loading ? (
          <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded-md text-center">
            <p className="font-semibold">Cargando datos de la tropa...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-800 p-4 rounded-md text-center">
            <p className="font-semibold mb-1">Error al cargar</p>
            <p>{error}</p>
            <button
              onClick={() => navigate('/faena')}
              className="mt-4 px-4 py-2 rounded-lg bg-red-700 text-white hover:bg-red-800"
            >
              🔙 Volver a FaenaPage
            </button>
          </div>
        ) : resumen ? (
          <ResumenFaena resumen={resumen} />
        ) : faena ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <Card title="N° de Tropa" value={faena.n_tropa} />
              <Card title="DTE / DTU" value={faena.dte_dtu} />
              <Card
                title="Fecha de ingreso"
                value={new Date(faena.fecha).toLocaleDateString('es-AR')}
              />
            </div>

            <div className="mb-6">
              <span className="text-sm text-slate-500">Especie</span>
              <p className="text-2xl font-bold text-slate-800">
                {faena.especie}
              </p>
            </div>

            <DetalleFaenaForm
              modo={modo}
              faena={faena}
              onSubmit={handleSubmit}
            />
          </>
        ) : (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-md text-center">
            <p className="font-semibold mb-1">Sin animales registrados</p>
            <p>La tropa no tiene animales cargados para faenar.</p>
            <button
              onClick={() => navigate('/faena')}
              className="mt-4 px-4 py-2 rounded-lg bg-yellow-700 text-white hover:bg-yellow-800"
            >
              🔙 Volver a FaenaPage
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Card = ({ title, value }) => (
  <div className="bg-white rounded-xl shadow border border-slate-200 p-4 text-center">
    <p className="text-xs text-slate-500 mb-1">{title}</p>
    <p className="text-lg font-semibold text-slate-800">{value}</p>
  </div>
);

const ResumenFaena = ({ resumen }) => (
  <div className="w-full max-w-3xl mx-auto space-y-6 bg-green-50 border border-green-200 rounded-xl p-6">
    <h2 className="text-xl font-bold text-green-800">
      ✅ Faena registrada correctamente
    </h2>
    <p>
      <strong>ID Faena:</strong> {resumen.id_faena}
    </p>
    <p>
      <strong>Tropa:</strong> {resumen.n_tropa}
    </p>
    <p>
      <strong>Fecha:</strong> {resumen.fecha}
    </p>
    <p>
      <strong>Especie:</strong> {resumen.especie}
    </p>
    <h3 className="font-semibold mt-4">Categorías faenadas:</h3>
    <ul className="list-disc pl-5 text-slate-700">
      {resumen.categorias.map((cat, i) => (
        <li key={i}>
          {cat.nombre || `Detalle ${cat.id_tropa_detalle}`}: {cat.cantidad}{' '}
          animales
        </li>
      ))}
    </ul>
    <button
      onClick={() => (window.location.href = '/faena')}
      className="mt-6 px-6 py-3 rounded-lg bg-green-700 text-white font-semibold hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600 transition"
    >
      🔙 Volver a FaenaPage
    </button>
  </div>
);

export default DetableFaenaPage;
