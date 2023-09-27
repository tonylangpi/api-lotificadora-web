const mysql = require('mysql2')
require('dotenv').config(); 
const {BD_HOST,
    BD_USER,
    BD_PASS,
    BD_PORT,
    BD_DATABASE} = process.env;
    //const connection = mysql.createPool(`mysql://${USER}:${PASS}@${HOST}:${PORT}/${DATABASE}`); 
const connection =  mysql.createPool({
    host: BD_HOST,
    user: BD_USER,
    password:BD_PASS,
    port: BD_PORT,
    database:BD_DATABASE,
});
connection.getConnection((error) => {
    if (error) {
      console.error('El error de conexión es: ' + error);
      return;
    }
    console.log('Conectado a la base de datos.');
  });
module.exports = {connection}