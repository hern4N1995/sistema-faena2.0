const pool = require('../db');

exports.getAll = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id_tropa,
        t.n_tropa,
        t.fecha,
        t.dte_dtu,
        tf.nombre AS titular
      FROM tropa t
      LEFT JOIN titular_faena tf ON t.id_titular_faena = tf.id_titular_faena
      ORDER BY t.fecha DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener tropas:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

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
      JOIN categoria_especie ce ON e.id_cat_especie = ce.id_cat_especie
      ORDER BY t.fecha DESC, e.descripcion, ce.descripcion
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener todos los detalles de tropas:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

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
        fecha || new Date(), // si no viene, usa NOW()
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

exports.getById = async (req, res) => {
  const { id } = req.params;

  // Validación: el ID debe ser un número entero positivo
  if (!/^\d+$/.test(id)) {
    console.warn(`ID inválido recibido: ${id}`);
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
        t.fecha,
        t.dte_dtu,
        tf.nombre AS titular
      FROM tropa t
      LEFT JOIN titular_faena tf ON t.id_titular_faena = tf.id_titular_faena
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

exports.getDepartamentos = async (req, res) => {
  const result = await pool.query(
    'SELECT id_departamento, nombre_departamento FROM departamento',
  );
  res.json(result.rows);
};

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

exports.saveDetalle = async (req, res) => {
  const { id } = req.params;
  const { fecha, animales, otros } = req.body;
  try {
    await pool.query(
      'INSERT INTO detalle_tropa (id_tropa, fecha, animales, otros) VALUES ($1, $2, $3, $4)',
      [id, fecha, JSON.stringify(animales), JSON.stringify(otros)],
    );
    res.json({ message: 'Detalle guardado correctamente' });
  } catch (err) {
    console.error('Error al guardar detalle:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.getDetalle = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
  SELECT 
    td.id_tropa_detalle,
    e.descripcion AS nombre_especie,
    ce.descripcion AS nombre_categoria,
    td.cantidad
  FROM tropa_detalle td
  JOIN especie e ON td.id_especie = e.id_especie
  JOIN categoria_especie ce ON e.id_cat_especie = ce.id_cat_especie
  WHERE td.id_tropa = $1
  ORDER BY e.descripcion, ce.descripcion
`,
      [id],
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener detalle de tropa:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
