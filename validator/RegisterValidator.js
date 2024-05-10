const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateRegisterInput(data) {
  let errors = {
    status: "",
    message: {
      email: "",
      password: "",
    },
  };

  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";

  // Email validator
  if (Validator.isEmpty(data.email)) {
    errors.status = 401;
    errors.message = {
      ...errors.message,
      email: "Email is required.",
    };
  } else if (!Validator.isEmail(data.email)) {
    errors.status = 401;
    errors.message = {
      ...errors.message,
      email: "Email is invalid.",
    };
  }

  // Password validator
  if (Validator.isEmpty(data.password)) {
    errors.status = 401;
    errors.message = {
      ...errors.message,
      password: "Password is required.",
    };
  } else if (
    !Validator.isLength(data.password, {
      min: 8,
      max: 30,
    })
  ) {
    (errors.status = 401),
      (errors.message = {
        ...errors.message,
        password:
          "Password must be at least 8 characters either under 30 characters.",
      });
  }
  return {
    errors,
    // isValid = no errors occur
    isValid: isEmpty(errors.status),
  };
};