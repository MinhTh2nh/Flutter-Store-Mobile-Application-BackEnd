var express = require("express");
var router = express.Router();
const { validateAdmin, validateUser } = require("../validator/UsersValidator");
const productsController = require("../controller/ProductsController");
const multer = require("multer");


//For the MySQL database -- Start Here
//Test Ok

router.get("/get", productsController.getAllProducts);

router.get("/get/category/categoryList", productsController.getByProductCategoryList);
router.get("/get/category/sub_category/:category_id", productsController.getBySubCateByCateId);
router.get("/get/category/query", productsController.getByProductCategory);

router.get("/get/:product_id", productsController.getProductById);
router.get("/get/itemList/:product_id", productsController.getAllItems);

router.post("/create", productsController.createProduct);
router.put("/update/:product_id", productsController.editProductById);
router.delete("/delete/:product_id", productsController.deleteProductController);

router.post('/checkQuantity', productsController.checkQuantityOfProduct);

//Un-Test
//For the MySQL database -- End Here
// router.get("/getProductUnavailable", productsController.getProductUnavailable);
// router.get("/getAllProducts", productsController.getAllProducts);

module.exports = router;
