import React, { useState } from 'react'
import Layout from '../components/Layout.jsx'

export default function TitularAdmin() {
  const [titulares, setTitulares] = useState([])
  const [nuevoTitular, setNuevoTitular] = useState({
    nombre: '',
    localidad: '',
    provincia: '',
    direccion: '',
    documento: '',
  })
  const [editandoId, setEditandoId] = useState(null)
  const [editado, setEditado] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setNuevoTitular({ ...nuevoTitular, [name]: value })
  }

  const agregarTitular = () => {
    if (!nuevoTitular.nombre.trim()) return
    const nuevoId = Math.max(...titulares.map(t => t.id), 0) + 1
    setTitulares([...titulares, { id: nuevoId, ...nuevoTitular }])
    setNuevoTitular({
      nombre: '',
      localidad: '',
      provincia: '',
      direccion: '',
      documento: '',
    })
  }

  const eliminarTitular = (id) => {
    setTitulares(titulares.filter(t => t.id !== id))
  }

  const iniciarEdicion = (titular) => {
    setEditandoId(titular.id)
    setEditado({ ...titular })
  }

  const guardarEdicion = () => {
    setTitulares(titulares.map(t => (t.id === editandoId ? editado : t)))
    setEditandoId(null)
    setEditado({})
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-6 mt-4">
        <h1 className="text-2xl font-bold mb-4">Administrar Titulares de Faena</h1>

        {/* Formulario */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="nombre" value={nuevoTitular.nombre} onChange={handleChange} placeholder="Nombre y Apellido o Razón Social" className="px-4 py-2 border rounded" />
          <input name="localidad" value={nuevoTitular.localidad} onChange={handleChange} placeholder="Localidad" className="px-4 py-2 border rounded" />
          <input name="provincia" value={nuevoTitular.provincia} onChange={handleChange} placeholder="Provincia" className="px-4 py-2 border rounded" />
          <input name="direccion" value={nuevoTitular.direccion} onChange={handleChange} placeholder="Dirección" className="px-4 py-2 border rounded" />
          <input name="documento" value={nuevoTitular.documento} onChange={handleChange} placeholder="DNI o CUIT" className="px-4 py-2 border rounded" />
        </div>
        <button onClick={agregarTitular} className="bg-[#00902f] text-white px-4 py-2 rounded hover:bg-[#008d36] mt-2">
          Agregar Titular
        </button>

        {/* Tabla */}
        <table className="w-full border mt-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-2">Nombre / Razón Social</th>
              <th className="border px-3 py-2">Localidad</th>
              <th className="border px-3 py-2">Provincia</th>
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
                    <input value={editado.nombre} onChange={(e) => setEditado({ ...editado, nombre: e.target.value })} className="w-full px-2 py-1 border rounded" />
                  ) : (
                    t.nombre
                  )}
                </td>
                <td className="border px-3 py-1">{editandoId === t.id ? <input value={editado.localidad} onChange={(e) => setEditado({ ...editado, localidad: e.target.value })} className="w-full px-2 py-1 border rounded" /> : t.localidad}</td>
                <td className="border px-3 py-1">{editandoId === t.id ? <input value={editado.provincia} onChange={(e) => setEditado({ ...editado, provincia: e.target.value })} className="w-full px-2 py-1 border rounded" /> : t.provincia}</td>
                <td className="border px-3 py-1">{editandoId === t.id ? <input value={editado.direccion} onChange={(e) => setEditado({ ...editado, direccion: e.target.value })} className="w-full px-2 py-1 border rounded" /> : t.direccion}</td>
                <td className="border px-3 py-1">{editandoId === t.id ? <input value={editado.documento} onChange={(e) => setEditado({ ...editado, documento: e.target.value })} className="w-full px-2 py-1 border rounded" /> : t.documento}</td>
                <td className="border px-3 py-1 space-x-2">
                  {editandoId === t.id ? (
                    <button onClick={guardarEdicion} className="text-green-700 hover:text-green-900 font-bold">💾</button>
                  ) : (
                    <button onClick={() => iniciarEdicion(t)} className="text-blue-600 hover:text-blue-800 font-bold">✏️</button>
                  )}
                  <button onClick={() => eliminarTitular(t.id)} className="text-red-600 hover:text-red-800 font-bold">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
