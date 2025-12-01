// src/pages/TipoParteDecoAdmin.jsx
import React, { useEffect, useState } from 'react';

const ESTADOS = ['Activo', 'Inactivo'];

export default function TipoParteDecoAdmin() {
  const [form, setForm] = useState({ nombre_tipo_parte: '', estado: 'Activo' });
  const [tipos, setTipos] = useState([]);
  const [partes, setPartes] = useState([]); // puede mantenerse para otras vistas si las necesitas
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('');
  const [editingRowId, setEditingRowId] = useState(null); // id_tipo_parte_deco en edición inline

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    Promise.all([loadTipos(), loadPartesIfNeeded()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const loadTipos = async () => {
    try {
      const res = await fetch('/tipos-parte-deco', {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('No se cargaron tipos');
      const data = await res.json();
      setTipos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('loadTipos', err);
      setTipos([]);
      setError('Error cargando tipos');
    }
  };

  const loadPartesIfNeeded = async () => {
    // Si en el futuro necesitás partes aquí, descomenta y usa fetchPartes
    try {
      const res = await fetch('/partes-decomisadas', {
        headers: authHeaders(),
      });
      if (!res.ok) return setPartes([]);
      const data = await res.json();
      setPartes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('loadPartesIfNeeded', err);
      setPartes([]);
    }
  };

  const resetForm = () => {
    setForm({ nombre_tipo_parte: '', estado: 'Activo' });
    setMensaje('');
    setError('');
    setEditingRowId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const createOrUpdate = async (e) => {
    e && e.preventDefault();
    setMensaje('');
    setError('');

    const nombre = String(form.nombre_tipo_parte || '').trim();
    if (!nombre) return setError('El nombre es obligatorio');

    const payload = {
      nombre_tipo_parte: nombre,
      estado: form.estado === 'Activo',
    };

    try {
      const method = form.id_tipo_parte_deco ? 'PUT' : 'POST';
      const url = form.id_tipo_parte_deco
        ? `/tipos-parte-deco/${form.id_tipo_parte_deco}`
        : '/tipos-parte-deco';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error || 'Error guardando');
      }
      setMensaje(form.id_tipo_parte_deco ? 'Tipo actualizado' : 'Tipo creado');
      resetForm();
      loadTipos();
    } catch (err) {
      console.error('createOrUpdate', err);
      setError(err.message || 'Error');
    }
  };

  const startEdit = (t) => {
    // edición vía formulario superior: llena form con datos
    setForm({
      nombre_tipo_parte: t.nombre_tipo_parte || '',
      estado: t.estado ? 'Activo' : 'Inactivo',
      id_tipo_parte_deco: t.id, // para PUT desde form
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Inline editing: habilita edición en la fila, guarda con PUT directo
  const enableInlineEdit = (id) => {
    setEditingRowId(id);
  };

  const cancelInlineEdit = () => {
    setEditingRowId(null);
    loadTipos();
  };

  const saveInlineEdit = async (id, inlineValues) => {
    setMensaje('');
    setError('');
    const nombre = String(inlineValues.nombre_tipo_parte || '').trim();
    if (!nombre) return setError('El nombre es obligatorio');

    const payload = {
      nombre_tipo_parte: nombre,
      estado: inlineValues.estado === 'Activo',
    };

    try {
      const res = await fetch(`/tipos-parte-deco/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error || 'Error actualizando');
      }
      setMensaje('Tipo actualizado');
      setEditingRowId(null);
      loadTipos();
    } catch (err) {
      console.error('saveInlineEdit', err);
      setError(err.message || 'Error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Eliminar tipo (eliminación lógica)?')) return;
    try {
      const res = await fetch(`/tipos-parte-deco/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error || 'Error eliminando');
      }
      setMensaje('Tipo eliminado');
      loadTipos();
    } catch (err) {
      console.error('handleDelete', err);
      setError(err.message || 'Error');
    }
  };

  const tiposFiltrados = tipos.filter((t) =>
    (t.nombre_tipo_parte || '').toLowerCase().includes(filtro.toLowerCase())
  );

  if (loading)
    return <div className="py-10 text-center text-gray-500">Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">
        {form.id_tipo_parte_deco
          ? 'Editar Tipo'
          : 'Nuevo Tipo de Parte Decomisada'}
      </h2>

      <form onSubmit={createOrUpdate} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            name="nombre_tipo_parte"
            value={form.nombre_tipo_parte}
            onChange={handleChange}
            placeholder="Nombre del tipo"
            className="border rounded px-3 py-2 w-full"
          />

          {/* Eliminado select de parte asociada */}

          <select
            name="estado"
            value={form.estado}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
          >
            {ESTADOS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {form.id_tipo_parte_deco ? 'Guardar cambios' : 'Crear Tipo'}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Limpiar
          </button>
        </div>

        {(mensaje || error) && (
          <p
            className={`mt-2 text-sm ${
              mensaje ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {mensaje || error}
          </p>
        )}
      </form>

      <hr />

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tipos Existentes</h3>
        <input
          placeholder="Filtrar por nombre"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="mb-4 w-80 border rounded px-3 py-2"
        />
      </div>

      <ul className="space-y-2">
        {tiposFiltrados.length === 0 && (
          <p className="text-gray-500">No se encontraron tipos.</p>
        )}

        {tiposFiltrados.map((t) => (
          <li
            key={t.id}
            className="flex justify-between items-center border rounded px-4 py-2"
          >
            {/* Left: view or inline edit */}
            <div className="flex-1">
              {editingRowId === t.id ? (
                <InlineEditor
                  item={t}
                  onCancel={cancelInlineEdit}
                  onSave={(vals) => saveInlineEdit(t.id, vals)}
                />
              ) : (
                <>
                  <div className="flex items-baseline gap-3">
                    <strong>{t.nombre_tipo_parte}</strong>
                    <span className="ml-4 text-sm text-gray-500">
                      {t.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {t.fecha_creacion
                      ? new Date(t.fecha_creacion).toLocaleDateString()
                      : '-'}
                  </div>
                </>
              )}
            </div>

            {/* Right: actions */}
            <div className="space-x-2">
              {editingRowId === t.id ? null : (
                <>
                  <button
                    onClick={() => enableInlineEdit(t.id)}
                    className="text-blue-600 hover:underline"
                  >
                    Editar
                  </button>
                  {/* Botón 'Editar (form)' eliminado */}
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* InlineEditor component: edita nombre y estado dentro de la fila (sin parte asociada) */
function InlineEditor({ item, onCancel, onSave }) {
  const [vals, setVals] = useState({
    nombre_tipo_parte: item.nombre_tipo_parte || '',
    estado: item.estado ? 'Activo' : 'Inactivo',
  });

  React.useEffect(() => {
    setVals({
      nombre_tipo_parte: item.nombre_tipo_parte || '',
      estado: item.estado ? 'Activo' : 'Inactivo',
    });
  }, [item]);

  const change = (e) => {
    const { name, value } = e.target;
    setVals((v) => ({ ...v, [name]: value }));
  };

  return (
    <div className="flex items-center gap-3 w-full">
      <input
        name="nombre_tipo_parte"
        value={vals.nombre_tipo_parte}
        onChange={change}
        className="border rounded px-2 py-1 w-64"
      />
      <select
        name="estado"
        value={vals.estado}
        onChange={change}
        className="border rounded px-2 py-1"
      >
        {ESTADOS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <div className="ml-auto flex gap-2">
        <button
          onClick={() => onSave(vals)}
          className="bg-green-600 text-white px-3 py-1 rounded"
        >
          Guardar
        </button>
        <button onClick={onCancel} className="bg-gray-200 px-3 py-1 rounded">
          Cancelar
        </button>
      </div>
    </div>
  );
}
