import React, { useState, useEffect } from 'react';

const roles = [
  { id_rol: 2, nombre: 'Supervisor' },
  { id_rol: 3, nombre: 'Usuario' },
];

const estados = ['Activo', 'Inactivo'];

const AgregarUsuarioPage = () => {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    password: '',
    estado: 'Activo',
    id_rol: '',
    id_planta: '',
    n_telefono: '',
  });
  const [usuarios, setUsuarios] = useState([]);
  const [plantas, setPlantas] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar usuarios y plantas en paralelo
    Promise.all([fetchUsuarios(), fetchPlantas()])
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const fetchUsuarios = async () => {
    try {
      const res = await fetch('/api/usuarios');
      const data = await res.json();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch {
      setError('No se pudieron cargar los usuarios');
    }
  };

  const fetchPlantas = async () => {
    try {
      const res = await fetch('/api/plantas');
      console.log('fetchPlantas status:', res.status);
      const data = await res.json();
      console.log('fetchPlantas data:', data);
      setPlantas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar plantas:', err);
      setError('No se pudieron cargar las plantas');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    const url = editandoId ? `/api/usuarios/${editandoId}` : '/api/usuarios';
    const method = editandoId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Error al guardar usuario');
      setMensaje(editandoId ? 'Usuario modificado' : 'Usuario creado');
      setForm({
        nombre: '',
        apellido: '',
        dni: '',
        email: '',
        password: '',
        estado: 'Activo',
        id_rol: '',
        id_planta: '',
        n_telefono: '',
      });
      setEditandoId(null);
      await fetchUsuarios();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditar = (u) => {
    setForm({
      nombre: u.nombre,
      apellido: u.apellido,
      dni: u.dni,
      email: u.email,
      password: '',
      estado: u.estado,
      id_rol: u.id_rol,
      id_planta: parseInt(u.id_planta, 10),
      n_telefono: u.n_telefono || '',
    });
    setEditandoId(u.id_usuario);
    setMensaje('');
    setError('');
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;
    try {
      const res = await fetch(`/api/usuarios/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar usuario');
      await fetchUsuarios();
    } catch (err) {
      setError(err.message);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const texto = filtro.toLowerCase();
    return (
      u.dni.toString().includes(texto) ||
      u.nombre.toLowerCase().includes(texto) ||
      u.apellido.toLowerCase().includes(texto)
    );
  });

  if (loading) {
    return (
      <div className="py-10 text-center text-gray-500">Cargando datos...</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-xl font-bold">
        {editandoId ? 'Modificar Usuario' : 'Agregar Usuario'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
            placeholder="Nombre"
            className="border rounded px-3 py-2"
          />
          <input
            name="apellido"
            value={form.apellido}
            onChange={handleChange}
            required
            placeholder="Apellido"
            className="border rounded px-3 py-2"
          />
          <input
            name="dni"
            value={form.dni}
            onChange={handleChange}
            required
            placeholder="DNI"
            className="border rounded px-3 py-2"
          />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="Email"
            className="border rounded px-3 py-2"
          />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder={
              editandoId ? 'Dejar vacío para no cambiar' : 'Contraseña'
            }
            className="border rounded px-3 py-2"
          />
          <input
            name="n_telefono"
            value={form.n_telefono}
            onChange={handleChange}
            placeholder="Teléfono"
            className="border rounded px-3 py-2"
          />

          <select
            name="id_rol"
            value={form.id_rol}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2"
          >
            <option value="">-- Seleccionar Rol --</option>
            {roles.map((r) => (
              <option key={r.id_rol} value={r.id_rol}>
                {r.nombre}
              </option>
            ))}
          </select>

          <select
            name="id_planta"
            value={form.id_planta || ''}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2"
          >
            <option value="">-- Seleccionar Planta --</option>
            {plantas
              .filter((p) => typeof p.id_planta !== 'undefined' && p.nombre)
              .map((p) => (
                <option
                  key={`planta-${p.id_planta}`}
                  value={String(p.id_planta)}
                >
                  {p.nombre}
                </option>
              ))}
          </select>

          <select
            name="estado"
            value={form.estado}
            onChange={handleChange}
            className="border rounded px-3 py-2"
          >
            {estados.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>

          <div className="flex items-end">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
            >
              {editandoId ? 'Guardar Cambios' : 'Guardar'}
            </button>
          </div>
        </div>
      </form>

      {mensaje && <p className="text-green-600">{mensaje}</p>}
      {error && <p className="text-red-600">{error}</p>}

      <hr className="my-6" />

      <h3 className="text-lg font-semibold">Usuarios Registrados</h3>
      <input
        type="text"
        placeholder="Buscar por DNI, nombre o apellido"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="mb-4 px-4 py-2 border rounded-md w-full"
      />

      <div className="max-h-[400px] overflow-y-auto border rounded-md p-2 bg-white shadow">
        {usuariosFiltrados.length > 0 ? (
          <ul className="space-y-2">
            {usuariosFiltrados.map((u) => (
              <li
                key={u.id_usuario}
                className="flex justify-between items-center border rounded px-4 py-2"
              >
                <div>
                  <strong>
                    {u.nombre} {u.apellido}
                  </strong>{' '}
                  — DNI: {u.dni} — {u.email} — Tel: {u.n_telefono} — Rol:{' '}
                  {u.id_rol === 2 ? 'Supervisor' : 'Usuario'} — Planta:{' '}
                  {u.planta_nombre || `ID ${u.id_planta}`} — Estado:{' '}
                  {u.estado ? 'Activo' : 'Inactivo'} — Creado:{' '}
                  {new Date(u.creado_en).toLocaleDateString()}
                </div>

                <div className="space-x-2">
                  <button
                    onClick={() => handleEditar(u)}
                    className="text-blue-600 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(u.id_usuario)}
                    className="text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No se encontraron usuarios.</p>
        )}
      </div>
    </div>
  );
};

export default AgregarUsuarioPage;
