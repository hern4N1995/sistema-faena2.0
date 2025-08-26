import { useState, useEffect } from 'react';
import api from '../services/api';

export default function DetalleEspecieForm({ idTropa }) {
  const [especies, setEspecies] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [especieSeleccionada, setEspecieSeleccionada] = useState('');
  const [detalle, setDetalle] = useState([]);
  const [categoria, setCategoria] = useState('');
  const [cantidad, setCantidad] = useState('');

  useEffect(() => {
    api
      .get('/especies')
      .then((res) => {
        setEspecies(res.data);
      })
      .catch((err) => {
        console.error('Error al obtener especies:', err);
      });
  }, []);

  useEffect(() => {
    if (!especieSeleccionada) return;

    console.log(
      `Consultando categorías para especie ID: ${especieSeleccionada}`
    );

    api
      .get(`/especie/${especieSeleccionada}/categorias`)
      .then((res) => {
        setCategorias(res.data);
        setCategoria('');
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          console.warn('Sin categorías para esta especie');
          setCategorias([]);
        } else {
          console.error('Error al obtener categorías:', err);
        }
      });
  }, [especieSeleccionada]);

  const agregarDetalle = () => {
    if (!categoria || !cantidad) return;

    const especieObj = especies.find((e) => e.id === especieSeleccionada);
    const categoriaObj = categorias.find((c) => c.id === Number(categoria));

    const nuevo = {
      especie_id: especieSeleccionada,
      especie_nombre: especieObj?.nombre || '',
      categoria_id: Number(categoria),
      categoria_nombre: categoriaObj?.nombre || '',
      cantidad: parseInt(cantidad),
    };

    setDetalle((prev) => [...prev, nuevo]);
    setCategoria('');
    setCantidad('');
  };

  const guardarDetalles = () => {
    if (detalle.length === 0) {
      alert('No hay detalles para guardar');
      return;
    }

    const payload = detalle.map((d) => ({
      id_especie: d.especie_id,
      id_cat_especie: d.categoria_id,
      cantidad: d.cantidad,
    }));

    api
      .post(`/tropa_detalle/${idTropa}`, { detalles: payload })
      .then(() => {
        setDetalle([]);
        alert('Detalles guardados correctamente');
      })
      .catch((err) => {
        console.error('Error al guardar detalles:', err);
        alert('Hubo un problema al guardar. Revisá la consola.');
      });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-semibold mb-1">Especie</label>
        <select
          value={especieSeleccionada}
          onChange={(e) => setEspecieSeleccionada(Number(e.target.value))}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Seleccionar especie</option>
          {especies.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre}
            </option>
          ))}
        </select>
      </div>

      {especieSeleccionada && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block font-semibold mb-1">Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
            {categorias.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">
                No hay categorías disponibles para esta especie.
              </p>
            )}
          </div>

          <div>
            <label className="block font-semibold mb-1">Cantidad</label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-full border rounded px-3 py-2"
              min={0}
            />
          </div>

          <button
            onClick={agregarDetalle}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Agregar
          </button>
        </div>
      )}

      {detalle.length > 0 && (
        <div className="mt-6">
          <h4 className="font-bold mb-2">Detalle agregado</h4>
          <table className="w-full table-auto border">
            <thead className="bg-gray-200">
              <tr>
                <th>Especie</th>
                <th>Categoría</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {detalle.map((d, i) => (
                <tr key={i} className="text-center border-t">
                  <td>{d.especie_nombre}</td>
                  <td>{d.categoria_nombre}</td>
                  <td>{d.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={guardarDetalles}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Guardar todo
          </button>
        </div>
      )}
    </div>
  );
}
