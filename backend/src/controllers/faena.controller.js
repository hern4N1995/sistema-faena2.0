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
const obtenerFaenasRealizadas = async (req, res) => {
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

  const where = filtros.length > 0 ? `WHERE ${filtros.join(' AND ')}` : '';

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
      ${where}
      GROUP BY f.id_faena, f.fecha_faena, t.dte_dtu, t.guia_policial, t.n_tropa,
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

//ObtenerDatosParaDecomiso
const obtenerDatosParaDecomiso = async (req, res) => {
  const { id_faena } = req.params;

  try {
    const query = `
      SELECT 
        esp.descripcion AS especie,
        cat.descripcion AS categoria,
        SUM(fd.cantidad_faena) AS faenados,
        td.id_tropa_detalle
      FROM faena_detalle fd
      JOIN tropa_detalle td ON fd.id_tropa_detalle = td.id_tropa_detalle
      JOIN especie esp ON td.id_especie = esp.id_especie
      JOIN categoria_especie cat ON td.id_cat_especie = cat.id_cat_especie
      WHERE fd.id_faena = $1
      GROUP BY esp.descripcion, cat.descripcion, td.id_tropa_detalle
    `;

    const resultado = await pool.query(query, [id_faena]);
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener datos para decomiso:', error.message);
    res.status(500).json({ error: 'Error al obtener datos para decomiso' });
  }
};

module.exports = {
  obtenerFaenas,
  crearFaena,
  obtenerFaenasRealizadas,
  obtenerRemanentePorTropa,
  obtenerDatosParaDecomiso,
};
