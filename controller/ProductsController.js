const db = require("../config/db");
require("dotenv").config();

module.exports = {
  createProduct: (req, res) => {
    const obj = {
      product_name: req.body.product_name,
      product_price: req.body.product_price,
      product_thumbnail: req.body.product_thumbnail,
      product_description: req.body.product_description,
      category_id: req.body.category_id,
      sub_id: req.body.sub_id,
      total_stock: req.body.total_stock,
      status: "Available",
    };
  
    const productData = [
      obj.product_name,
      obj.product_price,
      obj.product_thumbnail,
      obj.product_description,
      obj.category_id,
      obj.sub_id,
      obj.total_stock,
      obj.status,
    ];
  
    const insertQuery = `
      INSERT INTO PRODUCT 
      SET product_name=?, product_price=?, product_thumbnail=?, product_description=?, category_id=?, sub_id=?, total_stock=?, STATUS=?
    `;
    db.query(insertQuery, productData, (error, result) => {
      if (error) {
        return res.status(400).json(error);
      }
  
      return res.json({
        status: "success",
        message: "Successfully create product!",
        data: result,
      });
    });
  },
  
  getAllProducts: async (req, res) => {
    try {
      let sql = `
            SELECT 
                p.*,
                c.*,
                sc.sub_name
            FROM 
                PRODUCT p
                INNER JOIN CATEGORY c ON p.category_id = c.category_id
                INNER JOIN SUB_CATEGORY sc ON p.sub_id = sc.sub_id
        `;

      db.query(sql, (err, result) => {
        if (err) {
          return res.status(500).json({
            status: "error",
            message: "Failed to fetch products.",
            error: err.message,
          });
        }

        res.status(200).json({
          status: "success",
          message: "Successfully fetched products!",
          data: result,
        });
      });
    } catch (error) {
      res.status(400).json(error);
    }
  },

  getAllItems: async (req, res) => {
    try {
      let sql = `
        SELECT I.*, SC.size_name
        FROM ITEM I
        INNER JOIN SIZE_CATEGORY SC ON I.size_id = SC.size_id
        WHERE I.product_id = ${req.params.product_id}
        `;

      db.query(sql, (err, result) => {
        if (err) {
          return res.status(500).json({
            status: "error",
            message: "Failed to fetch products.",
            error: err.message,
          });
        }

        res.status(200).json({
          status: "success",
          message: "Successfully fetched products!",
          data: result,
        });
      });
    } catch (error) {
      res.status(400).json(error);
    }
  },

  getProductById: async (req, res) => {
    try {
      const product_id = req.params.product_id;
      const sql = "SELECT * FROM PRODUCT WHERE product_id = ?";
      const value = [product_id];
      db.query(sql, value, (error, results) => {
        if (error) {
          return res.status(500).json({
            error: "Internal Server Error"
          });
        }
        if (results.length === 0) {
          return res.status(404).json({
            error: "Product not found"
          });
        }
        const productData = results[0];

        return res.json({
          status: "success",
          data: productData,
        });
      });
    } catch {
      res.status(400).json({
        error: "Bad Request"
      });
    }
  },

  editProductById: async (req, res) => {
    try {
        const product_id = req.params.product_id;
        const {
            product_name,
            product_price,
            product_thumbnail,
            product_description,
            category_id,
            sub_id,
            total_stock,
            status 
        } = req.body;

        const updatedStatus = total_stock === 0 ? "Unavailable" : status;

        const updateSql = "UPDATE PRODUCT SET product_name=?, product_price=?, product_thumbnail=?, product_description=?, category_id=?, sub_id=?, total_stock=?, STATUS=? WHERE product_id=?";

        const updateValues = [
            product_name,
            product_price,
            product_thumbnail,
            product_description,
            category_id,
            sub_id,
            total_stock,
            updatedStatus,
            product_id,
        ];

        db.query(updateSql, updateValues, (updateErr, updateResult) => {
            if (updateErr) {
                return res.status(500).json({
                    status: "error",
                    message: "Internal server error",
                    error: updateErr.message,
                });
            }

            if (updateResult.affectedRows === 0) {
                return res.status(404).json({
                    status: "error",
                    message: `Product with ID ${product_id} not found`,
                });
            }

            res.json({
                status: "success",
                message: `Successfully updated product with ID ${product_id}!`,
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

  getAllProductAvailable: async (req, res) => {
    try {
      const status = "Available";
      const sql = "SELECT * FROM PRODUCT where status = ?";
      const value = [status];

      db.query(sql, value, (err, result) => {
        res.status(200).json({
          status: "success",
          message: "Successfully get all products!",
          data: result,
        });
      });
    } catch (error) {
      res.status(400).json(error);
    }
  },

  getByProductCategory: async (req, res) => {
    try {
        const category_name = req.query.category_name;
        const sub_name = req.query.sub_name;
        let sql = `
            SELECT 
                p.*,
                c.*,
                sc.sub_name
            FROM 
                PRODUCT p
                INNER JOIN CATEGORY c ON p.category_id = c.category_id
                INNER JOIN SUB_CATEGORY sc ON p.sub_id = sc.sub_id
            WHERE 
                1=1 ${category_name ? 'AND c.category_name = ?' : ''} ${sub_name ? 'AND sc.sub_name = ?' : ''} 
        `;

        const params = [];
        if (category_name) params.push(category_name);
        if (sub_name) params.push(sub_name);

        db.query(sql, params, (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: "error",
                    message: "Failed to fetch products.",
                    error: err.message,
                });
            }

            res.status(200).json({
                status: "success",
                message: "Successfully fetched products!",
                data: result,
            });
        });
    } catch (error) {
        res.status(400).json(error);
    }
},



  getByProductCategoryList: async (req, res) => {
    try {
      const sql = "SELECT * FROM CATEGORY";

      db.query(sql, (err, result) => {
        res.status(200).json({
          status: "success",
          message: "Successfully get all categories!",
          data: result,
        });
      });
    } catch (error) {
      res.status(400).json(error);
    }
  },

  getBySubCateByCateId: async (req, res) => {
    try {
      const category_id = req.params.category_id;

      const sql = "SELECT * FROM SUB_CATEGORY WHERE category_id = ?";

      db.query(sql, [category_id] , (err, result) => {
        res.status(200).json({
          status: "success",
          message: "Successfully get all categories!",
          data: result,
        });
      });
    } catch (error) {
      res.status(400).json(error);
    }
  },

  getProductUnavailable: async (req, res) => {
    try {
      const status = "Unavailable";
      const sql = "SELECT * FROM products where status = ?";
      const value = [status];

      db.query(sql, value, (err, result) => {
        res.status(200).json({
          status: "success",
          message: "Successfully get all products!",
          data: result,
        });
      });
    } catch (error) {
      res.status(400).json(error);
    }
  },

  deleteProductController: async (req, res) => {
    try {
        const productID = req.params.product_id;
        const updateSql = "UPDATE PRODUCT SET STATUS = 'Unavailable' WHERE product_id = ?";
        const updateValues = [productID];

        db.query(updateSql, updateValues, (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: "error",
                    message: "Internal server error",
                    error: err.message,
                });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({
                    status: "error",
                    message: `Product with ID ${productID} not found`,
                });
            }
            res.json({
                status: "success",
                message: `Successfully updated status to 'Unavailable' for product with ID ${productID}!`,
            });
        });
    } catch (err) {
        res.status(400).json({
            status: "error",
            message: "Bad request",
            error: err.message,
        });
    }
},

  checkQuantityOfProduct: async (req, res) => {
    try {
      const productID = req.body.productID;
      const requestedQuantity = req.body.orderQuantity;
      const price = req.body.price;
      const sql = "SELECT quantity FROM products WHERE productID = ?";
      const values = [productID];

      db.query(sql, values, (err, result) => {
        if (err) {
          throw new Error(err.message);
        }

        if (result.length > 0) {
          const availableQuantity = result[0].quantity;

          if (availableQuantity >= requestedQuantity) {
            res.status(200).json({
              status: "Sufficient Quantity",
              message: "Product has enough quantity",
            });
          } else {
            res.status(400).json({
              status: "Not Enough Quantity",
              message: "Not Enough Quantity",
            });
          }
        } else {
          res.status(404).json({
            status: "Product not found",
            message: `Product with ID ${productID} not found`,
          });
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "Internal Server Error",
        message: "An error occurred while processing the request",
        error: error.message,
      });
    }
  },
};