const Database = require('better-sqlite3');
// Esto abrirá o creará tu archivo database.sqlite
const db = new Database('database.sqlite');

const sql = `
CREATE TABLE IF NOT EXISTS loyalty_program (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    business_id INTEGER,
    prize_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    start_date DATETIME,
    end_date DATETIME,
    caducity_prize INTEGER
);

CREATE TABLE IF NOT EXISTS user_reward (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_prize INTEGER,
    user_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    used_date DATETIME,
    FOREIGN KEY (id_prize) REFERENCES loyalty_program(id)
);
`;

db.exec(sql);
console.log("¡Tablas 'loyalty_program' y 'user_reward' creadas con éxito!");