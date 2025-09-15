const pool = require('../db');
const bcrypt = require('bcrypt');

// Obtener todos los usuarios con nombre de planta
const obtenerUsuarios = async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT u.*, p.nombre AS planta_nombre
      FROM usuario u
      LEFT JOIN planta p ON u.id_planta = p.id_planta
      WHERE u.estado = true
    `);
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// Crear nuevo usuario
const crearUsuario = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      dni,
      email,
      password,
      rol,
      estado,
      id_planta,
      n_telefono,
    } = req.body;

    const estadoBooleano = normalizarEstado(estado);
    const contraseniaHasheada = await bcrypt.hash(password, 10);
    const id_rol = mapRol(rol);
    const id_planta_num = parseInt(id_planta, 10);
    if (!id_planta || isNaN(id_planta_num)) {
      console.warn('ID de planta inválido recibido:', id_planta);
      return res.status(400).json({ error: 'Planta inválida' });
    }

    const resultado = await pool.query(
      `INSERT INTO usuario (
        nombre, apellido, dni, email, contrasenia,
        id_rol, estado, id_planta, n_telefono, creado_en
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, NOW()
      ) RETURNING *`,
      [
        nombre,
        apellido,
        dni,
        email,
        contraseniaHasheada,
        id_rol,
        estadoBooleano,
        id_planta_num,
        n_telefono,
      ],
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
    const {
      nombre,
      apellido,
      dni,
      email,
      password,
      rol,
      estado,
      id_planta,
      n_telefono,
    } = req.body;

    const estadoBooleano = normalizarEstado(estado);
    const id_rol = mapRol(rol);
    const id_planta_num = parseInt(id_planta, 10);
    if (!id_planta || isNaN(id_planta_num)) {
      console.warn('ID de planta inválido recibido:', id_planta);
      return res.status(400).json({ error: 'Planta inválida' });
    }

    let query;
    let params;

    if (password && password.trim() !== '') {
      const contraseniaHasheada = await bcrypt.hash(password, 10);
      query = `
        UPDATE usuario SET
          nombre = $1, apellido = $2, dni = $3, email = $4,
          contrasenia = $5, id_rol = $6, estado = $7,
          id_planta = $8, n_telefono = $9
        WHERE id_usuario = $10 RETURNING *`;
      params = [
        nombre,
        apellido,
        dni,
        email,
        contraseniaHasheada,
        id_rol,
        estadoBooleano,
        id_planta_num,
        n_telefono,
        id,
      ];
    } else {
      query = `
        UPDATE usuario SET
          nombre = $1, apellido = $2, dni = $3, email = $4,
          id_rol = $5, estado = $6,
          id_planta = $7, n_telefono = $8
        WHERE id_usuario = $9 RETURNING *`;
      params = [
        nombre,
        apellido,
        dni,
        email,
        id_rol,
        estadoBooleano,
        id_planta_num,
        n_telefono,
        id,
      ];
    }

    const resultado = await pool.query(query, params);
    res.json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

// Eliminar usuario (soft delete)
const eliminarUsuario = async (req, res) => {
  try {
    const id_usuario = parseInt(req.params.id, 10);

    if (isNaN(id_usuario)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    const resultado = await pool.query(
      'UPDATE usuario SET estado = false WHERE id_usuario = $1',
      [id_usuario],
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Usuario desactivado correctamente' });
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    res.status(500).json({ error: 'Error al desactivar usuario' });
  }
};

// Mapear rol desde string a número
const mapRol = (rol) => {
  if (typeof rol !== 'string') return 3;

  switch (rol.toLowerCase()) {
    case 'superadmin':
      return 1;
    case 'supervisor':
      return 2;
    case 'usuario':
      return 3;
    default:
      return 3;
  }
};

// Normalizar estado desde string, boolean o número
function normalizarEstado(valor) {
  if (typeof valor === 'boolean') return valor;
  if (typeof valor === 'string') {
    const limpio = valor.trim().toLowerCase();
    return limpio === 'activo' || limpio === 'true' || limpio === '1';
  }
  if (typeof valor === 'number') return valor === 1;
  return false;
}

module.exports = {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
};
