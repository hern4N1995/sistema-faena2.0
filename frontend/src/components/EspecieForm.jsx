import { useState, useEffect } from 'react';
import axios from 'axios';

export default function EspecieForm() {
  const [descripcion, setDescripcion] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [especies, setEspecies] = useState([]);

  useEffect(() => {
    const fetchEspecies = async () => {
      try {
        const res = await axios.get('/api/especies');
        setEspecies(res.data);
      } catch (err) {
        console.error('Error al cargar especies', err);
      }
    };
    fetchEspecies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/especie', { descripcion });
      setMensaje(`Especie "${res.data.descripcion}" registrada con éxito`);
      setDescripcion('');
    } catch (err) {
      setMensaje('Error al guardar la especie');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Agregar especie</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Especie</label>
          <select
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded bg-white"
          >
            <option value="" disabled>
              Seleccione una especie
            </option>
            {especies.map((especie) => (
              <option key={especie.id} value={especie.descripcion}>
                {especie.descripcion}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
        >
          Guardar especie
        </button>
      </form>
      {mensaje && <p className="mt-4 text-sm text-green-800">{mensaje}</p>}
    </div>
  );
}
