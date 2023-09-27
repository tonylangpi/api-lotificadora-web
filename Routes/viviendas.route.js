const express = require('express');
const router = express();
const {  getViviendas,
    createViviendas,
    editViviendas,
    deleteViviendas,
    getViviendabyId} = require('../Controllers/viviendas.controller');

//rutas de CRUD 
router.get('/all', getViviendas);
router.post('/create', createViviendas);
router.put('/edit', editViviendas);
router.delete('/delete/:id',deleteViviendas); 
router.get('/detallevivienda/:codigo', getViviendabyId);

module.exports = router;