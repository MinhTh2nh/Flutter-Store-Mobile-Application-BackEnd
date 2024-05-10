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
      console.log(obj);

      //validation register
      const { errors, isValid } = validateRegisterInput(obj);

      if (!isValid) {
        return res.status(errors.status).json(errors);
      }
  
      // Check if the email already exists
      const checkEmailQuery = 'SELECT * FROM CUSTOMER WHERE email = ?';

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
        const insertUserQuery = 'INSERT INTO CUSTOMER SET ?';
        db.query(insertUserQuery, { name, email,  password: hashedPassword}, (err, result) => {
          if (err) {
            return res.status(400).json(err);
          }
          res.json({
            status: "success",
            message: "Successfully created account!",
            data: result,
          });
        });
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
  
        // if (user.status === 'Banned') {
        //   return res.status(404).json({
        //     status: "failed",
        //     error: "User has been banned",
        //   });
        // }

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

  loginAdmin: async (req, res) => {
    try {
      const email = req.body.email;
      const password = req.body.password;
      const sql = `SELECT * FROM users WHERE email = ?`;
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

        if (!user || user.role !== "Admin") {
          return res
            .status(404)
            .json({ status: "failed", error: "Admin's email not found" });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
          const payload = {
            userID: user.userID,
            email: user.email,
            name: user.name,
          };
          jwt.sign(
            payload,
            process.env.PRIVATE_KEY,
            { expiresIn: 100 },
            (err, token) => {
              res.json({
                status: "success",
                message: "You're an admin!",
                token: token,
              });
            }
          );
        } else {
          return res.status(404).json({
            status: "failed",
            error: "Password incorrect",
          });
        }
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ status: "failed", error: "Internal Server Error" });
    }
  },

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
    } catch (err)  {
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
        const emailCheckSql = "SELECT COUNT(*) as count FROM users WHERE email = ?";
        const emailCheckValues = [email];
    
        db.query(emailCheckSql, emailCheckValues, (emailCheckErr, emailCheckResult) => {
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
          const phoneNumberCheckSql = "SELECT COUNT(*) as count FROM users WHERE phoneNumber = ?";
          const phoneNumberCheckValues = [phoneNumber];
    
          db.query(phoneNumberCheckSql, phoneNumberCheckValues, (phoneNumberCheckErr, phoneNumberCheckResult) => {
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
            const updateSql = "UPDATE users SET name=?, email=?, phoneNumber=? WHERE userID=?";
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
    
};