var express = require("express");
var router = express.Router();
const { validateAdmin, validateUser } = require("../validator/UsersValidator");
const productsControllerMySQL = require("../controller/ProductsControllerMySQL");
const multer = require("multer");


//For the MySQL database -- Start Here
//Test Ok
router.get("/get", productsControllerMySQL.getAllProductAvailable);
router.get("/get/:productType", productsControllerMySQL.getAllProductAvailableByProductType);
router.get("/getProductUnavailable", productsControllerMySQL.getProductUnavailable);
router.get("/getAllProducts", productsControllerMySQL.getAllProducts);
router.post("/create", productsControllerMySQL.createProduct);
router.get("/get/:productID", productsControllerMySQL.getProductById);
router.put("/update/:productID", productsControllerMySQL.editProductById);
router.delete("/delete/:productID", productsControllerMySQL.deleteProductController);

router.post('/checkQuantity', productsControllerMySQL.checkQuantityOfProduct);

//Un-Test
//For the MySQL database -- End Here

module.exports = router;
