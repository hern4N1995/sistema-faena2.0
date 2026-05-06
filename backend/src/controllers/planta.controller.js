// controllers/planta.controller.js
const pool = require('../db');

// Helper: Limpiar CUIT (remover guiones)
const limpiarCUIT = (cuit) => {
  if (!cuit) return null;
  const numeros = cuit.toString().replace(/\D/g, '');
  return numeros.length === 11 ? numeros : null;
};

// Obtener todas las plantas
const obtenerPlantas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id_planta,
        p.nombre,
        p.id_provincia,
        pr.descripcion AS nombre_provincia,
        p.direccion,
        p.cuit,
        p.fecha_habilitacion,
        p.norma_legal,
        p.estado
      FROM planta p
      LEFT JOIN provincia pr ON p.id_provincia = pr.id_provincia
      ORDER BY p.id_planta;
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener plantas:', error.message);
    res.status(500).json({ error: 'Error al obtener plantas' });
  }
};

// Crear planta
const crearPlanta = async (req, res) => {
  const {
    nombre,
    id_provincia,
    direccion,
    cuit,
    fecha_habilitacion,
    norma_legal,
    estado,
  } = req.body;

  if (!nombre || !fecha_habilitacion) {
    return res
      .status(400)
      .json({ error: 'Nombre y fecha de habilitación son obligatorios' });
  }

  try {
    // Intentar insertar con CUIT primero
    const insert = await pool.query(
      `INSERT INTO planta (
        nombre, id_provincia, direccion, cuit,
        fecha_habilitacion, norma_legal, estado
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING 
        id_planta AS id,
        nombre,
        id_provincia,
        direccion,
        cuit,
        fecha_habilitacion,
        norma_legal,
        estado`,
      [
        nombre.trim(),
        id_provincia,
        direccion?.trim() || '',
        limpiarCUIT(cuit),
        fecha_habilitacion,
        norma_legal?.trim() || '',
        estado ?? true,
      ],
    );
    res.status(201).json(insert.rows[0]);
  } catch (error) {
    console.error('Error al crear planta:', error.message);
    // Si falla por columna CUIT no existe, intentar sin ella
    if (error.message.includes('cuit') || error.message.includes('undefined column')) {
      try {
        const insertFallback = await pool.query(
          `INSERT INTO planta (
            nombre, id_provincia, direccion,
            fecha_habilitacion, norma_legal, estado
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING 
            id_planta AS id,
            nombre,
            id_provincia,
            direccion,
            fecha_habilitacion,
            norma_legal,
            estado`,
          [
            nombre.trim(),
            id_provincia,
            direccion?.trim() || '',
            fecha_habilitacion,
            norma_legal?.trim() || '',
            estado ?? true,
          ],
        );
        const row = insertFallback.rows[0];
        return res.status(201).json({ ...row, cuit: '' });
      } catch (fallbackError) {
        console.error('Error fallback al crear planta:', fallbackError.message);
        res.status(500).json({ error: 'Error al crear planta' });
      }
    } else {
      res.status(500).json({ error: 'Error al crear planta' });
    }
  }
};

// Modificar planta
const modificarPlanta = async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    id_provincia,
    direccion,
    cuit,
    fecha_habilitacion,
    norma_legal,
    estado,
  } = req.body;

  try {
    // Intentar actualizar con CUIT primero
    const update = await pool.query(
      `UPDATE planta
       SET nombre = $1,
           id_provincia = $2,
           direccion = $3,
           cuit = $4,
           fecha_habilitacion = $5,
           norma_legal = $6,
           estado = $7
       WHERE id_planta = $8
       RETURNING 
         id_planta AS id,
         nombre,
         id_provincia,
         direccion,
         cuit,
         fecha_habilitacion,
         norma_legal,
         estado`,
      [
        nombre?.trim() || '',
        id_provincia || null,
        direccion?.trim() || '',
        limpiarCUIT(cuit),
        fecha_habilitacion,
        norma_legal?.trim() || '',
        typeof estado === 'boolean' ? estado : true,
        id,
      ],
    );

    if (update.rowCount === 0) {
      return res.status(404).json({ error: 'Planta no encontrada' });
    }

    res.json(update.rows[0]);
  } catch (error) {
    console.error('Error al modificar planta:', error.message);
    // Si falla por columna CUIT no existe, intentar sin ella
    if (error.message.includes('cuit') || error.message.includes('undefined column')) {
      try {
        const updateFallback = await pool.query(
          `UPDATE planta
           SET nombre = $1,
               id_provincia = $2,
               direccion = $3,
               fecha_habilitacion = $4,
               norma_legal = $5,
               estado = $6
           WHERE id_planta = $7
           RETURNING 
             id_planta AS id,
             nombre,
             id_provincia,
             direccion,
             fecha_habilitacion,
             norma_legal,
             estado`,
          [
            nombre?.trim() || '',
            id_provincia || null,
            direccion?.trim() || '',
            fecha_habilitacion,
            norma_legal?.trim() || '',
            typeof estado === 'boolean' ? estado : true,
            id,
          ],
        );

        if (updateFallback.rowCount === 0) {
          return res.status(404).json({ error: 'Planta no encontrada' });
        }

        const row = updateFallback.rows[0];
        return res.json({ ...row, cuit: '' });
      } catch (fallbackError) {
        console.error('Error fallback al modificar planta:', fallbackError.message);
        res.status(500).json({ error: 'Error al modificar planta' });
      }
    } else {
      res.status(500).json({ error: 'Error al modificar planta' });
    }
  }
};

// Eliminar planta (marcar como deshabilitada)
const eliminarPlanta = async (req, res) => {
  const { id } = req.params;
  try {
    const update = await pool.query(
      `UPDATE planta
       SET estado = false
       WHERE id_planta = $1
       RETURNING id_planta AS id`,
      [id],
    );

    if (update.rowCount === 0) {
      return res.status(404).json({ error: 'Planta no encontrada' });
    }

    res.status(200).json({
      message: 'Planta deshabilitada correctamente',
      id: update.rows[0].id,
    });
  } catch (error) {
    console.error('Error al deshabilitar planta:', error.message);
    res.status(500).json({ error: 'Error al deshabilitar planta' });
  }
};

module.exports = {
  obtenerPlantas,
  crearPlanta,
  modificarPlanta,
  eliminarPlanta,
};
