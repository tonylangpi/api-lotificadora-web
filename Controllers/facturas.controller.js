const { connection } = require("../Database/bd");
const {transporter}  = require("../services/mailer");
const PDF = require("pdfkit-construct");
require("dotenv").config();

const getInfoEncabezadosFactura = async(req, res) => {
  try {
     const factEncabezado = await connection.query(`SELECT 
     re.idReciboGastoEncabezado as CodigoEncabezado,
     CONCAT(p.nombre, ' ', p.apellido) as Propietario,
     p.correo,
     M.nombreMes as Mes,
     EF.Estado as EstadoPago,
     V.codigo as CodVivienda,
     SUBSTRING(re.fecha_recibo, 1, 10) as fecha_recibo,
     COALESCE(SUM(dc.cuota), 0) AS totalRecibo
 FROM ReciboGastoEncabezado re
 LEFT JOIN ReciboGastoDetalle dc ON re.idReciboGastoEncabezado = dc.idReciboGastoEncabezado
 LEFT JOIN Servicios PDC ON dc.idServicio = PDC.idServicio
 INNER JOIN Mes M ON M.Mesid = re.Mes
 INNER JOIN EstadoFactura EF ON EF.id = re.Estado
 INNER JOIN vivienda V ON V.codigo = re.idVivienda
 INNER JOIN propietarios p ON p.idPropietario = V.idPropietario
 GROUP BY 
     re.idReciboGastoEncabezado,
     CONCAT(p.nombre, ' ', p.apellido), -- Include the CONCAT in the GROUP BY
     p.correo,
     M.nombreMes,
     EF.Estado,
     V.codigo,
     SUBSTRING(re.fecha_recibo, 1, 10)
 ORDER BY re.idReciboGastoEncabezado ASC`); 
     const viviendas = await connection.query(`select v.codigo, CONCAT(p.nombre, ' ', p.apellido) as Propietario, p.Estado as EstadoPropietario from vivienda v
     inner join propietarios p on p.idPropietario = v.idPropietario
     WHERE p.Estado = 'ACTIVO' `); 
      res.json({
         encabezados: factEncabezado[0],
         viviendas : viviendas[0]
      }); 
  } catch (error) {
     console.log(error);
     res.json({message:"algo ocurrio mal"});
  }
};
const facturasDetalle = async(req,res) =>{
  const{idencabezado} = req.params; 
  try {
     const detalleFact = await connection.query(`select RD.idDetalle, S.descripcion, RD.cuota from ReciboGastoDetalle RD
     inner join Servicios S on S.idServicio = RD.idServicio 
     where RD.idReciboGastoEncabezado = ?`,[idencabezado]); 
     const servicios = await connection.query(`SELECT * FROM Servicios WHERE Estado ='ACTIVO'`); 
     res.json({
       detalles: detalleFact[0],
       servicios: servicios[0]
     })
  } catch (error) {
      console.log(error);
      res.json({message:"algo salio bad"});
  }
}
// const getViviendabyId = async(req, res) => {
//   const { codigo } = req.params;
//   try {
//      const detallevivienda = await  connection.query(
//       `SELECT * FROM  vivienda WHERE codigo = ?`,
//       [codigo]
//     );
//     const propietarios = await connection.query(`SELECT idPropietario, nombre, apellido FROM  propietarios`);
//     res.json({
//       detalleviviendas: detallevivienda[0],
//       propietarios: propietarios[0]
//     })
//   } catch (error) {
//       console.log(error);
//       res.json({message:"algo salio mal"});
//   }
 
// };
const createFacturaEncabezado = async(req, res) => {
  const {
    Mes,
    idVivienda,
    Estado,
    idUsuario,
  } = req.body;

  try {
    if (
      !Mes ||
      !idVivienda ||
      !Estado ||
      !idUsuario
    ) {
      res.json({
        message: "Faltan datos",
      });
    } else {
       const FacturaExistenteDeMes = await connection.query(`select * from ReciboGastoEncabezado where idVivienda = ? and Estado = ? and Mes = ?`,[idVivienda,Estado,Mes]);
       if(FacturaExistenteDeMes[0].length > 0){
           res.json({message:"ya generaste una factura no pagada con el mes actual, si te equivocaste deberias anularla y volverla a crear"});
       }else{
        const FacturaExistenteDeMesPagada = await connection.query(`select * from ReciboGastoEncabezado where idVivienda = ? and Estado = ? and Mes = ?`,[idVivienda,1,Mes]);
        if(FacturaExistenteDeMesPagada[0].length > 0){
           res.json({message:"ya fue pagada esta factura con el mes actual y el numero de vivienda actual"});
        }else{
          await connection.query(
            "INSERT INTO ReciboGastoEncabezado SET ?",
            {
              Mes: Mes,
              idVivienda: idVivienda,
              Estado: Estado,
              idUsuario: idUsuario,
            }
          );
          res.json({message:`Encabezado creado satisfactoriamente`});
        }
       }
      }
  } catch (error) {
    console.log(error);
  }
};
const createDetallesFactura = async(req, res) => {
  const {
    idReciboGastoEncabezado,
    idServicio,
    cuota,
  } = req.body;

  try {
    if (
      !idReciboGastoEncabezado ||
      !idServicio ||
      !cuota
    ) {
      res.json({
        message: "Faltan datos",
      });
    } else {
       const ServicioYaRegistrado = await connection.query(`SELECT * FROM ReciboGastoDetalle WHERE idServicio = ? and idReciboGastoEncabezado = ?`,[idServicio,idReciboGastoEncabezado]);
       if(ServicioYaRegistrado[0].length > 0){
         res.json({message:"Este servicio ya se registro como detalle en esta factura"})
       }else{
        await connection.query(
          "INSERT INTO ReciboGastoDetalle SET ?",
          {
            idReciboGastoEncabezado: idReciboGastoEncabezado,
            idServicio: idServicio,
            cuota: cuota,
          }
        );
        res.json({message:`Detalle creado satisfactoriamente`});
       }
      }
  } catch (error) {
    console.log(error);
  }
};
// const editViviendas = (req, res) => {
//   const {
//     Codigo,
//     descripcion,
//     CantidadHabitantes,
//     medidas,
//     idPropietario,
//     idUsuario,
//   } = req.body;
//   try {
//     connection.query(
//       "UPDATE vivienda SET ? WHERE codigo = ?",
//       [
//         {
//           codigo: Codigo,
//           descripcion: descripcion,
//           CantidadHabitantes: CantidadHabitantes,
//           medidas: medidas,
//           idPropietario: idPropietario,
//           idUsuario: idUsuario,
//         },
//         Codigo,
//       ]
//     );
//     res.json({message:"vivienda editada correctamente"});
//   } catch (error) {
//     console.log(error);
//   }
// };

const deleteEncabezado = async(req, res) => {
  const { id } = req.params;//pedimos el id de la vivienda 
  const anulado = 3;
  try {
    await connection.query(`UPDATE ReciboGastoEncabezado SET Estado = ${anulado} WHERE idReciboGastoEncabezado = ?`,
   [id]);
    res.json({message:"Factura anulada"});
  } catch (error) {
    res.json(error);
  }
};

const deleteDetalles = async(req, res) => {
  const { id } = req.params;//pedimos el id del detalle 

  try {
    connection.query(`DELETE FROM ReciboGastoDetalle WHERE idDetalle = ?`,[id]);
     res.json({message:"DETALLE ELIMINADO"});
  } catch (error) {
    res.json(error);
  }
};

const ConsultaFacturaCliente = async(req, res)=>{
  const{mes, year, viviendacod} = req.body; 
  try {
     const verificarVivienda = await connection.query(`select * from vivienda where codigo = ?`,[viviendacod]); 
     if(verificarVivienda[0]?.length > 0){
      const  [rows] = await connection.query(`SELECT 
      re.idReciboGastoEncabezado as CodigoEncabezado,
      CONCAT(p.nombre, ' ', p.apellido) as Propietario,
      p.correo,
      M.nombreMes as Mes,
      EF.Estado as EstadoPago,
      V.codigo as CodVivienda,
      SUBSTRING(re.fecha_recibo, 1, 10) as fecha_recibo,
      COALESCE(SUM(dc.cuota), 0) AS totalRecibo
  FROM ReciboGastoEncabezado re
  LEFT JOIN ReciboGastoDetalle dc ON re.idReciboGastoEncabezado = dc.idReciboGastoEncabezado
  LEFT JOIN Servicios PDC ON dc.idServicio = PDC.idServicio
  INNER JOIN Mes M ON M.Mesid = re.Mes
  INNER JOIN EstadoFactura EF ON EF.id = re.Estado
  INNER JOIN vivienda V ON V.codigo = re.idVivienda
  INNER JOIN propietarios p ON p.idPropietario = V.idPropietario
    where MONTH(re.fecha_recibo) = ? AND YEAR(re.fecha_recibo) = ? AND re.idVivienda =  ? AND re.Estado = 2
  GROUP BY 
      re.idReciboGastoEncabezado,
      CONCAT(p.nombre, ' ', p.apellido), -- Include the CONCAT in the GROUP BY
      p.correo,
      M.nombreMes,
      EF.Estado,
      V.codigo,
      SUBSTRING(re.fecha_recibo, 1, 10)
  ORDER BY re.idReciboGastoEncabezado ASC`,[mes,year,viviendacod]);
      const registros = rows[0]; 
      if(rows.length > 0){
        const detalleFact = await connection.query(`select RD.idDetalle, S.descripcion, RD.cuota from ReciboGastoDetalle RD
        inner join Servicios S on S.idServicio = RD.idServicio 
        where RD.idReciboGastoEncabezado = ?`,[registros?.CodigoEncabezado]); 
         res.json({
           encabezado: rows,
           detalle: detalleFact[0]
         })
      }else{
        res.json({message:"no han generado la factura del mes"}); 
      } 
     }else{
        res.json({message:"El numero de vivienda ingresado no esta registrado en el sistema"}); 
     }
  } catch (error) {
      console.log(error); 
      res.json(error); 
  }
}

const facturasPendientesMes = async(req,res) =>{
  const{year}  = req.params; 
  try {
    const  [rows] = await connection.query(`SELECT 
    re.idReciboGastoEncabezado as CodigoEncabezado,
    CONCAT(p.nombre, ' ', p.apellido) as Propietario,
    p.correo,
    M.nombreMes as Mes,
    EF.Estado as EstadoPago,
    V.codigo as CodVivienda,
    SUBSTRING(re.fecha_recibo, 1, 10) as fecha_recibo,
    COALESCE(SUM(dc.cuota), 0) AS totalRecibo
FROM ReciboGastoEncabezado re
LEFT JOIN ReciboGastoDetalle dc ON re.idReciboGastoEncabezado = dc.idReciboGastoEncabezado
LEFT JOIN Servicios PDC ON dc.idServicio = PDC.idServicio
INNER JOIN Mes M ON M.Mesid = re.Mes
INNER JOIN EstadoFactura EF ON EF.id = re.Estado
INNER JOIN vivienda V ON V.codigo = re.idVivienda
INNER JOIN propietarios p ON p.idPropietario = V.idPropietario
 where YEAR(re.fecha_recibo) = 2023 AND re.Estado = 2
GROUP BY 
    re.idReciboGastoEncabezado,
    CONCAT(p.nombre, ' ', p.apellido), -- Include the CONCAT in the GROUP BY
    p.correo,
    M.nombreMes,
    EF.Estado,
    V.codigo,
    SUBSTRING(re.fecha_recibo, 1, 10)
ORDER BY re.idReciboGastoEncabezado ASC`,[year]);
    res.json(rows);
  } catch (error) {
     console.log(error); 
     res.json({message:"algo salio mal"}); 
  }
}

const sendMailCliente = async(req,res) =>{
   const {correo, viviendacod,mes, year} = req.body; 
  try {
    const  [rows] = await connection.query(`SELECT 
    re.idReciboGastoEncabezado as CodigoEncabezado,
    CONCAT(p.nombre, ' ', p.apellido) as Propietario,
    p.correo,
    M.nombreMes as Mes,
    EF.Estado as EstadoPago,
    V.codigo as CodVivienda,
    SUBSTRING(re.fecha_recibo, 1, 10) as fecha_recibo,
    COALESCE(SUM(dc.cuota), 0) AS totalRecibo
FROM ReciboGastoEncabezado re
LEFT JOIN ReciboGastoDetalle dc ON re.idReciboGastoEncabezado = dc.idReciboGastoEncabezado
LEFT JOIN Servicios PDC ON dc.idServicio = PDC.idServicio
INNER JOIN Mes M ON M.Mesid = re.Mes
INNER JOIN EstadoFactura EF ON EF.id = re.Estado
INNER JOIN vivienda V ON V.codigo = re.idVivienda
INNER JOIN propietarios p ON p.idPropietario = V.idPropietario
  where MONTH(re.fecha_recibo) = ? AND YEAR(re.fecha_recibo) = ? AND re.idVivienda =  ? AND re.Estado = 2
GROUP BY 
    re.idReciboGastoEncabezado,
    CONCAT(p.nombre, ' ', p.apellido), -- Include the CONCAT in the GROUP BY
    p.correo,
    M.nombreMes,
    EF.Estado,
    V.codigo,
    SUBSTRING(re.fecha_recibo, 1, 10)
ORDER BY re.idReciboGastoEncabezado ASC`,[mes,year,viviendacod]);
      const registros = rows[0]; 
      if(rows.length > 0){
        const detalleFact = await connection.query(`select RD.idDetalle, S.descripcion, RD.cuota from ReciboGastoDetalle RD
        inner join Servicios S on S.idServicio = RD.idServicio 
        where RD.idReciboGastoEncabezado = ?`,[registros?.CodigoEncabezado]); 
        const result =  await transporter.sendMail({
          from: `Lotificadora ServiHogar ${process.env.EMAIL}`,
          to:correo,
          subject:'Factura de pagos servicios generada',
          html:`<!DOCTYPE html>
          <html>
          <head>
            <title>Factura</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                font-size: 12px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                border: 1px solid black;
                padding: 5px;
              }
              th {
                text-align: center;
              }
            </style>
          </head>
          <body>
            <h1>Factura</h1>
            <p>Fecha: ${registros.fecha_recibo}</p>
            <p>Propietario: ${registros.Propietario}</p>
            <p>Numero de la casa: ${registros.CodVivienda}</p>
            <p>Mes: ${registros.Mes}</p>
            <p>Estado: ${registros.EstadoPago}</p>
            <p>Total a pagar: ${registros.totalRecibo}</p>
            <table>
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>cuota</th>
                </tr>
              </thead>
              <tbody>
               ${detalleFact[0].map(p => 
                `<tr key=${p.idDetalle}>
                 <td>${p.descripcion}</td> 
                 <td>${p.cuota}</td>
                 </tr>`).join('')}
              </tbody>
            </table>
            <h1>Te recordamos que pagues tu factura de gastos por favor</h1>
          </body>
          </html>`
       });
       res.json({message:"correo enviado"}); 
      }else{
        res.json({message:"no han generado la factura del mes"}); 
      } 
  } catch (error) {
     console.log(error); 
     res.json({message:"algo salio mal"}); 
  }
}

const pagarFactura = async(req,res) =>{
  const{idVivienda, encabezadoFactura, nombreTarjeta, numeroTarjeta, expiracion,cvv}  = req.body; 
  const estadoPagado  = 1;
  try {
    const updateFactura = await connection.query(`UPDATE ReciboGastoEncabezado SET Estado = ${estadoPagado} WHERE idReciboGastoEncabezado = ? AND idVivienda = ?`,[encabezadoFactura, idVivienda]); 
    const  [rows] = await connection.query(`SELECT 
    re.idReciboGastoEncabezado as CodigoEncabezado,
    CONCAT(p.nombre, ' ', p.apellido) as Propietario,
    p.correo,
    M.nombreMes as Mes,
    EF.Estado as EstadoPago,
    V.codigo as CodVivienda,
    SUBSTRING(re.fecha_recibo, 1, 10) as fecha_recibo,
    COALESCE(SUM(dc.cuota), 0) AS totalRecibo
FROM ReciboGastoEncabezado re
LEFT JOIN ReciboGastoDetalle dc ON re.idReciboGastoEncabezado = dc.idReciboGastoEncabezado
LEFT JOIN Servicios PDC ON dc.idServicio = PDC.idServicio
INNER JOIN Mes M ON M.Mesid = re.Mes
INNER JOIN EstadoFactura EF ON EF.id = re.Estado
INNER JOIN vivienda V ON V.codigo = re.idVivienda
INNER JOIN propietarios p ON p.idPropietario = V.idPropietario
  where re.idReciboGastoEncabezado = ? AND re.idVivienda =  ?
GROUP BY 
    re.idReciboGastoEncabezado,
    CONCAT(p.nombre, ' ', p.apellido), 
    p.correo,
    M.nombreMes,
    EF.Estado,
    V.codigo,
    SUBSTRING(re.fecha_recibo, 1, 10)
ORDER BY re.idReciboGastoEncabezado ASC;`,[encabezadoFactura, idVivienda] );
    const registros = rows[0]; 
    if(rows.length > 0){
      const detalleFact = await connection.query(`select RD.idDetalle, S.descripcion, RD.cuota from ReciboGastoDetalle RD
      inner join Servicios S on S.idServicio = RD.idServicio 
      where RD.idReciboGastoEncabezado = ?`,[registros?.CodigoEncabezado]); 
      const result =  await transporter.sendMail({
        from: `Lotificadora ServiHogar ${process.env.EMAIL}`,
        to:registros?.correo,
        subject:'Factura de pagos servicios generada',
        html:`<!DOCTYPE html>
        <html>
        <head>
          <title>Factura</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid black;
              padding: 5px;
            }
            th {
              text-align: center;
            }
          </style>
        </head>
        <body>
          <h1>Factura</h1>
          <p>Fecha: ${registros.fecha_recibo}</p>
          <p>Propietario: ${registros.Propietario}</p>
          <p>Numero de la casa: ${registros.CodVivienda}</p>
          <p>Mes: ${registros.Mes}</p>
          <p>Estado: ${registros.EstadoPago}</p>
          <p>Total a pagar: ${registros.totalRecibo}</p>
          <table>
            <thead>
              <tr>
                <th>Descripción</th>
                <th>cuota</th>
              </tr>
            </thead>
            <tbody>
             ${detalleFact[0].map(p => 
              `<tr key=${p.idDetalle}>
               <td>${p.descripcion}</td> 
               <td>${p.cuota}</td>
               </tr>`).join('')}
            </tbody>
          </table>
          <h1>GRACIAS POR PAGAR TU FACTURA</h1>
        </body>
        </html>`
     });
     res.json({message:"PAGO PROCESADO"}); 
    }else{
      res.json({message:"no han generado la factura del mes"}); 
    } 
  } catch (error) {
     console.log(error); 
     res.json({message:"algo salio mal"}); 
  }
}

const generarPdf = async (req, res) => {
  try {
    const facturasEncabezados = await connection.query(
      `SELECT 
      re.idReciboGastoEncabezado as CodigoEncabezado,
      CONCAT(p.nombre, ' ', p.apellido) as Propietario,
      p.correo,
      M.nombreMes as Mes,
      EF.Estado as EstadoPago,
      V.codigo as CodVivienda,
      SUBSTRING(re.fecha_recibo, 1, 10) as fecha_recibo,
      COALESCE(SUM(dc.cuota), 0) AS totalRecibo
  FROM ReciboGastoEncabezado re
  LEFT JOIN ReciboGastoDetalle dc ON re.idReciboGastoEncabezado = dc.idReciboGastoEncabezado
  LEFT JOIN Servicios PDC ON dc.idServicio = PDC.idServicio
  INNER JOIN Mes M ON M.Mesid = re.Mes
  INNER JOIN EstadoFactura EF ON EF.id = re.Estado
  INNER JOIN vivienda V ON V.codigo = re.idVivienda
  INNER JOIN propietarios p ON p.idPropietario = V.idPropietario
  GROUP BY 
      re.idReciboGastoEncabezado,
      CONCAT(p.nombre, ' ', p.apellido), -- Include the CONCAT in the GROUP BY
      p.correo,
      M.nombreMes,
      EF.Estado,
      V.codigo,
      SUBSTRING(re.fecha_recibo, 1, 10)
  ORDER BY re.idReciboGastoEncabezado ASC`
    );
    if (facturasEncabezados[0].length > 0) {
     
      const doc = new PDF({ bufferPages: true, layout: {orientation: 'landscape', size: {width: 600, height: 600}}});
      const stream = res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment;filename=ReporteDefacturasGeneradas.pdf`,
      });
      doc.on("data", (chunk) => stream.write(chunk));
      doc.on("end", () => stream.end());
      doc.setDocumentHeader(
        {
          height: "15",
        },
        () => {
          doc.fontSize(15).text("REPORTE DE FACTURAS GENERADAS", {
            width: 420,
            align: "center",
          });
        }
      );

        doc.addTable(
          [
            { key: "CodigoEncabezado", label: "CodigoEncabezado", align: "left" },
            { key: "Propietario", label: "Propietario", align: "left" },
            { key: "correo", label: "correo propietario", align: "left" },
            { key: "Mes", label: "Mes" },
            { key: "EstadoPago", label: "Estado pago", align: "right" },
            { key: "CodVivienda", label: "Codigo vivienda", align: "right" },
            { key: "fecha_recibo", label: "Fecha", align: "right" },
            { key: "totalRecibo", label: "TOTAL Q", align: "right" },
          ],
          facturasEncabezados[0],
          {
            border: null,
            width: "fill_body",
            striped: true,
            cellsPadding: 10,
            marginTop: 10,
            marginLeft: 25,
            marginRight: 25,
            headAlign: "left",
          }
        );
        doc.render();
        doc.end();
      }
  } catch (error) {
    console.log(error);
    res.json({ message: "algo ocurrio mal" });
  }
};

module.exports = {
  getInfoEncabezadosFactura,
  createFacturaEncabezado,
  deleteEncabezado,
  facturasDetalle,
  createDetallesFactura,
  deleteDetalles,
  ConsultaFacturaCliente,
  facturasPendientesMes,
  sendMailCliente,
  pagarFactura,
  generarPdf
};
