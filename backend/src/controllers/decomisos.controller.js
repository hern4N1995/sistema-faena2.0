const pool = require('../db');

// 🔍 Cargar combinaciones ya registradas en parte_deco_afeccion
const obtenerCombinaciones = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        tp.id_tipo_parte_deco,
        tp.nombre_tipo_parte AS tipo_parte,
        pd.id_parte_decomisada,
        pd.nombre_parte AS parte,
        a.id_afeccion,
        a.descripcion AS afeccion
      FROM parte_deco_afeccion pda
      JOIN parte_decomisada pd ON pda.id_parte_decomisada = pd.id_parte_decomisada
      JOIN tipo_parte_deco tp ON pd.id_tipo_parte_deco = tp.id_tipo_parte_deco
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

// Obtener resumen decomiso
const obtenerResumenDecomiso = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT
        d.id_decomiso,
        fd.id_faena_detalle,
        t.n_tropa,
        t.dte_dtu,
        f.fecha_faena,
        fd.cantidad_faena,
        dd.id_decomiso_detalle,
        dd.cantidad,
        dd.peso_kg,
        dd.animales_afectados,
        dd.destino_decomiso,
        dd.observaciones,
        tp.nombre_tipo_parte,
        pd.nombre_parte,
        a.descripcion AS afeccion
      FROM decomiso d
      JOIN faena_detalle fd ON d.id_faena_detalle = fd.id_faena_detalle
      JOIN tropa_detalle td ON fd.id_tropa_detalle = td.id_tropa_detalle
      JOIN tropa t ON t.id_tropa = td.id_tropa
      JOIN decomiso_detalle dd ON d.id_decomiso = dd.id_decomiso
      JOIN parte_decomisada pd ON dd.id_parte_decomisada = pd.id_parte_decomisada
      JOIN tipo_parte_deco tp ON pd.id_tipo_parte_deco = tp.id_tipo_parte_deco
      JOIN afeccion a ON dd.id_afeccion = a.id_afeccion
      JOIN faena f ON f.id_faena = fd.id_faena
      WHERE d.id_decomiso = $1`,
      [id],
    );

    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error al obtener resumen:', err.message);
    res.status(500).json({ error: 'Error al obtener resumen del decomiso' });
  }
};

const listarDecomisos = async (req, res) => {
  try {
    // Limitar a 100 decomisos para evitar timeouts (paginación en frontend)
    const limit = 100;
    const result = await pool.query(`
      SELECT 
        d.id_decomiso,
        f.id_faena,
        f.fecha_faena,
        f.fecha_faena AS fecha,
        t.n_tropa,
        t.dte_dtu,
        t.id_planta,
        td.cantidad AS cantidad_tropa,
        fd.cantidad_faena,
        dd.id_decomiso_detalle,
        dd.cantidad,
        dd.peso_kg,
        dd.animales_afectados,
        dd.destino_decomiso,
        dd.observaciones,
        tp.nombre_tipo_parte,
        pd.nombre_parte,
        a.descripcion AS afeccion
      FROM decomiso d
      JOIN faena_detalle fd ON d.id_faena_detalle = fd.id_faena_detalle
      JOIN faena f ON fd.id_faena = f.id_faena
      JOIN tropa_detalle td ON fd.id_tropa_detalle = td.id_tropa_detalle
      JOIN tropa t ON td.id_tropa = t.id_tropa
      LEFT JOIN decomiso_detalle dd ON d.id_decomiso = dd.id_decomiso
      LEFT JOIN parte_decomisada pd ON dd.id_parte_decomisada = pd.id_parte_decomisada
      LEFT JOIN tipo_parte_deco tp ON pd.id_tipo_parte_deco = tp.id_tipo_parte_deco
      LEFT JOIN afeccion a ON dd.id_afeccion = a.id_afeccion
      ORDER BY f.fecha_faena DESC, d.id_decomiso DESC
      LIMIT $1;
    `, [limit]);

    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error al listar decomisos:', err.message);
    res.status(500).json({ error: 'Error al listar decomisos' });
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
    if (!Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({ error: 'Payload inválido o vacío' });
    }

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

    // ---------------------------
    // Normalizar y validar payload
    // ---------------------------
    const detallesNormalizados = detalles.map((d) => {
      // parsear peso: aceptar números o strings con coma/punto
      const parsedPeso =
        d.peso_kg !== undefined &&
        d.peso_kg !== null &&
        String(d.peso_kg).trim() !== ''
          ? Number(String(d.peso_kg).replace(',', '.'))
          : NaN;
      const peso = Number.isFinite(parsedPeso) ? parsedPeso : 0;

      // cantidad
      const parsedCantidad =
        d.cantidad !== undefined &&
        d.cantidad !== null &&
        String(d.cantidad).trim() !== ''
          ? Number(String(d.cantidad).replace(',', '.'))
          : NaN;
      const cantidad = Number.isFinite(parsedCantidad) ? parsedCantidad : 0;

      // animales afectadps
      const parsedAnimales =
        d.animales_afectados !== undefined &&
        d.animales_afectados !== null &&
        String(d.animales_afectados).trim() !== ''
          ? Number(String(d.animales_afectados).replace(',', '.'))
          : NaN;
      const animales_afectados = Number.isFinite(parsedAnimales)
        ? parsedAnimales
        : 0;

      return {
        ...d,
        peso_kg: peso,
        cantidad,
        animales_afectados,
      };
    });

    // Paso 2: Insertar cada detalle usando detallesNormalizados
    for (const d of detallesNormalizados) {
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

      // Insertar detalle del decomiso (peso_kg ya es número, no usamos || null que convierta 0 en null)
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
          d.peso_kg,
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
  obtenerResumenDecomiso,
  listarDecomisos,
};
