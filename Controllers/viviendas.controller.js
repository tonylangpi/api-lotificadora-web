
const { connection } = require("../Database/bd");
require("dotenv").config();

const getViviendas = (req, res) => {
  connection.query(`select v.codigo, v.descripcion, v.CantidadHabitantes, v.medidas, CONCAT(p.nombre, p.apellido) as NombreCompleto, p.idPropietario from vivienda v
  inner join propietarios p on p.idPropietario = v.idPropietario`, (error, results) => {
    if (error) {
      console.error(error);
    } else {
      res.json(results);
    }
  });
};

const getPropietariosByEstado = (req, res) => {
  const{Estado} = req.params; 
  connection.query(`SELECT * FROM  propietarios WHERE Estdo = ?`,[Estado], (error, results) => {
    if (error) {
      console.error(error);
    } else {
      res.json(results);
    }
  });
};
const createViviendas = (req, res) => {
  const { nombre, apellido, email, telefono, direccion, idUsuario, dpi, Estado } =
    req.body;

  try {
    if (
      !nombre ||
      !apellido ||
      !email ||
      !telefono ||
      !direccion ||
      !idUsuario ||
      !dpi || 
      !Estado
    ) {
      res.json({
        message: "Faltan datos",
      });
    } else {
      connection.query(
        "INSERT INTO propietarios SET ?",
        {
          nombre: nombre,
          apellido: apellido,
          correo: email,
          telefono: telefono,
          direccion: direccion,
          idUsuario: idUsuario,
          dpi: dpi,
          Estado: Estado
        },
        (error, results) => {
          if (error) {
            console.error(error);
          } else {
            res.json({ message: "propietario creado" });
          }
        }
      );
    }
  } catch (error) {
    console.log(error);
  }
};
const editViviendas = (req, res) => {
    const{nombre, apellido, correo, telefono, direccion, idUsuario, dpi, idPropietario} = req.body;
    try {
        connection.query('UPDATE propietarios SET ? WHERE idPropietario = ?', [{nombre:nombre,apellido:apellido,correo:correo,telefono:telefono,direccion:direccion,idUsuario:idUsuario,dpi:dpi}, idPropietario],(error,results) =>{
            if(error){
                console.log(error);
            }else{
                res.json({message:"información de propietario actualizada"})
            }
        });
    } catch (error) {
        console.log(error);
    }
};

const deleteViviendas = (req, res) =>{
    const {id} = req.params; 
    const estadoInactivo = 'INACTIVO';
    const estadoActivo = 'ACTIVO'; 
  try {
     connection.query(`SELECT Estado FROM propietarios WHERE idPropietario = ?`,[id],(error,results) =>{
       if(error){
         console.log(error);
       }else{
          let status = results[0].Estado;
          if(status === "ACTIVO"){
            connection.query(`UPDATE propietarios SET Estado = '${estadoInactivo}' WHERE idPropietario = ?`, [id],(error,results) =>{
              if(error){
                  console.log(error);
              }else{
                  res.json({message:"Propietario inactivado"})
              }
          });
          }else{
            connection.query(`UPDATE propietarios SET Estado = '${estadoActivo}' WHERE idPropietario = ?`, [id],(error,results) =>{
              if(error){
                  console.log(error);
              }else{
                  res.json({message:"Propietario Activado"})
              }
          });
          }
       }
     })
  } catch (error) {
     res.json(error)
  }
}
module.exports = {
    getViviendas,
    createViviendas,
    editViviendas,
    deleteViviendas
};
