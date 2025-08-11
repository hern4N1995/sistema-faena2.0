const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Clave secreta para firmar el token (usala desde .env en producción)
const JWT_SECRET = process.env.JWT_SECRET; // <-- Cambiala en producción

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Buscar el usuario por email
    const result = await pool.query(
      'SELECT * FROM usuario WHERE email = $1',
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
      { expiresIn: '1d' }
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
      },
    });

    console.log(req.body);
    console.log("Email recibido:", email);
    console.log("Resultado DB:", result.rows);
    console.log("Usuario encontrado:", usuario.email);
    console.log("Rol del usuario:", usuario.id_rol);
    console.log(`Login exitoso para ${usuario.email} con rol ${usuario.id_rol}`);


  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
