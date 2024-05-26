const express = require("express");
const router = express.Router();
const paymentController = require("../controller/paymentController");

router.get("/", paymentController.getOrderList);
router.get("/create_payment_url", paymentController.createPaymentUrl);
router.post("/create_payment_url", paymentController.createPaymentUrl);
router.get("/vnpay_return", paymentController.vnpayReturn);
router.get("/vnpay_ipn", paymentController.vnpayIpn);

module.exports = router;
