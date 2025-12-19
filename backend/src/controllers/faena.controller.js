const pool = require('../db');

// Obtener tropas con remanente para faenar
const obtenerFaenas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id_tropa,
        t.fecha,
        t.dte_dtu,
        t.guia_policial,
        t.n_tropa,
        pr.nombre AS productor,
        d.nombre_departamento AS departamento,
        tf.nombre AS titular_faena,
        (
          SELECT e.descripcion
          FROM tropa_detalle td
          JOIN especie e ON td.id_especie = e.id_especie
          WHERE td.id_tropa = t.id_tropa
          LIMIT 1
        ) AS especie,
        (
          SELECT SUM(td.cantidad - COALESCE((
            SELECT SUM(fd.cantidad_faena)
            FROM faena_detalle fd
            WHERE fd.id_tropa_detalle = td.id_tropa_detalle
          ), 0))
          FROM tropa_detalle td
          WHERE td.id_tropa = t.id_tropa
        ) AS total_a_faenar
      FROM tropa t
      LEFT JOIN productor pr ON t.id_productor = pr.id_productor
      LEFT JOIN departamento d ON t.id_departamento = d.id_departamento
      LEFT JOIN titular_faena tf ON t.id_titular_faena = tf.id_titular_faena
      ORDER BY t.fecha DESC;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener faenas:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear una nueva faena
const crearFaena = async (req, res) => {
  try {
    const {
      fecha,
      dte,
      guiaPolicial,
      nroUsuario,
      guiaExtendida,
      procedencia,
      titular,
    } = req.body;

    const resultado = await pool.query(
      `INSERT INTO faenas (fecha, dte, guia_policial, nro_usuario, guia_extendida, procedencia, titular)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        fecha,
        dte,
        guiaPolicial,
        nroUsuario,
        guiaExtendida,
        procedencia,
        titular,
      ],
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al crear faena:', error);
    res.status(500).json({ error: 'Error al crear faena' });
  }
};

// Obtener faenas realizadas con filtros y paginación
// Obtener faenas realizadas con filtros, paginación y total_faenados
const obtenerFaenasRealizadas = async (req, res) => {
  const {
    desde = '',
    hasta = '',
    n_tropa = '',
    id_especie = '',
    id_provincia = '',
    id_planta = '',
    limit = '100', // por defecto mayor para permitir sumar en backend
    offset = '0',
  } = req.query;

  const filtros = [];
  const valores = [];

  if (desde.trim()) {
    valores.push(desde);
    filtros.push(`f.fecha_faena::date >= $${valores.length}`);
  }
  if (hasta.trim()) {
    valores.push(hasta);
    filtros.push(`f.fecha_faena::date <= $${valores.length}`);
  }
  if (n_tropa.trim()) {
    valores.push(`%${n_tropa}%`);
    filtros.push(`t.n_tropa::text ILIKE $${valores.length}`);
  }

  if (id_especie.trim()) {
    valores.push(id_especie);
    filtros.push(`esp.id_especie = $${valores.length}`);
  }
  if (id_provincia.trim()) {
    valores.push(id_provincia);
    filtros.push(`prov.id_provincia = $${valores.length}`);
  }
  if (id_planta.trim()) {
    valores.push(id_planta);
    filtros.push(`t.id_planta = $${valores.length}`);
  }

  const where = filtros.length > 0 ? `WHERE ${filtros.join(' AND ')}` : '';

  const limitNum = parseInt(limit, 10) || 100;
  const offsetNum = parseInt(offset, 10) || 0;

  try {
    // Query principal: devuelve faenas agregadas por faena + total_faenado por faena
    const query = `
      SELECT
        f.id_faena,
        f.fecha_faena,
        t.dte_dtu,
        t.guia_policial,
        t.n_tropa,
        t.id_planta,
        p.nombre AS nombre_planta,
        prod.nombre AS productor,
        depto.nombre_departamento AS departamento,
        tf.nombre AS titular_faena,
        esp.descripcion AS especie,
        SUM(fd.cantidad_faena)::int AS total_faenado,
        t.id_tropa
      FROM faena f
      JOIN faena_detalle fd ON f.id_faena = fd.id_faena
      JOIN tropa t ON f.id_tropa = t.id_tropa
      JOIN tropa_detalle td ON td.id_tropa_detalle = fd.id_tropa_detalle
      JOIN especie esp ON td.id_especie = esp.id_especie
      JOIN productor prod ON t.id_productor = prod.id_productor
      JOIN departamento depto ON t.id_departamento = depto.id_departamento
      LEFT JOIN titular_faena tf ON t.id_titular_faena = tf.id_titular_faena
      LEFT JOIN provincia prov ON depto.id_provincia = prov.id_provincia
      LEFT JOIN planta p ON t.id_planta = p.id_planta
      ${where}
      GROUP BY f.id_faena, f.fecha_faena, t.dte_dtu, t.guia_policial, t.n_tropa, t.id_planta, p.nombre,
               prod.nombre, depto.nombre_departamento, tf.nombre, esp.descripcion, t.id_tropa, prov.id_provincia
      ORDER BY f.fecha_faena DESC, f.id_faena DESC
      LIMIT $${valores.length + 1} OFFSET $${valores.length + 2};
    `;

    const resultado = await pool.query(query, [
      ...valores,
      limitNum,
      offsetNum,
    ]);

    const faenas = resultado.rows || [];

    // Calcular total faenados de todas las faenas filtradas
    const totalFaenadosQuery = `
      SELECT SUM(fd.cantidad_faena)::int as total
      FROM faena f
      JOIN faena_detalle fd ON f.id_faena = fd.id_faena
      JOIN tropa t ON f.id_tropa = t.id_tropa
      LEFT JOIN tropa_detalle td ON td.id_tropa_detalle = fd.id_tropa_detalle
      LEFT JOIN departamento depto ON t.id_departamento = depto.id_departamento
      ${where}
    `;
    const totalFaenadosResult = await pool.query(totalFaenadosQuery, valores);
    const totalFaenados = parseInt(totalFaenadosResult.rows[0].total || 0);

    // Obtener total de tropas filtrado
    const filtrosTropa = [];
    const valoresTropa = [];

    if (desde.trim()) {
      valoresTropa.push(desde);
      filtrosTropa.push(`tropa.fecha_ingreso::date >= $${valoresTropa.length}`);
    }
    if (hasta.trim()) {
      valoresTropa.push(hasta);
      filtrosTropa.push(`tropa.fecha_ingreso::date <= $${valoresTropa.length}`);
    }
    if (n_tropa.trim()) {
      valoresTropa.push(`%${n_tropa}%`);
      filtrosTropa.push(`tropa.n_tropa::text ILIKE $${valoresTropa.length}`);
    }
    if (id_especie.trim()) {
      valoresTropa.push(id_especie);
      filtrosTropa.push(
        `EXISTS (SELECT 1 FROM tropa_detalle td WHERE td.id_tropa = tropa.id_tropa AND td.id_especie = $${valoresTropa.length})`,
      );
    }
    if (id_provincia.trim()) {
      valoresTropa.push(id_provincia);
      filtrosTropa.push(
        `EXISTS (SELECT 1 FROM departamento d WHERE d.id_departamento = tropa.id_departamento AND d.id_provincia = $${valoresTropa.length})`,
      );
    }
    if (id_planta.trim()) {
      valoresTropa.push(id_planta);
      filtrosTropa.push(`tropa.id_planta = $${valoresTropa.length}`);
    }

    const whereTropa =
      filtrosTropa.length > 0 ? `WHERE ${filtrosTropa.join(' AND ')}` : '';
    const totalTropasQuery = `SELECT COUNT(*) as total FROM tropa ${whereTropa}`;
    const totalTropasResult = await pool.query(totalTropasQuery, valoresTropa);
    const totalTropas = parseInt(totalTropasResult.rows[0].total);

    // Calcular sum_faenado por tropa de las faenas filtradas
    const sumFaenadoPerTropaQuery = `
      SELECT t.id_tropa, SUM(fd.cantidad_faena)::int as sum_faenado
      FROM faena f
      JOIN faena_detalle fd ON f.id_faena = fd.id_faena
      JOIN tropa t ON f.id_tropa = t.id_tropa
      LEFT JOIN tropa_detalle td ON td.id_tropa_detalle = fd.id_tropa_detalle
      LEFT JOIN departamento depto ON t.id_departamento = depto.id_departamento
      ${where}
      GROUP BY t.id_tropa
    `;
    const sumFaenadoResult = await pool.query(sumFaenadoPerTropaQuery, valores);
    const sumFaenadoByTropa = sumFaenadoResult.rows.reduce((acc, row) => {
      acc[row.id_tropa] = Number(row.sum_faenado);
      return acc;
    }, {});
    const tropaIds = Object.keys(sumFaenadoByTropa);

    let fullyFaenadaCount = 0;
    let totalCantidadByTropa = {};
    if (tropaIds.length > 0) {
      const totalCantidadQuery = `SELECT id_tropa, SUM(cantidad) as total_cantidad FROM tropa_detalle WHERE id_tropa = ANY($1) GROUP BY id_tropa`;
      const totalCantidadResult = await pool.query(totalCantidadQuery, [
        tropaIds,
      ]);
      totalCantidadByTropa = totalCantidadResult.rows.reduce((acc, row) => {
        acc[row.id_tropa] = Number(row.total_cantidad);
        return acc;
      }, {});
      for (const idTropa of tropaIds) {
        const sumFaenado = sumFaenadoByTropa[idTropa];
        const totalCantidad = totalCantidadByTropa[idTropa];
        if (sumFaenado === totalCantidad) {
          fullyFaenadaCount++;
        }
      }
    }

    // Total unidades de todas las tropas filtradas
    const whereTropaDetalle = whereTropa.replace(/tropa\./g, 't.');
    const totalUnidadesQuery = `SELECT SUM(td.cantidad)::int as total_unidades FROM tropa_detalle td JOIN tropa t ON td.id_tropa = t.id_tropa ${whereTropaDetalle}`;
    const totalUnidadesResult = await pool.query(
      totalUnidadesQuery,
      valoresTropa,
    );
    const totalUnidades = parseInt(
      totalUnidadesResult.rows[0].total_unidades || 0,
    );

    res.status(200).json({
      faenas,
      total_faenados: totalFaenados,
      total_tropas: totalTropas,
      tropas_faenadas_completas: fullyFaenadaCount,
      total_unidades: totalUnidades,
      total_por_tropa: totalCantidadByTropa,
    });
  } catch (error) {
    console.error('Error al obtener faenas realizadas:', error.message);
    res.status(500).json({ error: 'Error al obtener faenas realizadas' });
  }
};

// Obtener remanente por número de tropa
const obtenerRemanentePorTropa = async (req, res) => {
  const { n_tropa } = req.query;

  if (!n_tropa) {
    return res.status(400).json({ error: 'Falta el número de tropa' });
  }

  try {
    const tropaRes = await pool.query(
      'SELECT id_tropa, fecha FROM tropa WHERE n_tropa = $1 LIMIT 1',
      [n_tropa],
    );

    if (tropaRes.rows.length === 0) {
      return res.status(404).json({ error: 'Tropa no encontrada' });
    }

    const { id_tropa, fecha } = tropaRes.rows[0];

    const detalleRes = await pool.query(
      `SELECT td.id_tropa_detalle, td.id_especie, td.id_cat_especie, td.cantidad,
              e.descripcion AS especie, c.descripcion AS categoria
       FROM tropa_detalle td
       JOIN especie e ON td.id_especie = e.id_especie
       JOIN categoria_especie c ON td.id_cat_especie = c.id_cat_especie
       WHERE td.id_tropa = $1`,
      [id_tropa],
    );

    const faenaRes = await pool.query(
      `SELECT id_tropa_detalle, SUM(cantidad_faena) AS faenados
       FROM faena_detalle
       WHERE id_tropa_detalle IN (
         SELECT id_tropa_detalle FROM tropa_detalle WHERE id_tropa = $1
       )
       GROUP BY id_tropa_detalle`,
      [id_tropa],
    );

    const faenaMap = {};
    faenaRes.rows.forEach((f) => {
      faenaMap[f.id_tropa_detalle] = parseInt(f.faenados, 10);
    });

    const animales = {};

    detalleRes.rows.forEach((row) => {
      const grupo = row.especie;
      const categoria = row.categoria;
      const faenados = faenaMap[row.id_tropa_detalle] || 0;
      const remanente = row.cantidad - faenados;

      if (!animales[grupo]) {
        animales[grupo] = {};
      }

      animales[grupo][categoria] = {
        faenados,
        remanente: remanente < 0 ? 0 : remanente,
      };

      if (!animales[grupo].TOTAL) {
        animales[grupo].TOTAL = { faenados: 0, remanente: 0 };
      }

      animales[grupo].TOTAL.faenados += faenados;
      animales[grupo].TOTAL.remanente += remanente < 0 ? 0 : remanente;
    });

    res.json({
      n_tropa,
      fecha,
      animales,
    });
  } catch (error) {
    console.error('Error al obtener remanente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

//ObtenerFaenasSinDecomiso
// Obtener faenas realizadas SIN decomiso, con filtros y paginación
const obtenerFaenasSinDecomiso = async (req, res) => {
  const {
    fecha = '',
    dte_dtu = '',
    n_tropa = '',
    limit = '20',
    offset = '0',
  } = req.query;

  const filtros = [];
  const valores = [];

  if (fecha.trim()) {
    filtros.push(`f.fecha_faena::date = $${valores.length + 1}`);
    valores.push(fecha);
  }
  if (dte_dtu.trim()) {
    filtros.push(`t.dte_dtu ILIKE $${valores.length + 1}`);
    valores.push(`%${dte_dtu}%`);
  }
  if (n_tropa.trim()) {
    filtros.push(`t.n_tropa::text ILIKE $${valores.length + 1}`);
    valores.push(`%${n_tropa}%`);
  }

  const whereBase =
    filtros.length > 0 ? `WHERE ${filtros.join(' AND ')}` : 'WHERE true';

  const limitNum = parseInt(limit, 10) || 20;
  const offsetNum = parseInt(offset, 10) || 0;

  try {
    const query = `
      SELECT
        f.id_faena,
        f.fecha_faena,
        t.dte_dtu,
        t.guia_policial,
        t.n_tropa,
        t.id_planta,
        prod.nombre AS productor,
        depto.nombre_departamento AS departamento,
        tf.nombre AS titular_faena,
        esp.descripcion AS especie,
        SUM(fd.cantidad_faena) AS total_faenado,
        t.id_tropa
      FROM faena f
      JOIN faena_detalle fd ON f.id_faena = fd.id_faena
      JOIN tropa t ON f.id_tropa = t.id_tropa
      JOIN tropa_detalle td ON td.id_tropa_detalle = fd.id_tropa_detalle
      JOIN especie esp ON td.id_especie = esp.id_especie
      JOIN productor prod ON t.id_productor = prod.id_productor
      JOIN departamento depto ON t.id_departamento = depto.id_departamento
      JOIN titular_faena tf ON t.id_titular_faena = tf.id_titular_faena
      ${whereBase}
      AND NOT EXISTS (
        SELECT 1
        FROM decomiso d
        JOIN faena_detalle fd2 ON d.id_faena_detalle = fd2.id_faena_detalle
        WHERE fd2.id_faena = f.id_faena
        )
      GROUP BY f.id_faena, f.fecha_faena, t.dte_dtu, t.guia_policial, t.n_tropa, t.id_planta,
               prod.nombre, depto.nombre_departamento, tf.nombre, esp.descripcion, t.id_tropa
      ORDER BY f.fecha_faena DESC, f.id_faena DESC
      LIMIT $${valores.length + 1} OFFSET $${valores.length + 2};
    `;

    const resultado = await pool.query(query, [
      ...valores,
      limitNum,
      offsetNum,
    ]);
    res.json(resultado.rows);
  } catch (error) {
    console.error('❌ Error al obtener faenas realizadas:', error.message);
    res.status(500).json({ error: 'Error al obtener faenas realizadas' });
  }
};

//ObtenerDatosParaDecomiso
const obtenerDatosParaDecomiso = async (req, res) => {
  const { id_faena } = req.params;

  try {
    const query = `
      SELECT 
        fd.id_faena_detalle, -- ✅ necesario para registrar decomiso
        td.id_tropa_detalle,
        ce.descripcion AS categoria,
        e.descripcion AS especie,
        fd.cantidad_faena AS faenados,
        t.dte_dtu,
        t.n_tropa,
        f.fecha_faena
      FROM faena f
      JOIN faena_detalle fd ON f.id_faena = fd.id_faena
      JOIN tropa_detalle td ON fd.id_tropa_detalle = td.id_tropa_detalle
      JOIN tropa t ON td.id_tropa = t.id_tropa
      JOIN especie e ON td.id_especie = e.id_especie
      JOIN categoria_especie ce ON td.id_cat_especie = ce.id_cat_especie
      WHERE f.id_faena = $1
    `;

    const resultado = await pool.query(query, [id_faena]);

    if (resultado.rows.length === 0) {
      return res
        .status(404)
        .json({ error: 'No se encontraron datos para esta faena' });
    }

    res.json(resultado.rows);
  } catch (error) {
    console.error('❌ Error al obtener datos para decomiso:', error.message);
    res.status(500).json({ error: 'Error al obtener datos para decomiso' });
  }
};

// Obtener detalles de faena con categorías para informe
const obtenerDetallesFaenaConCategoria = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        f.id_faena,
        f.fecha_faena,
        t.id_planta,
        esp.descripcion AS especie,
        ce.descripcion AS categoria_especie,
        fd.cantidad_faena
      FROM faena f
      JOIN faena_detalle fd ON f.id_faena = fd.id_faena
      JOIN tropa_detalle td ON td.id_tropa_detalle = fd.id_tropa_detalle
      JOIN especie esp ON td.id_especie = esp.id_especie
      JOIN categoria_especie ce ON td.id_cat_especie = ce.id_cat_especie
      JOIN tropa t ON f.id_tropa = t.id_tropa
      ORDER BY f.fecha_faena DESC;
    `);

    res.status(200).json(result.rows || []);
  } catch (error) {
    console.error(
      'Error al obtener detalles de faena con categoría:',
      error.message,
    );
    res.status(500).json({ error: 'Error al obtener detalles de faena' });
  }
};

module.exports = {
  obtenerFaenas,
  crearFaena,
  obtenerFaenasRealizadas,
  obtenerRemanentePorTropa,
  obtenerDatosParaDecomiso,
  obtenerFaenasSinDecomiso,
  obtenerDetallesFaenaConCategoria,
};
