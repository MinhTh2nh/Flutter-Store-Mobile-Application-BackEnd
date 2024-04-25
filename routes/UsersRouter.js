const express = require("express");
const router = express.Router();
const { validateAdmin, validateUser } = require("../validator/UsersValidator");
// const usersController = require("../controller/UsersController");
const userControllerMySQL = require("../controller/UsersControllerMySQL");

//For the MYSQL database -- Start Here
router.post("/register", userControllerMySQL.register);
router.post("/login", userControllerMySQL.login);
router.post("/loginadmin", userControllerMySQL.loginAdmin);
router.get("/get", userControllerMySQL.getAllUsers);
router.get("/get/:userID", userControllerMySQL.getUserID);
router.delete("/delete/:userID", userControllerMySQL.deleteById);
router.put("/update/:userID", userControllerMySQL.updateID);


module.exports = router;
