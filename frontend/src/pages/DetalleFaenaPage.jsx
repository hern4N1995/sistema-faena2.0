import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DetalleFaenaForm from '../components/DetalleFaenaForm';

const DetalleFaenaPage = () => {
  const { idTropa } = useParams();
  const navigate = useNavigate();
  const [faena, setFaena] = useState(null);
  const [modo] = useState('crear');
  const [resumen, setResumen] = useState(null); // ✅ agregado

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`/tropas/${idTropa}/detalle`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setFaena)
      .catch(() => setFaena(null));
  }, [idTropa]);

  const handleSubmit = async (datos) => {
    const token = localStorage.getItem('token');

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
      const res = await fetch('/faena/faena', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        alert('⚠️ Sesión expirada. Volvé a iniciar sesión.');
        navigate('/login');
        return;
      }

      if (res.status === 403) {
        alert('🚫 No tenés permisos para registrar faenas');
        return;
      }

      if (res.status === 400) {
        const error = await res.json();
        alert(`❌ Error: ${error?.error || 'Datos inválidos'}`);
        return;
      }

      if (!res.ok) throw new Error('Error al guardar faena');

      const result = await res.json();
      alert('✅ Faena registrada correctamente');

      setResumen({
        id_faena: result.id_faena,
        fecha: datos.fecha,
        n_tropa: faena.n_tropa,
        especie: faena.especie,
        categorias: datos.categorias,
      });
    } catch (err) {
      console.error('Error al guardar faena:', err);
      alert('❌ No se pudo guardar la faena');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 text-center mb-8">
          Faena
        </h1>

        {resumen ? (
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

export default DetalleFaenaPage;
