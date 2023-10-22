const express = require('express');
const router = express();
const {getServicios, createServicios,getServicioById, editServicios,changeStatusServicio} = require('../Controllers/servicios.controller');

//rutas de CRUD 
router.get('/all', getServicios);
router.post('/create', createServicios);
router.get('/servicioById/:id',getServicioById);
router.put('/edit', editServicios);
router.delete('/delete/:id',changeStatusServicio); 

module.exports = router;