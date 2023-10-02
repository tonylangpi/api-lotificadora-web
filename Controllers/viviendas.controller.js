const { connection } = require("../Database/bd");
require("dotenv").config();

const getViviendas = async(req, res) => {
  try {
    const viviendas = await connection.query(
      `select v.codigo, v.descripcion, v.CantidadHabitantes, v.medidas, CONCAT(p.nombre, p.apellido) as NombreCompleto, p.idPropietario from vivienda v
    inner join propietarios p on p.idPropietario = v.idPropietario` );
    const propietarios = await connection.query(`SELECT idPropietario, nombre, apellido FROM  propietarios`);
    res.json({
      viviendas: viviendas[0],
      propietarios: propietarios[0]
    })
  } catch (error) {
     console.log(error);
     res.json({message:"algo ocurrio mal"});
  }
 
};

const getViviendabyId = async(req, res) => {
  const { codigo } = req.params;
  try {
     const detallevivienda = await  connection.query(
      `SELECT * FROM  vivienda WHERE codigo = ?`,
      [codigo]
    );
    const propietarios = await connection.query(`SELECT idPropietario, nombre, apellido FROM  propietarios`);
    res.json({
      detalleviviendas: detallevivienda[0],
      propietarios: propietarios[0]
    })
  } catch (error) {
      console.log(error);
      res.json({message:"algo salio mal"});
  }
 
};
const createViviendas = async(req, res) => {
  const {
    Codigo,
    descripcion,
    CantidadHabitantes,
    medidas,
    idPropietario,
    idUsuario,
  } = req.body;

  try {
    if (
      !Codigo ||
      !descripcion ||
      !CantidadHabitantes ||
      !medidas ||
      !idPropietario ||
      !idUsuario
    ) {
      res.json({
        message: "Faltan datos",
      });
    } else {
      const viviendaFound = await connection.query(`SELECT * FROM vivienda WHERE codigo = ?`,[Codigo]);
      if(viviendaFound[0].length > 0){
         res.json({message:`El codigo ${Codigo} , ya existe en una vivienda`});
      }else{
        connection.query(
          "INSERT INTO vivienda SET ?",
          {
            codigo: Codigo,
            descripcion: descripcion,
            CantidadHabitantes: CantidadHabitantes,
            medidas: medidas,
            idPropietario: idPropietario,
            idUsuario: idUsuario,
          }
        );
        res.json({message:`Vivienda con codigo ${Codigo} creada`});
      }
    }
  } catch (error) {
    console.log(error);
  }
};
const editViviendas = (req, res) => {
  const {
    Codigo,
    descripcion,
    CantidadHabitantes,
    medidas,
    idPropietario,
    idUsuario,
  } = req.body;
  try {
    connection.query(
      "UPDATE vivienda SET ? WHERE codigo = ?",
      [
        {
          codigo: Codigo,
          descripcion: descripcion,
          CantidadHabitantes: CantidadHabitantes,
          medidas: medidas,
          idPropietario: idPropietario,
          idUsuario: idUsuario,
        },
        Codigo,
      ]
    );
    res.json({message:"vivienda editada correctamente"});
  } catch (error) {
    console.log(error);
  }
};

const deleteViviendas = async(req, res) => {
  const { id } = req.params;//pedimos el id de la vivienda 

  try {
   const reciboGastos = await connection.query(`SELECT * FROM ReciboGastoEncabezado WHERE idVivienda = ?`,
   [id]);
   if(reciboGastos[0].length > 0){
      res.json({message:"no puedes borrar la vivienda pues ya tiene historial de facturas"});
   }else{
    connection.query(`DELETE FROM vivienda WHERE codigo = ?`,[id]);
     res.json({message:"VIVIENDA ELIMINADA"});
   }
  } catch (error) {
    res.json(error);
  }
};
module.exports = {
  getViviendas,
  createViviendas,
  editViviendas,
  deleteViviendas,
  getViviendabyId
};
