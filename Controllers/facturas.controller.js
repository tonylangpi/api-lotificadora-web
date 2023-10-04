const { connection } = require("../Database/bd");
require("dotenv").config();

const getInfoEncabezadosFactura = async(req, res) => {
  try {
     const factEncabezado = await connection.query(`select RE.idReciboGastoEncabezado as CodigoEncabezado, CONCAT(p.nombre, ' ', p.apellido) as Propietario, M.nombreMes as Mes, EF.Estado as EstadoPago, V.codigo as CodVivienda, RE.fecha_recibo
     from ReciboGastoEncabezado RE
     inner join Mes M on M.Mesid = RE.Mes
     inner join EstadoFactura EF on  EF.id = RE.Estado
     inner join vivienda V on V.codigo = RE.idVivienda
     inner join propietarios p on p.idPropietario = V.idPropietario`); 
     const viviendas = await connection.query(`select codigo from vivienda`); 
      res.json({
         encabezados: factEncabezado[0],
         viviendas : viviendas[0]
      }); 
  } catch (error) {
     console.log(error);
     res.json({message:"algo ocurrio mal"});
  }
};

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
module.exports = {
  getInfoEncabezadosFactura,
  createFacturaEncabezado,
  deleteEncabezado
};
