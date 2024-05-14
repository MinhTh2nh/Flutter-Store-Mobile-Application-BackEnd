const express = require("express");
const router = express.Router();
const { validateAdmin, validateUser } = require("../validator/UsersValidator");
// const usersController = require("../controller/UsersController");
const userControllerMySQL = require("../controller/UsersControllerMySQL");

//ROUTE FOR CUSTOMER
router.post("/register", userControllerMySQL.register);
router.post("/login", userControllerMySQL.login);
router.get("/get", userControllerMySQL.getAllUsers);
router.get("/get/:customer_id", userControllerMySQL.getUserID);
router.delete("/delete/:customer_id", userControllerMySQL.deleteById);
router.put("/update/:customer_id", userControllerMySQL.updateID);

//ROUTE FOR CUSTOMER DETAILS
router.post("/address/create", userControllerMySQL.addCustomerDetail);  
router.get("/address/get/:customer_id", userControllerMySQL.getCustomerDetail);
router.put("/address/update/:cd_id", userControllerMySQL.updateCustomerDetail);
router.delete("/address/delete/:cd_id", userControllerMySQL.deleteCustomerDetail);

module.exports = router;
