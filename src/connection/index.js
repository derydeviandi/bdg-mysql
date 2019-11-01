const mysql = require('mysql')

const conn = mysql.createConnection({
    user: 'devuser',
    password: 'Mysql123',
    // host: 'localhost',
    host: 'db4free.net',
    database: 'bdg_mysql',
    port: 3306
})

module.exports = conn