const pool = require('../db');

/**
 * Obtener todas las especies ordenadas alfabéticamente
 */
const getEspecies = async (req, res) => {
  try {
    const query = `
      SELECT id_especie AS id, descripcion AS nombre
      FROM especie
      ORDER BY descripcion
    `;

    const { rows } = await pool.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener especies desde la base de datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { getEspecies };
