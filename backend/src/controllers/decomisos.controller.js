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

const obtenerInfoFaenaPorDecomiso = async (req, res) => {
  const { id_decomiso } = req.params;

  try {
    const query = `
      SELECT 
        f.fecha_faena,
        t.dte_dtu,
        t.n_tropa
      FROM decomiso d
      JOIN faena_detalle fd ON d.id_faena_detalle = fd.id_faena_detalle
      JOIN faena f ON fd.id_faena = f.id_faena
      JOIN tropa_detalle td ON fd.id_tropa_detalle = td.id_tropa_detalle
      JOIN tropa t ON td.id_tropa = t.id_tropa
      WHERE d.id_decomiso = $1
    `;

    const resultado = await pool.query(query, [id_decomiso]);

    if (resultado.rows.length === 0) {
      return res
        .status(404)
        .json({ error: 'No se encontró información para el decomiso' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al obtener info de faena:', error.message);
    res.status(500).json({ error: 'Error al obtener info de faena' });
  }
};
module.exports = {
  obtenerCombinaciones,
  obtenerInfoFaenaPorDecomiso,
};
