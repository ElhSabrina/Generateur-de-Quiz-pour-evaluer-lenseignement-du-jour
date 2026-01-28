// db.js
require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'checkyourteaching',
  port: process.env.DB_PORT || 3306
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('MySQL connection error:', err.message);
  } else {
    console.log('Connected to MySQL (checkyourteaching)');
    connection.release();
  }
});

module.exports = db;
