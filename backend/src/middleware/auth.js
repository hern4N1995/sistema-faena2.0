// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET; // Usar process.env en producción
const isProduction = process.env.NODE_ENV === 'production';

exports.verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    console.warn('[AUTH] Token no proporcionado en Authorization header');
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    if (!JWT_SECRET) {
      console.error('[AUTH] JWT_SECRET no configurado!');
      throw new Error('JWT_SECRET no está configurado');
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id_usuario, rol }
    if (!isProduction) {
      console.log('[AUTH] Token verificado para usuario:', decoded.id_usuario);
    }
    next();
  } catch (error) {
    console.error('[AUTH] Error al verificar token:', error.message, 'JWT_SECRET definido:', !!JWT_SECRET);
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
};
