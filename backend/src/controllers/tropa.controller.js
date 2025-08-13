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

exports.getById = async (req, res) => {
  const { id } = req.params;
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
      [id],
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener tropa:', err);
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
