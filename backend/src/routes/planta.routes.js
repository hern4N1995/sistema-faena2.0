// routes/planta.routes.js
const express = require('express');
const { obtenerPlantas } = require('../controllers/planta.controller');
const router = express.Router();

router.get('/', obtenerPlantas);

module.exports = router;
