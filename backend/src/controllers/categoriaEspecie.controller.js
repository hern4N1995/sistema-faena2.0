const pool = require('../db');

/**
 * Obtener todas las categorías de especie ordenadas alfabéticamente
 */
const getCategoriasEspecie = async (req, res) => {
  try {
    const query = `
      SELECT id_cat_especie AS id, descripcion AS nombre
      FROM categoria_especie
      ORDER BY descripcion
    `;

    const { rows } = await pool.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener categorías de especie:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { getCategoriasEspecie };
