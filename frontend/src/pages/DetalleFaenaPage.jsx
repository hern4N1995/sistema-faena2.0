import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DetalleFaenaForm from '../components/DetalleFaenaForm';

const DetalleFaenaPage = () => {
  const { idTropa } = useParams();
  const [faena, setFaena] = useState(null);
  const [modo, setModo] = useState('crear');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const res = await fetch(`/api/tropas/${idTropa}/detalle`);
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        const data = await res.json();
        console.log('Datos recibidos:', data);
        setFaena(data);
      } catch (error) {
        console.error('Error al obtener detalle de tropa:', error);
      }
    };

    cargarDatos();
  }, [idTropa]);

  const handleSubmit = (datos) => {
    console.log('Datos enviados desde el formulario:', datos);
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Faena</h2>

      {faena ? (
        <>
          {/* Encabezado con datos principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-4">
            <div>
              <span className="block text-sm text-gray-500">N° de Tropa</span>
              <span className="text-lg font-semibold">{faena.n_tropa}</span>
            </div>
            <div>
              <span className="block text-sm text-gray-500">DTE/DTU</span>
              <span className="text-lg font-semibold">{faena.dte_dtu}</span>
            </div>
            <div>
              <span className="block text-sm text-gray-500">
                Fecha de ingreso
              </span>
              <span className="text-lg font-semibold">
                {new Date(faena.fecha).toLocaleDateString('es-AR')}
              </span>
            </div>
          </div>

          {/* Especie */}
          <div className="text-left mb-6">
            <span className="block text-sm text-gray-500">Especie</span>
            <span className="text-xl font-bold text-gray-800">
              {faena.especie}
            </span>
          </div>

          {/* Formulario */}
          <DetalleFaenaForm modo={modo} faena={faena} onSubmit={handleSubmit} />
        </>
      ) : (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md text-center">
          <p className="font-semibold mb-1">Sin animales registrados</p>
          <p>
            La tropa seleccionada no tiene animales cargados para faenar.
            Verificá los datos o agregá detalles antes de continuar.
          </p>
        </div>
      )}
    </div>
  );
};

export default DetalleFaenaPage;
