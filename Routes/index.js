const express = require('express');
const router = express();
const auth = require('./auth.route');
const propietarios = require('./propietarios.route');
const viviendas = require('./viviendas.route');
const facturas = require('./facturas.route');
const servicios = require('./servicios.route');
router.use('/auth', auth);
router.use('/propietarios', propietarios);
router.use('/viviendas', viviendas); 
router.use('/facturas',facturas);
router.use('/servicios',servicios);
module.exports = router; 