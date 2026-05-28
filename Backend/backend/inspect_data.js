const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data/database.sqlite');

db.serialize(() => {
  db.get("SELECT COUNT(*) as count FROM customer", (err, row) => console.log("Customers count:", row ? row.count : err));
  db.get("SELECT COUNT(*) as count FROM business", (err, row) => console.log("Businesses count:", row ? row.count : err));
  db.get("SELECT COUNT(*) as count FROM appointment", (err, row) => console.log("Appointments count:", row ? row.count : err));
  db.get("SELECT COUNT(*) as count FROM payment", (err, row) => console.log("Payments count:", row ? row.count : err));
  db.all("SELECT * FROM customer LIMIT 5", (err, rows) => console.log("Customers preview:", rows));
  db.all("SELECT * FROM appointment LIMIT 5", (err, rows) => console.log("Appointments preview:", rows));
});
db.close();
