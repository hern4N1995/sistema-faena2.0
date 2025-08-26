const pool = require('../db');

const getEspecies = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id_especie AS id, descripcion AS nombre FROM especie',
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener especies:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Express - especieController.js
const getCategoriasPorEspecie = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT id_cat_especie AS id, descripcion AS nombre
      FROM categoria_especie
      WHERE id_especie = $1
      ORDER BY descripcion
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: 'No hay categorías para esta especie' });
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener categorías:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getEspecies,
  getCategoriasPorEspecie,
};
