import { useState, useEffect, useRef } from 'react';

export default function DepartamentoAdmin() {
  const departamentosPorProvincia = {
    'Buenos Aires': [
      'La Matanza',
      'General Pueyrredón',
      'Lanús',
      'Quilmes',
      'Lomas de Zamora',
      'Avellaneda',
      'Morón',
      'San Isidro',
      'Tigre',
      'Berazategui',
      'Vicente López',
      'San Fernando',
      'Tres de Febrero',
      'Almirante Brown',
      'Esteban Echeverría',
      'Florencio Varela',
      'José C. Paz',
      'Malvinas Argentinas',
      'Merlo',
      'Moreno',
      'San Miguel',
      'Ituzaingó',
      'Hurlingham',
      'Ezeiza',
      'Pilar',
      'Escobar',
      'Campana',
      'Zárate',
      'San Nicolás',
      'Pergamino',
    ],
    Catamarca: [
      'Ambato',
      'Ancasti',
      'Andalgalá',
      'Antofagasta de la Sierra',
      'Belén',
      'Capayán',
      'Capital',
      'El Alto',
      'Fray Mamerto Esquiú',
      'La Paz',
      'Paclín',
      'Pomán',
      'Santa María',
      'Santa Rosa',
      'Tinogasta',
      'Valle Viejo',
    ],
    Chaco: [
      'Almirante Brown',
      'Bermejo',
      'Comandante Fernández',
      'General Belgrano',
      'General Güemes',
      'Independencia',
      'Libertad',
      'Libertador General San Martín',
      'Maipú',
      'Mayor Luis Jorge Fontana',
      '9 de Julio',
      'O’Higgins',
      'Presidencia de la Plaza',
      'Quitilipi',
      'San Fernando',
      'San Lorenzo',
      'Sargento Cabral',
      'Tapenagá',
      '12 de Octubre',
      '2 de Abril',
    ],
    Chubut: [
      'Biedma',
      'Cushamen',
      'Escalante',
      'Florentino Ameghino',
      'Gaiman',
      'Gastre',
      'Languiñeo',
      'Mártires',
      'Paso de Indios',
      'Rawson',
      'Río Senguer',
      'Sarmiento',
      'Tehuelches',
      'Telsen',
    ],
    Córdoba: [
      'Calamuchita',
      'Capital',
      'Colón',
      'Cruz del Eje',
      'General Roca',
      'General San Martín',
      'Ischilín',
      'Juárez Celman',
      'Marcos Juárez',
      'Minas',
      'Pocho',
      'Presidente Roque Sáenz Peña',
      'Punilla',
      'Río Cuarto',
      'Río Primero',
      'Río Seco',
      'Río Segundo',
      'San Alberto',
      'San Javier',
      'San Justo',
      'Santa María',
      'Sobremonte',
      'Tercero Arriba',
      'Totoral',
      'Tulumba',
      'Unión',
    ],
    Corrientes: [
      'Capital',
      'Bella Vista',
      'Berón de Astrada',
      'Concepción',
      'Curuzú Cuatiá',
      'Empedrado',
      'Esquina',
      'General Alvear',
      'General Paz',
      'Goya',
      'Itatí',
      'Ituzaingó',
      'Lavalle',
      'Mburucuyá',
      'Mercedes',
      'Monte Caseros',
      'Paso de los Libres',
      'Saladas',
      'San Cosme',
      'San Luis del Palmar',
      'San Martín',
      'San Miguel',
      'Santo Tomé',
      'Sauce',
    ],
    'Entre Ríos': [
      'Colón',
      'Concordia',
      'Diamante',
      'Federación',
      'Federal',
      'Gualeguay',
      'Gualeguaychú',
      'Islas del Ibicuy',
      'La Paz',
      'Nogoyá',
      'Paraná',
      'San Salvador',
      'Tala',
      'Uruguay',
      'Victoria',
      'Villaguay',
    ],
    Formosa: [
      'Bermejo',
      'Formosa',
      'Laishí',
      'Matacos',
      'Patiño',
      'Pilagás',
      'Pilcomayo',
      'Pirané',
      'Ramón Lista',
    ],
    Jujuy: [
      'Cochinoca',
      'Dr. Manuel Belgrano',
      'El Carmen',
      'Humahuaca',
      'Ledesma',
      'Palpalá',
      'Rinconada',
      'San Antonio',
      'San Pedro',
      'Santa Bárbara',
      'Santa Catalina',
      'Susques',
      'Tilcara',
      'Tumbaya',
      'Valle Grande',
      'Yavi',
    ],
    'La Pampa': [
      'Atreucó',
      'Caleu Caleu',
      'Capital',
      'Catriló',
      'Chapaleufú',
      'Chalileo',
      'Chical Co',
      'Conhelo',
      'Curacó',
      'Guatraché',
      'Hucal',
      'Lihuel Calel',
      'Limay Mahuida',
      'Loventué',
      'Maracó',
      'Puelén',
      'Quemú Quemú',
      'Rancul',
      'Realicó',
      'Toay',
      'Trenel',
      'Utracán',
    ],
    'La Rioja': [
      'Arauco',
      'Capital',
      'Castro Barros',
      'Chamical',
      'Chilecito',
      'Famatina',
      'General Ángel Vicente Peñaloza',
      'General Belgrano',
      'General Juan Facundo Quiroga',
      'General Lamadrid',
      'General San Martín',
      'Independencia',
      'Rosario Vera Peñaloza',
      'San Blas de los Sauces',
      'Sanagasta',
      'Vinchina',
    ],
    Mendoza: [
      'Capital',
      'General Alvear',
      'Godoy Cruz',
      'Guaymallén',
      'Junín',
      'La Paz',
      'Las Heras',
      'Lavalle',
      'Luján de Cuyo',
      'Maipú',
      'Malargüe',
      'Rivadavia',
      'San Carlos',
      'San Martín',
      'San Rafael',
      'Santa Rosa',
      'Tunuyán',
      'Tupungato',
    ],
    Misiones: [
      'Apóstoles',
      'Cainguás',
      'Candelaria',
      'Capital',
      'Concepción',
      'Eldorado',
      'General Manuel Belgrano',
      'Guaraní',
      'Iguazú',
      'Leandro N. Alem',
      'Libertador General San Martín',
      'Montecarlo',
      'Oberá',
      'San Ignacio',
      'San Javier',
      'San Pedro',
    ],
    Neuquén: [
      'Aluminé',
      'Añelo',
      'Catán Lil',
      'Chos Malal',
      'Collón Curá',
      'Confluencia',
      'Huiliches',
      'Lácar',
      'Loncopué',
      'Los Lagos',
      'Minas',
      'Pehuenches',
      'Picunches',
      'Picún Leufú',
      'Zapala',
    ],
    'Río Negro': [
      'Adolfo Alsina',
      'Avellaneda',
      'Bariloche',
      'Conesa',
      'El Cuy',
      'General Roca',
      'Ñorquincó',
      'Pilcaniyeu',
      'Pichi Mahuida',
      'San Antonio',
      'Valcheta',
      '25 de Mayo',
    ],
    Salta: [
      'Anta',
      'Cachi',
      'Cafayate',
      'Capital',
      'Cerrillos',
      'Chicoana',
      'General Güemes',
      'General José de San Martín',
      'Guachipas',
      'Iruya',
      'La Caldera',
      'La Candelaria',
      'La Poma',
      'La Viña',
      'Los Andes',
      'Metán',
      'Molinos',
      'Orán',
      'Rivadavia',
      'Rosario de la Frontera',
      'Rosario de Lerma',
      'San Carlos',
      'Santa Victoria',
    ],
    'San Juan': [
      'Albardón',
      'Angaco',
      'Calingasta',
      'Capital',
      'Caucete',
      'Chimbas',
      'Iglesia',
      'Jáchal',
      'Pocito',
      'Rawson',
      'Rivadavia',
      'San Martín',
      'Santa Lucía',
      'Sarmiento',
      'Ullum',
      'Valle Fértil',
      'Zonda',
    ],
    'San Luis': [
      'Ayacucho',
      'Belgrano',
      'Capital',
      'Chacabuco',
      'Coronel Pringles',
      'General Pedernera',
      'Gobernador Dupuy',
      'Junín',
      'Libertador General San Martín',
    ],
    'Santa Cruz': [
      'Corpen Aike',
      'Deseado',
      'Güer Aike',
      'Lago Argentino',
      'Lago Buenos Aires',
      'Magallanes',
      'Río Chico',
    ],
    'Santa Fe': [
      'Belgrano',
      'Caseros',
      'Castellanos',
      'Constitución',
      'Garay',
      'General López',
      'General Obligado',
      'Iriondo',
      'La Capital',
      'Las Colonias',
      '9 de Julio',
      'Rosario',
      'San Cristóbal',
      'San Javier',
      'San Jerónimo',
      'San Justo',
      'San Lorenzo',
      'San Martín',
      'Vera',
    ],
    'Santiago del Estero': [
      'Aguirre',
      'Alberdi',
      'Atamisqui',
      'Avellaneda',
      'Banda',
      'Belgrano',
      'Capital',
      'Choya',
      'Copo',
      'Figueroa',
      'General Taboada',
      'Guasayán',
      'Jiménez',
      'Juan Felipe Ibarra',
      'Loreto',
      'Mitre',
      'Moreno',
      'Ojo de Agua',
      'Pellegrini',
    ],
  };

  const provincias = Object.keys(departamentosPorProvincia);

  const [registros, setRegistros] = useState([]);
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState('');
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState('');
  const [sugerenciasProvincia, setSugerenciasProvincia] = useState([]);

  const provinciaRef = useRef(null);
  const departamentoRef = useRef(null);

  const [mostrarSugerenciasProvincia, setMostrarSugerenciasProvincia] =
    useState(false);
  const [mostrarSugerenciasDepartamento, setMostrarSugerenciasDepartamento] =
    useState(false);

  useEffect(() => {
    const manejarClickFuera = (e) => {
      if (provinciaRef.current && !provinciaRef.current.contains(e.target)) {
        setMostrarSugerenciasProvincia(false);
      }
      if (
        departamentoRef.current &&
        !departamentoRef.current.contains(e.target)
      ) {
        setMostrarSugerenciasDepartamento(false);
      }
    };
    document.addEventListener('mousedown', manejarClickFuera);
    return () => {
      document.removeEventListener('mousedown', manejarClickFuera);
    };
  }, []);

  const manejarProvincia = (e) => {
    const texto = e.target.value;
    setProvinciaSeleccionada(texto);
    const filtradas = provincias.filter((p) =>
      p.toLowerCase().includes(texto.toLowerCase())
    );
    setSugerenciasProvincia(filtradas);
    setMostrarSugerenciasProvincia(true);
    setDepartamentoSeleccionado('');
  };

  const seleccionarProvincia = (nombre) => {
    setProvinciaSeleccionada(nombre);
    setSugerenciasProvincia([]);
    setMostrarSugerenciasProvincia(false);
    setDepartamentoSeleccionado('');
  };

  const manejarDepartamento = (e) => {
    const texto = e.target.value;
    setDepartamentoSeleccionado(texto);
  };

  const seleccionarDepartamento = (nombre) => {
    setDepartamentoSeleccionado(nombre);
    setMostrarSugerenciasDepartamento(false);
  };

  const agregarRegistro = () => {
    if (!provinciaSeleccionada.trim() || !departamentoSeleccionado.trim())
      return;

    const yaExiste = registros.some(
      (r) =>
        r.provincia.toLowerCase() ===
          provinciaSeleccionada.trim().toLowerCase() &&
        r.departamento.toLowerCase() ===
          departamentoSeleccionado.trim().toLowerCase()
    );
    if (yaExiste) return;

    const nuevo = {
      id: registros.length + 1,
      provincia: provinciaSeleccionada.trim(),
      departamento: departamentoSeleccionado.trim(),
    };
    setRegistros([...registros, nuevo]);
    setDepartamentoSeleccionado('');
  };

  const eliminarRegistro = (id) => {
    setRegistros(registros.filter((r) => r.id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-6 mt-4">
      <h1 className="text-2xl font-bold mb-2">Administrar Departamentos</h1>

      {/* Provincia */}
      <div className="relative" ref={provinciaRef}>
        <input
          type="text"
          value={provinciaSeleccionada}
          onChange={manejarProvincia}
          onFocus={() => {
            const filtradas = provincias.filter((p) =>
              p.toLowerCase().includes(provinciaSeleccionada.toLowerCase())
            );
            setSugerenciasProvincia(filtradas);
            setMostrarSugerenciasProvincia(true);
          }}
          placeholder="Ingresar provincia..."
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {mostrarSugerenciasProvincia && sugerenciasProvincia.length > 0 && (
          <ul className="absolute z-10 bg-white border w-full mt-1 rounded shadow-lg max-h-60 overflow-y-auto">
            {sugerenciasProvincia.map((prov, idx) => (
              <li
                key={idx}
                onClick={() => seleccionarProvincia(prov)}
                className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
              >
                {prov}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Departamento */}
      {provinciaSeleccionada && (
        <div className="relative flex gap-2 mt-4" ref={departamentoRef}>
          <div className="flex-grow">
            <input
              type="text"
              value={departamentoSeleccionado}
              onChange={manejarDepartamento}
              onFocus={() => setMostrarSugerenciasDepartamento(true)}
              placeholder="Ingresar departamento..."
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {mostrarSugerenciasDepartamento && (
              <ul className="absolute z-10 bg-white border w-full mt-1 rounded shadow-lg max-h-60 overflow-y-auto">
                {(departamentosPorProvincia[provinciaSeleccionada] || [])
                  .filter((dep) =>
                    dep
                      .toLowerCase()
                      .includes(departamentoSeleccionado.toLowerCase())
                  )
                  .map((dep, idx) => (
                    <li
                      key={idx}
                      onClick={() => seleccionarDepartamento(dep)}
                      className="px-4 py-2 hover:bg-green-100 cursor-pointer"
                    >
                      {dep}
                    </li>
                  ))}
              </ul>
            )}
          </div>
          <button
            onClick={agregarRegistro}
            className="bg-[#00902f] text-white px-4 py-2 rounded hover:bg-[#008d36]"
          >
            Agregar
          </button>
        </div>
      )}

      {/* Tabla */}
      <table className="w-full border mt-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-2 text-left">ID</th>
            <th className="border px-3 py-2 text-left">Provincia</th>
            <th className="border px-3 py-2 text-left">Departamento</th>
            <th className="border px-3 py-2 text-left">Acción</th>
          </tr>
        </thead>
        <tbody>
          {registros.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="border px-3 py-1">{r.id}</td>
              <td className="border px-3 py-1">{r.provincia}</td>
              <td className="border px-3 py-1">{r.departamento}</td>
              <td className="border px-3 py-1">
                <button
                  onClick={() => eliminarRegistro(r.id)}
                  className="text-red-600 hover:text-red-800 font-bold"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
