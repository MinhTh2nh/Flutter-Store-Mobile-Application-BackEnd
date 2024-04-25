const db = require("../config/db");
require("dotenv").config();

module.exports = {
  createOrder: (req, res) => {
    const orderData = {
      userID: req.body.userID,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      country: req.body.country,
      city: req.body.city,
      address: req.body.address,
      phoneNumber: req.body.phoneNumber,
      postalCode: req.body.postalCode,
      pMethod: req.body.pMethod,
      shippingCost: req.body.shippingCost,

      totalPrice: req.body.totalPrice,
      status: "Draft",
    };

    const products = req.body.products;

    db.beginTransaction((err) => {
      if (err) {
        return res.status(500).json({
          status: "error",
          message: "Transaction Begin Error",
          error: err.message,
        });
      }

      db.query("INSERT INTO orders SET ?", orderData, (error, result) => {
        if (error) {
          return db.rollback(() => {
            res.status(400).json(error);
          });
        }

        const orderID = result.insertId;

        const order_detailData = products.map((product) => [
          orderID,
          product.productID,
          product.orderQuantity,
        ]);

        db.query(
          "INSERT INTO order_detail (orderID, productID, orderQuantity) VALUES ?",
          [order_detailData],
          (err, result) => {
            if (err) {
              return db.rollback(() => {
                res.status(400).json(err);
              });
            }

            // Update product quantities and status
            const updateProductQuantities = products.map((product) => ({
              orderQuantity: product.orderQuantity,
              productID: product.productID,
            }));

            // Use Promise.all to wait for all update queries to finish
            Promise.all(
              updateProductQuantities.map((updateData) => {
                return new Promise((resolve) => {
                  db.query(
                    "UPDATE products SET quantity = quantity - ? WHERE productID = ?",
                    [updateData.orderQuantity, updateData.productID],
                    (err) => {
                      if (err) {
                        db.rollback(() => {
                          res.status(400).json(err);
                          resolve();
                        });
                      } else {
                        if (updateData.orderQuantity === 0) {
                          db.query(
                            "UPDATE products SET status = 'Unavailable' WHERE productID = ?",
                            [updateData.productID],
                            (err) => {
                              if (err) {
                                db.rollback(() => {
                                  res.status(400).json(err);
                                });
                              }
                              resolve();
                            }
                          );
                        } else {
                          resolve();
                        }
                      }
                    }
                  );
                });
              })
            ).then(() => {
              db.commit((err) => {
                if (err) {
                  return db.rollback(() => {
                    res.status(500).json(err);
                  });
                }

                res.json({
                  status: "success",
                  message: "Successfully create order!",
                  data: result,
                });
              });
            });
          }
        );
      });
    });
  },
  getAllOrder: async (req, res) => {
    try {
      const sql = "SELECT * FROM orders";
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
        orderID
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
          message: "Successfully deleted all records from 'order_detail' table!",
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
}
};