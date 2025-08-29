const pool = require('../db');

// Obtener todos los departamentos con nombre de provincia
const obtenerDepartamentos = async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT 
        d.id_departamento, 
        d.nombre_departamento AS departamento, 
        p.descripcion AS provincia
      FROM departamento d
      JOIN provincia p ON d.id_provincia = p.id_provincia
      ORDER BY p.descripcion, d.nombre_departamento
    `);
    res.status(200).json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener departamentos:', error.message);
    res.status(500).json({ error: 'Error al obtener departamentos' });
  }
};

// Crear nuevo departamento con id_provincia
const crearDepartamento = async (req, res) => {
  const { nombre_departamento, id_provincia } = req.body;

  try {
    await pool.query(
      'INSERT INTO departamento (nombre_departamento, id_provincia) VALUES ($1, $2)',
      [nombre_departamento.trim(), id_provincia],
    );
    res.status(201).json({ mensaje: 'Departamento creado correctamente' });
  } catch (error) {
    console.error('Error al crear departamento:', error.message);
    res.status(500).json({ error: 'Error al crear departamento' });
  }
};

// Editar nombre del departamento
const editarDepartamento = async (req, res) => {
  const { id } = req.params;
  const { nombre_departamento } = req.body;

  try {
    await pool.query(
      'UPDATE departamento SET nombre_departamento = $1 WHERE id_departamento = $2',
      [nombre_departamento.trim(), id],
    );
    res.status(200).json({ mensaje: 'Departamento actualizado' });
  } catch (error) {
    console.error('Error al editar departamento:', error.message);
    res.status(500).json({ error: 'Error al editar departamento' });
  }
};

// Eliminar departamento
const eliminarDepartamento = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM departamento WHERE id_departamento = $1', [
      id,
    ]);
    res.status(200).json({ mensaje: 'Departamento eliminado' });
  } catch (error) {
    console.error('Error al eliminar departamento:', error.message);
    res.status(500).json({ error: 'Error al eliminar departamento' });
  }
};

module.exports = {
  obtenerDepartamentos,
  crearDepartamento,
  editarDepartamento,
  eliminarDepartamento,
};
