require("dotenv").config();
const mysql = require("mysql");

let db;

function createPool() {
  console.error("CREATING POOL");
  db = mysql.createPool({
    host: process.env.INSTANCE_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 50,
    queueLimit: 0,
    waitForConnections: true,
    // port: process.env.DB_PORT,
  });

  db.on("connection", (connection) => {
    console.error("NEW CONNECTION");
  });

  db.on("error", (err) => {
    console.error("POOL ERROR", err.code);
    if (err.fatal) {
      console.error("FATAL ERROR OCCURRED, RESTARTING POOL");
      createPool();
    }
  });
}

createPool();

module.exports = db;
