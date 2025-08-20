// controllers/planta.controller.js
const pool = require('../db');

const obtenerPlantas = async (req, res) => {
  try {
    // Solo columnas que necesitas
    const result = await pool.query(
      `SELECT id_planta, nombre 
       FROM planta 
       WHERE estado = true 
       ORDER BY nombre`,
    );
    // Si usas pg, los registros vienen en result.rows
    return res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener plantas:', err);
    return res.status(500).json({ error: 'Error al obtener plantas' });
  }
};

module.exports = { obtenerPlantas };
