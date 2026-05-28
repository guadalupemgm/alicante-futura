const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data/database.sqlite');

db.serialize(() => {
  db.all("SELECT * FROM user", (err, rows) => {
    if (err) console.error(err);
    else console.log("Users:", rows);
  });
});
db.close();
