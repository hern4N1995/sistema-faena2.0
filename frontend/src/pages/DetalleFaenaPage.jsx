import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { animalGroups } from '../data/animalCategories';

export default function DetalleFaenaPage() {
  const { idFaena } = useParams();
  const navigate = useNavigate();

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
  const [faenaInfo, setFaenaInfo] = useState({
    fecha: '',
    dte_dtu: '',
  });

  useEffect(() => {
    api
      .get(`/faena/${idFaena}`)
      .then((res) => {
        const { fecha, dte_dtu } = res.data;
        setFaenaInfo({ fecha: fecha || '', dte_dtu: dte_dtu || '' });
      })
      .catch((err) => console.error('Error al cargar faena:', err));
  }, [idFaena]);

  const handleChange = (group, cat, value) => {
    setCounts((prev) => {
      const updatedGroup = { ...prev[group], [cat]: value };
      const total = Object.entries(updatedGroup)
        .filter(([key]) => key !== 'TOTAL')
        .reduce((sum, [, val]) => sum + (parseInt(val, 10) || 0), 0);
      return { ...prev, [group]: { ...updatedGroup, TOTAL: total } };
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
      fecha: faenaInfo.fecha,
      animales: counts,
      otros: otrosPersonalizados,
    };
    try {
      await api.post(`/faena/${idFaena}/detalle`, payload);
      alert('Detalle guardado correctamente');
      navigate('/faena');
    } catch (err) {
      console.error('Error al guardar detalle:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-3 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-6 sm:mb-8">
          Detalle de Faena
        </h1>

        {/* Datos generales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4">
            <label className="block text-sm font-semibold text-gray-600">
              ID Faena
            </label>
            <input
              type="text"
              value={idFaena}
              disabled
              className="w-full mt-1 border rounded-md px-3 py-2 bg-gray-100 text-sm sm:text-base"
            />
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <label className="block text-sm font-semibold text-gray-600">
              Fecha
            </label>
            <input
              type="date"
              value={faenaInfo.fecha}
              onChange={(e) =>
                setFaenaInfo({ ...faenaInfo, fecha: e.target.value })
              }
              className="w-full mt-1 border rounded-md px-3 py-2 text-sm sm:text-base"
            />
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <label className="block text-sm font-semibold text-gray-600">
              DTE/DTU
            </label>
            <input
              type="text"
              value={faenaInfo.dte_dtu}
              disabled
              className="w-full mt-1 border rounded-md px-3 py-2 bg-gray-100 text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Formulario de animales */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Object.entries(animalGroups).map(([groupName, categories]) => (
              <section
                key={groupName}
                className="bg-white rounded-xl shadow-md p-4 space-y-3"
              >
                <h2 className="text-lg font-semibold text-gray-800">
                  {groupName}
                </h2>

                {/* Vista cards en móvil / Vista tabla desktop */}
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-2 py-1 text-left">Categoría</th>
                        <th className="px-2 py-1 text-right">Cant.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupName === 'Otros' ? (
                        <>
                          {otrosPersonalizados.map((item, index) => (
                            <tr key={index}>
                              <td className="px-2 py-1">
                                <input
                                  type="text"
                                  value={item.tipo}
                                  onChange={(e) =>
                                    actualizarOtro(
                                      index,
                                      'tipo',
                                      e.target.value
                                    )
                                  }
                                  placeholder="Nombre del tipo"
                                  className="w-full border rounded px-2 py-1 text-sm"
                                />
                              </td>
                              <td className="px-2 py-1 text-right">
                                <input
                                  type="number"
                                  min="0"
                                  value={item.cantidad}
                                  onChange={(e) =>
                                    actualizarOtro(
                                      index,
                                      'cantidad',
                                      e.target.value
                                    )
                                  }
                                  className="w-16 border rounded px-2 py-1 text-right text-sm"
                                />
                              </td>
                            </tr>
                          ))}
                          <tr>
                            <td colSpan={2} className="text-center py-2">
                              <button
                                type="button"
                                onClick={agregarFilaOtro}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                              >
                                ➕ Agregar
                              </button>
                            </td>
                          </tr>
                          <tr className="font-bold bg-green-100">
                            <td>TOTAL Otros</td>
                            <td className="text-right">
                              {calcularTotalOtros()}
                            </td>
                          </tr>
                        </>
                      ) : (
                        <>
                          {categories.map((cat) => (
                            <tr key={cat}>
                              <td className="px-2 py-1">{cat}</td>
                              <td className="px-2 py-1 text-right">
                                <input
                                  type="number"
                                  min="0"
                                  value={counts[groupName][cat]}
                                  onChange={(e) =>
                                    handleChange(groupName, cat, e.target.value)
                                  }
                                  className="w-16 border rounded px-2 py-1 text-right text-sm"
                                />
                              </td>
                            </tr>
                          ))}
                          <tr className="font-bold bg-green-100">
                            <td>TOTAL {groupName}</td>
                            <td className="text-right">
                              {counts[groupName].TOTAL}
                            </td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto mx-auto block bg-[#00902f] hover:bg-[#008d36] text-white px-6 py-3 rounded-lg text-base font-semibold transition"
          >
            GUARDAR DETALLE
          </button>
        </form>
      </div>
    </div>
  );
}
