const mysql = require('mysql2/promise');
const fs = require('fs');
var path = require('path');
require('dotenv').config(); 
const {BD_HOST,
    BD_USER,
    BD_PASS,
    BD_PORT,
    BD_DATABASE} = process.env;
const config = {
  host: BD_HOST,
  port: BD_PORT,
  user: BD_USER,
  password: BD_PASS,
  database: BD_DATABASE,
  ssl: {
    ca: fs.readFileSync(path.resolve(__dirname + '/ca.pem')).toString(),
    rejectUnauthorized: true,
  },
};
  const prueba = async () => {
    try {
      const connection = await mysql.createPool(config);
      console.log('Conexión exitosa a la base de datos MySQL.');
      return connection;
    } catch (error) {
      console.error('Error al conectar a la base de datos MySQL:', error);
      throw error;
    }
  };
   prueba(); 
  const connection =  mysql.createPool(config); 
module.exports = {connection}