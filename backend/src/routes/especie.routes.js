const express = require('express');
const router = express.Router();
const { getEspecies } = require('../controllers/especie.controller');

router.get('/', getEspecies);

module.exports = router;
