const express = require('express');
const router = express();
const auth = require('./auth.route');
const propietarios = require('./propietarios.route');
const viviendas = require('./viviendas.route');
const facturas = require('./facturas.route')
router.use('/auth', auth);
router.use('/propietarios', propietarios);
router.use('/viviendas', viviendas); 
router.use('/facturas',facturas);
module.exports = router; 