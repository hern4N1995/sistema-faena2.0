const pool = require('../db');

// Listar veterinarios activos (mapeando columnas reales a los nombres que usa el frontend)
const obtenerVeterinarios = async (req, res) => {
  try {
    const q = `
      SELECT
        id_veterinario,
        nombre_vet   AS nombre,
        apellido_vet AS apellido,
        matricula,
        dni,
        email,
        n_telefono,
        estado,
        fecha_creacion AS creado_en
      FROM veterinario
      WHERE estado = true
      ORDER BY apellido_vet, nombre_vet
    `;
    const result = await pool.query(q);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener veterinarios:', error);
    res.status(500).json({ error: 'Error al obtener veterinarios' });
  }
};

const obtenerVeterinarioPorId = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  try {
    const q = `
      SELECT
        id_veterinario,
        nombre_vet   AS nombre,
        apellido_vet AS apellido,
        matricula,
        dni,
        email,
        n_telefono,
        estado,
        fecha_creacion AS creado_en
      FROM veterinario
      WHERE id_veterinario = $1 AND estado = true
    `;
    const result = await pool.query(q, [id]);
    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Veterinario no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener veterinario por id:', error);
    res.status(500).json({ error: 'Error al obtener veterinario' });
  }
};

const crearVeterinario = async (req, res) => {
  try {
    const {
      nombre, // frontend envía "nombre"
      apellido,
      matricula,
      dni,
      email,
      n_telefono,
      estado = 'Activo',
    } = req.body;

    if (!nombre || !apellido || !matricula) {
      return res
        .status(400)
        .json({ error: 'nombre, apellido y matricula son obligatorios' });
    }

    const estadoBooleano =
      typeof estado === 'boolean'
        ? estado
        : String(estado).toLowerCase() === 'activo';

    // Prevenir duplicado por matrícula
    const dup = await pool.query(
      'SELECT 1 FROM veterinario WHERE matricula = $1 AND estado = true',
      [matricula],
    );
    if (dup.rowCount > 0) {
      return res
        .status(409)
        .json({ error: 'Ya existe un veterinario con esa matrícula' });
    }

    const q = `
      INSERT INTO veterinario
        (nombre_vet, apellido_vet, matricula, dni, email, n_telefono, estado, fecha_creacion)
      VALUES
        ($1,$2,$3,$4,$5,$6,$7,NOW())
      RETURNING
        id_veterinario,
        nombre_vet   AS nombre,
        apellido_vet AS apellido,
        matricula,
        dni,
        email,
        n_telefono,
        estado,
        fecha_creacion AS creado_en
    `;
    const params = [
      nombre,
      apellido,
      matricula,
      dni || null,
      email || null,
      n_telefono || null,
      estadoBooleano,
    ];

    const result = await pool.query(q, params);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear veterinario:', error);
    res.status(500).json({ error: 'Error al crear veterinario' });
  }
};

const actualizarVeterinario = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const {
      nombre,
      apellido,
      matricula,
      dni,
      email,
      n_telefono,
      estado = 'Activo',
    } = req.body;

    if (!nombre || !apellido || !matricula) {
      return res
        .status(400)
        .json({ error: 'nombre, apellido y matricula son obligatorios' });
    }

    const estadoBooleano =
      typeof estado === 'boolean'
        ? estado
        : String(estado).toLowerCase() === 'activo';

    const q = `
      UPDATE veterinario SET
        nombre_vet = $1,
        apellido_vet = $2,
        matricula = $3,
        dni = $4,
        email = $5,
        n_telefono = $6,
        estado = $7
      WHERE id_veterinario = $8
      RETURNING
        id_veterinario,
        nombre_vet   AS nombre,
        apellido_vet AS apellido,
        matricula,
        dni,
        email,
        n_telefono,
        estado,
        fecha_creacion AS creado_en
    `;
    const params = [
      nombre,
      apellido,
      matricula,
      dni || null,
      email || null,
      n_telefono || null,
      estadoBooleano,
      id,
    ];

    const result = await pool.query(q, params);
    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Veterinario no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar veterinario:', error);
    res.status(500).json({ error: 'Error al actualizar veterinario' });
  }
};

const eliminarVeterinario = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  try {
    const result = await pool.query(
      'UPDATE veterinario SET estado = false WHERE id_veterinario = $1 RETURNING id_veterinario',
      [id],
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Veterinario no encontrado' });
    res.json({ message: 'Veterinario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar veterinario:', error);
    res.status(500).json({ error: 'Error al eliminar veterinario' });
  }
};

module.exports = {
  obtenerVeterinarios,
  obtenerVeterinarioPorId,
  crearVeterinario,
  actualizarVeterinario,
  eliminarVeterinario,
};
