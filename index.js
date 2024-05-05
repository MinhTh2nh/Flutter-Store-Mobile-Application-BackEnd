const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require('path');
require("dotenv").config();
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

const db = require("./config/db");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/UsersRouter");
const productRouter = require("./routes/ProductRouter");
const orderRouter = require("./routes/OrderRouter");

const app = express();
const port = process.env.PORT;
const pathUrl = process.env.SWAGGER_URL || `http://localhost:${port}`;

app.use(cors({
  origin: '*', // Allow requests from all origins
  credentials: true, // Allow cookies and credentials
}));

app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));


app.use("/public", express.static("public"));
app.use("/public/productImages", express.static("public"));

app.use("/users", usersRouter);
app.use("/products", productRouter);
app.use("/orders", orderRouter);

db.query('SELECT 1 + 1', (error, results, fields) => {
  if (error) throw error;
    console.log('Connected to MySQL!');
});

// Swagger options
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Library API",
      version: "1.0.0",
      description: "A simple Express Library API",
    },
    servers: [
      {
        url: pathUrl,
      },
    ],
  },
  // Specify the pathUrl to your route files with Swagger annotations
  apis: [`${__dirname}/routes/*.js`],
};
const specs = swaggerJsDoc(options);
app.use("/", swaggerUI.serve, swaggerUI.setup(specs));

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});