require("dotenv").config();
const mysql = require("mysql");

const db = mysql.createConnection({
  host: process.env.INSTANCE_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT, 
});

const createTablesQueries = [
  `CREATE TABLE CUSTOMER (
      customer_id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100),
      email VARCHAR(100),
      password VARCHAR(100)
  )`,
  `CREATE TABLE CUSTOMER_DETAIL (
      customer_id INT,
      phone VARCHAR(20),
      address VARCHAR(255),
      FOREIGN KEY (customer_id) REFERENCES CUSTOMER(customer_id)
  )`,
];

function createTables() {
  createTablesQueries.forEach(query => {
    db.query(query, (err, results) => {
          if (err) {
              console.error('Error creating table:', err);
              return;
          }
          console.log('Table created successfully');
      });
  });
}

createTables() ;
module.exports = db; // Export the promise-based pool
