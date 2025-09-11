const pool = require('../db');

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
       FROM faena
       WHERE id_tropa = $1
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

const getFaenasRealizadas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        f.id_faena,
        f.fecha_faena AS fecha,
        t.n_tropa,
        (
          SELECT e.descripcion
          FROM tropa_detalle td
          JOIN especie e ON td.id_especie = e.id_especie
          WHERE td.id_tropa = t.id_tropa
          LIMIT 1
        ) AS especie
      FROM faena f
      JOIN tropa t ON f.id_tropa = t.id_tropa
      ORDER BY f.fecha_faena DESC
      LIMIT 20
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener faenas realizadas:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const obtenerFaenaPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        f.id_faena,
        f.fecha_faena AS fecha,
        t.n_tropa,
        (
          SELECT e.descripcion
          FROM tropa_detalle td
          JOIN especie e ON td.id_especie = e.id_especie
          WHERE td.id_tropa = t.id_tropa
          LIMIT 1
        ) AS especie
      FROM faena f
      JOIN tropa t ON f.id_tropa = t.id_tropa
      WHERE f.id_faena = $1
      LIMIT 1
    `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Faena no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener faena por ID:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  obtenerFaenas,
  crearFaena,
  obtenerRemanentePorTropa, // ✅ exportación agregada
  getFaenasRealizadas,
  obtenerFaenaPorId,
};
