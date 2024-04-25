const jwt = require("jsonwebtoken");
require("dotenv").config();
const privateKey = process.env.PRIVATE_KEY;

module.exports.validateUser = (req, res, next) => {
  jwt.verify(req.headers["x-access-token"], privateKey, (err, decoded) => {
    if (err) {
      res.status(401).json({
        ...err,
        message: "Sorry, it seems you haven't login. Try login again.",
      });
    } else {
      req.userId = decoded.id;
      next();
    }
  });
};

module.exports.validateAdmin = (req, res, next) => {
  jwt.verify(req.headers["x-access-token"], privateKey, (err, decoded) => {
    if (decoded && decoded.email == "admin@gmail.com" && !err) {
        req.userId = decoded.id;
        next();
    } else {
        res.status(401).json({
            ...err,
            message: "Sorry, you're not an admin.",
        });
    }
});
};
