const { connection } = require("../Database/bd");
require("dotenv").config();

const getPropietarios = async (req, res) => {
  try {
    const propietarios = await connection.query(`SELECT * FROM  propietarios`);
    res.json(propietarios[0]);
  } catch (error) {
    console.log(error);
    res.json({ message: "algo salio mal" });
  }
};

const getPropietariosByEstado = (req, res) => {
  const { Estado } = req.params;
  connection.query(
    `SELECT * FROM  propietarios WHERE Estdo = ?`,
    [Estado],
    (error, results) => {
      if (error) {
        console.error(error);
      } else {
        res.json(results);
      }
    }
  );
};
const createPropietarios = async (req, res) => {
  const {
    nombre,
    apellido,
    email,
    telefono,
    direccion,
    idUsuario,
    dpi,
    Estado,
  } = req.body;

  try {
    if (
      !nombre ||
      !apellido ||
      !email ||
      !telefono ||
      !direccion ||
      !idUsuario ||
      !dpi.trim() ||
      !Estado
    ) {
      res.json({
        message: "Faltan datos",
      });
    } else {
      const dpiYaingresado = await connection.query(
        `SELECT * FROM propietarios WHERE dpi ='${dpi}'`
      );
      if (dpiYaingresado[0].length > 0) {
        res.json({ message: `El dpi ${dpi} , ya existe en un propietario` });
      } else {
        connection.query("INSERT INTO propietarios SET ?", {
          nombre: nombre,
          apellido: apellido,
          correo: email,
          telefono: telefono,
          direccion: direccion,
          idUsuario: idUsuario,
          dpi: dpi,
          Estado: Estado,
        });
        res.json({ message: "propietario  creado" });
      }
    }
  } catch (error) {
    console.log(error);
  }
};
const editPropietarios = (req, res) => {
  const {
    nombre,
    apellido,
    correo,
    telefono,
    direccion,
    idUsuario,
    dpi,
    idPropietario,
  } = req.body;
  try {
    connection.query("UPDATE propietarios SET ? WHERE idPropietario = ?", [
      {
        nombre: nombre,
        apellido: apellido,
        correo: correo,
        telefono: telefono,
        direccion: direccion,
        idUsuario: idUsuario,
        dpi: dpi,
      },
      idPropietario,
    ]);
    res.json({ message: "Propietario actualizado" });
  } catch (error) {
    console.log(error);
  }
};

const deletePropietarios = async (req, res) => {
  const { id } = req.params;
  const estadoInactivo = "INACTIVO";
  const estadoActivo = "ACTIVO";
  try {
    const Estado = await connection.query(
      `SELECT Estado FROM propietarios WHERE idPropietario = ?`,
      [id]
    );
    let EstadoFinal = Estado[0];
    if (EstadoFinal[0]?.Estado == "ACTIVO") {
      connection.query(
        `UPDATE propietarios SET Estado = '${estadoInactivo}' WHERE idPropietario = ?`,
        [id]
      );
      res.json({ message: "Propietario inactivado" });
    } else {
      connection.query(
        `UPDATE propietarios SET Estado = '${estadoActivo}' WHERE idPropietario = ?`,
        [id]
      );
      res.json({ message: "Propietario Activado" });
    }
  } catch (error) {
    res.json(error);
  }
};
module.exports = {
  getPropietarios,
  createPropietarios,
  editPropietarios,
  deletePropietarios,
  getPropietariosByEstado,
};
