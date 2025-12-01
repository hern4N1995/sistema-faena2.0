import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select';

/* Visual constants */
const INPUT_BASE_CLASS =
  'w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm transition-all duration-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none hover:border-green-300 bg-gray-50';

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  maxMenuHeight = 200,
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
      transition: 'all 50ms ease',
      '&:hover': {
        borderColor: '#96f1b7',
      },
      '&:focus-within': {
        borderColor: '#22c55e',
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

/* InputField */
function InputField({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  as = 'input',
  className = '',
  step,
}) {
  if (as === 'textarea') {
    return (
      <div className={`flex flex-col ${className}`}>
        {label && (
          <label className="mb-2 font-semibold text-gray-700 text-sm">
            {label}
          </label>
        )}
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${INPUT_BASE_CLASS} resize-vertical min-h-[72px]`}
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className="mb-2 font-semibold text-gray-700 text-sm">
          {label}
        </label>
      )}
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        step={step}
        className={INPUT_BASE_CLASS}
      />
    </div>
  );
}

/* ReviewModal */
function ReviewModal({
  open,
  onClose,
  preview = [],
  payload = [],
  onConfirm,
  serverErrors = [],
}) {
  if (!open) return null;

  const totalLines = preview.length;
  const totalCantidad = preview.reduce(
    (s, d) => s + (Number(d.cantidad) || 0),
    0
  );
  const totalAnimales = preview.reduce(
    (s, d) => s + (Number(d.animales_afectados) || 0),
    0
  );
  const totalPeso = preview.reduce((s, d) => {
    const pRaw =
      d.peso_kg !== null && d.peso_kg !== undefined
        ? String(d.peso_kg).replace(',', '.')
        : null;
    const p = pRaw !== null ? Number(pRaw) : null;
    return s + (Number.isFinite(p) ? p : 0);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-800">
              Resumen antes de confirmar
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Revisá las líneas y totales. Volvé a editar si algo no coincide.
            </p>
          </div>

          <div className="flex gap-4 items-center">
            <div className="text-right">
              <p className="text-xs text-slate-500">Líneas</p>
              <p className="text-lg font-semibold text-slate-800">
                {totalLines}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Total cantidad</p>
              <p className="text-lg font-semibold text-slate-800">
                {totalCantidad}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Total animales</p>
              <p className="text-lg font-semibold text-slate-800">
                {totalAnimales || '—'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Total peso (kg)</p>
              <p className="text-lg font-semibold text-slate-800">
                {totalPeso ? String(totalPeso).replace('.', ',') : '—'}
              </p>
            </div>
          </div>
        </header>

        {serverErrors?.length > 0 && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
            <p className="font-medium">Error del servidor</p>
            <ul className="list-disc list-inside text-sm">
              {serverErrors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-3">
          <div className="overflow-x-auto rounded-md border border-slate-100">
            <table className="min-w-full text-sm text-slate-700">
              <thead className="bg-slate-100 text-xs text-slate-600 uppercase">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Parte</th>
                  <th className="px-3 py-2 text-left">Tipo</th>
                  <th className="px-3 py-2 text-right">Cant</th>
                  <th className="px-3 py-2 text-right">Peso kg</th>
                  <th className="px-3 py-2 text-right">Animales</th>
                  <th className="px-3 py-2 text-left">Destino</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {preview.map((d, i) => {
                  const tipoLabel = String(
                    d.tipoLabel || d.id_tipo_parte_deco || ''
                  ).toLowerCase();
                  const tipoRes =
                    tipoLabel.includes('res') || tipoLabel.includes('res.');
                  const pesoRaw =
                    d.peso_kg !== null && d.peso_kg !== undefined
                      ? String(d.peso_kg)
                      : '';
                  const pesoPresent = pesoRaw !== '';
                  const pesoDisplay = pesoPresent
                    ? pesoRaw.replace('.', ',')
                    : null;
                  const pesoMissing = tipoRes && !pesoPresent;

                  return (
                    <tr key={i} className={pesoMissing ? 'bg-red-50' : ''}>
                      <td className="px-3 py-2 align-middle">{i + 1}</td>
                      <td className="px-3 py-2 align-middle">
                        {d.parteLabel || d.id_parte_decomisada || '—'}
                      </td>
                      <td className="px-3 py-2 align-middle">
                        {d.tipoLabel || d.id_tipo_parte_deco || '—'}
                      </td>
                      <td className="px-3 py-2 text-right align-middle font-medium">
                        {d.cantidad ?? '—'}
                      </td>
                      <td className="px-3 py-2 text-right align-middle">
                        {pesoMissing ? (
                          <span className="text-red-600">Falta</span>
                        ) : (
                          pesoDisplay ?? '—'
                        )}
                      </td>
                      <td className="px-3 py-2 text-right align-middle">
                        {d.animales_afectados ?? '—'}
                      </td>
                      <td className="px-3 py-2 align-middle">
                        {d.destino_decomiso ?? '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border hover:bg-slate-50"
          >
            Volver a editar
          </button>
          <button
            onClick={() => onConfirm(payload)}
            className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
          >
            Confirmar y guardar
          </button>
        </div>
      </div>
    </div>
  );
}

/* DecomisoPage (rest of the file kept exactly as in your original) */
export default function DecomisoPage() {
  const { id_faena } = useParams();
  const navigate = useNavigate();

  const [infoFaena, setInfoFaena] = useState(null);
  const [datosFaena, setDatosFaena] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tiposParte, setTiposParte] = useState([]);
  const [partes, setPartes] = useState([]);
  const [afecciones, setAfecciones] = useState([]);

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

  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(null);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewPreviewData, setReviewPreviewData] = useState([]);
  const [reviewPayload, setReviewPayload] = useState([]);
  const [reviewServerErrors, setReviewServerErrors] = useState([]);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || '';
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const resFaena = await fetch(`/faena/${id_faena}/decomiso-datos`, {
          headers,
        });
        const faena = await resFaena.json();
        if (Array.isArray(faena) && faena.length > 0) {
          setInfoFaena({
            id_faena_detalle: faena[0].id_faena_detalle,
            n_tropa: faena[0].n_tropa,
            dte_dtu: faena[0].dte_dtu,
            fecha_faena: faena[0].fecha_faena
              ? new Date(faena[0].fecha_faena).toLocaleDateString('es-AR')
              : '—',
            faenados: faena.reduce(
              (acc, f) => acc + (Number(f.faenados) || 0),
              0
            ),
          });
          setDatosFaena(faena);
        }

        const resBase = await fetch('/decomisos/datos-base', { headers });
        const base = await resBase.json();
        setTiposParte(Array.isArray(base?.tiposParte) ? base.tiposParte : []);
        setPartes(Array.isArray(base?.partes) ? base.partes : []);
        setAfecciones(Array.isArray(base?.afecciones) ? base.afecciones : []);
      } catch (e) {
        console.error('Error cargando datos base de decomisos:', e);
        setErrors(['Error cargando datos iniciales. Reintentá más tarde.']);
      } finally {
        setLoading(false);
      }
    };
    fetchDatos();
  }, [id_faena]);

  const onlyDigits = (raw) =>
    raw == null ? '' : String(raw).replace(/\D/g, '');
  const onlyNumberWithComma = (raw) => {
    if (raw == null) return '';
    let s = String(raw);
    s = s.replace(/[^0-9,]/g, '');
    const parts = s.split(',');
    if (parts.length <= 1) return s;
    return parts.shift() + ',' + parts.join('');
  };

  const tipoEsRes = (id_tipo_parte_deco) => {
    if (!id_tipo_parte_deco) return false;
    const t = tiposParte.find(
      (x) => String(x.id_tipo_parte_deco) === String(id_tipo_parte_deco)
    );
    if (!t) return false;
    const nombre = String(t.nombre_tipo_parte ?? t.nombre ?? '').toLowerCase();
    return /\bres\b/.test(nombre) || /res/.test(nombre);
  };

  const actualizarDetalle = (index, campo, valor) => {
    setDetalles((prev) => {
      const copy = [...prev];
      const det = { ...copy[index] };
      if (campo === 'cantidad' || campo === 'animales_afectados')
        det[campo] = onlyDigits(valor);
      else if (campo === 'peso_kg') det.peso_kg = onlyNumberWithComma(valor);
      else det[campo] = valor;
      if (campo === 'id_tipo_parte_deco') {
        det.id_parte_decomisada = '';
        det.peso_kg = '';
      }
      copy[index] = det;
      return copy;
    });
    setErrors([]);
    setSuccess(null);
  };

  const agregarDetalle = () =>
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

  const eliminarDetalle = (i) =>
    setDetalles((prev) => {
      const copy = prev.slice();
      copy.splice(i, 1);
      return copy.length
        ? copy
        : [
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
          ];
    });

  const tipoOptions = useMemo(
    () =>
      tiposParte.map((t) => ({
        value: t.id_tipo_parte_deco,
        label: (t.nombre_tipo_parte ?? t.nombre) || '—',
      })),
    [tiposParte]
  );
  const afeccOptions = useMemo(
    () =>
      afecciones.map((a) => ({
        value: a.id_afeccion,
        label: a.descripcion || a.nombre || '—',
      })),
    [afecciones]
  );
  const destinoOptions = useMemo(
    () => [
      { value: 'incineracion', label: 'Incineración' },
      { value: 'rendering', label: 'Rendering' },
      { value: 'entierro', label: 'Entierro' },
      { value: 'desnaturalizacion', label: 'Desnaturalización' },
      { value: 'otro', label: 'Otro' },
    ],
    []
  );
  const partesPorTipo = (id_tipo) =>
    partes
      .filter((p) => String(p.id_tipo_parte_deco) === String(id_tipo))
      .map((p) => ({
        value: p.id_parte_decomisada,
        label: p.nombre_parte || p.nombre || p.descripcion || '—',
        requiere_peso: p.requiere_peso,
      }));

  const openReview = () => {
    setErrors([]);
    setSuccess(null);

    const validationErrors = [];
    const preview = detalles.map((d, i) => {
      const row = i + 1;
      if (!d.id_parte_decomisada)
        validationErrors.push(
          `Detalle ${row}: Debés seleccionar la parte decomisada.`
        );
      if (!d.id_afeccion)
        validationErrors.push(`Detalle ${row}: Debés seleccionar la afección.`);
      if (!d.cantidad)
        validationErrors.push(
          `Detalle ${row}: La cantidad es obligatoria y debe ser un número entero mayor que 0.`
        );
      else if (Number(d.cantidad) <= 0)
        validationErrors.push(
          `Detalle ${row}: La cantidad debe ser mayor que 0.`
        );
      if (!d.destino_decomiso)
        validationErrors.push(
          `Detalle ${row}: Debés seleccionar el destino del decomiso.`
        );

      const tipoResFlag = tipoEsRes(d.id_tipo_parte_deco);
      if (tipoResFlag) {
        if (d.peso_kg === '' || d.peso_kg == null)
          validationErrors.push(
            `Detalle ${row}: Esta parte requiere ingresar el Peso (kg). Podés ingresar 0 o 0,0 si corresponde.`
          );
        else {
          const numeric = Number(String(d.peso_kg).replace(',', '.'));
          if (Number.isNaN(numeric) || numeric < 0)
            validationErrors.push(
              `Detalle ${row}: Peso inválido. Usá formato 1,56 o 0.`
            );
        }
      }

      const tipoLabel =
        (
          tiposParte.find(
            (t) => String(t.id_tipo_parte_deco) === String(d.id_tipo_parte_deco)
          ) || {}
        ).nombre_tipo_parte ||
        (
          tiposParte.find(
            (t) => String(t.id_tipo_parte_deco) === String(d.id_tipo_parte_deco)
          ) || {}
        ).nombre ||
        null;
      const parteLabel =
        (
          partes.find(
            (p) =>
              String(p.id_parte_decomisada) === String(d.id_parte_decomisada)
          ) || {}
        ).nombre_parte ||
        (
          partes.find(
            (p) =>
              String(p.id_parte_decomisada) === String(d.id_parte_decomisada)
          ) || {}
        ).nombre ||
        null;
      const afeccionLabel =
        (
          afecciones.find(
            (a) => String(a.id_afeccion) === String(d.id_afeccion)
          ) || {}
        ).descripcion ||
        (
          afecciones.find(
            (a) => String(a.id_afeccion) === String(d.id_afeccion)
          ) || {}
        ).nombre ||
        null;

      return {
        ...d,
        tipoLabel,
        parteLabel,
        afeccionLabel,
        peso_kg_display:
          d.peso_kg !== '' && d.peso_kg != null
            ? String(d.peso_kg).replace('.', ',')
            : null,
      };
    });

    if (validationErrors.length) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // IMPORTANT: Forzar peso_kg = 0 cuando está vacío o inválido para evitar null en DB
    const payloadToSend = detalles.map((d) => {
      const parsedPeso =
        d.peso_kg !== '' && d.peso_kg != null
          ? Number(String(d.peso_kg).replace(',', '.'))
          : NaN;
      const pesoNum = Number.isFinite(parsedPeso) ? parsedPeso : 0;
      return {
        id_faena_detalle: infoFaena.id_faena_detalle,
        id_tipo_parte_deco: d.id_tipo_parte_deco || null,
        id_parte_decomisada: d.id_parte_decomisada,
        id_afeccion: d.id_afeccion,
        cantidad: d.cantidad ? Number(d.cantidad) : null,
        animales_afectados: d.animales_afectados
          ? Number(d.animales_afectados)
          : null,
        peso_kg: pesoNum,
        destino_decomiso: d.destino_decomiso,
        observaciones: d.observaciones || null,
      };
    });

    setReviewPreviewData(preview);
    setReviewPayload(payloadToSend);
    setReviewServerErrors([]);
    setReviewOpen(true);
  };

  const confirmAndSave = async (payload) => {
    setReviewServerErrors([]);
    try {
      const token = localStorage.getItem('token') || '';
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const res = await fetch('/decomisos', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        const serverMsg =
          data?.error || data?.mensaje || 'Error desconocido del servidor';
        setReviewServerErrors([`Error del servidor: ${serverMsg}`]);
        return;
      }
      setReviewOpen(false);
      setSuccess('Decomiso registrado correctamente.');
      if (data?.id_decomiso) navigate(`/decomisos/detalle/${data.id_decomiso}`);
    } catch (e) {
      console.error('Error guardando desde modal', e);
      setReviewServerErrors([
        'Error guardando decomiso. Revisá la consola o intentá nuevamente.',
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 sm:py-8 py-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 text-center mb-8">
          🧾 Registrar Decomisos
        </h1>

        {errors.length > 0 && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-red-700 mb-2">
              No se pudo validar. Corregí los siguientes errores:
            </p>
            <ul className="list-disc list-inside text-sm text-red-700">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
            {success}
          </div>
        )}

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

        <div className="space-y-4">
          {detalles.map((detalle, idx) => {
            const partesOpts = partesPorTipo(detalle.id_tipo_parte_deco);
            const tipoOption =
              tipoOptions.find(
                (o) => String(o.value) === String(detalle.id_tipo_parte_deco)
              ) || null;
            const parteOption =
              partesOpts.find(
                (p) => String(p.value) === String(detalle.id_parte_decomisada)
              ) || null;
            const afeccionOption =
              afeccOptions.find(
                (a) => String(a.value) === String(detalle.id_afeccion)
              ) || null;
            const destinoOption =
              destinoOptions.find(
                (d) => String(d.value) === String(detalle.destino_decomiso)
              ) || null;
            const mostrarPeso = tipoEsRes(detalle.id_tipo_parte_deco);

            return (
              <div
                key={idx}
                className="relative bg-white p-4 rounded-2xl shadow-lg border border-slate-200 ring-1 ring-slate-100 transition hover:shadow-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
              >
                <div className="absolute top-3 right-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('¿Eliminar este detalle?'))
                        eliminarDetalle(idx);
                    }}
                    className="text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md text-sm font-medium shadow-sm"
                    aria-label={`Eliminar detalle ${idx + 1}`}
                  >
                    ✕
                  </button>
                </div>

                <SelectField
                  label="Tipo de parte"
                  value={tipoOption}
                  onChange={(s) =>
                    actualizarDetalle(idx, 'id_tipo_parte_deco', s?.value ?? '')
                  }
                  options={tipoOptions}
                  placeholder="Seleccione tipo"
                />

                <SelectField
                  label="Parte decomisada"
                  value={parteOption}
                  onChange={(s) =>
                    actualizarDetalle(
                      idx,
                      'id_parte_decomisada',
                      s?.value ?? ''
                    )
                  }
                  options={partesOpts.map((p) => ({
                    value: p.value,
                    label: p.label,
                  }))}
                  placeholder="Seleccione parte"
                  disabled={!detalle.id_tipo_parte_deco}
                />

                <SelectField
                  label="Afección"
                  value={afeccionOption}
                  onChange={(s) =>
                    actualizarDetalle(idx, 'id_afeccion', s?.value ?? '')
                  }
                  options={afeccOptions}
                  placeholder="Seleccione afección"
                />

                <InputField
                  label="Cantidad"
                  type="text"
                  value={detalle.cantidad}
                  onChange={(e) =>
                    actualizarDetalle(idx, 'cantidad', e.target.value)
                  }
                  placeholder="Sólo números enteros"
                />

                {mostrarPeso && (
                  <InputField
                    label="Peso (kg)"
                    type="text"
                    value={detalle.peso_kg}
                    onChange={(e) =>
                      actualizarDetalle(idx, 'peso_kg', e.target.value)
                    }
                    placeholder="Ej. 1,56 — podés ingresar 0"
                  />
                )}

                <InputField
                  label="Animales afectados"
                  type="text"
                  value={detalle.animales_afectados}
                  onChange={(e) =>
                    actualizarDetalle(idx, 'animales_afectados', e.target.value)
                  }
                  placeholder="Sólo números enteros"
                />

                <SelectField
                  label="Destino del decomiso"
                  value={destinoOption}
                  onChange={(s) =>
                    actualizarDetalle(idx, 'destino_decomiso', s?.value ?? '')
                  }
                  options={destinoOptions}
                  placeholder="Seleccione destino"
                />

                <InputField
                  label="Observaciones"
                  as="textarea"
                  value={detalle.observaciones}
                  onChange={(e) =>
                    actualizarDetalle(idx, 'observaciones', e.target.value)
                  }
                  placeholder="Observaciones opcionales"
                  className="md:col-span-3"
                />
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            type="button"
            onClick={agregarDetalle}
            className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg font-semibold hover:bg-slate-300 transition"
          >
            ➕ Agregar detalle
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={openReview}
              className="px-5 py-2 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 transition shadow"
            >
              Guardar Decomisos
            </button>
          </div>
        </div>

        <ReviewModal
          open={reviewOpen}
          onClose={() => setReviewOpen(false)}
          preview={reviewPreviewData}
          payload={reviewPayload}
          onConfirm={confirmAndSave}
          serverErrors={reviewServerErrors}
        />
      </div>
    </div>
  );
}

/* Presentational Card */
const Card = ({ title, value }) => (
  <div className="bg-white rounded-xl shadow border border-slate-200 p-4 text-center">
    <p className="text-xs text-slate-500 mb-1">{title}</p>
    <p className="text-lg font-semibold text-slate-800">{value}</p>
  </div>
);
