const { connection } = require("../Database/bd");
const {transporter}  = require("../services/mailer")
require("dotenv").config();

const getInfoEncabezadosFactura = async(req, res) => {
  try {
     const factEncabezado = await connection.query(`select RE.idReciboGastoEncabezado as CodigoEncabezado, CONCAT(p.nombre, ' ', p.apellido) as Propietario, M.nombreMes as Mes, EF.Estado as EstadoPago, V.codigo as CodVivienda, substring(RE.fecha_recibo,1,10) as fecha_recibo
     from ReciboGastoEncabezado RE
     inner join Mes M on M.Mesid = RE.Mes
     inner join EstadoFactura EF on  EF.id = RE.Estado
     inner join vivienda V on V.codigo = RE.idVivienda
     inner join propietarios p on p.idPropietario = V.idPropietario`); 
     const viviendas = await connection.query(`select V.codigo, CONCAT(p.nombre, ' ', p.apellido) as Propietario, p.Estado as EstadoPropietario from vivienda v
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
     const servicios = await connection.query(`SELECT * FROM Servicios`); 
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
      
        connection.query(
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
      
        connection.query(
          "INSERT INTO ReciboGastoDetalle SET ?",
          {
            idReciboGastoEncabezado: idReciboGastoEncabezado,
            idServicio: idServicio,
            cuota: cuota,
          }
        );
        res.json({message:`Detalle creado satisfactoriamente`});
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

  try {
   const reciboGastos = await connection.query(`SELECT * FROM ReciboGastoDetalle WHERE idReciboGastoEncabezado = ?`,
   [id]);
   if(reciboGastos[0].length > 0){
      res.json({message:"no puedes borrar este encabezado pues ya tiene detalles"});
   }else{
    connection.query(`DELETE FROM ReciboGastoEncabezado WHERE idReciboGastoEncabezado = ?`,[id]);
     res.json({message:"ENCABEZADO ELIMINADO"});
   }
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
      const  [rows] = await connection.query(`SELECT RE.idReciboGastoEncabezado as CodigoEncabezado, CONCAT(p.nombre, ' ', p.apellido) as Propietario, M.nombreMes as Mes, EF.Estado as EstadoPago, V.codigo as CodVivienda, substring(RE.fecha_recibo,1,10) as fecha_recibo, SUM(dc.cuota) AS totalRecibo
      FROM ReciboGastoEncabezado re
      INNER JOIN ReciboGastoDetalle DC ON re.idReciboGastoEncabezado = DC.idReciboGastoEncabezado
      INNER JOIN Servicios PDC ON DC.idServicio = PDC.idServicio
      inner join Mes M on M.Mesid = RE.Mes
      inner join EstadoFactura EF on  EF.id = re.Estado
      inner join vivienda V on V.codigo = re.idVivienda
      inner join propietarios p on p.idPropietario = V.idPropietario
      where MONTH(re.fecha_recibo) = ? AND YEAR(re.fecha_recibo) = ? AND re.idVivienda = ? AND re.Estado = 2
      GROUP BY DC.idReciboGastoEncabezado
      ORDER BY re.idReciboGastoEncabezado ASC;`,[mes,year,viviendacod]);
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
  const{mes, year}  = req.query; 
  try {
    const  [rows] = await connection.query(`SELECT RE.idReciboGastoEncabezado as CodigoEncabezado, CONCAT(p.nombre, ' ', p.apellido) as Propietario, p.correo as CorreoPropietario, M.nombreMes as Mes, EF.Estado as EstadoPago, V.codigo as CodVivienda, substring(RE.fecha_recibo,1,10) as fecha_recibo, SUM(dc.cuota) AS totalRecibo
    FROM ReciboGastoEncabezado re
    INNER JOIN ReciboGastoDetalle DC ON re.idReciboGastoEncabezado = DC.idReciboGastoEncabezado
    INNER JOIN Servicios PDC ON DC.idServicio = PDC.idServicio
    inner join Mes M on M.Mesid = RE.Mes
    inner join EstadoFactura EF on  EF.id = re.Estado
    inner join vivienda V on V.codigo = re.idVivienda
    inner join propietarios p on p.idPropietario = V.idPropietario
    where MONTH(re.fecha_recibo) = ? AND YEAR(re.fecha_recibo) = ? AND re.Estado = 2
    GROUP BY DC.idReciboGastoEncabezado
    ORDER BY re.idReciboGastoEncabezado ASC;`,[mes,year]);
    res.json(rows);
  } catch (error) {
     console.log(error); 
     res.json({message:"algo salio mal"}); 
  }
}

const sendMailCliente = async(req,res) =>{
   const {correo, viviendacod,mes, year} = req.body; 
  try {
    const  [rows] = await connection.query(`SELECT RE.idReciboGastoEncabezado as CodigoEncabezado, CONCAT(p.nombre, ' ', p.apellido) as Propietario, M.nombreMes as Mes, EF.Estado as EstadoPago, V.codigo as CodVivienda, substring(RE.fecha_recibo,1,10) as fecha_recibo, SUM(dc.cuota) AS totalRecibo
      FROM ReciboGastoEncabezado re
      INNER JOIN ReciboGastoDetalle DC ON re.idReciboGastoEncabezado = DC.idReciboGastoEncabezado
      INNER JOIN Servicios PDC ON DC.idServicio = PDC.idServicio
      inner join Mes M on M.Mesid = RE.Mes
      inner join EstadoFactura EF on  EF.id = re.Estado
      inner join vivienda V on V.codigo = re.idVivienda
      inner join propietarios p on p.idPropietario = V.idPropietario
      where MONTH(re.fecha_recibo) = ? AND YEAR(re.fecha_recibo) = ? AND re.idVivienda = ? AND re.Estado = 2
      GROUP BY DC.idReciboGastoEncabezado
      ORDER BY re.idReciboGastoEncabezado ASC;`,[mes,year,viviendacod]);
      const registros = rows[0]; 
      if(rows.length > 0){
        const detalleFact = await connection.query(`select RD.idDetalle, S.descripcion, RD.cuota from ReciboGastoDetalle RD
        inner join Servicios S on S.idServicio = RD.idServicio 
        where RD.idReciboGastoEncabezado = ?`,[registros?.CodigoEncabezado]); 
        console.log( detalleFact[0].map((det, index) =>{
          return  `<tr key=${index}>
          <td>${det.descripcion}</td>
          <td>${det.cuota}</td>
         </tr>`
        }
        ));
        const result =  await transporter.sendMail({
          from: `Lotificadora Mazat ${process.env.EMAIL}`,
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
                ${detalleFact[0].map((det, index) =>
                  `<tr key=${index}>
                   <td>${det.descripcion}</td>
                   <td>${det.cuota}</td>
                  </tr>`
                )}
              </tbody>
            </table>
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
module.exports = {
  getInfoEncabezadosFactura,
  createFacturaEncabezado,
  deleteEncabezado,
  facturasDetalle,
  createDetallesFactura,
  deleteDetalles,
  ConsultaFacturaCliente,
  facturasPendientesMes,
  sendMailCliente
};
