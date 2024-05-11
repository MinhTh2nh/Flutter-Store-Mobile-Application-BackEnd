var express = require("express");
var router = express.Router();
const orderController = require("../controller/OrderController");
const { validateAdmin, validateUser } = require("../validator/UsersValidator");

//For the MongoDB database -- Start Here
router.post("/create", orderController.createOrder);
router.put("/edit/:ỏdẻ_id", orderController.editOrderById);
router.get("/get/:order_id", orderController.showOrderDetails);
router.get("/get", orderController.getAllOrder);
router.get("/getOrderDetaiLs/:ỏdẻ_id", orderController.getOrderDetaiLs);
router.get("/getOrder/:ỏdẻ_id", orderController.getOrderById);

router.delete("/delete/:ỏdẻ_id", validateAdmin, orderController.deleteById);
router.delete("/deleteAllOrderDetails", validateAdmin , orderController.deleteAllOrderDetails);
router.delete("/deleteAllOrder", validateAdmin , orderController.deleteAllOrder);

router.get("/getOrderByUserID/:userID", orderController.getOrderByUserID);

router.get("/displayOrderDetailInformation/:ỏdẻ_id", orderController.displayOrderDetailInformation);

//For the MongoDB database -- End Here




module.exports = router;
