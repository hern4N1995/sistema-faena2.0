const pool = require('../db');

// Obtener todos los productores activos
const obtenerProductores = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id_productor, cuit, nombre
      FROM productor
      WHERE estado = true
      ORDER BY nombre
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener productores:', error);
    res.status(500).json({ error: 'Error al obtener productores' });
  }
};

// Crear nuevo productor
const crearProductor = async (req, res) => {
  const { cuit, nombre } = req.body;

  if (!cuit || !nombre) {
    return res.status(400).json({ error: 'CUIT y nombre son obligatorios' });
  }

  try {
    const existe = await pool.query(
      'SELECT 1 FROM productor WHERE cuit = $1 AND estado = true',
      [cuit],
    );
    if (existe.rowCount > 0) {
      return res.status(409).json({ error: 'El productor ya está registrado' });
    }

    await pool.query(
      `INSERT INTO productor (cuit, nombre, estado, creado_en)
       VALUES ($1, $2, true, NOW())`,
      [cuit, nombre],
    );

    res.status(201).json({ mensaje: 'Productor creado correctamente' });
  } catch (error) {
    console.error('Error al crear productor:', error);
    res.status(500).json({ error: 'Error al crear productor' });
  }
};

// Editar productor
const editarProductor = async (req, res) => {
  const { id } = req.params;
  const { cuit, nombre } = req.body;

  if (!cuit || !nombre) {
    return res.status(400).json({ error: 'CUIT y nombre son obligatorios' });
  }

  try {
    await pool.query(
      `UPDATE productor SET cuit = $1, nombre = $2
       WHERE id_productor = $3 AND estado = true`,
      [cuit, nombre, id],
    );

    res.json({ mensaje: 'Productor modificado correctamente' });
  } catch (error) {
    console.error('Error al editar productor:', error);
    res.status(500).json({ error: 'Error al editar productor' });
  }
};

// Eliminar productor (soft delete)
const eliminarProductor = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      `UPDATE productor SET estado = false
       WHERE id_productor = $1`,
      [id],
    );

    res.json({ mensaje: 'Productor eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar productor:', error);
    res.status(500).json({ error: 'Error al eliminar productor' });
  }
};

module.exports = {
  obtenerProductores,
  crearProductor,
  editarProductor,
  eliminarProductor,
};
