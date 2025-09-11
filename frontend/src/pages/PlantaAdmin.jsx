import React, { useState, useEffect } from 'react';

export default function PlantaAdmin() {
  const [plantas, setPlantas] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [nuevaPlanta, setNuevaPlanta] = useState({
    nombre: '',
    id_provincia: '',
    direccion: '',
    fecha_habilitacion: '',
    norma_legal: '',
    estado: true,
  });
  const [editandoId, setEditandoId] = useState(null);
  const [editado, setEditado] = useState({});

  // Cargar plantas
  useEffect(() => {
    const cargarPlantas = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/plantas');
        const data = await res.json();
        setPlantas(data);
      } catch (error) {
        console.error('Error al cargar plantas:', error);
      }
    };
    cargarPlantas();
  }, []);

  // Cargar provincias
  useEffect(() => {
    const cargarProvincias = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/provincias');
        const data = await res.json();
        setProvincias(data);
      } catch (error) {
        console.error('Error al cargar provincias:', error);
      }
    };
    cargarProvincias();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setNuevaPlanta({ ...nuevaPlanta, [name]: val });
  };

  const agregarPlanta = async () => {
    if (!nuevaPlanta.nombre.trim()) return;

    try {
      const res = await fetch('http://localhost:3000/api/plantas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaPlanta),
      });
      const data = await res.json();
      if (res.ok) {
        setPlantas([...plantas, data]);
        setNuevaPlanta({
          nombre: '',
          id_provincia: '',
          direccion: '',
          fecha_habilitacion: '',
          norma_legal: '',
          estado: true,
        });
      }
    } catch (error) {
      console.error('Error al agregar planta:', error);
    }
  };

  const iniciarEdicion = (planta) => {
    setEditandoId(planta.id);
    setEditado({ ...planta });
  };

  const guardarEdicion = async () => {
    const payload = {
      ...editado,
      estado: typeof editado.estado === 'boolean' ? editado.estado : true,
    };

    try {
      const res = await fetch(
        `http://localhost:3000/api/plantas/${editandoId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setPlantas(plantas.map((p) => (p.id === editandoId ? data : p)));
        setEditandoId(null);
        setEditado({});
      }
    } catch (error) {
      console.error('Error al guardar edición:', error);
    }
  };

  const deshabilitarPlanta = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/api/plantas/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setPlantas(
          plantas.map((p) => (p.id === id ? { ...p, estado: false } : p))
        );
      }
    } catch (error) {
      console.error('Error al deshabilitar planta:', error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-6 mt-4">
      <h1 className="text-2xl font-bold mb-4">Administrar Plantas</h1>

      {/* Formulario */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <input
          name="nombre"
          value={nuevaPlanta.nombre}
          onChange={handleChange}
          placeholder="Nombre"
          className="px-4 py-2 border rounded"
        />

        <select
          name="id_provincia"
          value={nuevaPlanta.id_provincia}
          onChange={handleChange}
          className="px-4 py-2 border rounded"
        >
          <option value="">Seleccionar provincia</option>
          {provincias.map((prov) => (
            <option key={prov.id} value={prov.id}>
              {prov.descripcion}
            </option>
          ))}
        </select>

        <input
          name="direccion"
          value={nuevaPlanta.direccion}
          onChange={handleChange}
          placeholder="Dirección"
          className="px-4 py-2 border rounded"
        />

        <input
          type="date"
          name="fecha_habilitacion"
          value={nuevaPlanta.fecha_habilitacion}
          onChange={handleChange}
          className="px-4 py-2 border rounded"
        />

        <input
          name="norma_legal"
          value={nuevaPlanta.norma_legal}
          onChange={handleChange}
          placeholder="Norma Legal"
          className="px-4 py-2 border rounded"
        />

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="estado"
            checked={nuevaPlanta.estado}
            onChange={handleChange}
          />
          <span>Habilitada</span>
        </label>
      </div>

      <button
        onClick={agregarPlanta}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-2"
      >
        Agregar Planta
      </button>

      {/* Tabla */}
      <table className="w-full border mt-6 text-sm">
        <thead>
          <tr className="bg-gray-100">
            {[
              'nombre',
              'provincia',
              'direccion',
              'fecha_habilitacion',
              'norma_legal',
              'estado',
            ].map((campo) => (
              <th key={campo} className="border px-3 py-2 capitalize">
                {campo}
              </th>
            ))}
            <th className="border px-3 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {plantas.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              {/* nombre */}
              <td className="border px-3 py-1">
                {editandoId === p.id ? (
                  <input
                    type="text"
                    value={editado.nombre}
                    onChange={(e) =>
                      setEditado({ ...editado, nombre: e.target.value })
                    }
                    className="w-full px-2 py-1 border rounded"
                  />
                ) : (
                  p.nombre
                )}
              </td>

              {/* provincia */}
              <td className="border px-3 py-1">
                {editandoId === p.id ? (
                  <select
                    name="id_provincia"
                    value={editado.id_provincia}
                    onChange={(e) =>
                      setEditado({ ...editado, id_provincia: e.target.value })
                    }
                    className="w-full px-2 py-1 border rounded"
                  >
                    <option value="">Seleccionar provincia</option>
                    {provincias.map((prov) => (
                      <option key={prov.id} value={prov.id}>
                        {prov.descripcion}
                      </option>
                    ))}
                  </select>
                ) : (
                  p.provincia || '—'
                )}
              </td>

              {/* direccion */}
              <td className="border px-3 py-1">
                {editandoId === p.id ? (
                  <input
                    type="text"
                    value={editado.direccion}
                    onChange={(e) =>
                      setEditado({ ...editado, direccion: e.target.value })
                    }
                    className="w-full px-2 py-1 border rounded"
                  />
                ) : (
                  p.direccion
                )}
              </td>

              {/* fecha_habilitacion */}
              <td className="border px-3 py-1">
                {editandoId === p.id ? (
                  <input
                    type="date"
                    value={editado.fecha_habilitacion}
                    onChange={(e) =>
                      setEditado({
                        ...editado,
                        fecha_habilitacion: e.target.value,
                      })
                    }
                    className="w-full px-2 py-1 border rounded"
                  />
                ) : (
                  p.fecha_habilitacion
                )}
              </td>

              {/* norma_legal */}
              <td className="border px-3 py-1">
                {editandoId === p.id ? (
                  <input
                    type="text"
                    value={editado.norma_legal}
                    onChange={(e) =>
                      setEditado({ ...editado, norma_legal: e.target.value })
                    }
                    className="w-full px-2 py-1 border rounded"
                  />
                ) : (
                  p.norma_legal
                )}
              </td>

              {/* estado */}
              <td className="border px-3 py-1 text-center">
                {editandoId === p.id ? (
                  <input
                    type="checkbox"
                    checked={!!editado.estado}
                    onChange={(e) =>
                      setEditado({ ...editado, estado: e.target.checked })
                    }
                  />
                ) : p.estado ? (
                  '✅'
                ) : (
                  '❌'
                )}
              </td>

              {/* acciones */}
              <td className="border px-3 py-1 space-x-2 text-center">
                {editandoId === p.id ? (
                  <button
                    onClick={guardarEdicion}
                    className="text-green-700 hover:text-green-900 font-bold"
                  >
                    💾
                  </button>
                ) : (
                  <button
                    onClick={() => iniciarEdicion(p)}
                    className="text-blue-600 hover:text-blue-800 font-bold"
                  >
                    ✏️
                  </button>
                )}
                <button
                  onClick={() => deshabilitarPlanta(p.id)}
                  className="text-red-600 hover:text-red-800 font-bold"
                >
                  🚫
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
