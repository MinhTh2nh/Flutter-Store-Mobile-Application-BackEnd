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
  getSizeList: async (req, res) => {
    try {
      const sql = "SELECT * FROM SIZE_CATEGORY";
      db.query(sql, (err, result) => {
        if (err) {
          return res.status(500).json({
            status: "error",
            message: "Failed to fetch sizes.",
            error: err.message,
          });
        }

        res.status(200).json({
          status: "success",
          message: "Successfully fetched sizes!",
          data: result,
        });
      });
    } catch {
      res.status(400).json({
        error: "Bad Request",
      });
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
            error: "Internal Server Error",
          });
        }
        if (results.length === 0) {
          return res.status(404).json({
            error: "Product not found",
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
        error: "Bad Request",
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
        status,
      } = req.body;

      const updatedStatus = total_stock === 0 ? "Unavailable" : status;

      const updateSql =
        "UPDATE PRODUCT SET product_name=?, product_price=?, product_thumbnail=?, product_description=?, category_id=?, sub_id=?, total_stock=?, STATUS=? WHERE product_id=?";

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

  editCategoryById: async (req, res) => {
    try {
      const category_id = req.params.category_id;
      const { category_name, category_description, category_thumbnail } =
        req.body;

      const updateSql =
        "UPDATE CATEGORY SET category_name=?, category_description=?, category_thumbnail=? WHERE category_id=?";

      const updateValues = [
        category_name,
        category_description,
        category_thumbnail,
        category_id,
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
            message: `Category with ID ${category_id} not found`,
          });
        }

        res.json({
          status: "success",
          message: `Successfully updated Category with ID ${category_id}!`,
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

  editSubCategoryById: async (req, res) => {
    try {
      const sub_id = req.params.sub_id;
      const { sub_name, category_id } =
        req.body;

      const updateSql =
        "UPDATE SUB_CATEGORY SET sub_name=?, category_id=? WHERE sub_id=?";

      const updateValues = [
        sub_name,
        category_id,
        sub_id,
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
            message: `Sub Category with ID ${sub_id} not found`,
          });
        }

        res.json({
          status: "success",
          message: `Successfully updated Sub Category with ID ${sub_id}!`,
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
  editProductItemById: async (req, res) => {
    try {
      const item_id = req.params.item_id;
      const { product_id, size_id , stock} =
        req.body;

      const updateSql =
        "UPDATE ITEM SET product_id=?, size_id=? , stock=? WHERE item_id=?";

      const updateValues = [
        product_id,
        size_id,
        stock,
        item_id,
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
            message: `Item with ID ${item_id} not found`,
          });
        }

        res.json({
          status: "success",
          message: `Item updated with ID ${item_id}!`,
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
                1=1 ${category_name ? "AND c.category_name = ?" : ""} ${
        sub_name ? "AND sc.sub_name = ?" : ""
      } 
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

  getByProductCategoryId: async (req, res) => {
    try {
      const sql = "SELECT * FROM CATEGORY where category_id = ?";

      db.query(sql, [req.params.category_id], (err, result) => {
        if (err) {
          console.error("Error fetching category:", err);
          return res.status(500).json({
            status: "error",
            message: "Failed to fetch category",
            error: err.message, // Send error message for debugging
          });
        }

        // Check if category exists
        if (result.length === 0) {
          return res.status(404).json({
            status: "error",
            message: "Category not found",
          });
        }

        // Category found, send response
        res.status(200).json({
          status: "success",
          message: "Successfully fetched category",
          data: result[0], // Assuming category_id is unique, so only one result
        });
      });
    } catch (error) {
      // Catch synchronous errors (unlikely in this case)
      console.error("Error:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.message, // Send error message for debugging
      });
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

      db.query(sql, [category_id], (err, result) => {
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

  createProductItem: async (req, res) => {
    try {
      const obj = {
        product_id: req.body.product_id,
        size_id: req.body.size_id,
        stock: req.body.stock,
      };

      const checkDuplicateQuery = `
        SELECT * FROM ITEM 
        WHERE product_id = ? AND size_id = ?
      `;

      db.query(
        checkDuplicateQuery,
        [obj.product_id, obj.size_id],
        (err, result) => {
          if (err) {
            throw err; // Throw error if there's an issue with the query execution
          }

          // If a duplicate item is found, return an error response
          if (result.length > 0) {
            return res.status(400).json({
              status: "error",
              message:
                "Product item with the same product_id and size_id already exists!",
            });
          }

          // If no duplicate item is found, proceed with the insertion
          const insertQuery = `
          INSERT INTO ITEM 
          SET ?
        `;

          db.query(insertQuery, obj, (err, result) => {
            if (err) {
              throw err; // Throw error if there's an issue with the query execution
            }
            res.status(200).json({
              status: "success",
              message: "Item created successfully!",
              data: result,
            });
          });
        }
      );
    } catch (error) {
      res.status(400).json(error);
    }
  },

  createSubCategory: async (req, res) => {
    try {
      const obj = {
        category_id: req.body.category_id,
        sub_name: req.body.sub_name,
      };

      const checkDuplicateQuery = `
        SELECT * FROM SUB_CATEGORY 
        WHERE sub_name = ?
      `;

      db.query(checkDuplicateQuery, [obj.sub_name], (err, result) => {
        if (err) {
          throw err; // Throw error if there's an issue with the query execution
        }

        // If a duplicate item is found, return an error response
        if (result.length > 0) {
          return res.status(400).json({
            status: "error",
            message: "Subcategory with the same sub_name already exists!",
          });
        }

        // If no duplicate item is found, proceed with the insertion
        const insertQuery = `
          INSERT INTO SUB_CATEGORY 
          SET ?
        `;

        db.query(insertQuery, obj, (err, result) => {
          if (err) {
            throw err; // Throw error if there's an issue with the query execution
          }
          res.status(200).json({
            status: "success",
            message: "Sub-category created successfully!",
            data: result,
          });
        });
      });
    } catch (error) {
      res.status(400).json(error);
    }
  },
  
  createSize: async (req, res) => {
    try {
      const obj = {
        size_name: req.body.size_name,
      };

      const checkDuplicateQuery = `
        SELECT * FROM SIZE_CATEGORY 
        WHERE size_name = ?
      `;

      db.query(checkDuplicateQuery, [obj.size_name], (err, result) => {
        if (err) {
          throw err; // Throw error if there's an issue with the query execution
        }

        // If a duplicate item is found, return an error response
        if (result.length > 0) {
          return res.status(400).json({
            status: "error",
            message: "Size with the same size_name already exists!",
          });
        }

        // If no duplicate item is found, proceed with the insertion
        const insertQuery = `
          INSERT INTO SIZE_CATEGORY 
          SET ?
        `;

        db.query(insertQuery, obj, (err, result) => {
          if (err) {
            throw err; // Throw error if there's an issue with the query execution
          }
          res.status(200).json({
            status: "success",
            message: "size_name created successfully!",
            data: result,
          });
        });
      });
    } catch (error) {
      res.status(400).json(error);
    }
  },
  createCategory: async (req, res) => {
    try {
      const obj = {
        category_id: req.body.category_id,
        sub_name: req.body.sub_name,
      };

      const checkDuplicateQuery = `
        SELECT * FROM SUB_CATEGORY 
        WHERE sub_name = ?
      `;

      db.query(checkDuplicateQuery, [obj.sub_name], (err, result) => {
        if (err) {
          throw err; // Throw error if there's an issue with the query execution
        }

        // If a duplicate item is found, return an error response
        if (result.length > 0) {
          return res.status(400).json({
            status: "error",
            message: "Subcategory with the same sub_name already exists!",
          });
        }

        // If no duplicate item is found, proceed with the insertion
        const insertQuery = `
          INSERT INTO SUB_CATEGORY 
          SET ?
        `;

        db.query(insertQuery, obj, (err, result) => {
          if (err) {
            throw err; // Throw error if there's an issue with the query execution
          }
          res.status(200).json({
            status: "success",
            message: "Sub-category created successfully!",
            data: result,
          });
        });
      });
    } catch (error) {
      res.status(400).json(error);
    }
  },
  deleteProductController: async (req, res) => {
    try {
      const productID = req.params.product_id;
      const updateSql =
        "UPDATE PRODUCT SET STATUS = 'Unavailable' WHERE product_id = ?";
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

  //Add new review
  addReview: async (req, res) => {
    try {
      const { review_rating, review_comment, item_id, customer_id } = req.body;

      if (!review_rating || !item_id || !customer_id) {
        return res.status(400).json({
          status: "error",
          message: "Please provide all required fields",
        });
      }

      const insertSql = `INSERT INTO REVIEW (review_rating, review_comment, item_id, customer_id) VALUES (?, ?, ?, ?)`;
      db.query(
        insertSql,
        [review_rating, review_comment, item_id, customer_id],
        (err, result) => {
          if (err) {
            return res.status(500).json({
              status: "error",
              message: "Internal server error",
              error: err.message,
            });
          }

          res.status(200).json({
            status: "success",
            message: "Review added successfully",
            data: {
              // review_id: result.insertId,
              review_rating,
              review_comment,
              item_id,
              customer_id,
              review_timestamp: new Date(),
            },
          });
        }
      );
    } catch (error) {
      console.error("Error adding review:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // Get all reviews
  getAllReviewByProductId: async (req, res) => {
    try {
      const {product_id} = req.params;

      const query = `
        SELECT
        R.*
        FROM
          REVIEW R INNER JOIN ITEM I ON R.item_id = I.item_id
          WHERE I.product_id = ?
      `
      db.query(query,[product_id], (err, result) => {
        if (err) {
          return res.status(500).json({
            status: "error",
            message: "Internal server error",
            error: err.message,
          });
        }

        res.status(200).json({
          status: "success",
          message: "Successfully fetched reviews",
          data: result,
        });
      });
    } catch (error){
      console.error("Error fetching reviews:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
        error: error.message,
      });
    }
  }
};
