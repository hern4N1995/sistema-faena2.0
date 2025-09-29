const pool = require('../db');

// 🔍 Cargar combinaciones ya registradas en parte_deco_afeccion
const obtenerCombinaciones = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        tp.id_tipo_parte,
        tp.nombre_tipo_parte AS tipo_parte,
        pd.id_parte_decomisada,
        pd.nombre_parte AS parte,
        a.id_afeccion,
        a.descripcion AS afeccion
      FROM parte_deco_afeccion pda
      JOIN parte_decomisada pd ON pda.id_parte_decomisada = pd.id_parte_decomisada
      JOIN tipo_parte_deco tp ON pd.id_tipo_parte = tp.id_tipo_parte
      JOIN afeccion a ON pda.id_afeccion = a.id_afeccion
      ORDER BY tp.nombre_tipo_parte, pd.nombre_parte, a.descripcion;
    `);

    res.json(result.rows || []);
  } catch (err) {
    console.error('❌ Error al obtener combinaciones:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// 📦 Cargar todos los tipos, partes y afecciones desde la base
const obtenerDatosBaseDecomiso = async (req, res) => {
  try {
    const [tiposParte, partes, afecciones] = await Promise.all([
      pool.query(`
        SELECT id_tipo_parte_deco, nombre_tipo_parte
        FROM tipo_parte_deco
        WHERE estado = true
        ORDER BY nombre_tipo_parte;
      `),
      pool.query(`
        SELECT id_parte_decomisada, nombre_parte, id_tipo_parte_deco
        FROM parte_decomisada
        WHERE estado = true
        ORDER BY nombre_parte;
      `),
      pool.query(`
        SELECT id_afeccion, descripcion
        FROM afeccion
        ORDER BY descripcion;
      `),
    ]);

    res.json({
      tiposParte: tiposParte.rows,
      partes: partes.rows,
      afecciones: afecciones.rows,
    });
  } catch (err) {
    console.error('❌ Error al obtener datos base de decomiso:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// 📄 Obtener info de faena desde un id_decomiso
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
    console.error('❌ Error al obtener info de faena:', error.message);
    res.status(500).json({ error: 'Error al obtener info de faena' });
  }
};

// 📝 Registrar decomiso y crear combinación parte + afección si no existe
const registrarDecomiso = async (req, res) => {
  const detalles = req.body;

  try {
    const { id_faena_detalle } = detalles[0];

    if (!id_faena_detalle) {
      return res.status(400).json({ error: 'Falta id_faena_detalle' });
    }

    // Paso 1: Insertar en decomiso
    const result = await pool.query(
      `INSERT INTO decomiso (id_faena_detalle) VALUES ($1) RETURNING id_decomiso`,
      [id_faena_detalle],
    );

    const id_decomiso = result.rows[0].id_decomiso;

    // Paso 2: Insertar cada detalle
    for (const d of detalles) {
      // Verificar si la combinación parte + afección existe
      const existe = await pool.query(
        `SELECT 1 FROM parte_deco_afeccion
   WHERE id_parte_decomisada = $1 AND id_afeccion = $2`,
        [d.id_parte_decomisada, d.id_afeccion],
      );

      if (existe.rowCount === 0) {
        await pool.query(
          `INSERT INTO parte_deco_afeccion (id_parte_decomisada, id_afeccion)
     VALUES ($1, $2)`,
          [d.id_parte_decomisada, d.id_afeccion],
        );
      }

      // Insertar detalle del decomiso
      await pool.query(
        `INSERT INTO decomiso_detalle (
          id_decomiso,
          id_parte_decomisada,
          id_afeccion,
          cantidad,
          animales_afectados,
          peso_kg,
          destino_decomiso,
          observaciones
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          id_decomiso,
          d.id_parte_decomisada,
          d.id_afeccion,
          d.cantidad,
          d.animales_afectados,
          d.peso_kg || null,
          d.destino_decomiso || null,
          d.observaciones || null,
        ],
      );
    }

    res.status(201).json({ id_decomiso });
  } catch (error) {
    console.error('❌ Error al registrar decomisos:', error.message);
    res.status(500).json({ error: 'Error al registrar decomisos' });
  }
};

module.exports = {
  obtenerCombinaciones,
  obtenerDatosBaseDecomiso,
  obtenerInfoFaenaPorDecomiso,
  registrarDecomiso,
};
