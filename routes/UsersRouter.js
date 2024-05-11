const express = require("express");
const router = express.Router();
const { validateAdmin, validateUser } = require("../validator/UsersValidator");
// const usersController = require("../controller/UsersController");
const userControllerMySQL = require("../controller/UsersControllerMySQL");

//For the MYSQL database -- Start Here
router.post("/register", userControllerMySQL.register);
router.post("/login", userControllerMySQL.login);
router.get("/get", userControllerMySQL.getAllUsers);
router.get("/get/:customer_id", userControllerMySQL.getUserID);
router.delete("/delete/:customer_id", userControllerMySQL.deleteById);
router.put("/update/:customer_id", userControllerMySQL.updateID);

router.post("/address/create", userControllerMySQL.addCustomerDetail);  
router.get("/address/get/:customer_id", userControllerMySQL.getCustomerDetail);


module.exports = router;
