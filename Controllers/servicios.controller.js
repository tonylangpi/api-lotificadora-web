const { connection } = require("../Database/bd");
require("dotenv").config();

const getServicios = async (req, res) => {
  try {
    const servicios = await connection.query(`SELECT * FROM  Servicios`);
    res.json(servicios[0]);
  } catch (error) {
    console.log(error);
    res.json({ message: "algo salio mal" });
  }
};

const createServicios = async (req, res) => {
  const {
    descripcion,
    cuotaBase,
  } = req.body;

  try {
    if (
      !descripcion
    ) {
      res.json({
        message: "Falta la descripcion",
      })
    } else {
     
      if(cuotaBase != 0){
       await  connection.query("INSERT INTO Servicios SET ?", {
            descripcion: descripcion,
            cuotaBase: cuotaBase,
            Estado:'ACTIVO',
            TipoServicio:'FIJO'
          });
          res.json({ message: "Servicio  creado" });
      }else{
        await  connection.query("INSERT INTO Servicios SET ?", {
            descripcion: descripcion,
            cuotaBase: 0,
            Estado:'ACTIVO',
            TipoServicio:'VARIABLE'
          });
          res.json({ message: "Servicio  creado" });
      }
        
    }
  } catch (error) {
    console.log(error);
  }
};
const getServicioById = async(req, res) => {
    const { id } = req.params;
    try {
       const DetalleServicio = await  connection.query(
        `SELECT * FROM  Servicios WHERE idServicio = ?`,
        [id]
      );
      res.json(DetalleServicio[0])
    } catch (error) {
        console.log(error);
        res.json({message:"algo salio mal"});
    }
   
  };
const editServicios = (req, res) => {
  const {
    idServicio,
    descripcion,
    cuotaBase,
    tipoServicio,
  } = req.body;
  try {
     if(cuotaBase){
        connection.query("UPDATE Servicios SET ? WHERE idServicio = ?", [
            {
                descripcion: descripcion,
                cuotaBase: cuotaBase
            },
            idServicio,
          ]);
          res.json({ message: "Servicio actualizado" });
     }else{
        connection.query("UPDATE Servicios SET ? WHERE idServicio = ?", [
            {
                descripcion: descripcion
            },
            idServicio,
          ]);
          res.json({ message: "Servicio actualizado" });
     }
   
  } catch (error) {
    console.log(error);
  }
};

const changeStatusServicio = async (req, res) => {
  const { id } = req.params;
  const estadoInactivo = "INACTIVO";
  const estadoActivo = "ACTIVO";
  try {
    const Estado = await connection.query(
      `SELECT Estado FROM Servicios WHERE idServicio = ?`,
      [id]
    );
    let EstadoFinal = Estado[0];
    if (EstadoFinal[0]?.Estado == "ACTIVO") {
      connection.query(
        `UPDATE Servicios SET Estado = '${estadoInactivo}' WHERE idServicio = ?`,
        [id]
      );
      res.json({ message: "Servicio inactivado" });
    } else {
      connection.query(
        `UPDATE Servicios SET Estado = '${estadoActivo}' WHERE idServicio = ?`,
        [id]
      );
      res.json({ message: "Servicio Activado" });
    }
  } catch (error) {
    res.json(error);
  }
};
module.exports = {
  getServicios,
  createServicios,
  getServicioById,
  editServicios,
  changeStatusServicio
};
