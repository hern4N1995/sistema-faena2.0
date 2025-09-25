// src/pages/ParteDecomisadaAdmin.jsx
import React, { useEffect, useState } from 'react';

const ESTADOS = ['Activo', 'Inactivo'];

export default function ParteDecomisadaAdmin() {
  const [form, setForm] = useState({
    id_tipo_parte_deco: '',
    nombre_parte: '',
    estado: 'Activo',
  });
  const [lista, setLista] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('');
  const [editingRowId, setEditingRowId] = useState(null); // id_parte_decomisada en edición inline

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    Promise.all([loadList(), loadTipos()]).finally(() => setLoading(false));
  }, []);

  const loadList = async () => {
    try {
      const res = await fetch('/api/partes-decomisadas', {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('No se cargaron partes');
      const data = await res.json();
      setLista(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('loadList', err);
      setLista([]);
      setError('Error cargando partes');
    }
  };

  const loadTipos = async () => {
    try {
      const res = await fetch('/api/tipos-parte-deco', {
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

  const resetForm = () => {
    setForm({ id_tipo_parte_deco: '', nombre_parte: '', estado: 'Activo' });
    setMensaje('');
    setError('');
    setEditingRowId(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const createOrUpdate = async (e) => {
    e && e.preventDefault();
    setMensaje('');
    setError('');

    if (!form.id_tipo_parte_deco) return setError('Selecciona un tipo primero');
    if (!String(form.nombre_parte || '').trim())
      return setError('El nombre es obligatorio');

    const payload = {
      id_tipo_parte_deco: form.id_tipo_parte_deco || null,
      nombre_parte: String(form.nombre_parte).trim(),
      estado: form.estado === 'Activo',
    };

    try {
      const method = form.id_parte_decomisada ? 'PUT' : 'POST';
      const url = form.id_parte_decomisada
        ? `/api/partes-decomisadas/${form.id_parte_decomisada}`
        : '/api/partes-decomisadas';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error || 'Error guardando');
      }
      setMensaje(
        form.id_parte_decomisada ? 'Parte actualizada' : 'Parte creada'
      );
      resetForm();
      loadList();
    } catch (err) {
      console.error('createOrUpdate', err);
      setError(err.message || 'Error');
    }
  };

  const enableInlineEdit = (id) => {
    setEditingRowId(id);
  };

  const cancelInlineEdit = () => {
    setEditingRowId(null);
    loadList();
  };

  const saveInlineEdit = async (id, vals) => {
    setMensaje('');
    setError('');
    if (!vals.id_tipo_parte_deco) return setError('Selecciona un tipo');
    if (!String(vals.nombre_parte || '').trim())
      return setError('El nombre es obligatorio');

    const payload = {
      id_tipo_parte_deco: vals.id_tipo_parte_deco || null,
      nombre_parte: String(vals.nombre_parte).trim(),
      estado: vals.estado === 'Activo',
    };

    try {
      const res = await fetch(`/api/partes-decomisadas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error || 'Error actualizando');
      }
      setMensaje('Parte actualizada');
      setEditingRowId(null);
      loadList();
    } catch (err) {
      console.error('saveInlineEdit', err);
      setError(err.message || 'Error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Eliminar parte (eliminación lógica)?')) return;
    try {
      const res = await fetch(`/api/partes-decomisadas/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error || 'Error eliminando');
      }
      setMensaje('Parte eliminada');
      if (form.id_parte_decomisada === id) resetForm();
      loadList();
    } catch (err) {
      console.error('handleDelete', err);
      setError(err.message || 'Error');
    }
  };

  const listaFiltrada = lista.filter((p) => {
    const q = filtro.toLowerCase();
    return (
      (p.nombre_parte || '').toLowerCase().includes(q) ||
      (p.tipo_nombre || '').toLowerCase().includes(q)
    );
  });

  if (loading)
    return <div className="py-10 text-center text-gray-500">Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">
        {form.id_parte_decomisada
          ? 'Editar Parte Decomisada'
          : 'Nueva Parte Decomisada'}
      </h2>

      <form onSubmit={createOrUpdate} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Tipo</label>
            <select
              name="id_tipo_parte_deco"
              value={form.id_tipo_parte_deco || ''}
              onChange={handleFormChange}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="">-- Seleccionar tipo --</option>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre_tipo_parte}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700 mb-1">Nombre</label>
            <input
              name="nombre_parte"
              value={form.nombre_parte}
              onChange={handleFormChange}
              placeholder={
                form.id_tipo_parte_deco
                  ? 'Escribe nombre de la parte'
                  : 'Selecciona un tipo primero'
              }
              disabled={!form.id_tipo_parte_deco}
              className={`border rounded px-3 py-2 w-full ${
                !form.id_tipo_parte_deco ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            name="estado"
            value={form.estado}
            onChange={handleFormChange}
            className="border rounded px-3 py-2"
          >
            {ESTADOS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <div className="ml-auto flex gap-3">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              {form.id_parte_decomisada ? 'Guardar cambios' : 'Crear'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-200 px-4 py-2 rounded"
            >
              Limpiar
            </button>
          </div>
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
        <h3 className="text-lg font-semibold">Partes Decomisadas</h3>
        <input
          placeholder="Filtrar por nombre o tipo"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="mb-4 w-80 border rounded px-3 py-2"
        />
      </div>

      <div className="overflow-x-auto bg-white border rounded p-2">
        {listaFiltrada.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="text-sm text-gray-600">
                <th className="px-3 py-2">Nombre</th>
                <th className="px-3 py-2">Tipo</th>
                <th className="px-3 py-2">Creado</th>
                <th className="px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {listaFiltrada.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-3 py-2">
                    {editingRowId === p.id ? (
                      <InlineEditorParte
                        item={p}
                        tipos={tipos}
                        onCancel={cancelInlineEdit}
                        onSave={(vals) => saveInlineEdit(p.id, vals)}
                      />
                    ) : (
                      p.nombre_parte || '-'
                    )}
                  </td>
                  <td className="px-3 py-2">{p.tipo_nombre || '-'}</td>
                  <td className="px-3 py-2">
                    {p.fecha_creacion
                      ? new Date(p.fecha_creacion).toLocaleString()
                      : '-'}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => enableInlineEdit(p.id)}
                        className="text-blue-600 hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-600 hover:underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-6 text-center text-gray-500">
            No se encontraron registros.
          </p>
        )}
      </div>
    </div>
  );
}

/* Inline editor for parte: editar tipo, nombre y estado inside row */
function InlineEditorParte({ item, tipos, onCancel, onSave }) {
  const [vals, setVals] = useState({
    id_tipo_parte_deco: item.id_tipo_parte_deco || '',
    nombre_parte: item.nombre_parte || '',
    estado: item.estado ? 'Activo' : 'Inactivo',
  });

  useEffect(() => {
    setVals({
      id_tipo_parte_deco: item.id_tipo_parte_deco || '',
      nombre_parte: item.nombre_parte || '',
      estado: item.estado ? 'Activo' : 'Inactivo',
    });
  }, [item]);

  const change = (e) => {
    const { name, value } = e.target;
    setVals((v) => ({ ...v, [name]: value }));
  };

  return (
    <div className="flex items-center gap-3">
      <select
        name="id_tipo_parte_deco"
        value={vals.id_tipo_parte_deco || ''}
        onChange={change}
        className="border rounded px-2 py-1"
      >
        <option value="">-- Seleccionar tipo --</option>
        {tipos.map((t) => (
          <option key={t.id} value={t.id}>
            {t.nombre_tipo_parte}
          </option>
        ))}
      </select>

      <input
        name="nombre_parte"
        value={vals.nombre_parte}
        onChange={change}
        placeholder="Nombre"
        className="border rounded px-2 py-1 w-56"
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
