var express = require("express");
var router = express.Router();
const { validateAdmin, validateUser } = require("../validator/UsersValidator");
const productsController = require("../controller/ProductsController");


//For the MySQL database -- Start Here
//Test Ok

router.get("/get", productsController.getAllProducts);

router.get("/get/category/categoryList", productsController.getByProductCategoryList);
router.get("/get/category/categoryList/:category_id", productsController.getByProductCategoryId);
router.get("/get/category/sub_category/:category_id", productsController.getBySubCateByCateId);
router.get("/get/category/query", productsController.getByProductCategory);

router.get("/get/:product_id", productsController.getProductById);
router.get("/get/size/get", productsController.getSizeList);

router.get("/get/itemList/:product_id", productsController.getAllItems);

router.put("/update/:product_id", productsController.editProductById);
router.put("/delete/:product_id", productsController.deleteProductController);
router.get("/update/category/:category_id", productsController.editCategoryById);

router.post("/category/sub_category/create", productsController.createSubCategory);
router.post("/item/create", productsController.createProductItem);
router.post("/category/create", productsController.createCategory);
router.post("/create", productsController.createProduct);
router.post('/checkQuantity', productsController.checkQuantityOfProduct);


//ROUTE FOR REVIEW PRODUCT
router.post("/review/create", productsController.addReview);
router.get("/:product_id/reviews", productsController.getAllReviewByProductId);

module.exports = router;
