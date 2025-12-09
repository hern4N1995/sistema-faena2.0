const pool = require('../db');

// Listar especies activas
const getEspecies = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id_especie, descripcion
      FROM especie
      WHERE estado IS TRUE
      ORDER BY id_especie DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener especies:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Registrar nueva especie
const registrarEspecie = async (req, res) => {
  const { descripcion } = req.body;

  if (!descripcion) {
    return res.status(400).json({ error: 'La descripción es obligatoria' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO especie (descripcion, estado)
       VALUES ($1, TRUE)
       RETURNING id_especie`,
      [descripcion.trim()],
    );
    res.status(201).json({ id_especie: result.rows[0].id_especie });
  } catch (err) {
    console.error('Error al registrar especie:', err.message);
    res.status(500).json({ error: 'Error al registrar especie' });
  }
};

// Modificar especie
const actualizarEspecie = async (req, res) => {
  const { id } = req.params;
  const { descripcion } = req.body;

  if (!descripcion) {
    return res.status(400).json({ error: 'La descripción es obligatoria' });
  }

  try {
    await pool.query(
      `UPDATE especie SET descripcion = $1 WHERE id_especie = $2`,
      [descripcion.trim(), id],
    );
    res.sendStatus(200);
  } catch (err) {
    console.error('Error al actualizar especie:', err.message);
    res.status(500).json({ error: 'Error al actualizar especie' });
  }
};

// Obtener categorías de una especie específica
const getCategoriasPorEspecie = async (req, res) => {
  const { id } = req.params;

  if (!id || !/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'ID de especie inválido' });
  }

  try {
    const result = await pool.query(
      `
      SELECT 
        id_cat_especie,
        descripcion,
        id_especie
      FROM categoria_especie
      WHERE id_especie = $1 AND estado IS TRUE
      ORDER BY descripcion
      `,
      [parseInt(id, 10)],
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener categorías por especie:', err.message);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

module.exports = {
  getEspecies,
  registrarEspecie,
  actualizarEspecie,
  eliminarEspecie,
  getCategoriasPorEspecie,
};
