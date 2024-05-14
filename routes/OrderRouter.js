var express = require("express");
var router = express.Router();
const orderController = require("../controller/OrderController");
const { validateAdmin, validateUser } = require("../validator/UsersValidator");

//For the MongoDB database -- Start Here
router.post("/create", orderController.createOrder);
router.put("/update/:order_id", orderController.updateOrderById);
router.get("/get/:order_id", orderController.showOrderDetails);
router.get("/get", orderController.getAllOrders);

router.delete(
  "/delete/:order_id",
  //   validateAdmin,
  orderController.deleteOrderById
);
router.delete("/delete", validateAdmin, orderController.deleteAllOrder);

router.get(
  "/get/customer/:customer_id",
  orderController.getOrdersByCustomerId
);

//For the MongoDB database -- End Here

module.exports = router;
