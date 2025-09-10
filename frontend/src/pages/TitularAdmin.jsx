import React, { useState, useEffect } from 'react';

export default function TitularAdmin() {
  const [titulares, setTitulares] = useState([]);
  const [provinciasDB, setProvinciasDB] = useState([]);
  const [nuevoTitular, setNuevoTitular] = useState({
    nombre: '',
    provincia: '',
    localidad: '',
    direccion: '',
    documento: '',
  });
  const [editandoId, setEditandoId] = useState(null);
  const [editado, setEditado] = useState({});
  const [mensajeFeedback, setMensajeFeedback] = useState('');

  // Cargar provincias y titulares
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resProvincias, resTitulares] = await Promise.all([
          fetch('http://localhost:3000/api/provincias'),
          fetch('http://localhost:3000/api/titulares-faena'),
        ]);
        setProvinciasDB(await resProvincias.json());
        setTitulares(await resTitulares.json());
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };
    cargarDatos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoTitular({ ...nuevoTitular, [name]: value });
  };

  const agregarTitular = async () => {
    if (
      !nuevoTitular.nombre ||
      !nuevoTitular.provincia ||
      !nuevoTitular.localidad
    )
      return;
    try {
      const res = await fetch('http://localhost:3000/api/titulares-faena', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nuevoTitular.nombre,
          id_provincia: parseInt(nuevoTitular.provincia, 10),
          localidad: nuevoTitular.localidad,
          direccion: nuevoTitular.direccion,
          documento: nuevoTitular.documento,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTitulares([...titulares, data]);
        setNuevoTitular({
          nombre: '',
          provincia: '',
          localidad: '',
          direccion: '',
          documento: '',
        });
      }
    } catch (error) {
      console.error('Error al agregar titular:', error);
    }
  };

  const iniciarEdicion = (titular) => {
    setEditandoId(titular.id);
    setEditado({ ...titular });
  };

  const guardarEdicion = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/titulares-faena/${editandoId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editado),
        }
      );
      if (res.ok) {
        setTitulares(titulares.map((t) => (t.id === editandoId ? editado : t)));
        setEditandoId(null);
        setEditado({});
      }
    } catch (error) {
      console.error('Error al modificar titular:', error);
    }
  };

  const eliminarTitular = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/titulares-faena/${id}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        setTitulares(titulares.filter((t) => t.id !== id));
      }
    } catch (error) {
      console.error('Error al eliminar titular:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-6 mt-4">
      <h1 className="text-2xl font-bold mb-4">
        Administrar Titulares de Faena
      </h1>

      {/* Formulario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="nombre"
          value={nuevoTitular.nombre}
          onChange={handleChange}
          placeholder="Nombre / Razón Social"
          className="px-4 py-2 border rounded"
        />
        <select
          name="provincia"
          value={nuevoTitular.provincia}
          onChange={handleChange}
          className="px-4 py-2 border rounded"
        >
          <option value="">-- Seleccioná provincia --</option>
          {provinciasDB.map((p) => (
            <option key={p.id} value={p.id}>
              {p.descripcion}
            </option>
          ))}
        </select>
        <input
          name="localidad"
          value={nuevoTitular.localidad}
          onChange={handleChange}
          placeholder="Localidad"
          className="px-4 py-2 border rounded"
        />
        <input
          name="direccion"
          value={nuevoTitular.direccion}
          onChange={handleChange}
          placeholder="Dirección"
          className="px-4 py-2 border rounded"
        />
        <input
          name="documento"
          value={nuevoTitular.documento}
          onChange={handleChange}
          placeholder="DNI o CUIT"
          className="px-4 py-2 border rounded"
        />
      </div>
      <button
        onClick={agregarTitular}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-2"
      >
        Agregar Titular
      </button>

      {/* Tabla */}
      <table className="w-full border mt-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-2">Nombre</th>
            <th className="border px-3 py-2">Provincia</th>
            <th className="border px-3 py-2">Localidad</th>
            <th className="border px-3 py-2">Dirección</th>
            <th className="border px-3 py-2">DNI / CUIT</th>
            <th className="border px-3 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {titulares.map((t) => (
            <tr key={t.id} className="hover:bg-gray-50">
              <td className="border px-3 py-1">
                {editandoId === t.id ? (
                  <input
                    value={editado.nombre}
                    onChange={(e) =>
                      setEditado({ ...editado, nombre: e.target.value })
                    }
                    className="w-full px-2 py-1 border rounded"
                  />
                ) : (
                  t.nombre
                )}
              </td>
              <td className="border px-3 py-1">{t.provincia}</td>
              <td className="border px-3 py-1">{t.localidad}</td>
              <td className="border px-3 py-1">{t.direccion}</td>
              <td className="border px-3 py-1">{t.documento}</td>
              <td className="border px-3 py-1 space-x-2">
                {editandoId === t.id ? (
                  <button
                    onClick={guardarEdicion}
                    className="text-green-700 font-bold"
                  >
                    💾
                  </button>
                ) : (
                  <button
                    onClick={() => iniciarEdicion(t)}
                    className="text-blue-600 font-bold"
                  >
                    ✏️
                  </button>
                )}
                <button
                  onClick={() => eliminarTitular(t.id)}
                  className="text-red-600 font-bold"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
