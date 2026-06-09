// Frontend/lib/db.js
const Database = require('better-sqlite3');
// Asegúrate de poner la ruta completa a tu archivo database.sqlite
const db = new Database('C:/PRACTICAS/Backend/backend/data/database.sqlite');
module.exports = db;