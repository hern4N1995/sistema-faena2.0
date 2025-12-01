import { useState } from 'react';

export default function AltaDepartamento({
  provinciasDB,
  onDepartamentoAgregado,
}) {
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState('');
  const [provinciaIdSeleccionada, setProvinciaIdSeleccionada] = useState('');
  const [departamentoInput, setDepartamentoInput] = useState('');
  const [mensajeFeedback, setMensajeFeedback] = useState('');

  const agregarDepartamento = async () => {
    const nombre = departamentoInput.trim();

    if (
      !provinciaIdSeleccionada ||
      isNaN(parseInt(provinciaIdSeleccionada, 10)) ||
      !nombre
    ) {
      setMensajeFeedback('❌ Completá ambos campos correctamente.');
      setTimeout(() => setMensajeFeedback(''), 4000);
      return;
    }

    try {
      /*  const res = await fetch('http://localhost:3000/api/departamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_departamento: nombre,
          id_provincia: parseInt(provinciaIdSeleccionada, 10), // conversión segura
        }),
      }); */

      const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

      function fetchWithTimeout(url, options = {}, timeout = 10000) {
        return Promise.race([
          fetch(url, options),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timed out')), timeout)
          ),
        ]);
      }

      try {
        const res = await fetchWithTimeout(
          `${API}/departamentos`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nombre_departamento: nombre,
              id_provincia: Number(provinciaIdSeleccionada),
            }),
            // credentials: 'include'
          },
          10000
        );

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`API error ${res.status}: ${errText}`);
        }

        const data = await res.json();
        // manejar data
      } catch (err) {
        // manejar error (mostrar popup, console, etc.)
        console.error('Error creando departamento:', err);
      }

      const data = await res.json();
      if (res.ok) {
        setMensajeFeedback('✅ Departamento agregado correctamente.');
        setProvinciaSeleccionada('');
        setProvinciaIdSeleccionada('');
        setDepartamentoInput('');
        if (onDepartamentoAgregado) onDepartamentoAgregado(data);
      } else {
        setMensajeFeedback(`❌ ${data.error}`);
      }
    } catch (error) {
      setMensajeFeedback('❌ Error de conexión con el servidor.');
    }

    setTimeout(() => setMensajeFeedback(''), 4000);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Agregar nuevo departamento</h2>

      {/* Selector de provincia */}
      <div>
        <label htmlFor="provincia" className="block mb-1 font-medium">
          Seleccioná una provincia
        </label>
        <select
          id="provincia"
          value={provinciaIdSeleccionada}
          onChange={(e) => {
            const id = e.target.value;
            setProvinciaIdSeleccionada(id);
            const provObj = provinciasDB.find(
              (p) => p.id_provincia.toString() === id
            );
            setProvinciaSeleccionada(provObj ? provObj.descripcion : '');
          }}
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Seleccioná --</option>
          {provinciasDB.map((p) => (
            <option key={p.id_provincia} value={p.id_provincia}>
              {p.descripcion}
            </option>
          ))}
        </select>
      </div>

      {/* Input de departamento */}
      <input
        type="text"
        value={departamentoInput}
        onChange={(e) => setDepartamentoInput(e.target.value)}
        placeholder="Nombre del departamento..."
        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      {/* Botón */}
      <button
        onClick={agregarDepartamento}
        disabled={!provinciaIdSeleccionada || !departamentoInput.trim()}
        className={`px-4 py-2 rounded text-white ${
          !provinciaIdSeleccionada || !departamentoInput.trim()
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        Agregar
      </button>

      {/* Feedback */}
      {mensajeFeedback && (
        <p
          className={`text-sm ${
            mensajeFeedback.includes('✅') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {mensajeFeedback}
        </p>
      )}
    </div>
  );
}
