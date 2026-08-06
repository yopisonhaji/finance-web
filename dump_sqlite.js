const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('d:/finance/backend-go/wa_session.db');

db.all("SELECT their_jid, first_name, full_name, push_name, business_name FROM whatsmeow_contacts LIMIT 20", [], (err, rows) => {
  if (err) {
    throw err;
  }
  console.log(rows);
});

db.close();
