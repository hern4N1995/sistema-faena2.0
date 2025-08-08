import React, { useState, useEffect } from 'react';

const roles = ['Supervisor', 'Usuario'];
const estados = ['Activo', 'Inactivo'];

const AgregarUsuarioPage = () => {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    password: '',
    rol: 'Usuario',
    estado: 'Activo',
  });
  const [usuarios, setUsuarios] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const res = await fetch('/api/usuarios');
      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      console.error('Error al cargar usuarios', err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
        rol: 'Usuario',
        estado: 'Activo',
      });
      setEditandoId(null);
      fetchUsuarios();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditar = (usuario) => {
    setForm({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      dni: usuario.dni,
      email: usuario.email,
      password: '',
      rol: usuario.rol,
      estado: usuario.estado,
    });
    setEditandoId(usuario.id_usuario);
    setMensaje('');
    setError('');
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;
    try {
      const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar usuario');
      fetchUsuarios();
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

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-xl font-bold">
        {editandoId ? 'Modificar Usuario' : 'Agregar Usuario'}
      </h2>
      {editandoId && (
        <p className="text-sm text-gray-600">Editando usuario #{editandoId}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Campos del formulario */}
          <div>
            <label className="block font-medium">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium">Apellido</label>
            <input
              type="text"
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium">DNI</label>
            <input
              type="text"
              name="dni"
              value={form.dni}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block font-medium">Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder={editandoId ? 'Dejar vacío para no cambiar' : ''}
            />
          </div>
          <div>
            <label className="block font-medium">Rol</label>
            <select
              name="rol"
              value={form.rol}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium">Estado</label>
            <select
              name="estado"
              value={form.estado}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              {estados.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>
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

      {/* Filtro */}
      <input
        type="text"
        placeholder="Buscar por DNI, nombre o apellido"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="mb-4 px-4 py-2 border rounded-md w-full"
      />

      {/* Lista con scroll */}
      <div className="max-h-[400px] overflow-y-auto border rounded-md p-2 bg-white shadow">
        {usuariosFiltrados.length > 0 ? (
          <ul className="space-y-2">
            {usuariosFiltrados.map((u) => (
              <li
                key={u.id}
                className="flex justify-between items-center border rounded px-4 py-2"
              >
                <div>
                  <strong>
                    {u.nombre} {u.apellido}
                  </strong>{' '}
                  — DNI: {u.dni} — {u.email} — {u.rol} — {u.estado}
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
