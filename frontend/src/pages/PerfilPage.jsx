import { useEffect, useState } from 'react';
import api from '../services/api';

export default function PerfilPage() {
  const [usuario, setUsuario] = useState(null);
  const [form, setForm] = useState({ email: '', n_telefono: '' });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    api
      .get('/usuarios/perfil', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUsuario(res.data);
        setForm({
          email: res.data.email,
          n_telefono: res.data.n_telefono || '',
        });
      })
      .catch(() => setMensaje('Error al cargar perfil.'));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/usuarios/perfil', form);
      setMensaje('✅ Datos actualizados correctamente.');
    } catch {
      setMensaje('❌ Error al actualizar datos.');
    } finally {
      setLoading(false);
    }
  };

  if (!usuario) return <p className="p-4">⏳ Cargando perfil...</p>;

  const formatFecha = (f) =>
    new Date(f).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 text-center mb-8 drop-shadow">
        👤 Mi Perfil
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Nombre" value={usuario.nombre} disabled />
          <Field label="Apellido" value={usuario.apellido} disabled />
          <Field label="DNI" value={usuario.dni} disabled />
          <Field
            label="Fecha de creación"
            value={formatFecha(usuario.creado_en)}
            disabled
          />
          <Field label="Planta" value={usuario.planta} disabled />
          <Field label="Rol" value={usuario.rol} disabled />
          <EditableField
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
          <EditableField
            label="Teléfono"
            name="n_telefono"
            value={form.n_telefono}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>

        {mensaje && (
          <p className="text-center text-sm mt-4 font-medium text-green-700">
            {mensaje}
          </p>
        )}
      </form>
    </div>
  );
}

function Field({ label, value, disabled }) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-sm text-slate-600 font-semibold">
        {label}
      </label>
      <input
        type="text"
        value={value}
        disabled={disabled}
        className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-sm"
      />
    </div>
  );
}

function EditableField({ label, name, value, onChange }) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-sm text-slate-600 font-semibold">
        {label}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
      />
    </div>
  );
}
