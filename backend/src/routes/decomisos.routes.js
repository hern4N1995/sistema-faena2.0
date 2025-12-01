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

// 🔍 Combinaciones ya registradas en parte_deco_afeccion
router.get('/', verificarToken, permitirRoles(1), obtenerCombinaciones);

// 📄 Info de faena por decomiso
router.get(
  '/:id_decomiso/info-faena',
  verificarToken,
  permitirRoles(1),
  obtenerInfoFaenaPorDecomiso,
);

// 📦 Datos base para desplegables (tipo, parte, afección)
router.get(
  '/datos-base',
  verificarToken,
  permitirRoles(1),
  obtenerDatosBaseDecomiso,
);
router.get('/', verificarToken, listarDecomisos);

router.get('/:id/resumen', verificarToken, obtenerResumenDecomiso);

// 📝 Registrar decomiso
router.post('/', verificarToken, permitirRoles(1), registrarDecomiso);

module.exports = router;
