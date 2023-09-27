const express = require('express');
const router = express();
const {login, createUser, getUser} = require('../Controllers/auth.controller');

//rutas de CRUD 
router.post('/login', login);
router.post('/createUser', createUser);
router.get('/validate',  getUser)
module.exports = router;