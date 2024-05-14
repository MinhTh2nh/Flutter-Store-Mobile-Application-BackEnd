const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validateRegisterInput = require("../validator/RegisterValidator");
const db = require("../config/db");
require("dotenv").config();

module.exports = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const obj = { name, email, password };

      // Validation for registration input
      const { errors, isValid } = validateRegisterInput(obj);

      if (!isValid) {
        return res.status(errors.status).json(errors);
      }

      // Check if the email already exists
      const checkEmailQuery = "SELECT * FROM CUSTOMER WHERE email = ?";

      db.query(checkEmailQuery, [email], async (err, result) => {
        if (err) {
          return res.status(500).json({
            status: "failed",
            error: "Internal Server Error",
          });
        }

        if (result.length > 0) {
          return res.status(401).json({
            status: "error",
            error: `Email "${email}" already exists!`,
          });
        }

        // Hash the user's password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // If email doesn't exist, insert the new user
        const insertUserQuery = "INSERT INTO CUSTOMER SET ?";
        db.query(
          insertUserQuery,
          { name, email, password: hashedPassword },
          (err, result) => {
            if (err) {
              return res.status(400).json(err);
            }

            // Generate a token for the newly registered user
            const token = generateToken(email); // Replace with your token generation logic

            res.json({
              status: "success",
              message: "Successfully created account!",
              token: token, // Return the token
              data: result,
            });
          }
        );
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        status: "failed",
        error: "Internal Server Error",
      });
    }
  },

  login: async (req, res) => {
    try {
      const email = req.body.email;
      const password = req.body.password;

      const sql = `SELECT * FROM CUSTOMER WHERE email = ?`;

      db.query(sql, [email], async (err, result) => {
        if (err) {
          return res.status(500).json({
            status: "failed",
            error: "Internal Server Error",
          });
        }

        // Check if user exists
        if (result.length === 0) {
          return res.status(404).json({
            status: "failed",
            error: "User not found",
          });
        }

        const user = result[0];

        // Validate password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
          // Make payload for token
          const payload = {
            userID: user.userID,
            email: user.email,
            name: user.name,
          };

          // Sign token
          jwt.sign(
            payload,
            process.env.JWT_SECRET_KEY,
            {
              expiresIn: 100,
            },
            (err, token) => {
              res.json({
                status: "success",
                token: token,
                user: user,
              });
            }
          );
        } else {
          return res.status(401).json({
            status: "failed",
            error: "Password incorrect",
          });
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        status: "failed",
        error: "Internal Server Error",
      });
    }
  },

  // loginAdmin: async (req, res) => {
  //   try {
  //     const email = req.body.email;
  //     const password = req.body.password;
  //     const sql = `SELECT * FROM users WHERE email = ?`;
  //     db.query(sql, [email], async (err, result) => {
  //       if (err) {
  //         return res.status(500).json({
  //           status: "failed",
  //           error: "Internal Server Error",
  //         });
  //       }
  //       // Check if user exists
  //       if (result.length === 0) {
  //         return res.status(404).json({
  //           status: "failed",
  //           error: "User not found",
  //         });
  //       }
  //       const user = result[0];

  //       if (!user || user.role !== "Admin") {
  //         return res
  //           .status(404)
  //           .json({ status: "failed", error: "Admin's email not found" });
  //       }
  //       const passwordMatch = await bcrypt.compare(password, user.password);
  //       if (passwordMatch) {
  //         const payload = {
  //           userID: user.userID,
  //           email: user.email,
  //           name: user.name,
  //         };
  //         jwt.sign(
  //           payload,
  //           process.env.PRIVATE_KEY,
  //           { expiresIn: 100 },
  //           (err, token) => {
  //             res.json({
  //               status: "success",
  //               message: "You're an admin!",
  //               token: token,
  //             });
  //           }
  //         );
  //       } else {
  //         return res.status(404).json({
  //           status: "failed",
  //           error: "Password incorrect",
  //         });
  //       }
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     res
  //       .status(500)
  //       .json({ status: "failed", error: "Internal Server Error" });
  //   }
  // },

  //get all users
  getAllUsers: async (req, res) => {
    try {
      const sql = "SELECT * FROM CUSTOMER";
      db.query(sql, (err, result) => {
        res.status(200).json({
          status: "success",
          message: "Successfully get all customers!",
          data: result,
        });
      });
    } catch (error) {
      res.status(400).json(error);
    }
  },

  //Get user by ID
  getUserID: async (req, res) => {
    try {
      const customer_id = req.params.customer_id;
      const sql = "SELECT * FROM CUSTOMER WHERE customer_id = ?";
      const value = [userID];
      db.query(sql, value, (err, result) => {
        res.json({
          status: "success",
          message: `Successfully get data id of ${customer_id} !`,
          data: result,
        });
      });
    } catch (error) {
      res.status(400).json(error);
    }
  },

  //Delete user by ID
  deleteById: async (req, res) => {
    try {
      const userID = req.params.userID;
      const sql = "UPDATE users SET status = 'Banned' WHERE userID = ?";
      const value = [userID];
      db.query(sql, value, (err, result) => {
        res.json({
          status: "success",
          message: `Successfully banned user with ID ${userID}!`,
        });
      });
    } catch (err) {
      res.status(400).json({
        status: "error",
        message: "Bad Request",
      });
    }
  },

  //Update user by ID
  updateID: async (req, res) => {
    try {
      const userID = req.params.userID;
      const { name, email, phoneNumber } = req.body;

      // Check if the new email already exists in the database
      const emailCheckSql =
        "SELECT COUNT(*) as count FROM users WHERE email = ?";
      const emailCheckValues = [email];

      db.query(
        emailCheckSql,
        emailCheckValues,
        (emailCheckErr, emailCheckResult) => {
          if (emailCheckErr) {
            return res.status(500).json({
              status: "error",
              message: "Internal server error",
              error: emailCheckErr.message,
            });
          }

          const emailExists = emailCheckResult[0].count > 0;

          if (emailExists) {
            return res.status(400).json({
              status: "error",
              message: "Email already exists in the database",
            });
          }

          // Check if the new phoneNumber already exists in the database
          const phoneNumberCheckSql =
            "SELECT COUNT(*) as count FROM users WHERE phoneNumber = ?";
          const phoneNumberCheckValues = [phoneNumber];

          db.query(
            phoneNumberCheckSql,
            phoneNumberCheckValues,
            (phoneNumberCheckErr, phoneNumberCheckResult) => {
              if (phoneNumberCheckErr) {
                return res.status(500).json({
                  status: "error",
                  message: "Internal server error",
                  error: phoneNumberCheckErr.message,
                });
              }

              const phoneNumberExists = phoneNumberCheckResult[0].count > 0;

              if (phoneNumberExists) {
                return res.status(400).json({
                  status: "error",
                  message: "Phone number already exists in the database",
                });
              }

              // If both email and phoneNumber are unique, proceed with the update
              const updateSql =
                "UPDATE users SET name=?, email=?, phoneNumber=? WHERE userID=?";
              const updateValues = [name, email, phoneNumber, userID];

              db.query(updateSql, updateValues, (updateErr, updateResult) => {
                if (updateErr) {
                  return res.status(500).json({
                    status: "error",
                    message: "Internal server error",
                    error: updateErr.message,
                  });
                }

                res.json({
                  status: "success",
                  message: `Successfully updated user with ID ${userID}!`,
                });
              });
            }
          );
        }
      );
    } catch (error) {
      res.status(400).json({
        status: "error",
        message: "Bad request",
        error: error.message,
      });
    }
  },

  // Add address for customer
  addCustomerDetail: async (req, res) => {
    try {
      const { customer_id, phone, address } = req.body;
      // Insert new customer detail
      const insertSql = `INSERT INTO CUSTOMER_DETAIL (customer_id, phone, address) VALUES (?, ?, ?)`;
      db.query(insertSql, [customer_id, phone, address], (err, result) => {
        if (err) {
          return res.status(500).json({
            status: "failed",
            error: "Internal Server Error",
          });
        }

        res.status(200).json({
          status: "success",
          message: "Customer detail added successfully",
          data: result,
        });
      });
    } catch (error) {
      console.error("Error adding customer detail:", error);
      res.status(500).json({
        status: "failed",
        error: "Internal Server Error",
      });
    }
  },

  getCustomerDetail: async (req, res) => {
    try {
      const { customer_id } = req.params;

      // Query customer details
      const sql = `SELECT * FROM CUSTOMER_DETAIL WHERE customer_id = ?`;
      db.query(sql, [customer_id], (err, result) => {
        if (err) {
          console.error("Error retrieving customer detail:", err);
          return res.status(500).json({
            status: "failed",
            error: "Internal Server Error",
          });
        }

        if (result.length === 0) {
          return res.status(404).json({
            status: "failed",
            error: "Customer detail not found",
          });
        }

        // Return customer detail
        const customerDetail = result;
        res.status(200).json({
          status: "success",
          data: customerDetail,
        });
      });
    } catch (error) {
      console.error("Error retrieving customer detail:", error);
      res.status(500).json({
        status: "failed",
        error: "Internal Server Error",
      });
    }
  },

  //Update customer detail
  updateCustomerDetail: async (req, res) => {
    try {
      const { cd_id, phone, address } = req.body;
      const updateSql = `UPDATE CUSTOMER_DETAIL SET phone = ?, address = ? WHERE cd_id = ?`;
      db.query(updateSql, [phone, address, cd_id], (err, result) => {
        if (err) {
          return res.status(500).json({
            status: "failed",
            error: "Internal Server Error",
          });
        }

        if (result.afftedRows === 0) {
          return res.status(404).json({
            status: "failed",
            error: "Customer detail not found",
          });
        }

        res.status(200).json({
          status: "success",
          message: "Customer detail updated successfully",
          data: result,
        });
      });
    } catch (error) {
      console.error("Error updating customer detail:", error);
      res.status(500).json({
        status: "failed",
        error: "Internal Server Error",
      });
    }
  },

  //delete customer detail
  deleteCustomerDetail: async (req, res) => {
    try {
      const { cd_id } = req.params;

      const deleteSql = `DELETE FROM CUSTOMER_DETAIL WHERE cd_id = ?`;
      db.query(deleteSql, [cd_id], (err, result) => {
        if (err) {
          return res.status(500).json({
            status: "failed",
            error: "Internal Server Error",
          });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({
            status: "failed",
            error: "Customer detail not found",
          });
        }
        res.status(200).json({
          status: "success",
          message: "Customer detail deleted successfully",
          data: result,
        });
      });
    } catch (error) {
      console.error("Error deleting customer detail:", error);
      res.status(500).json({
        status: "failed",
        error: "Internal Server Error",
      });
    }
  },
};
