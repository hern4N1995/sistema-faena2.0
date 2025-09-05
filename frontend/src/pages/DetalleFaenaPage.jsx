import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DetalleFaenaForm from '../components/DetalleFaenaForm';

const DetalleFaenaPage = () => {
  const { idTropa } = useParams();
  const [faena, setFaena] = useState(null);
  const [modo] = useState('crear');

  useEffect(() => {
    fetch(`/api/tropas/${idTropa}/detalle`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setFaena)
      .catch(() => setFaena(null));
  }, [idTropa]);

  const handleSubmit = (datos) => {
    console.log('Enviando faena:', datos);
    // aquí irá el fetch real
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 text-center mb-8">
          Faena {/* · Tropa {faena?.n_tropa} */}
        </h1>

        {faena ? (
          <>
            {/* Info resumida */}
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

/* mini-componente */
const Card = ({ title, value }) => (
  <div className="bg-white rounded-xl shadow border border-slate-200 p-4 text-center">
    <p className="text-xs text-slate-500 mb-1">{title}</p>
    <p className="text-lg font-semibold text-slate-800">{value}</p>
  </div>
);

export default DetalleFaenaPage;
