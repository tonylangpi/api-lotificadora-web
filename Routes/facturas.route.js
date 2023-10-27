const express = require('express');
const router = express();
const {getInfoEncabezadosFactura, createFacturaEncabezado, deleteEncabezado, facturasDetalle, createDetallesFactura, deleteDetalles, ConsultaFacturaCliente, facturasPendientesMes, sendMailCliente, pagarFactura, generarPdf} = require('../Controllers/facturas.controller');

//rutas de CRUD 
router.get('/all', getInfoEncabezadosFactura);
router.post('/create', createFacturaEncabezado);
router.delete('/delete/:id',deleteEncabezado); 
router.get('/facturasdetalle/:idencabezado', facturasDetalle);
router.post('/createDetalles',createDetallesFactura); 
router.delete('/deleteDetalle/:id',deleteDetalles); 
router.post('/consultafactcliente', ConsultaFacturaCliente); 
router.get('/facturasPendientesMes/:year', facturasPendientesMes); 
router.post('/sendmail',sendMailCliente);
router.post('/pagarFactura', pagarFactura); 
router.get('/generarReporte',generarPdf);
module.exports = router;