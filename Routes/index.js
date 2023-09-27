const express = require('express');
const router = express();
const auth = require('./auth.route');
const propietarios = require('./propietarios.route');
router.use('/auth', auth);
router.use('/propietarios', propietarios)
module.exports = router; 