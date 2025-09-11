import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const DetalleDecomisoPage = () => {
  const { idFaena } = useParams();
  const [faena, setFaena] = useState(null);
  const [combinaciones, setCombinaciones] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token no disponible');
      setLoading(false);
      return;
    }

    Promise.all([
      fetch(`/api/faena/${idFaena}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(async (r) => {
        if (!r.ok) throw new Error('Error al obtener faena');
        return await r.json();
      }),
      fetch('/api/decomisos/combinaciones', {
        headers: { Authorization: `Bearer ${token}` },
      }).then(async (r) => {
        if (!r.ok) throw new Error('Error al obtener combinaciones');
        const data = await r.json();
        if (!Array.isArray(data)) throw new Error('Combinaciones inválidas');
        return data;
      }),
    ])
      .then(([faenaData, combinacionesData]) => {
        setFaena(faenaData);
        setCombinaciones(combinacionesData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('❌ Error al cargar datos:', err.message);
        setError('No se pudieron cargar los datos');
        setLoading(false);
      });
  }, [idFaena]);

  const toggleSeleccion = (id) => {
    setSeleccionadas((prev) => ({
      ...prev,
      [id]: prev[id] ? undefined : { cantidad: '', animales_afectados: '' },
    }));
  };

  const handleChange = (id, field, value) => {
    setSeleccionadas((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Token no disponible');

    const payload = Object.entries(seleccionadas).map(([id, datos]) => ({
      id_cat_enfermedad: parseInt(id.split('-')[0]),
      id_enfermedad: parseInt(id.split('-')[1]),
      cantidad: parseInt(datos.cantidad),
      animales_afectados: parseInt(datos.animales_afectados),
    }));

    try {
      const res = await fetch(`/api/decomisos/${idFaena}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('✅ Decomisos registrados correctamente');
      } else {
        const err = await res.json();
        console.error('❌ Error al registrar decomisos:', err);
        alert('❌ Error al registrar decomisos');
      }
    } catch (err) {
      console.error('❌ Error en el submit:', err.message);
      alert('❌ Error inesperado al registrar decomisos');
    }
  };

  if (loading)
    return <p className="text-center text-slate-500">Cargando datos...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;
  if (!faena)
    return <p className="text-center text-slate-500">Faena no encontrada</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6 text-center">
        🧪 Detalle de Decomisos
      </h1>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <strong>Tropa:</strong> {faena.n_tropa}
        </div>
        <div>
          <strong>Fecha:</strong>{' '}
          {new Date(faena.fecha).toLocaleDateString('es-AR')}
        </div>
        <div>
          <strong>Especie:</strong> {faena.especie}
        </div>
      </div>

      {combinaciones.length === 0 ? (
        <p className="text-center text-slate-500">
          No hay combinaciones disponibles para decomisar.
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="space-y-4">
            {combinaciones.map((c) => {
              const id = `${c.id_cat_enfermedad}-${c.id_enfermedad}`;
              const seleccion = seleccionadas[id];

              return (
                <div
                  key={id}
                  className="border rounded-xl p-4 shadow-sm bg-white"
                >
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={!!seleccion}
                      onChange={() => toggleSeleccion(id)}
                    />
                    <span className="font-semibold text-slate-800">
                      {c.categoria} con {c.enfermedad}
                    </span>
                  </label>

                  {seleccion && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="number"
                        min={1}
                        required
                        value={seleccion.cantidad}
                        onChange={(e) =>
                          handleChange(id, 'cantidad', e.target.value)
                        }
                        placeholder="Cantidad de órganos"
                        className="border rounded px-3 py-2 w-full"
                      />
                      <input
                        type="number"
                        min={0}
                        required
                        value={seleccion.animales_afectados}
                        onChange={(e) =>
                          handleChange(id, 'animales_afectados', e.target.value)
                        }
                        placeholder="Animales afectados"
                        className="border rounded px-3 py-2 w-full"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            💾 Registrar Decomisos
          </button>
        </form>
      )}
    </div>
  );
};

export default DetalleDecomisoPage;
