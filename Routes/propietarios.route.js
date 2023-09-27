const express = require('express');
const router = express();
const {getPropietarios, createPropietarios, editPropietarios,deletePropietarios, getPropietariosByEstado} = require('../Controllers/propietarios.controller');

//rutas de CRUD 
router.get('/all', getPropietarios);
router.post('/create', createPropietarios);
router.put('/edit', editPropietarios);
router.delete('/delete/:id',deletePropietarios); 
router.get('/allbyStatus/:Estado', getPropietariosByEstado)

module.exports = router;