import React, { useState, useEffect, useRef } from 'react';

export default function ProvinciaAdmin() {
  const todasLasProvincias = [
    'Buenos Aires',
    'Catamarca',
    'Chaco',
    'Chubut',
    'Córdoba',
    'Corrientes',
    'Entre Ríos',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuquén',
    'Río Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego',
    'Tucumán',
  ];

  const [provincias, setProvincias] = useState([]);
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [descripcionEditada, setDescripcionEditada] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [mensajeFeedback, setMensajeFeedback] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchProvincias = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/provincias');
        const data = await res.json();
        setProvincias(data);
      } catch (err) {
        console.error('Error al cargar provincias:', err);
      }
    };

    fetchProvincias();

    const manejarClickFuera = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setMostrarSugerencias(false);
      }
    };
    document.addEventListener('mousedown', manejarClickFuera);
    return () => document.removeEventListener('mousedown', manejarClickFuera);
  }, []);

  const manejarBusqueda = (e) => {
    const texto = e.target.value;
    setNuevaDescripcion(texto);
    const filtradas = todasLasProvincias.filter((prov) =>
      prov.toLowerCase().includes(texto.toLowerCase())
    );
    setSugerencias(filtradas);
    setMostrarSugerencias(true);
    setMensajeFeedback('');
  };

  const seleccionarProvincia = (nombre) => {
    setNuevaDescripcion(nombre);
    setSugerencias([]);
    setMostrarSugerencias(false);
    setMensajeFeedback('');
  };

  const agregarProvincia = async () => {
    if (!nuevaDescripcion.trim()) return;

    const yaExiste = provincias.some(
      (p) =>
        p.descripcion.toLowerCase() === nuevaDescripcion.trim().toLowerCase()
    );

    if (yaExiste) {
      setMensajeFeedback('❌ La provincia ya está registrada.');
      setTimeout(() => setMensajeFeedback(''), 4000);
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/provincias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descripcion: nuevaDescripcion.trim() }),
      });
      const nueva = await res.json();
      setProvincias([...provincias, nueva]);
      setNuevaDescripcion('');
      setSugerencias([]);
      setMostrarSugerencias(false);
      setMensajeFeedback('✅ Provincia agregada correctamente.');
      setTimeout(() => setMensajeFeedback(''), 4000);
    } catch (err) {
      console.error('Error al agregar provincia:', err);
      setMensajeFeedback('❌ Error al agregar provincia.');
      setTimeout(() => setMensajeFeedback(''), 4000);
    }
  };

  const eliminarProvincia = async (id) => {
    const confirmar = window.confirm(
      '¿Seguro que querés eliminar esta provincia? Esta acción no se puede deshacer.'
    );
    if (!confirmar) return;

    try {
      await fetch(`http://localhost:3000/api/provincias/${id}`, {
        method: 'DELETE',
      });
      setProvincias(provincias.filter((p) => p.id !== id));
      setMensajeFeedback('✅ Provincia eliminada correctamente.');
      setTimeout(() => setMensajeFeedback(''), 4000);
    } catch (err) {
      console.error('Error al eliminar provincia:', err);
      setMensajeFeedback('❌ Error al eliminar provincia.');
      setTimeout(() => setMensajeFeedback(''), 4000);
    }
  };

  const iniciarEdicion = (id, descripcionActual) => {
    setEditandoId(id);
    setDescripcionEditada(descripcionActual);
    setMensajeFeedback('');
  };

  const guardarEdicion = async () => {
    if (!descripcionEditada.trim()) return;

    const confirmar = window.confirm(
      `¿Estás seguro de que querés guardar los cambios en la provincia "${descripcionEditada}"?`
    );
    if (!confirmar) return;

    try {
      await fetch(`http://localhost:3000/api/provincias/${editandoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descripcion: descripcionEditada.trim() }),
      });

      const actualizadas = provincias.map((p) =>
        p.id === editandoId
          ? { ...p, descripcion: descripcionEditada.trim() }
          : p
      );
      setProvincias(actualizadas);
      setEditandoId(null);
      setDescripcionEditada('');
      setMensajeFeedback('✅ Provincia modificada correctamente.');
      setTimeout(() => setMensajeFeedback(''), 4000);
    } catch (err) {
      console.error('Error al editar provincia:', err);
      setMensajeFeedback('❌ Error al editar provincia.');
      setTimeout(() => setMensajeFeedback(''), 4000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-6 mt-4">
      <h1 className="text-2xl font-bold mb-2">Administrar Provincias</h1>

      {/* 🔤 Campo de ingreso con autocompletado */}
      <div className="relative flex flex-col gap-2" ref={inputRef}>
        <div className="flex gap-2">
          <input
            type="text"
            value={nuevaDescripcion}
            onChange={manejarBusqueda}
            onFocus={() => {
              const filtradas = todasLasProvincias.filter((prov) =>
                prov.toLowerCase().includes(nuevaDescripcion.toLowerCase())
              );
              setSugerencias(filtradas);
              setMostrarSugerencias(true);
            }}
            placeholder="Ingresar provincia..."
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={agregarProvincia}
            className="bg-[#00902f] text-white px-4 py-2 rounded hover:bg-[#008d36]"
          >
            Agregar
          </button>
        </div>

        {mostrarSugerencias && sugerencias.length > 0 && (
          <ul className="absolute z-10 bg-white border w-full mt-1 rounded shadow-lg max-h-60 overflow-y-auto">
            {sugerencias.map((prov, idx) => (
              <li
                key={idx}
                onClick={() => seleccionarProvincia(prov)}
                className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
              >
                {prov}
              </li>
            ))}
          </ul>
        )}

        {mensajeFeedback && (
          <span
            className={`text-sm mt-1 block ${
              mensajeFeedback.includes('✅') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {mensajeFeedback}
          </span>
        )}
      </div>

      {/* 📋 Tabla de provincias */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-2 text-left">ID</th>
            <th className="border px-3 py-2 text-left">Descripción</th>
            <th className="border px-3 py-2 text-left">Acción</th>
          </tr>
        </thead>
        <tbody>
          {provincias.map((prov) => (
            <tr key={prov.id} className="hover:bg-gray-50">
              <td className="border px-3 py-1">{prov.id}</td>
              <td className="border px-3 py-1">
                {editandoId === prov.id ? (
                  <input
                    value={descripcionEditada}
                    onChange={(e) => setDescripcionEditada(e.target.value)}
                    className="w-full px-2 py-1 border rounded bg-gray-100"
                  />
                ) : (
                  prov.descripcion
                )}
              </td>

              <td className="border px-3 py-1 space-x-2">
                {editandoId === prov.id ? (
                  <button
                    onClick={guardarEdicion}
                    className="text-green-700 hover:text-green-900 font-bold"
                  >
                    💾
                  </button>
                ) : (
                  <button
                    onClick={() => iniciarEdicion(prov.id, prov.descripcion)}
                    className="text-blue-600 hover:text-blue-800 font-bold"
                  >
                    ✏️
                  </button>
                )}
                <button
                  onClick={() => eliminarProvincia(prov.id)}
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
