// src/controllers/usuario.controller.js
const pool = require('../db');
const bcrypt = require('bcrypt');

// Obtener todos los usuarios
const obtenerUsuarios = async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM usuario');
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// Crear nuevo usuario
const crearUsuario = async (req, res) => {
  try {
    const { nombre, apellido, dni, email, password, rol, estado } = req.body;
    const estadoBooleano = estado.toLowerCase() === 'true';

    const contraseniaHasheada = await bcrypt.hash(password, 10);

    const resultado = await pool.query(
      `INSERT INTO usuario (nombre, apellido,dni, email, contrasenia, id_rol, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [nombre, apellido, dni, email, contraseniaHasheada, mapRol(rol), estadoBooleano]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

// Actualizar usuario
const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, password, rol, estado } = req.body;
    const estadoBooleano = estado.toLowerCase() === 'true';

    let query = `
      UPDATE usuario SET nombre = $1, apellido = $2, email = $3, id_rol = $4, estado = $5
      WHERE id_usuario = $6 RETURNING *`;
    let params = [nombre, apellido, email, mapRol(rol), estadoBooleano, id];

    if (password) {
      const contraseniaHasheada = await bcrypt.hash(password, 10);
      query = `
        UPDATE usuario SET nombre = $1, apellido = $2, email = $3, contrasenia = $4, id_rol = $5, estado = $6
        WHERE id_usuario = $7 RETURNING *`;
      params = [nombre, apellido, email, contraseniaHasheada, mapRol(rol), estadoBooleano, id];
    }

    const resultado = await pool.query(query, params);
    res.json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

// Eliminar usuario
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM usuario WHERE id_usuario = $1', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

// Mapear rol desde string a número
const mapRol = (rol) => {
  switch (rol.toLowerCase()) {
    case 'supervisor':
      return 1;
    case 'usuario':
      return 2;
    default:
      return 2;
  }
};

module.exports = {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
};
