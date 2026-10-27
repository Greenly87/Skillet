const sql = require('mssql');
require('dotenv').config();

// configuracion para sql server
const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        encrypt: false, // usa verdadero para azure sql
        trustServerCertificate: true,
        enableArithAbort: true
    },
    port: parseInt(process.env.DB_PORT)
};

// funcion para conectarse a la base de datos

const poolPromise = new sql.ConnectionPool(config)
.connect()
.then(pool => {
    console.log('Conectado a la base de datos');
    return pool;
})
.catch(err => {
    console.error('Error al conectarse a la base de datos', err);
    throw err;
});

module.exports = {
    sql, poolPromise
};
