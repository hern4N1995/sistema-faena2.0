const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Clave secreta para firmar el token (usala desde .env en producción)
const JWT_SECRET = process.env.JWT_SECRET; // <-- Cambiala en producción
const isProduction = process.env.NODE_ENV === 'production';

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Solo buscar usuarios activos
    const result = await pool.query(
      'SELECT * FROM usuario WHERE email = $1 AND estado = true',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const usuario = result.rows[0];

    // 2. Verificar contraseña
    const esValida = await bcrypt.compare(password, usuario.contrasenia);
    if (!esValida) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 3. Generar token JWT
    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, rol: usuario.id_rol },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // 4. Devolver token + user básico
    res.json({
      token,
      user: {
        id: usuario.id_usuario,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.id_rol,
        id_planta: usuario.id_planta,
      },
    });

    if (!isProduction) {
      console.log('[AUTH] Login exitoso:', {
        id_usuario: usuario.id_usuario,
        email: usuario.email,
        rol: usuario.id_rol,
        id_planta: usuario.id_planta,
        token_expira_en: '30d',
      });
    }


  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
