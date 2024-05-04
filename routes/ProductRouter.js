var express = require("express");
var router = express.Router();
const { validateAdmin, validateUser } = require("../validator/UsersValidator");
const productsController = require("../controller/ProductsController");
const multer = require("multer");


//For the MySQL database -- Start Here
//Test Ok
router.get("/get", productsController.getAllProductAvailable);
router.get("/get/:productType", productsController.getAllProductAvailableByProductType);
router.get("/getProductUnavailable", productsController.getProductUnavailable);
router.get("/getAllProducts", productsController.getAllProducts);
router.post("/create", productsController.createProduct);
router.get("/get/:productID", productsController.getProductById);
router.put("/update/:productID", productsController.editProductById);
router.delete("/delete/:productID", productsController.deleteProductController);

router.post('/checkQuantity', productsController.checkQuantityOfProduct);

//Un-Test
//For the MySQL database -- End Here

module.exports = router;
