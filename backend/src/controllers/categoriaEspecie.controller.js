// controllers/categoriaEspecie.controller.js
const pool = require('../db');

const getCategoriasPorEspecie = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT ce.id_cat_especie AS id, ce.descripcion AS nombre
      FROM especie_categoria ec
      JOIN categoria_especie ce ON ec.id_cat_especie = ce.id_cat_especie
      WHERE ec.id_especie = $1
      ORDER BY ce.descripcion
    `,
      [id],
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener categorías por especie:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { getCategoriasPorEspecie };
