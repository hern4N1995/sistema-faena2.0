import React, { useState } from 'react'
import Layout from '../components/Layout.jsx'

export default function LocalidadAdmin() {
  const [provincias] = useState([
    { id: 1, descripcion: 'Corrientes' },
    { id: 2, descripcion: 'Misiones' },
  ])
  const [localidades, setLocalidades] = useState([
    { id: 1, nombre: 'Capital', provinciaId: 1 },
    { id: 2, nombre: 'Eldorado', provinciaId: 2 },
  ])
  const [nuevaLocalidad, setNuevaLocalidad] = useState('')
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState(provincias[0]?.id || null)
  const [editandoId, setEditandoId] = useState(null)
  const [nombreEditado, setNombreEditado] = useState('')

  const agregarLocalidad = () => {
    if (!nuevaLocalidad.trim()) return
    const nuevoId = Math.max(...localidades.map(l => l.id), 0) + 1
    const nueva = {
      id: nuevoId,
      nombre: nuevaLocalidad.trim(),
      provinciaId: provinciaSeleccionada,
    }
    setLocalidades([...localidades, nueva])
    setNuevaLocalidad('')
  }

  const eliminarLocalidad = (id) => {
    setLocalidades(localidades.filter(l => l.id !== id))
  }

  const iniciarEdicion = (id, nombreActual) => {
    setEditandoId(id)
    setNombreEditado(nombreActual)
  }

  const guardarEdicion = () => {
    if (!nombreEditado.trim()) return
    const actualizadas = localidades.map(l =>
      l.id === editandoId ? { ...l, nombre: nombreEditado.trim() } : l
    )
    setLocalidades(actualizadas)
    setEditandoId(null)
    setNombreEditado('')
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-6 mt-4">
        <h1 className="text-2xl font-bold mb-2">Administrar Localidades</h1>

        {/* Formulario */}
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            value={nuevaLocalidad}
            onChange={(e) => setNuevaLocalidad(e.target.value)}
            placeholder="Nueva localidad"
            className="flex-grow px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <select
            value={provinciaSeleccionada}
            onChange={(e) => setProvinciaSeleccionada(Number(e.target.value))}
            className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {provincias.map(p => (
              <option key={p.id} value={p.id}>
                {p.descripcion}
              </option>
            ))}
          </select>
          <button
            onClick={agregarLocalidad}
            className="bg-[#00902f] text-white px-4 py-2 rounded hover:bg-[#008d36]"
          >
            Agregar
          </button>
        </div>

        {/* Tabla */}
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-2 text-left">ID</th>
              <th className="border px-3 py-2 text-left">Localidad</th>
              <th className="border px-3 py-2 text-left">Provincia</th>
              <th className="border px-3 py-2 text-left">Acción</th>
            </tr>
          </thead>
          <tbody>
            {localidades.map((loc) => {
              const provincia = provincias.find(p => p.id === loc.provinciaId)
              return (
                <tr key={loc.id} className="hover:bg-gray-50">
                  <td className="border px-3 py-1">{loc.id}</td>
                  <td className="border px-3 py-1">
                    {editandoId === loc.id ? (
                      <input
                        value={nombreEditado}
                        onChange={(e) => setNombreEditado(e.target.value)}
                        className="w-full px-2 py-1 border rounded bg-gray-100"
                      />
                    ) : (
                      loc.nombre
                    )}
                  </td>
                  <td className="border px-3 py-1">{provincia?.descripcion || '-'}</td>
                  <td className="border px-3 py-1 space-x-2">
                    {editandoId === loc.id ? (
                      <button
                        onClick={guardarEdicion}
                        className="text-green-700 hover:text-green-900 font-bold"
                      >
                        💾
                      </button>
                    ) : (
                      <button
                        onClick={() => iniciarEdicion(loc.id, loc.nombre)}
                        className="text-blue-600 hover:text-blue-800 font-bold"
                      >
                        ✏️
                      </button>
                    )}
                    <button
                      onClick={() => eliminarLocalidad(loc.id)}
                      className="text-red-600 hover:text-red-800 font-bold"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
