const pool = require('../db');

const registrarFaena = async (req, res) => {
  const { fecha_faena, categorias } = req.body;

  if (!fecha_faena || !Array.isArray(categorias) || categorias.length === 0) {
    return res.status(400).json({ error: 'Datos incompletos o inválidos' });
  }

  try {
    // Crear faena principal
    const faenaRes = await pool.query(
      `INSERT INTO faena (fecha_faena) VALUES ($1) RETURNING id_faena`,
      [fecha_faena],
    );
    const id_faena = faenaRes.rows[0].id_faena;

    const detallesInsertados = [];

    for (const cat of categorias) {
      const { id_tropa_detalle, cantidad } = cat;

      if (!id_tropa_detalle || typeof cantidad !== 'number' || cantidad <= 0) {
        console.warn('Categoría inválida:', cat);
        continue;
      }

      // Validar remanente
      const remanenteRes = await pool.query(
        `SELECT cantidad - COALESCE((
           SELECT SUM(cantidad_faena)
           FROM faena_detalle
           WHERE id_tropa_detalle = $1
         ), 0) AS remanente
         FROM tropa_detalle
         WHERE id_tropa_detalle = $1`,
        [id_tropa_detalle],
      );

      const remanente = remanenteRes.rows[0]?.remanente ?? 0;

      if (cantidad > remanente) {
        return res.status(400).json({
          error: `La cantidad (${cantidad}) excede el remanente disponible (${remanente}) para id_tropa_detalle ${id_tropa_detalle}`,
        });
      }

      // Insertar detalle
      await pool.query(
        `INSERT INTO faena_detalle (id_faena, id_tropa_detalle, cantidad_faena)
         VALUES ($1, $2, $3)`,
        [id_faena, id_tropa_detalle, cantidad],
      );

      detallesInsertados.push({ id_tropa_detalle, cantidad });
    }

    res.status(201).json({
      id_faena,
      detalles: detallesInsertados,
    });
  } catch (err) {
    console.error('Error al registrar faena:', err.message);
    res.status(500).json({ error: 'Error interno al registrar faena' });
  }
};

module.exports = { registrarFaena };
