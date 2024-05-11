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
  getAllOrders: async (req, res) => {
    try {
      // Query all orders
      const sql = `
      SELECT 
        o.order_id,
        o.order_date,
        o.order_status,
        o.total_price,
        od.detail_id,
        od.quantity,
        p.product_id,
        p.product_name,
        p.product_price,
        p.product_thumbnail,
        p.product_description,
        c.category_id,
        c.category_name,
        sc.sub_id,
        sc.sub_name,
        s.size_id,
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
        SIZE_CATEGORY s ON i.size_id = s.size_id;
    `;

      db.query(sql, (err, result) => {
        if (err) {
          console.error("Error retrieving orders:", err);
          return res.status(500).json({
            status: "failed",
            error: "Internal Server Error",
          });
        }

        // Group orders by order_id
        const orders = result.reduce((acc, order) => {
          const {
            order_id,
            order_date,
            order_status,
            total_price,
            ...details
          } = order;

          if (!acc[order_id]) {
            acc[order_id] = {
              order_id,
              order_date,
              order_status,
              total_price,
              order_details: [],
            };
          }

          acc[order_id].order_details.push({
            detail_id: order.detail_id,
            quantity: order.quantity,
            product: {
              product_id: order.product_id,
              product_name: order.product_name,
              product_price: order.product_price,
              product_thumbnail: order.product_thumbnail,
              product_description: order.product_description,
              category: {
                category_id: order.category_id,
                category_name: order.category_name,
              },
              sub_category: {
                sub_id: order.sub_id,
                sub_name: order.sub_name,
              },
              size: {
                size_id: order.size_id,
                size_name: order.size_name,
              },
              stock: order.stock,
            },
          });

          return acc;
        }, {});

        const orderedOrders = Object.values(orders);

        res.status(200).json({
          status: "success",
          data: orderedOrders,
        });
      });
    } catch (error) {
      console.error("Error retrieving orders:", error);
      res.status(500).json({
        status: "failed",
        error: "Internal Server Error",
      });
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

  updateOrderById: async (req, res) => {
    try {
      const { order_id } = req.params;
      const {
        order_quantity,
        order_address,
        shipping_address,
        phoneNumber,
        order_status,
        total_price,
        items,
      } = req.body;

      // Update order details in the ORDERS table
      const updateOrderSql = `
      UPDATE ORDERS
      SET 
        order_quantity = ?,
        order_address = ?,
        shipping_address = ?,
        phoneNumber = ?,
        order_status = ?,
        total_price = ?
      WHERE
        order_id = ?;
    `;

      db.query(
        updateOrderSql,
        [
          order_quantity,
          order_address,
          shipping_address,
          phoneNumber,
          order_status,
          total_price,
          order_id,
        ],
        (err, result) => {
          if (err) {
            console.error("Error updating order:", err);
            return res.status(500).json({
              status: "failed",
              error: "Internal Server Error",
            });
          }

          // Update order details in the ORDER_DETAIL table
          const updateOrderDetailsSql = `
          UPDATE ORDER_DETAIL
          SET 
            detail_price = ?,
            quantity = ?
          WHERE
            order_id = ? AND item_id = ?;
        `;

          let updateCount = 0;
          let errorOccurred = false;

          items.forEach((item) => {
            db.query(
              updateOrderDetailsSql,
              [item.detail_price, item.quantity, order_id, item.item_id],
              (err, result) => {
                updateCount++;

                if (err) {
                  console.error("Error updating order details:", err);
                  errorOccurred = true;
                }

                if (updateCount === items.length) {
                  if (errorOccurred) {
                    return res.status(500).json({
                      status: "failed",
                      error: "Internal Server Error",
                    });
                  } else {
                    res.status(200).json({
                      status: "success",
                      message: "Order updated successfully",
                    });
                  }
                }
              }
            );
          });
        }
      );
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(400).json({ status: "failed", error: "Bad request" });
    }
  },

deleteOrderById: async (req, res) => {
  const { order_id } = req.params;

  try {
    // // Delete order details from the ORDER_DETAIL table
    // const deleteOrderDetailsSql = `
    //   DELETE FROM ORDER_DETAIL
    //   WHERE order_id = ?;
    // `;

    // await db.query(deleteOrderDetailsSql, [order_id]);

    // Delete order from the ORDERS table
    const deleteOrderSql = `
      DELETE FROM ORDERS
      WHERE order_id = ?;
    `;

    await db.query(deleteOrderSql, [order_id]);

    res.status(200).json({
      status: "success",
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({
      status: "failed",
      error: "Internal Server Error",
    });
  }
},


  getOrdersByCustomerId: async (req, res) => {
    try {
      const { customer_id } = req.params;

      // Query orders by customer_id
      const sql = `
      SELECT 
        o.order_id,
        o.order_date,
        o.order_status,
        o.total_price,
        od.detail_id,
        od.quantity,
        p.product_id,
        p.product_name,
        p.product_price,
        p.product_thumbnail,
        p.product_description,
        c.category_id,
        c.category_name,
        sc.sub_id,
        sc.sub_name,
        s.size_id,
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
        o.customer_id = ?
      ORDER BY 
        o.order_date DESC;
    `;

      db.query(sql, [customer_id], (err, result) => {
        if (err) {
          console.error("Error retrieving orders:", err);
          return res.status(500).json({
            status: "failed",
            error: "Internal Server Error",
          });
        }

        if (result.length === 0) {
          return res.status(404).json({
            status: "failed",
            error: "No orders found for the specified customer",
          });
        }

        // Group orders by order_id
        const orders = result.reduce((acc, order) => {
          const {
            order_id,
            order_date,
            order_status,
            total_price,
            ...details
          } = order;

          if (!acc[order_id]) {
            acc[order_id] = {
              order_id,
              order_date,
              order_status,
              total_price,
              order_details: [],
            };
          }

          acc[order_id].order_details.push({
            detail_id: order.detail_id,
            quantity: order.quantity,
            product: {
              product_id: order.product_id,
              product_name: order.product_name,
              product_price: order.product_price,
              product_thumbnail: order.product_thumbnail,
              product_description: order.product_description,
              category: {
                category_id: order.category_id,
                category_name: order.category_name,
              },
              sub_category: {
                sub_id: order.sub_id,
                sub_name: order.sub_name,
              },
              size: {
                size_id: order.size_id,
                size_name: order.size_name,
              },
              stock: order.stock,
            },
          });

          return acc;
        }, {});

        const orderedOrders = Object.values(orders);

        res.status(200).json({
          status: "success",
          data: orderedOrders,
        });
      });
    } catch (error) {
      console.error("Error retrieving orders:", error);
      res.status(500).json({
        status: "failed",
        error: "Internal Server Error",
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
};
