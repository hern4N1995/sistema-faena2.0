const pool = require('../db');

const obtenerCombinaciones = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ce.id_cat_enfermedad,
        ce.descripcion AS categoria,
        e.id_enfermedad,
        e.descripcion AS enfermedad
      FROM enfermedad e
      JOIN categoria_enfermedad ce ON e.id_cat_enfermedad = ce.id_cat_enfermedad
      ORDER BY ce.descripcion, e.descripcion
    `);

    // ✅ Si no hay datos, devolver array vacío sin error
    res.json(result.rows || []);
  } catch (err) {
    console.error('❌ Error al obtener combinaciones:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { obtenerCombinaciones };
