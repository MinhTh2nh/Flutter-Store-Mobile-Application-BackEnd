const db = require("../config/db");
require("dotenv").config();

module.exports = {
  createOrder: (req, res) => {
    try {
      const {
        customer_id,
        order_quantity,
        order_address,
        shipping_address,
        phoneNumber,
        order_status,
        total_price,
        items,
      } = req.body;
      //insert order into ORDERS table
      const insertOrderSql = `INSERT INTO ORDERS (order_quantity, order_address, shipping_address, phoneNumber, order_status, total_price, customer_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      db.query(
        insertOrderSql,
        [
          order_quantity,
          order_address,
          shipping_address,
          phoneNumber,
          order_status,
          total_price,
          customer_id,
        ],
        (err, result) => {
          if (err) {
            console.error("Error inserting order:", err);
            return res
              .status(500)
              .json({ status: "falied", error: "Internal Server Error" });
          }

          const orderID = result.insertId;

          //insert order details into ORDER_DETAILS table
          const insertOrderDetailsSql = `INSERT INTO ORDER_DETAIL (detail_price, item_id,order_id, quantity) VALUES ?`;
          const orderDetailValues = items.map((item) => [
            item.detail_price,
            item.item_id,
            orderID,
            item.quantity,
          ]);

          db.query(
            insertOrderDetailsSql,
            [orderDetailValues],
            (err, result) => {
              if (err) {
                console.error("Error inserting order details:", err);
                return res
                  .status(500)
                  .json({ status: "falied", error: "Internal Server Error" });
              }

              res.status(200).json({
                status: "success",
                message: "Successfully created order!",
                order_id: orderID,
              });
            }
          );
        }
      );
    } catch (error) {
      console.error("Error in createOrder:", error);
      res.status(400).json({ status: "failed", error: "Bad request" });
    }
  },
  getAllOrder: async (req, res) => {
    try {
      const sql = "SELECT * FROM ORDERS";
      db.query(sql, (err, result) => {
        res.status(200).json({
          status: "success",
          message: "Successfully get all orders!",
          data: result,
        });
      });
    } catch (error) {
      res.status(400).json(error);
    }
  },

  showOrderDetails: async (req, res) => {
    try {
      const { order_id } = req.params;
      console.log("order_id", order_id);

      // Query order details
      const sql = `
      SELECT 
          o.*,
          od.detail_id,
          od.detail_price,
          od.item_id,
          od.quantity,
          p.product_name,
          p.product_price,
          p.product_thumbnail,
          c.category_name,
          sc.sub_name,
          sc.category_id,
          sc.sub_id,
          s.size_name,
          i.stock
          FROM 
              ORDERS o
          JOIN 
              ORDER_DETAIL od ON o.order_id = od.order_id
          JOIN 
              ITEM i ON od.item_id = i.item_id
          JOIN 
              PRODUCT p ON i.product_id = p.product_id
          JOIN 
              CATEGORY c ON p.category_id = c.category_id
          JOIN 
              SUB_CATEGORY sc ON p.sub_id = sc.sub_id
          JOIN 
              SIZE_CATEGORY s ON i.size_id = s.size_id
          WHERE 
              o.order_id = ?;
    `;

      db.query(sql, [order_id], (err, result) => {
        if (err) {
          console.error("Error retrieving order details:", err);
          return res.status(500).json({
            status: "failed",
            error: "Internal Server Error",
          });
        }

        if (result.length === 0) {
          return res.status(404).json({
            status: "failed",
            error: "Order not found",
          });
        }

        // Consolidate order details
        const orderDetails = result.map((row) => ({
          detail_id: row.detail_id,
          detail_price: row.detail_price,
          item_id: row.item_id,
          quantity: row.quantity,
          product: {
            product_name: row.product_name,
            product_price: row.product_price,
            product_thumbnail: row.product_thumbnail,
            category: {
              category_name: row.category_name,
            },
            sub_category: {
              sub_name: row.sub_name,
              category_id: row.category_id,
              sub_id: row.sub_id,
            },
          },
          size: {
            size_name: row.size_name,
            stock: row.stock,
          },
        }));

        res.status(200).json({
          status: "success",
          data: {
            order_id: result[0].order_id,
            order_quantity: result[0].order_quantity,
            order_address: result[0].order_address,
            shipping_address: result[0].shipping_address,
            phoneNumber: result[0].phoneNumber,
            order_date: result[0].order_date,
            order_status: result[0].order_status,
            total_price: result[0].total_price,
            order_details: orderDetails,
          },
        });
      });
    } catch (error) {
      console.error("Error retrieving order details:", error);
      res.status(500).json({
        status: "failed",
        error: "Internal Server Error",
      });
    }
  },

  editOrderById: async (req, res) => {
    try {
      const orderID = req.params.orderID;
      const {
        firstName,
        lastName,
        email,
        country,
        city,
        address,
        phoneNumber,
        postalCode,
        status,
        totalPrice,
        pMethod,
        shippingCost,
      } = req.body;

      const updateSql =
        "UPDATE orders SET firstName=?, lastName=?, email=?, country=?, city=?, address=?, phoneNumber=?, postalCode=?, status=?, totalPrice=? , pMethod=?, shippingCost=? WHERE orderID=?";

      const updateValues = [
        firstName,
        lastName,
        email,
        country,
        city,
        address,
        phoneNumber,
        postalCode,
        status,
        totalPrice,
        pMethod,
        shippingCost,
        orderID,
      ];

      // Execute the update query
      const updateResult = await new Promise((resolve, reject) => {
        db.query(updateSql, updateValues, (updateErr, result) => {
          if (updateErr) {
            reject(updateErr);
          } else {
            resolve(result);
          }
        });
      });

      if (updateResult.affectedRows === 0) {
        return res.status(404).json({
          status: "error",
          message: `Order with ID ${orderID} not found`,
        });
      }

      // Check if the status is set to "Cancelled"
      if (status === "Cancelled") {
        // Retrieve order details to get product IDs and quantities
        const getOrder_detailSql =
          "SELECT productID, orderQuantity FROM order_detail WHERE orderID = ?";

        db.query(getOrder_detailSql, [orderID], (err, order_detailRows) => {
          if (err) {
            console.error("Error retrieving order details:", err);
            return;
          }

          // Log the content of order_detailRows
          console.log("order_detailRows:", order_detailRows);

          // Check if order_detailRows is an array and has at least one row
          if (Array.isArray(order_detailRows) && order_detailRows.length > 0) {
            // Update product quantities in the products table
            for (const orderDetail of order_detailRows) {
              const updateProductQuantitySql =
                "UPDATE products SET quantity = quantity + ? WHERE productID = ?";
              db.query(
                updateProductQuantitySql,
                [orderDetail.orderQuantity, orderDetail.productID],
                (err) => {
                  if (err) {
                    console.error("Error updating product quantity:", err);
                  }
                }
              );
            }
          } else {
            console.error("No order details found for orderID:", orderID);
          }
        });
      }

      res.json({
        status: "success",
        message: `Successfully updated Order with ID ${orderID}!`,
      });
    } catch (error) {
      res.status(400).json({
        status: "error",
        message: "Bad request",
        error: error.message,
      });
    }
  },
  deleteById: async (req, res) => {
    try {
      const orderID = req.params.orderID;

      // Delete order details first
      const deleteOrderDetailsSql = "DELETE FROM order_detail WHERE orderID =?";
      const orderDetailsValue = [orderID];

      db.query(deleteOrderDetailsSql, orderDetailsValue, (err, result) => {
        if (err) {
          return res.status(500).json({
            status: "error",
            message: "Error deleting order details",
          });
        }

        // Now, delete the order
        const deleteOrderSql = "DELETE FROM orders WHERE orderID =?";
        const orderValue = [orderID];

        db.query(deleteOrderSql, orderValue, (err, result) => {
          if (err) {
            return res.status(500).json({
              status: "error",
              message: "Error deleting order",
            });
          }

          res.json({
            status: "success",
            message: `Successfully deleted order and related details for orderID ${orderID}!`,
          });
        });
      });
    } catch (err) {
      res.status(400).json({
        status: "error",
        message: "Bad request",
      });
    }
  },
  getOrderDetaiLs: async (req, res) => {
    try {
      const orderID = req.params.orderID;
      const sql = "Select * FROM order_detail WHERE orderID =?";
      const value = [orderID];
      db.query(sql, value, (err, result) => {
        res.json({
          status: "success",
          message: `Successfully fetch details id of ${orderID} !`,
          data: result,
        });
      });
    } catch (err) {
      res.status(400).json(error);
    }
  },
  getOrderById: async (req, res) => {
    try {
      const orderID = req.params.orderID;
      const sql = "SELECT * FROM orders WHERE orderID = ?";
      const value = [orderID];

      db.query(sql, value, (err, result) => {
        if (err) {
          return res.status(500).json({
            status: "error",
            message: "Error retrieving order by ID",
            error: err.message,
          });
        }

        if (result.length === 0) {
          return res.status(404).json({
            status: "error",
            message: `Order with ID ${orderID} not found`,
          });
        }

        res.json({
          status: "success",
          message: `Successfully retrieved Order with ID ${orderID}!`,
          data: result[0],
        });
      });
    } catch (error) {
      res.status(400).json({
        status: "error",
        message: "Bad request",
        error: error.message,
      });
    }
  },
  getOrderByUserID: async (req, res) => {
    try {
      const userID = req.params.userID;
      const sql = "SELECT * FROM orders WHERE userID = ?";
      const value = [userID];

      db.query(sql, value, (err, result) => {
        if (err) {
          return res.status(500).json({
            status: "error",
            message: "Error retrieving order by ID",
            error: err.message,
          });
        }

        if (result.length === 0) {
          return res.status(404).json({
            status: "error",
            message: `Order with ID ${userID} not found`,
          });
        }

        res.json({
          status: "success",
          message: `Successfully retrieved Order with ID ${userID}!`,
          data: result,
        });
      });
    } catch (error) {
      res.status(400).json({
        status: "error",
        message: "Bad request",
        error: error.message,
      });
    }
  },
  deleteAllOrder: async (req, res) => {
    try {
      const sql = "DELETE FROM orders ";
      db.query(sql, (err, result) => {
        if (err) {
          res.status(400).json(err);
          return;
        }

        res.json({
          status: "success",
          message: "Successfully deleted all records from 'orders' table!",
        });
      });
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  deleteAllOrderDetails: async (req, res) => {
    try {
      const sql = "DELETE FROM order_detail ";
      db.query(sql, (err, result) => {
        if (err) {
          res.status(400).json(err);
          return;
        }

        res.json({
          status: "success",
          message:
            "Successfully deleted all records from 'order_detail' table!",
        });
      });
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  displayOrderDetailInformation: async (req, res) => {
    try {
      const orderID = req.params.orderID;
      // SQL query to retrieve order details along with product name and price
      const getOrderDetailsSql = `
            SELECT 
                od.productID,
                p.name,
                p.price,
                p.image,
                od.orderQuantity
            FROM 
                order_detail od
            JOIN
                products p ON od.productID = p.productID
            WHERE
                od.orderID = ?
        `;

      // Execute the query
      db.query(getOrderDetailsSql, [orderID], (err, orderDetails) => {
        if (err) {
          console.error("Error retrieving order details:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        // Send the order details to the client
        res.json({ orderDetails });
      });
    } catch (err) {
      console.error("Error in displayOrderDetailInformation:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
