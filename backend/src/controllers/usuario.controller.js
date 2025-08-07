// src/controllers/usuario.controller.js
const pool = require('../db');
const bcrypt = require('bcrypt');

// Obtener todos los usuarios
const obtenerUsuarios = async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM usuario WHERE estado = true');
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
    const estadoBooleano = typeof estado === 'string' && estado.toLowerCase() === 'Activo';


    const contraseniaHasheada = await bcrypt.hash(password, 10);

    const resultado = await pool.query(
      `INSERT INTO usuario (nombre, apellido, dni, email, contrasenia, id_rol, estado)
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
    const { nombre, apellido, dni, email, password, rol, estado } = req.body;
    const estadoBooleano = typeof estado === 'string' && estado.toLowerCase() === 'Activo';


    let query = `
  UPDATE usuario SET nombre = $1, apellido = $2, dni = $3, email = $4, contrasenia = $5, id_rol = $6, estado = $7
  WHERE id_usuario = $8 RETURNING *`;
params = [nombre, apellido, dni, email, contraseniaHasheada, mapRol(rol), estadoBooleano, id];
    if (password) {
      const contraseniaHasheada = await bcrypt.hash(password, 10);
      query = `
        UPDATE usuario SET nombre = $1, apellido = $2, dni = $3, email = $4, contrasenia = $5, id_rol = $6, estado = $7
        WHERE id_usuario = $8 RETURNING *`;
      params = [nombre, apellido, dni, email, contraseniaHasheada, mapRol(rol), estadoBooleano, id];
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
    const id_usuario = parseInt(req.params.id_usuario, 10);

    if (isNaN(id_usuario)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }
    
    await pool.query(
      'UPDATE usuario SET estado = false WHERE id_usuario = $1',
      [id_usuario]
    );

    res.status(200).json({ message: 'Usuario desactivado correctamente' });
  } catch (error) {
   console.error('Error al desactivar usuario:', error);
    res.status(500).json({ error: 'Error al desactivar usuario' });
  }
};

// Mapear rol desde string a número
const mapRol = (rol) => {
  if (typeof rol !== 'string') return 2; // Rol por defecto: 'usuario'
  
  switch (rol.toLowerCase()) {
    case 'supervisor':
      return 1;
    case 'usuario':
      return 2;
    default:
      return 3;
  }
};

module.exports = {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
};
