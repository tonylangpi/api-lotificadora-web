const express = require('express');
const router = express();
const {getInfoEncabezadosFactura, createFacturaEncabezado, deleteEncabezado} = require('../Controllers/facturas.controller');

//rutas de CRUD 
router.get('/all', getInfoEncabezadosFactura);
router.post('/create', createFacturaEncabezado);
// router.put('/edit', editPropietarios);
router.delete('/delete/:id',deleteEncabezado); 
// router.get('/allbyStatus/:Estado', getPropietariosByEstado)

module.exports = router;