const pool = require('../config/db');

const obtenerFaenas = async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM faenas');
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al listar faenas:', error);
    res.status(500).json({ error: 'Error al obtener faenas' });
  }
};

// Crear una nueva faena (POST)
const crearFaena = async (req, res) => {
  try {
    const {
      fecha,
      dte,
      guiaPolicial,
      nroUsuario,
      guiaExtendida,
      procedencia,
      titular,
    } = req.body;

    const resultado = await pool.query(
      `INSERT INTO faenas (fecha, dte, guia_policial, nro_usuario, guia_extendida, procedencia, titular)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        fecha,
        dte,
        guiaPolicial,
        nroUsuario,
        guiaExtendida,
        procedencia,
        titular,
      ],
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al crear faena:', error);
    res.status(500).json({ error: 'Error al crear faena' });
  }
};

module.exports = { obtenerFaenas, crearFaena };
