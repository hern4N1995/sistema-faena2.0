/* const express = require('express');
const router = express.Router();
const { getEspecies } = require('../controllers/especie.controller');

router.get('/', getEspecies);

module.exports = router;
 */

// routes/especie.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // conexión a PostgreSQL

router.post('/especie', async (req, res) => {
  const { descripcion, id_cat_especie } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO especie (descripcion, id_cat_especie) VALUES ($1, $2) RETURNING *',
      [descripcion, id_cat_especie],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al guardar especie:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
