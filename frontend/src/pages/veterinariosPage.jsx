import React, { useState, useEffect } from 'react';

const estados = ['Activo', 'Inactivo'];

const VeterinariosPage = () => {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    matricula: '',
    dni: '',
    email: '',
    n_telefono: '',
    estado: 'Activo',
    id_planta: '',
  });

  const [veterinarios, setVeterinarios] = useState([]);
  const [plantas, setPlantas] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchVeterinarios(), fetchPlantas()])
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchVeterinarios = async () => {
    try {
      const res = await fetch('/veterinarios', {
        headers: { ...getAuthHeaders() },
      });
      if (!res.ok) throw new Error('Error al cargar veterinarios');
      const data = await res.json();
      setVeterinarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetchVeterinarios:', err);
      setError('No se pudieron cargar los veterinarios');
      setVeterinarios([]);
    }
  };

  const fetchPlantas = async () => {
    try {
      const res = await api.get('/plantas', {
        headers: { ...getAuthHeaders() },
      });
      if (!res.ok) throw new Error('Error al cargar plantas');
      const data = await res.json();
      setPlantas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetchPlantas:', err);
      setError('No se pudieron cargar las plantas');
      setPlantas([]);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetForm = () =>
    setForm({
      nombre: '',
      apellido: '',
      matricula: '',
      dni: '',
      email: '',
      n_telefono: '',
      estado: 'Activo',
      id_planta: '',
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    if (
      !form.nombre.trim() ||
      !form.apellido.trim() ||
      !form.matricula.trim() ||
      !String(form.dni).trim()
    ) {
      setError('Completar nombre, apellido, matrícula y DNI es obligatorio');
      return;
    }

    const url = editandoId ? `/veterinarios/${editandoId}` : '/veterinarios';
    const method = editandoId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(form),
      });

      if (res.status === 401) throw new Error('No autorizado');
      if (res.status === 403) throw new Error('Acceso denegado');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Error al guardar veterinario');
      }

      setMensaje(editandoId ? 'Veterinario modificado' : 'Veterinario creado');
      resetForm();
      setEditandoId(null);
      await fetchVeterinarios();
    } catch (err) {
      console.error('handleSubmit:', err);
      setError(err.message);
    }
  };

  const handleEditar = (v) => {
    setForm({
      nombre: v.nombre,
      apellido: v.apellido,
      matricula: v.matricula,
      dni: v.dni || '',
      email: v.email || '',
      n_telefono: v.n_telefono || '',
      estado: v.estado || 'Activo',
      id_planta: v.id_planta || '',
    });
    setEditandoId(v.id_veterinario || v.id);
    setMensaje('');
    setError('');
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este veterinario?'))
      return;
    try {
      const res = await fetch(`/veterinarios/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() },
      });
      if (res.status === 401) throw new Error('No autorizado');
      if (res.status === 403) throw new Error('Acceso denegado');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Error al eliminar veterinario');
      }
      setMensaje('Veterinario eliminado');
      await fetchVeterinarios();
    } catch (err) {
      console.error('handleEliminar:', err);
      setError(err.message);
    }
  };

  const veterinariosFiltrados = veterinarios.filter((v) => {
    const texto = filtro.toLowerCase();
    return (
      String(v.matricula || '')
        .toLowerCase()
        .includes(texto) ||
      (v.nombre || '').toLowerCase().includes(texto) ||
      (v.apellido || '').toLowerCase().includes(texto) ||
      String(v.dni || '')
        .toLowerCase()
        .includes(texto)
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
        {editandoId ? 'Modificar Veterinario' : 'Agregar Veterinario'}
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
            name="matricula"
            value={form.matricula}
            onChange={handleChange}
            required
            placeholder="Matrícula"
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
            placeholder="Email"
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
            name="id_planta"
            value={form.id_planta}
            onChange={handleChange}
            required
            className="border rounded px-3 py-2"
          >
            <option value="">-- Seleccionar Planta --</option>
            {plantas.length > 0 ? (
              plantas.map((p) => (
                <option key={p.id_planta || p.id} value={p.id_planta || p.id}>
                  {p.nombre}
                </option>
              ))
            ) : (
              <option disabled value="">
                No hay plantas disponibles
              </option>
            )}
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

      <h3 className="text-lg font-semibold">Veterinarios Registrados</h3>
      <input
        type="text"
        placeholder="Buscar por matrícula, nombre, apellido o DNI"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="mb-4 px-4 py-2 border rounded-md w-full"
      />

      <div className="max-h-[400px] overflow-y-auto border rounded-md p-2 bg-white shadow">
        {veterinariosFiltrados.length > 0 ? (
          <ul className="space-y-2">
            {veterinariosFiltrados.map((v) => (
              <li
                key={v.id_veterinario || v.id}
                className="flex justify-between items-center border rounded px-4 py-2"
              >
                <div>
                  <strong>
                    {v.nombre} {v.apellido}
                  </strong>{' '}
                  — Matrícula: {v.matricula} — DNI: {v.dni || '-'} — Email:{' '}
                  {v.email || '-'} — Tel: {v.n_telefono || '-'} — Planta:{' '}
                  {v.planta_nombre || `ID ${v.id_planta || v.idPlanta || ''}`} —
                  Estado: {v.estado || '-'} — Creado:{' '}
                  {v.creado_en
                    ? new Date(v.creado_en).toLocaleDateString()
                    : '-'}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEditar(v)}
                    className="text-blue-600 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(v.id_veterinario || v.id)}
                    className="text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No se encontraron veterinarios.</p>
        )}
      </div>
    </div>
  );
};

export default VeterinariosPage;
