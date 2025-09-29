import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const DecomisoPage = () => {
  const { id_faena } = useParams();
  const navigate = useNavigate();

  const [infoFaena, setInfoFaena] = useState(null);
  const [datosFaena, setDatosFaena] = useState([]);
  const [loading, setLoading] = useState(true);

  const [detalles, setDetalles] = useState([
    {
      id_tipo_parte_deco: '',
      id_parte_decomisada: '',
      id_afeccion: '',
      cantidad: '',
      animales_afectados: '',
      peso_kg: '',
      observaciones: '',
    },
  ]);

  const [tiposParte, setTiposParte] = useState([]);
  const [partes, setPartes] = useState([]);
  const [afecciones, setAfecciones] = useState([]);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const token = localStorage.getItem('token'); // o sessionStorage si lo guardás ahí

        const resFaena = await fetch(`/api/faena/${id_faena}/decomiso-datos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const faena = await resFaena.json();

        if (Array.isArray(faena) && faena.length > 0) {
          setInfoFaena({
            id_faena_detalle: faena[0].id_faena_detalle,
            n_tropa: faena[0].n_tropa,
            dte_dtu: faena[0].dte_dtu,
            fecha_faena: new Date(faena[0].fecha_faena).toLocaleDateString(
              'es-AR'
            ),
            faenados: faena.reduce((acc, f) => acc + f.faenados, 0),
          });
          setDatosFaena(faena);
        }

        const resBase = await fetch('/api/decomisos/datos-base', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const base = await resBase.json();

        const tipos = new Map();
        const partesList = [];
        const afeccionesSet = new Map();

        base.forEach((item) => {
          tipos.set(item.id_tipo_parte_deco, item.nombre_tipo_parte);
          partesList.push({
            id: item.id_parte_decomisada,
            nombre: item.nombre_parte,
            id_tipo_parte_deco: item.id_tipo_parte_deco,
          });
          afeccionesSet.set(item.id_afeccion, item.descripcion);
        });

        setTiposParte(
          Array.from(tipos.entries()).map(([id, nombre]) => ({ id, nombre }))
        );
        setPartes(partesList);
        setAfecciones(
          Array.from(afeccionesSet.entries()).map(([id, descripcion]) => ({
            id,
            descripcion,
          }))
        );
      } catch (err) {
        console.error('❌ Error al cargar datos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, [id_faena]);

  const agregarDetalle = () => {
    setDetalles((prev) => [
      ...prev,
      {
        id_tipo_parte_deco: '',
        id_parte_decomisada: '',
        id_afeccion: '',
        cantidad: '',
        animales_afectados: '',
        peso_kg: '',
        observaciones: '',
      },
    ]);
  };

  const actualizarDetalle = (index, campo, valor) => {
    const nuevos = [...detalles];
    nuevos[index][campo] = valor;
    if (campo === 'id_tipo_parte_deco') {
      nuevos[index].id_parte_decomisada = '';
    }
    setDetalles(nuevos);
  };

  const handleGuardar = async () => {
    if (!infoFaena?.id_faena_detalle) {
      alert('No se pudo obtener el detalle de faena.');
      return;
    }

    const payload = detalles.map((d) => ({
      id_faena_detalle: infoFaena.id_faena_detalle,
      id_tipo_parte_deco: d.id_tipo_parte_deco,
      id_parte_decomisada: d.id_parte_decomisada,
      id_afeccion: d.id_afeccion,
      cantidad: d.cantidad,
      animales_afectados: d.animales_afectados,
      peso_kg: d.peso_kg || null,
      destino_decomiso: null,
      observaciones: d.observaciones || null,
    }));

    try {
      const res = await fetch('/api/decomisos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error desconocido');

      alert('✅ Decomiso registrado correctamente');
      navigate(`/decomisos/detalle/${data.id_decomiso}`);
    } catch (err) {
      console.error('❌ Error al guardar decomisos:', err);
      alert('Error al guardar decomisos. Verifique los datos.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 px-4 py-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">
          🩺 Registrar Decomisos
        </h1>

        {infoFaena && (
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card title="N° de Tropa" value={infoFaena.n_tropa} />
            <Card title="DTE / DTU" value={infoFaena.dte_dtu} />
            <Card title="Fecha de Faena" value={infoFaena.fecha_faena} />
            <Card title="Faenados" value={infoFaena.faenados} />
          </div>
        )}

        {datosFaena.length > 0 && (
          <div className="bg-white rounded-lg shadow p-3 mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              🐄 Animales faenados
            </h2>
            <table className="w-full text-sm">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="px-2 py-2 text-left">Especie</th>
                  <th className="px-2 py-2 text-left">Categoría</th>
                  <th className="px-2 py-2 text-center">Faenados</th>
                </tr>
              </thead>
              <tbody>
                {datosFaena.map((d) => (
                  <tr key={d.id_tropa_detalle} className="border-b">
                    <td className="px-2 py-2">{d.especie}</td>
                    <td className="px-2 py-2">{d.categoria}</td>
                    <td className="px-2 py-2 text-center font-bold">
                      {d.faenados}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {detalles.map((detalle, index) => (
          <div
            key={index}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 bg-white p-3 rounded shadow"
          >
            {/* Tipo de parte */}
            <select
              value={detalle.id_tipo_parte_deco}
              onChange={(e) =>
                actualizarDetalle(index, 'id_tipo_parte_deco', e.target.value)
              }
              className="border rounded px-2 py-1"
            >
              <option value="">Tipo de parte</option>
              {tiposParte.map((tp) => (
                <option key={tp.id} value={tp.id}>
                  {tp.nombre}
                </option>
              ))}
            </select>

            {/* Parte decomisada filtrada por tipo */}
            <select
              value={detalle.id_parte_decomisada}
              onChange={(e) =>
                actualizarDetalle(index, 'id_parte_decomisada', e.target.value)
              }
              className="border rounded px-2 py-1"
              disabled={!detalle.id_tipo_parte_deco}
            >
              <option value="">Parte decomisada</option>
              {partes
                .filter(
                  (p) =>
                    p.id_tipo_parte_deco ===
                    parseInt(detalle.id_tipo_parte_deco)
                )
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
            </select>

            {/* Afección */}
            <select
              value={detalle.id_afeccion}
              onChange={(e) =>
                actualizarDetalle(index, 'id_afeccion', e.target.value)
              }
              className="border rounded px-2 py-1"
            >
              <option value="">Afección</option>
              {afecciones.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.descripcion}
                </option>
              ))}
            </select>

            {/* Cantidad */}
            <input
              type="number"
              placeholder="Cantidad de órganos"
              value={detalle.cantidad}
              onChange={(e) =>
                actualizarDetalle(index, 'cantidad', e.target.value)
              }
              className="border rounded px-2 py-1"
            />

            {/* Peso */}
            <input
              type="number"
              step="0.1"
              placeholder="Peso (kg)"
              value={detalle.peso_kg}
              onChange={(e) =>
                actualizarDetalle(index, 'peso_kg', e.target.value)
              }
              className="border rounded px-2 py-1"
            />

            {/* Animales afectados */}
            <input
              type="number"
              placeholder="Animales afectados"
              value={detalle.animales_afectados}
              onChange={(e) =>
                actualizarDetalle(index, 'animales_afectados', e.target.value)
              }
              className="border rounded px-2 py-1"
            />

            {/* Observaciones */}
            <textarea
              placeholder="Observaciones"
              value={detalle.observaciones}
              onChange={(e) =>
                actualizarDetalle(index, 'observaciones', e.target.value)
              }
              className="border rounded px-2 py-1 col-span-3"
            />
          </div>
        ))}

        <div className="flex justify-between mt-4">
          <button
            onClick={agregarDetalle}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded text-sm font-semibold hover:bg-gray-300"
          >
            ➕ Agregar detalle
          </button>

          <button
            onClick={handleGuardar}
            className="px-4 py-2 bg-green-700 text-white rounded text-sm font-semibold hover:bg-green-800"
          >
            Guardar Decomisos
          </button>
        </div>
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

export default DecomisoPage;
