const { connection } = require("../Database/bd");
const bcrypt = require("bcryptjs");
const {sign, decode} = require("jsonwebtoken");
const {serialize} = require("cookie");
require('dotenv').config(); 



const login = (req, res) => {
  const { email, password } = req.body;
  connection.query("SELECT * FROM usuarios WHERE correo = ?", [
    email,
  ], async(error, results) =>{
     if(error){
       console.log(error);
     }else{
      if (results.length == 0) {
        res.send({
          Auth: false,
          message: "Usuario o Contraseña Incorrectos",
        });
      } else {
        const validation = await bcrypt.compare(password, results[0].clave);
        if (!validation) {
          res.json({
            Auth: false,
            message: "Usuario o Contraseña Incorrectos",
          });
        } else {
          const token = sign( { name: results[0].nombre, ID: results[0].id },
            process.env.SECRET_TOKEN,
            { expiresIn: 84000 });
          const cookie = serialize("Auth", token, {
            httpOnly: true,
            secure: true,
            maxAge: 3600,
            sameSite: "strict",
            path: "/",
          });
          const response = {
            message: "Authentication successful!",
          };
          res.json(JSON.stringify(response),{
            headers: { "Set-Cookie": cookie },
          });
        }
      }
     }
  });

};

const getUser = async (req, res) => {
  const Cookie = req.cookies.Auth;
  const decoded = decode(`${Cookie}`, SECRET_TOKEN);
  try {
    if (Cookie == undefined) {
      return res.send({ error: true, user: null });
    }
    console.log(decoded);
    const [result] = await pool.query(
      "SELECT U.idUsuario, U.email, U.nombre, U.rol, U.Telefono, RU.nombreRol FROM usuarios U INNER JOIN rolusuario RU ON U.rol = RU.idRol WHERE U.idUsuario = ?",
      [decoded.ID]
    );
    res.send({
      user: result[0],
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Algo salio mal",
    });
  }
};

const createUser =  (req, res) => {
  const { nombre, correo, telefono, clave, rol } = req.body;
  const emailregex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (
    !nombre.trim().length ||
    !correo.trim().length ||
    !telefono.trim().length ||
    !clave.trim().length ||
     rol.length == 0
  ) {
    return res.json({
      error: true,
      message: "Faltan datos",
    });
  } else if (!emailregex.test(correo)) {
    res.json({
      error: true,
      message: "Correo Electronico Invalido",
    });
  } else {
     connection.query(
      "SELECT * FROM usuarios WHERE correo = ?",
      [correo], async(error,results) =>{
        if(error){
           console.log(error);
        }else{
           if(results.length > 0){
            res.json({
              error: true,
              message: "Este usuario ya esta registrado",
            });
           } else{
            try {
              let passwordHash = await bcrypt.hash(clave, 10);
               connection.query(
                "INSERT INTO usuarios (nombre, correo, telefono, clave, idRol) VALUES (?, ?, ?, ?, ?)",
                [nombre, correo, telefono, passwordHash, rol]
              );
              return res.json({
                message: "usuario creado exitosamente",
                clave,
                passwordHash,
              });
            } catch (error) {
              return res.status(500).json({
                message: "Algo salio mal",
              });
            }
           }
        }
      }
    );
  }
};

module.exports = {
   login,
   createUser,
   getUser
};