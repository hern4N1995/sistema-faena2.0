/* import Layout from "../components/Layout.jsx";
import { useState } from "react";

export default function Faena() {
  const [faenas, setFaenas] = useState([]);
  const [fecha, setFecha] = useState("");
  const [frigorifico, setFrigorifico] = useState("");
  const [especie, setEspecie] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Crear nuevo objeto
    const nuevaFaena = {
      fecha,
      frigorifico,
      especie
    };

    // Agregar a la lista
    setFaenas([...faenas, nuevaFaena]);

    // Limpiar formulario
    setFecha("");
    setFrigorifico("");
    setEspecie("");
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Registro de Faena 🐄</h1>

      {📝 Formulario}
      <form className="bg-white p-6 rounded shadow space-y-4 w-full max-w-4xl mx-auto mb-4">
        <h2 className="text-lg font-semibold">Agregar nueva faena</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Frigorífico</label>
          <input
            type="text"
            value={frigorifico}
            onChange={(e) => setFrigorifico(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Especie</label>
          <select
            value={especie}
            onChange={(e) => setEspecie(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
            required
          >
            <option value="">Seleccionar</option>
            <option value="Bovino">Bovino</option>
            <option value="Porcino">Porcino</option>
            <option value="Ovina">Ovina</option>
          </select>
        </div>

        <button type="submit" className="w-full text-white p-2 rounded hover:opacity-90"
          style={{ backgroundColor: "#62ab44" }}>
            Guardar Faena
        </button>
      </form>

      {🧾 Tabla dinámica}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Listado de Faenas</h2>

        {faenas.length === 0 ? (
          <p className="text-gray-500">No hay registros aún.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-2 border">Fecha</th>
                <th className="p-2 border">Frigorífico</th>
                <th className="p-2 border">Especie</th>
              </tr>
            </thead>
            <tbody>
              {faenas.map((item, index) => (
                <tr key={index}>
                  <td className="p-2 border">{item.fecha}</td>
                  <td className="p-2 border">{item.frigorifico}</td>
                  <td className="p-2 border">{item.especie}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
 */
// src/pages/Tropa.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TropaForm from '../components/TropaForm.jsx';
import api from '../services/api.js';

export default function Tropa() {
  const [tropas, setTropas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/tropas') // ✅ Asegurate que el endpoint esté actualizado en el backend
      .then((res) => setTropas(res.data))
      .catch((err) => console.error('Error al obtener tropas:', err));
  }, []);

  const handleCreated = (nuevaTropa) => {
    setTropas((prev) => [...prev, nuevaTropa]);
    navigate(`/tropa/detalle/${nuevaTropa.id}`); // ✅ Ruta actualizada
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-6">
        🐄 Ingreso de Tropa 🐖
      </h2>

      <TropaForm onCreated={handleCreated} />

      <h3 className="text-xl font-semibold mt-10 mb-4">
        📋 Tropas registradas:
      </h3>
      <ul className="space-y-2">
        {tropas.map((tropa) => (
          <li
            key={tropa.id_tropa}
            className="bg-white p-3 rounded shadow flex justify-between items-center"
          >
            <div>
              <div className="font-semibold">{tropa.titular}</div>
              <div className="text-sm text-gray-600">
                Tropa Nº {tropa.n_tropa}
              </div>
              <div className="text-sm text-gray-600">DTE: {tropa.dte_dtu}</div>
            </div>
            <div className="text-sm text-gray-500">{tropa.fecha}</div>
            <button
              onClick={() => navigate(`/tropa/informe/${tropa.id_tropa}`)}
              className="text-blue-600 hover:underline text-sm"
            >
              Ver informe
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
