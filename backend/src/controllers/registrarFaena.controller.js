const pool = require('../db');

const registrarFaena = async (req, res) => {
  const { id_tropa, fecha_faena, categorias } = req.body;

  if (
    !id_tropa ||
    !fecha_faena ||
    !Array.isArray(categorias) ||
    categorias.length === 0
  ) {
    return res.status(400).json({ error: 'Datos incompletos o inválidos' });
  }

  try {
    // Normalizar fecha: si viene como "YYYY-MM-DD", convertir a timestamp con hora 00:00:00 en UTC
    let fechaNormalizada = fecha_faena;
    if (typeof fecha_faena === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha_faena)) {
      // Es una fecha sin hora, convertir a timestamp UTC (T00:00:00Z)
      fechaNormalizada = `${fecha_faena}T00:00:00Z`;
    }
    
    console.log('[registrarFaena] Fecha recibida:', fecha_faena, 'Normalizada:', fechaNormalizada);
    
    // Insertar faena principal
    const faenaRes = await pool.query(
      `INSERT INTO faena (id_tropa, fecha_faena) VALUES ($1, $2) RETURNING id_faena, fecha_faena`,
      [id_tropa, fechaNormalizada],
    );

    const id_faena = faenaRes.rows[0].id_faena;
    const fechaGuardada = faenaRes.rows[0].fecha_faena;
    console.log('[registrarFaena] Fecha guardada en BD:', fechaGuardada);
    
    const detallesInsertados = [];

    for (const cat of categorias) {
      const { id_tropa_detalle, cantidad } = cat;

      if (!id_tropa_detalle || typeof cantidad !== 'number' || cantidad <= 0) {
        console.warn('❌ Categoría inválida:', cat);
        continue;
      }

      // Validar remanente disponible
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

      // Insertar detalle de faena
      await pool.query(
        `INSERT INTO faena_detalle (id_faena, id_tropa_detalle, cantidad_faena)
         VALUES ($1, $2, $3)`,
        [id_faena, id_tropa_detalle, cantidad],
      );

      detallesInsertados.push({ id_tropa_detalle, cantidad });
    }

    res.status(201).json({
      id_faena,
      id_tropa,
      fecha_faena,
      detalles: detallesInsertados,
    });
  } catch (err) {
    console.error('Error al registrar faena:', err.message);
    res.status(500).json({ error: 'Error interno al registrar faena' });
  }
};

module.exports = { registrarFaena };
