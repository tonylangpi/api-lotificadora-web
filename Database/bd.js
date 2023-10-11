const mysql = require('mysql2/promise')
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
module.exports = {connection}