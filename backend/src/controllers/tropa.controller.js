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
  const detalles = req.body; // array de objetos con id_especie, id_cat_especie, cantidad

  // Validación básica
  if (!Array.isArray(detalles) || detalles.length === 0) {
    return res
      .status(400)
      .json({ error: 'No se recibieron detalles válidos.' });
  }

  try {
    for (const detalle of detalles) {
      const { id_especie, id_cat_especie, cantidad } = detalle;

      // Validación defensiva por registro
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
    }

    res.status(201).json({ message: 'Detalles guardados correctamente' });
  } catch (err) {
    console.error('Error al guardar detalles de tropa:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.getDetalle = async (req, res) => {
  const { id } = req.params;

  // Validación defensiva
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'ID de tropa inválido' });
  }

  try {
    const result = await pool.query(
      `
      SELECT 
        td.id_tropa_detalle,
        td.id_especie,
        e.descripcion AS nombre_especie,
        td.id_cat_especie,
        ce.descripcion AS nombre_categoria,
        td.cantidad
      FROM tropa_detalle td
      JOIN especie e ON td.id_especie = e.id_especie
      JOIN categoria_especie ce ON td.id_cat_especie = ce.id_cat_especie
      WHERE td.id_tropa = $1
      ORDER BY e.descripcion, ce.descripcion
      `,
      [parseInt(id)],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: 'No se encontraron detalles para esta tropa' });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error al obtener detalle de tropa:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
