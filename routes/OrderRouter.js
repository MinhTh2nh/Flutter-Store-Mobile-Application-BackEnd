var express = require("express");
var router = express.Router();
const orderController = require("../controller/OrderController");
const { validateAdmin, validateUser } = require("../validator/UsersValidator");

//For the MongoDB database -- Start Here
router.post("/create", orderController.createOrder);
router.put("/edit/:orderID", orderController.editOrderById);
router.get("/get/:orderID", orderController.getOrderById);
router.get("/getAll", orderController.getAllOrder);
router.get("/getOrderDetaiLs/:orderID", orderController.getOrderDetaiLs);
router.get("/getOrder/:orderID", orderController.getOrderById);

router.delete("/delete/:orderID", validateAdmin, orderController.deleteById);
router.delete("/deleteAllOrderDetails", validateAdmin , orderController.deleteAllOrderDetails);
router.delete("/deleteAllOrder", validateAdmin , orderController.deleteAllOrder);

router.get("/getOrderByUserID/:userID", orderController.getOrderByUserID);

router.get("/displayOrderDetailInformation/:orderID", orderController.displayOrderDetailInformation);

//For the MongoDB database -- End Here




module.exports = router;
