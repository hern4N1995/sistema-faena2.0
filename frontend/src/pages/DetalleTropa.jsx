import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { animalGroups } from '../data/animalCategories';

export default function DetalleTropa() {
  const { id } = useParams();

  const getInitialCounts = () =>
    Object.fromEntries(
      Object.entries(animalGroups).map(([group, cats]) => {
        const emptyCats = Object.fromEntries(cats.map((cat) => [cat, '']));
        return [group, { ...emptyCats, TOTAL: 0 }];
      })
    );

  const [counts, setCounts] = useState(getInitialCounts);
  const [otrosPersonalizados, setOtrosPersonalizados] = useState([
    { tipo: '', cantidad: 0 },
  ]);
  const [tropaInfo, setTropaInfo] = useState({
    fecha: '',
    dte: '',
    titular: '',
  });

  useEffect(() => {
    api
      .get(`/tropas/${id}`)
      .then((res) => {
        const { fecha, dte, titular } = res.data;
        setTropaInfo({
          fecha: fecha || '',
          dte: dte || '',
          titular: titular || '',
        });
      })
      .catch((err) => console.error('Error al cargar tropa:', err));
  }, [id]);

  const handleChange = (group, cat, value) => {
    setCounts((prev) => {
      const updatedGroup = { ...prev[group], [cat]: value };
      const total = Object.entries(updatedGroup)
        .filter(([key]) => key !== 'TOTAL')
        .reduce((sum, [, val]) => sum + (parseInt(val, 10) || 0), 0);

      return {
        ...prev,
        [group]: { ...updatedGroup, TOTAL: total },
      };
    });
  };

  const agregarFilaOtro = () =>
    setOtrosPersonalizados([...otrosPersonalizados, { tipo: '', cantidad: 0 }]);

  const actualizarOtro = (index, campo, valor) => {
    const nuevos = [...otrosPersonalizados];
    nuevos[index][campo] = campo === 'cantidad' ? parseInt(valor) || 0 : valor;
    setOtrosPersonalizados(nuevos);
  };

  const calcularTotalOtros = () =>
    otrosPersonalizados.reduce(
      (acc, item) => acc + (parseInt(item.cantidad) || 0),
      0
    );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      fecha: tropaInfo.fecha,
      animales: counts,
      otros: otrosPersonalizados,
    };

    try {
      await api.post(`/tropas/${id}/detalle`, payload);
      alert('Detalle guardado correctamente');
    } catch (err) {
      console.error('Error al guardar detalle:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-6">Detalle de Tropa</h2>

      {/* Datos generales */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-700">
        <div className="bg-white rounded shadow p-3">
          <label className="block font-semibold text-gray-600 mb-1">
            ID Tropa
          </label>
          <input
            type="text"
            value={id}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        <div className="bg-white rounded shadow p-3">
          <label className="block font-semibold text-gray-600 mb-1">
            Fecha
          </label>
          <input
            type="date"
            value={tropaInfo.fecha}
            onChange={(e) =>
              setTropaInfo((prev) => ({ ...prev, fecha: e.target.value }))
            }
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="bg-white rounded shadow p-3">
          <label className="block font-semibold text-gray-600 mb-1">
            DTE/DTU
          </label>
          <input
            type="text"
            value={tropaInfo.dte}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        <div className="bg-white rounded shadow p-3">
          <label className="block font-semibold text-gray-600 mb-1">
            Titular
          </label>
          <input
            type="text"
            value={tropaInfo.titular}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>
      </div>

      {/* Formulario de animales */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(animalGroups).map(([groupName, categories]) => (
            <div key={groupName} className="overflow-x-auto">
              <h3 className="text-xl font-semibold mb-2">{groupName}</h3>
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-3 py-1">Categoría</th>
                    <th className="border px-3 py-1">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {groupName === 'Otros' ? (
                    <>
                      {otrosPersonalizados.map((item, index) => (
                        <tr key={index}>
                          <td className="border px-3 py-1 bg-gray-300">
                            <input
                              type="text"
                              value={item.tipo}
                              onChange={(e) =>
                                actualizarOtro(index, 'tipo', e.target.value)
                              }
                              className="w-full bg-gray-200 rounded px-2 py-1"
                              placeholder="Nombre del tipo"
                            />
                          </td>
                          <td className="border px-3 py-1 text-right bg-gray-300">
                            <input
                              type="number"
                              value={item.cantidad}
                              min="0"
                              onChange={(e) =>
                                actualizarOtro(
                                  index,
                                  'cantidad',
                                  e.target.value
                                )
                              }
                              className="w-20 bg-gray-200 rounded px-2 py-1 text-right"
                            />
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan="2" className="text-center py-2">
                          <button
                            type="button"
                            onClick={agregarFilaOtro}
                            className="bg-[#62ab44] hover:bg-[#4ca92b] text-white px-4 py-2 rounded"
                          >
                            ➕ Agregar tipo
                          </button>
                        </td>
                      </tr>
                      <tr className="font-semibold bg-gray-300">
                        <td
                          className="border px-3 py-1"
                          style={{ backgroundColor: '#62ab44' }}
                        >
                          TOTAL
                        </td>
                        <td
                          className="border px-3 py-1 text-right"
                          style={{ backgroundColor: '#62ab44' }}
                        >
                          {calcularTotalOtros()}
                        </td>
                      </tr>
                    </>
                  ) : (
                    <>
                      {categories.map((cat) => (
                        <tr key={cat}>
                          <td className="border px-3 py-1 bg-gray-300">
                            {cat}
                          </td>
                          <td className="border px-3 py-1 bg-gray-300 text-right">
                            <input
                              type="number"
                              min="0"
                              value={counts[groupName][cat]}
                              onChange={(e) =>
                                handleChange(groupName, cat, e.target.value)
                              }
                              className="w-20 bg-gray-200 border-none rounded px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-green-400"
                            />
                          </td>
                        </tr>
                      ))}
                      <tr className="font-semibold bg-gray-300">
                        <td
                          className="border px-3 py-1"
                          style={{ backgroundColor: '#62ab44' }}
                        >
                          TOTAL
                        </td>
                        <td
                          className="border px-3 py-1 text-right"
                          style={{ backgroundColor: '#62ab44' }}
                        >
                          {counts[groupName].TOTAL}
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-[#00902f] text-white py-2 rounded hover:bg-[#008d36] transition"
        >
          GUARDAR DETALLE
        </button>
      </form>
    </div>
  );
}
