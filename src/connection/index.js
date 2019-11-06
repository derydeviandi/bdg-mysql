const mysql = require('mysql')

const conn = mysql.createConnection({
    user: 'derydev',
    password: 'Mysql123',
    // host: 'localhost',
    host: 'db4free.net',
    database: 'bdg_mysql_dery',
    port: 3306
})

module.exports = conn