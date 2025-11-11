const pool = require('../db');

// Obtener todas las tropas
exports.getAll = async (req, res) => {
  try {
    // GET /tropas  -> controllers/tropa.controller.js (getAll)
    const result = await pool.query(`
  SELECT
    t.id_tropa,
    t.n_tropa,
    t.fecha,
    t.dte_dtu,
    tf.nombre AS titular,
    pr.nombre AS productor_nombre,
    p.id_planta,
    p.nombre AS planta_nombre
  FROM tropa t
  LEFT JOIN titular_faena tf ON t.id_titular_faena = tf.id_titular_faena
  LEFT JOIN productor pr ON t.id_productor = pr.id_productor
  LEFT JOIN planta p ON t.id_planta = p.id_planta
  ORDER BY t.fecha DESC
`);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener tropas:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener todos los detalles de todas las tropas
exports.getTodosLosDetalles = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        td.id_tropa_detalle,
        td.id_tropa,
        t.n_tropa,
        t.fecha,
        t.dte_dtu,
        tf.nombre AS titular,
        e.descripcion AS nombre_especie,
        ce.descripcion AS nombre_categoria,
        td.cantidad
      FROM tropa_detalle td
      JOIN tropa t ON td.id_tropa = t.id_tropa
      LEFT JOIN titular_faena tf ON t.id_titular_faena = tf.id_titular_faena
      JOIN especie e ON td.id_especie = e.id_especie
      JOIN categoria_especie ce ON td.id_cat_especie = ce.id_cat_especie
      ORDER BY t.fecha DESC, e.descripcion, ce.descripcion
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener todos los detalles de tropas:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear una nueva tropa
exports.createTropa = async (req, res) => {
  const {
    dte_dtu,
    guia_policial,
    fecha,
    id_titular_faena,
    n_tropa,
    id_departamento,
    id_productor,
    id_planta,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO tropa (
        dte_dtu, guia_policial, fecha,
        id_titular_faena, n_tropa,
        id_departamento, id_productor, id_planta
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id_tropa`,
      [
        dte_dtu,
        guia_policial,
        fecha || new Date(),
        id_titular_faena,
        n_tropa,
        id_departamento,
        id_productor,
        id_planta,
      ],
    );

    res.status(201).json({
      message: 'Tropa creada correctamente',
      id_tropa: result.rows[0].id_tropa,
    });
  } catch (err) {
    console.error('Error al crear tropa:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener tropa por ID
exports.getById = async (req, res) => {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    return res
      .status(400)
      .json({ error: 'ID inválido. Debe ser un número entero.' });
  }

  try {
    const result = await pool.query(
      `
      SELECT 
        t.id_tropa,
        t.n_tropa,
        t.dte_dtu,
        t.fecha,
        tf.nombre AS titular,
        p.nombre AS planta,
        pr.nombre AS productor
      FROM tropa t
      LEFT JOIN titular_faena tf ON t.id_titular_faena = tf.id_titular_faena
      LEFT JOIN planta p ON t.id_planta = p.id_planta
      LEFT JOIN productor pr ON t.id_productor = pr.id_productor
      WHERE t.id_tropa = $1
    `,
      [parseInt(id)],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tropa no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener tropa:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Guardar detalle de tropa
exports.saveDetalle = async (req, res) => {
  const { id } = req.params;
  const detalles = req.body;

  if (!Array.isArray(detalles) || detalles.length === 0) {
    return res
      .status(400)
      .json({ error: 'No se recibieron detalles válidos.' });
  }

  try {
    const detallesInsertados = [];

    for (const detalle of detalles) {
      const { id_especie, id_cat_especie, cantidad } = detalle;

      if (
        !id_especie ||
        !id_cat_especie ||
        !cantidad ||
        isNaN(cantidad) ||
        parseInt(cantidad) <= 0
      ) {
        console.warn('Detalle inválido omitido:', detalle);
        continue;
      }

      await pool.query(
        `INSERT INTO tropa_detalle (id_tropa, id_especie, id_cat_especie, cantidad)
         VALUES ($1, $2, $3, $4)`,
        [parseInt(id), id_especie, id_cat_especie, parseInt(cantidad)],
      );

      detallesInsertados.push({ id_especie, id_cat_especie, cantidad });
    }

    res.status(201).json({
      message: 'Detalles guardados correctamente',
      cantidad: detallesInsertados.length,
      detalles: detallesInsertados,
    });
  } catch (err) {
    console.error('Error al guardar detalles de tropa:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener tropas de la planta del usuario logueado
exports.getByUsuarioPlanta = async (req, res) => {
  try {
    const id_usuario = req.user?.id_usuario;
    if (!id_usuario) return res.status(401).json({ error: 'No autenticado' });

    // Obtener id_planta del usuario (puede venir ya en req.user si tu middleware lo setea)
    // Si no está en req.user, obtenelo de la DB
    let id_planta = req.user.id_planta ?? null;
    if (!id_planta) {
      const uRes = await pool.query(
        `SELECT id_planta FROM usuario WHERE id_usuario = $1 LIMIT 1`,
        [id_usuario],
      );
      id_planta = uRes.rows[0]?.id_planta ?? null;
    }

    if (!id_planta)
      return res.status(404).json({ error: 'Usuario sin planta asignada' });

    const q = `
      SELECT
        t.id_tropa,
        t.n_tropa,
        t.fecha,
        t.dte_dtu,
        t.guia_policial,
        t.id_planta,
        p.nombre AS planta_nombre,
        tf.nombre AS titular,
        pr.nombre AS productor_nombre,
        d.nombre_departamento AS departamento
      FROM tropa t
      LEFT JOIN planta p ON t.id_planta = p.id_planta
      LEFT JOIN titular_faena tf ON t.id_titular_faena = tf.id_titular_faena
      LEFT JOIN productor pr ON t.id_productor = pr.id_productor
      LEFT JOIN departamento d ON t.id_departamento = d.id_departamento
      WHERE t.id_planta = $1
      ORDER BY t.fecha DESC
    `;
    const result = await pool.query(q, [id_planta]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener tropas por planta:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener detalle agrupado (opcional)
exports.getDetalleAgrupado = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'ID de tropa inválido' });
  }

  try {
    const tropaRes = await pool.query(
      `
      SELECT 
        t.n_tropa, 
        t.dte_dtu, 
        t.fecha, 
        tf.nombre AS titular
      FROM tropa t
      LEFT JOIN titular_faena tf ON t.id_titular_faena = tf.id_titular_faena
      WHERE t.id_tropa = $1
      `,
      [parseInt(id)],
    );

    if (tropaRes.rows.length === 0) {
      return res.status(404).json({ error: 'Tropa no encontrada' });
    }

    const { n_tropa, dte_dtu, fecha, titular } = tropaRes.rows[0];

    const detalleRes = await pool.query(
      `
      SELECT 
        td.id_tropa_detalle,
        e.descripcion AS nombre_especie,
        ce.descripcion AS nombre_categoria,
        td.cantidad
      FROM tropa_detalle td
      JOIN especie e ON td.id_especie = e.id_especie
      JOIN categoria_especie ce ON td.id_cat_especie = ce.id_cat_especie
      WHERE td.id_tropa = $1
      ORDER BY ce.descripcion
      `,
      [parseInt(id)],
    );

    const categorias = detalleRes.rows.map((row) => ({
      id_tropa_detalle: row.id_tropa_detalle,
      nombre: row.nombre_categoria,
      remanente: row.cantidad,
      especie: row.nombre_especie,
    }));

    res.status(200).json({
      n_tropa,
      dte_dtu,
      fecha,
      titular, // ✅ ahora sí se incluye correctamente
      especie: categorias[0]?.especie || '',
      categorias,
    });
  } catch (err) {
    console.error('Error al obtener detalle agrupado:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener detalle para DetalleFaenaPage
exports.getDetalle = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'ID de tropa inválido' });
  }

  try {
    const tropaRes = await pool.query(
      `
      SELECT id_tropa, n_tropa, dte_dtu, fecha
      FROM tropa
      WHERE id_tropa = $1
    `,
      [parseInt(id)],
    );

    if (tropaRes.rows.length === 0) {
      return res.status(404).json({ error: 'Tropa no encontrada' });
    }

    const { id_tropa, n_tropa, dte_dtu, fecha } = tropaRes.rows[0];

    const detalleRes = await pool.query(
      `
  SELECT 
    td.id_tropa_detalle,
    e.descripcion AS nombre_especie,
    ce.descripcion AS nombre_categoria,
    td.cantidad,
    COALESCE((
      SELECT SUM(fd.cantidad_faena)
      FROM faena_detalle fd
      WHERE fd.id_tropa_detalle = td.id_tropa_detalle
    ), 0) AS faenados,
    td.cantidad - COALESCE((
      SELECT SUM(fd.cantidad_faena)
      FROM faena_detalle fd
      WHERE fd.id_tropa_detalle = td.id_tropa_detalle
    ), 0) AS remanente
  FROM tropa_detalle td
  JOIN especie e ON td.id_especie = e.id_especie
  JOIN categoria_especie ce ON td.id_cat_especie = ce.id_cat_especie
  WHERE td.id_tropa = $1
  ORDER BY ce.descripcion
  `,
      [id_tropa],
    );

    const categorias = detalleRes.rows.map((row) => ({
      id_tropa_detalle: row.id_tropa_detalle,
      nombre: row.nombre_categoria,
      remanente: row.remanente,
      especie: row.nombre_especie,
    }));

    res.status(200).json({
      id_tropa, // ✅ agregado
      n_tropa,
      dte_dtu,
      fecha,
      especie: categorias[0]?.especie || '',
      categorias,
    });
  } catch (err) {
    console.error('Error al obtener detalle de tropa:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener titulares
exports.getTitulares = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id_titular_faena, nombre FROM titular_faena ORDER BY nombre
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener titulares:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener departamentos
exports.getDepartamentos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id_departamento, nombre_departamento FROM departamento
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener departamentos:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener plantas
exports.getPlantas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id_planta, nombre FROM planta ORDER BY nombre
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener plantas:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener productores
exports.getProductores = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id_productor, nombre FROM productor ORDER BY nombre
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener productores:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
