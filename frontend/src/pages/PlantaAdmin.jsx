import React, { useState } from 'react';

export default function PlantaAdmin() {
  const [plantas, setPlantas] = useState([]);
  const [nuevaPlanta, setNuevaPlanta] = useState({
    nombre: '',
    localidad: '',
    provincia: '',
    direccion: '',
    registroSenasa: '',
    fechaHabilitacion: '',
    normaLegal: '',
    especies: '',
  });
  const [editandoId, setEditandoId] = useState(null);
  const [editado, setEditado] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevaPlanta({ ...nuevaPlanta, [name]: value });
  };

  const agregarPlanta = () => {
    if (!nuevaPlanta.nombre.trim()) return;
    const nuevoId = Math.max(...plantas.map((p) => p.id), 0) + 1;
    setPlantas([...plantas, { id: nuevoId, ...nuevaPlanta }]);
    setNuevaPlanta({
      nombre: '',
      localidad: '',
      provincia: '',
      direccion: '',
      registroSenasa: '',
      fechaHabilitacion: '',
      normaLegal: '',
      especies: '',
    });
  };

  const eliminarPlanta = (id) => {
    setPlantas(plantas.filter((p) => p.id !== id));
  };

  const iniciarEdicion = (planta) => {
    setEditandoId(planta.id);
    setEditado({ ...planta });
  };

  const guardarEdicion = () => {
    setPlantas(plantas.map((p) => (p.id === editandoId ? editado : p)));
    setEditandoId(null);
    setEditado({});
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-6 mt-4">
      <h1 className="text-2xl font-bold mb-4">
        Administrar Plantas / Establecimientos
      </h1>

      {/* Formulario */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <input
          name="nombre"
          value={nuevaPlanta.nombre}
          onChange={handleChange}
          placeholder="Nombre del Establecimiento"
          className="px-4 py-2 border rounded"
        />

        <input
          type="date"
          name="fechaHabilitacion"
          value={nuevaPlanta.fechaHabilitacion}
          onChange={handleChange}
          className="px-4 py-2 border rounded"
        />
        <input
          name="normaLegal"
          value={nuevaPlanta.normaLegal}
          onChange={handleChange}
          placeholder="Norma Legal"
          className="px-4 py-2 border rounded"
        />
        <input
          name="estado"
          value={nuevaPlanta.estado}
          onChange={handleChange}
          placeholder="Estado"
          className="px-4 py-2 border rounded"
        />
        <input
          name="especies"
          value={nuevaPlanta.especies}
          onChange={handleChange}
          placeholder="Especies habilitadas a faenar"
          className="px-4 py-2 border rounded"
        />
      </div>

      <button
        onClick={agregarPlanta}
        className="bg-[#00902f] text-white px-4 py-2 rounded hover:bg-[#008d36] mt-2"
      >
        Agregar Planta
      </button>

      {/* Tabla */}
      <table className="w-full border mt-6 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-2">Nombre</th>
            <th className="border px-3 py-2">Fecha Habilitación</th>
            <th className="border px-3 py-2">Norma Legal</th>
            <th className="border px-3 py-2">Estado</th>
            <th className="border px-3 py-2">Especies</th>
            <th className="border px-3 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {plantas.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              {[
                'nombre',
                'fechaHabilitacion',
                'normaLegal',
                'estado',
                'especies',
              ].map((campo) => (
                <td key={campo} className="border px-3 py-1">
                  {editandoId === p.id ? (
                    <input
                      type={campo === 'fechaHabilitacion' ? 'date' : 'text'}
                      value={editado[campo]}
                      onChange={(e) =>
                        setEditado({ ...editado, [campo]: e.target.value })
                      }
                      className="w-full px-2 py-1 border rounded"
                    />
                  ) : (
                    p[campo]
                  )}
                </td>
              ))}
              <td className="border px-3 py-1 space-x-2">
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
                  onClick={() => eliminarPlanta(p.id)}
                  className="text-red-600 hover:text-red-800 font-bold"
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
