import { useState, useEffect } from 'react';
import api from '../services/api';

export default function DetalleEspecieForm({ idTropa, onSave }) {
  const [especies, setEspecies] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [especieSeleccionada, setEspecieSeleccionada] = useState('');
  const [detalle, setDetalle] = useState([]);
  const [categoria, setCategoria] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [error, setError] = useState('');

  const getTokenHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Traer especies activas
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get('/especies', { headers: getTokenHeaders() });
        const data = Array.isArray(res.data) ? res.data : [];
        // Filtramos por estado true por seguridad si viniera el campo
        const activos = data.filter((e) =>
          e.hasOwnProperty('estado') ? Boolean(e.estado) : true
        );
        if (mounted) setEspecies(activos);
      } catch (err) {
        console.error('Error al obtener especies:', err);
        if (mounted) setEspecies([]);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Cuando cambia especie, traer categorías de esa especie
  useEffect(() => {
    if (!especieSeleccionada) {
      setCategorias([]);
      setCategoria('');
      return;
    }

    let mounted = true;
    const loadCats = async () => {
      setLoadingCategorias(true);
      setError('');
      try {
        // Usamos la ruta /especies/:id/categorias
        const res = await api.get(
          `/especies/${especieSeleccionada}/categorias`,
          {
            headers: getTokenHeaders(),
          }
        );
        const data = Array.isArray(res.data) ? res.data : [];
        if (mounted) {
          // Normalizamos las categorías a { id, nombre }
          const normalized = data.map((c) => ({
            id: c.id_cat_especie ?? c.id ?? c.id_categoria,
            nombre: c.nombre ?? c.descripcion ?? c.descripcion_categoria ?? '',
          }));
          setCategorias(normalized);
          setCategoria('');
        }
      } catch (err) {
        console.error('Error al obtener categorías:', err);
        if (mounted) {
          setCategorias([]);
          setCategoria('');
          if (err.response?.status === 404) {
            setError('Sin categorías para esta especie');
          } else {
            setError('No se pudieron cargar las categorías');
          }
        }
      } finally {
        if (mounted) setLoadingCategorias(false);
      }
    };

    loadCats();
    return () => {
      mounted = false;
    };
  }, [especieSeleccionada]);

  const agregarDetalle = () => {
    setError('');
    if (!especieSeleccionada) {
      setError('Seleccioná una especie');
      return;
    }
    if (!categoria) {
      setError('Seleccioná una categoría');
      return;
    }
    const cantidadNum = Number(cantidad);
    if (!cantidad || Number.isNaN(cantidadNum) || cantidadNum <= 0) {
      setError('Ingresá una cantidad válida (mayor a 0)');
      return;
    }

    const especieObj =
      especies.find(
        (e) => String(e.id_especie ?? e.id) === String(especieSeleccionada)
      ) ?? {};
    const categoriaObj =
      categorias.find((c) => String(c.id) === String(categoria)) ?? {};

    const nuevo = {
      especie_id: String(especieSeleccionada),
      especie_nombre: especieObj.descripcion ?? especieObj.nombre ?? '',
      categoria_id: Number(categoria),
      categoria_nombre: categoriaObj.nombre ?? '',
      cantidad: cantidadNum,
    };

    setDetalle((prev) => [...prev, nuevo]);
    setCategoria('');
    setCantidad('');
  };

  const guardarDetalles = async () => {
    if (detalle.length === 0) {
      alert('No hay detalles para guardar');
      return;
    }

    const payload = detalle.map((d) => ({
      id_especie: d.especie_id,
      id_cat_especie: d.categoria_id,
      cantidad: d.cantidad,
    }));

    try {
      await api.post(`/tropas/${idTropa}/detalle`, payload, {
        headers: getTokenHeaders(),
      });
      setDetalle([]);
      alert('Detalles guardados correctamente');
      if (typeof onSave === 'function') onSave();
    } catch (err) {
      console.error('Error al guardar detalles:', err);
      alert('Hubo un problema al guardar. Revisá la consola.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-semibold mb-1">Especie</label>
        <select
          value={especieSeleccionada}
          onChange={(e) => setEspecieSeleccionada(String(e.target.value))}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Seleccionar especie</option>
          {Array.isArray(especies) &&
            especies.map((e) => {
              const id = e.id_especie ?? e.id;
              const label = e.descripcion ?? e.nombre ?? '';
              return (
                <option key={String(id)} value={String(id)}>
                  {label}
                </option>
              );
            })}
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
              disabled={loadingCategorias}
            >
              <option value="">
                {loadingCategorias ? 'Cargando...' : 'Seleccionar categoría'}
              </option>
              {Array.isArray(categorias) &&
                categorias.map((c) => (
                  <option key={String(c.id)} value={String(c.id)}>
                    {c.nombre}
                  </option>
                ))}
            </select>
            {!loadingCategorias && categorias.length === 0 && (
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
              min={1}
              disabled={!especieSeleccionada}
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

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

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
                <tr
                  key={`${d.especie_id}-${d.categoria_id}-${i}`}
                  className="text-center border-t"
                >
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
