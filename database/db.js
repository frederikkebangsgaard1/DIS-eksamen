const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

// Database konfigurationsindstillinger
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'weatherapp',
    port: process.env.DB_PORT || 3306,
    ssl: process.env.DB_SSLMODE === 'REQUIRED' ? { rejectUnauthorized: false } : false,
};

// Opret en MySQL connection pool
const pool = mysql.createPool(dbConfig).promise();

console.log(process.env.DB_HOST);

// Test databaseforbindelse
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully.');
        connection.release();
    } catch (err) {
        console.error('Database connection failed:', err);
    }
}

module.exports = { pool, testConnection };