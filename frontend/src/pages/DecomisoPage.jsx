import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select';

/* ------------------------------------------------------------------ */
/*  SelectField (igual que TropaForm)                                 */
/* ------------------------------------------------------------------ */
function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  maxMenuHeight,
  required = false,
}) {
  const [isFocusing, setIsFocusing] = useState(false);

  const customStyles = {
    control: (base, state) => ({
      ...base,
      height: '48px',
      minHeight: '48px',
      paddingLeft: '16px',
      paddingRight: '16px',
      backgroundColor: '#f9fafb',
      border: '2px solid #e5e7eb',
      borderRadius: '0.5rem',
      boxShadow: isFocusing
        ? '0 0 0 1px #000'
        : state.isFocused
        ? '0 0 0 4px #d1fae5'
        : 'none',
      transition: 'all 100ms ease',
      '&:hover': {
        borderColor: '#6ee7b7',
      },
      '&:focus-within': {
        borderColor: '#10b981',
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '0 0 0 2px',
      height: '48px',
      display: 'flex',
      alignItems: 'center',
    }),
    input: (base) => ({
      ...base,
      margin: 0,
      padding: 0,
      fontSize: '14px',
      fontFamily: 'inherit',
      color: '#111827',
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: '14px',
      color: '#111827',
      margin: 0,
      top: 'initial',
      transform: 'none',
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: '14px',
      color: '#6b7280',
      margin: 0,
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: '48px',
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
    }),
    option: (base, { isFocused }) => ({
      ...base,
      fontSize: '14px',
      padding: '10px 16px',
      backgroundColor: isFocused ? '#d1fae5' : '#fff',
      color: isFocused ? '#065f46' : '#111827',
    }),
  };

  return (
    <div className="flex flex-col">
      <label className="mb-2 font-semibold text-gray-700 text-sm">
        {label}
      </label>
      <Select
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        maxMenuHeight={maxMenuHeight}
        required={required}
        styles={customStyles}
        noOptionsMessage={() => 'Sin opciones'}
        components={{ IndicatorSeparator: () => null }}
        onFocus={() => {
          setIsFocusing(true);
          setTimeout(() => setIsFocusing(false), 50);
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  InputField idéntico al de TropaForm                               */
/* ------------------------------------------------------------------ */
function InputField({
  label,
  name,
  value,
  onChange,
  required = false,
  type = 'text',
  className = '',
}) {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="mb-2 font-semibold text-gray-700 text-sm">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300 bg-gray-50"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DecomisoPage                                                      */
/* ------------------------------------------------------------------ */
const DecomisoPage = () => {
  const { id_faena } = useParams();
  const navigate = useNavigate();

  const [infoFaena, setInfoFaena] = useState(null);
  const [datosFaena, setDatosFaena] = useState([]);
  const [loading, setLoading] = useState(true);

  const [detalles, setDetalles] = useState([
    {
      id_tipo_parte_deco: '',
      id_parte_decomisada: '',
      id_afeccion: '',
      cantidad: '',
      animales_afectados: '',
      peso_kg: '',
      destino_decomiso: '',
      observaciones: '',
    },
  ]);

  const [tiposParte, setTiposParte] = useState([]);
  const [partes, setPartes] = useState([]);
  const [afecciones, setAfecciones] = useState([]);

  /* ---------------------------------------------------------- */
  /*  Carga inicial de datos                                    */
  /* ---------------------------------------------------------- */
  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const token = localStorage.getItem('token');

        const resFaena = await fetch(`/api/faena/${id_faena}/decomiso-datos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const faena = await resFaena.json();

        if (Array.isArray(faena) && faena.length > 0) {
          setInfoFaena({
            id_faena_detalle: faena[0].id_faena_detalle,
            n_tropa: faena[0].n_tropa,
            dte_dtu: faena[0].dte_dtu,
            fecha_faena: new Date(faena[0].fecha_faena).toLocaleDateString(
              'es-AR'
            ),
            faenados: faena.reduce((acc, f) => acc + f.faenados, 0),
          });
          setDatosFaena(faena);
        }

        const resBase = await fetch('/api/decomisos/datos-base', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const base = await resBase.json();

        setTiposParte(base.tiposParte || []);
        setPartes(base.partes || []);
        setAfecciones(base.afecciones || []);
      } catch (err) {
        console.error('❌ Error al cargar datos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, [id_faena]);

  /* ---------------------------------------------------------- */
  /*  Reset de parte cuando cambia tipo                         */
  /* ---------------------------------------------------------- */
  useEffect(() => {
    setDetalles((prev) =>
      prev.map((detalle) => {
        const partesValidas = partes.filter(
          (p) =>
            String(p.id_tipo_parte_deco) === String(detalle.id_tipo_parte_deco)
        );
        const parteValida = partesValidas.some(
          (p) =>
            String(p.id_parte_decomisada) ===
            String(detalle.id_parte_decomisada)
        );
        return {
          ...detalle,
          id_parte_decomisada: parteValida ? detalle.id_parte_decomisada : '',
        };
      })
    );
  }, [partes]);

  /* ---------------------------------------------------------- */
  /*  Helpers                                                   */
  /* ---------------------------------------------------------- */
  const agregarDetalle = () => {
    setDetalles((prev) => [
      ...prev,
      {
        id_tipo_parte_deco: '',
        id_parte_decomisada: '',
        id_afeccion: '',
        cantidad: '',
        animales_afectados: '',
        peso_kg: '',
        destino_decomiso: '',
        observaciones: '',
      },
    ]);
  };

  const actualizarDetalle = (index, campo, valor) => {
    setDetalles((prev) => {
      const nuevos = [...prev];
      nuevos[index][campo] = valor;
      if (campo === 'id_tipo_parte_deco')
        nuevos[index].id_parte_decomisada = '';
      return nuevos;
    });
  };

  const handleGuardar = async () => {
    if (!infoFaena?.id_faena_detalle) {
      alert('No se pudo obtener el detalle de faena.');
      return;
    }

    const token = localStorage.getItem('token');

    try {
      for (const d of detalles) {
        if (
          !d.id_parte_decomisada ||
          !d.id_afeccion ||
          !d.cantidad ||
          !d.destino_decomiso
        ) {
          throw new Error('Faltan datos obligatorios en algún detalle');
        }
      }

      const payload = detalles.map((d) => ({
        id_faena_detalle: infoFaena.id_faena_detalle,
        id_tipo_parte_deco: d.id_tipo_parte_deco,
        id_parte_decomisada: d.id_parte_decomisada,
        id_afeccion: d.id_afeccion,
        cantidad: d.cantidad,
        animales_afectados: d.animales_afectados,
        peso_kg: d.peso_kg || null,
        destino_decomiso: d.destino_decomiso,
        observaciones: d.observaciones || null,
      }));

      const res = await fetch('/api/decomisos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || 'Error al registrar decomisos');

      alert('✅ Decomiso registrado correctamente');
      navigate(`/decomisos/detalle/${data.id_decomiso}`);
    } catch (err) {
      console.error('❌ Error al guardar decomisos:', err);
      alert(`Error al guardar decomisos: ${err.message}`);
    }
  };

  /* ---------------------------------------------------------- */
  /*  Render                                                    */
  /* ---------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 sm:py-8 py-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 text-center mb-10 drop-shadow">
          🩺 Registrar Decomisos
        </h1>

        {infoFaena && (
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card title="N° de Tropa" value={infoFaena.n_tropa} />
            <Card title="DTE / DTU" value={infoFaena.dte_dtu} />
            <Card title="Fecha de Faena" value={infoFaena.fecha_faena} />
            <Card title="Faenados" value={infoFaena.faenados} />
          </div>
        )}

        {datosFaena.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 mb-6">
            <h2 className="text-lg font-semibold text-slate-700 mb-3">
              🐄 Animales faenados
            </h2>
            <div className="overflow-x-auto rounded-xl ring-1 ring-slate-200">
              <table className="min-w-full text-sm text-slate-700">
                <thead className="bg-green-700 text-white uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-3 py-2 text-left">Especie</th>
                    <th className="px-3 py-2 text-left">Categoría</th>
                    <th className="px-3 py-2 text-center">Faenados</th>
                  </tr>
                </thead>
                <tbody>
                  {datosFaena.map((d) => (
                    <tr
                      key={d.id_tropa_detalle}
                      className="border-b last:border-b-0 hover:bg-green-50 transition"
                    >
                      <td className="px-3 py-2">{d.especie}</td>
                      <td className="px-3 py-2">{d.categoria}</td>
                      <td className="px-3 py-2 text-center font-bold">
                        {d.faenados}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Formulario de detalles */}
        <div className="space-y-4">
          {detalles.map((detalle, index) => {
            const partesFiltradas = partes.filter(
              (p) =>
                String(p.id_tipo_parte_deco) ===
                String(detalle.id_tipo_parte_deco)
            );
            const parteValida = partesFiltradas.some(
              (p) =>
                String(p.id_parte_decomisada) ===
                String(detalle.id_parte_decomisada)
            );
            const valorParte = parteValida ? detalle.id_parte_decomisada : '';

            const toOption = (item, key, label) => ({
              value: item[key],
              label: item[label],
            });

            const tipoOptions = tiposParte.map((t) =>
              toOption(t, 'id_tipo_parte_deco', 'nombre_tipo_parte')
            );
            const parteOptions = partesFiltradas.map((p) =>
              toOption(p, 'id_parte_decomisada', 'nombre_parte')
            );
            const afeccOptions = afecciones.map((a) =>
              toOption(a, 'id_afeccion', 'descripcion')
            );
            const destinoOptions = [
              { value: 'incineración', label: 'Incineración' },
              { value: 'rendering', label: 'Rendering' },
              { value: 'entierro', label: 'Entierro' },
              { value: 'desnaturalización', label: 'Desnaturalización' },
              { value: 'otro', label: 'Otro' },
            ];

            return (
              <div
                key={index}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-white p-4 rounded-2xl shadow-lg border border-slate-200 ring-1 ring-slate-100 transition hover:shadow-xl"
              >
                {/* Tipo de parte */}
                <SelectField
                  label="Tipo de parte"
                  value={
                    tipoOptions.find(
                      (o) => o.value === detalle.id_tipo_parte_deco
                    ) || null
                  }
                  onChange={(selected) =>
                    actualizarDetalle(
                      index,
                      'id_tipo_parte_deco',
                      selected?.value || ''
                    )
                  }
                  options={tipoOptions}
                  placeholder="Seleccione tipo"
                  required
                />

                {/* Parte decomisada */}
                <SelectField
                  label="Parte decomisada"
                  value={
                    parteOptions.find((o) => o.value === valorParte) || null
                  }
                  onChange={(selected) =>
                    actualizarDetalle(
                      index,
                      'id_parte_decomisada',
                      selected?.value || ''
                    )
                  }
                  options={parteOptions}
                  placeholder="Seleccione parte"
                  required
                  disabled={!detalle.id_tipo_parte_deco}
                />

                {/* Afección */}
                <SelectField
                  label="Afección"
                  value={
                    afeccOptions.find((o) => o.value === detalle.id_afeccion) ||
                    null
                  }
                  onChange={(selected) =>
                    actualizarDetalle(
                      index,
                      'id_afeccion',
                      selected?.value || ''
                    )
                  }
                  options={afeccOptions}
                  placeholder="Seleccione afección"
                  required
                />

                {/* Cantidad */}
                <InputField
                  label="Cantidad"
                  type="number"
                  value={detalle.cantidad}
                  onChange={(e) =>
                    actualizarDetalle(index, 'cantidad', e.target.value)
                  }
                  placeholder="Cantidad"
                />

                {/* Peso */}
                <InputField
                  label="Peso (kg)"
                  type="number"
                  step="0.1"
                  value={detalle.peso_kg}
                  onChange={(e) =>
                    actualizarDetalle(index, 'peso_kg', e.target.value)
                  }
                  placeholder="Peso (kg)"
                />

                {/* Animales afectados */}
                <InputField
                  label="Animales afectados"
                  type="number"
                  value={detalle.animales_afectados}
                  onChange={(e) =>
                    actualizarDetalle(
                      index,
                      'animales_afectados',
                      e.target.value
                    )
                  }
                  placeholder="Animales afectados"
                />

                {/* Destino del decomiso */}
                <SelectField
                  label="Destino del decomiso"
                  value={
                    destinoOptions.find(
                      (o) => o.value === detalle.destino_decomiso
                    ) || null
                  }
                  onChange={(selected) =>
                    actualizarDetalle(
                      index,
                      'destino_decomiso',
                      selected?.value || ''
                    )
                  }
                  options={destinoOptions}
                  placeholder="Seleccione destino"
                  required
                />

                {/* Observaciones */}
                <InputField
                  label="Observaciones"
                  as="textarea"
                  value={detalle.observaciones}
                  onChange={(e) =>
                    actualizarDetalle(index, 'observaciones', e.target.value)
                  }
                  placeholder="Observaciones"
                  className="md:col-span-3"
                />
              </div>
            );
          })}
        </div>

        {/* Botones inferiores */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            onClick={agregarDetalle}
            className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg font-semibold hover:bg-slate-300 transition"
          >
            ➕ Agregar detalle
          </button>

          <button
            onClick={handleGuardar}
            className="px-5 py-2 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 transition shadow"
          >
            Guardar Decomisos
          </button>
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, value }) => (
  <div className="bg-white rounded-xl shadow border border-slate-200 p-4 text-center transition hover:shadow-md">
    <p className="text-xs text-slate-500 mb-1">{title}</p>
    <p className="text-lg font-semibold text-slate-800">{value}</p>
  </div>
);

export default DecomisoPage;
