const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/auth');
const { permitirRoles } = require('../middleware/roles');
const {
  obtenerCombinaciones,
  obtenerInfoFaenaPorDecomiso,
  registrarDecomiso,
  obtenerDatosBaseDecomiso, // ✅ nuevo controlador
  obtenerResumenDecomiso,
  listarDecomisos,
} = require('../controllers/decomisos.controller');

// 📄 Info de faena por decomiso
router.get(
  '/:id_decomiso/info-faena',
  verificarToken,
  permitirRoles(1, 2, 3),
  obtenerInfoFaenaPorDecomiso,
);

// 📦 Datos base para desplegables (tipo, parte, afección)
router.get(
  '/datos-base',
  verificarToken,
  permitirRoles(1, 2, 3),
  obtenerDatosBaseDecomiso,
);

// 📋 Resumen de decomiso por ID
router.get('/:id/resumen', verificarToken, permitirRoles(1, 2, 3), obtenerResumenDecomiso);

// 📝 Lista de todos los decomisos cargados
router.get('/', verificarToken, permitirRoles(1, 2, 3), listarDecomisos);

// 🔍 Combinaciones ya registradas en parte_deco_afeccion (DEPRECATED - usar /decomisos)
// router.get('/', verificarToken, permitirRoles(1), obtenerCombinaciones);

// 📝 Registrar decomiso
router.post('/', verificarToken, permitirRoles(1, 2, 3), registrarDecomiso);

module.exports = router;
