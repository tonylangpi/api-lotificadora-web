const express = require('express');
const router = express();
const {getInfoEncabezadosFactura} = require('../Controllers/facturas.controller');

//rutas de CRUD 
router.get('/all', getInfoEncabezadosFactura);
// router.post('/create', createPropietarios);
// router.put('/edit', editPropietarios);
// router.delete('/delete/:id',deletePropietarios); 
// router.get('/allbyStatus/:Estado', getPropietariosByEstado)

module.exports = router;