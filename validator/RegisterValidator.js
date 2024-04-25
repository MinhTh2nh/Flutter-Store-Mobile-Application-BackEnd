const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateRegisterInput(data) {
  let errors = {
    status: "",
    message: {
      username: "",
      email: "",
      phoneNumber: "",
      password: "",
    },
  };
  //  avoid error pop-up
  data.username = !isEmpty(data.username) ? data.username : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.phoneNumber = !isEmpty(data.phoneNumber) ? data.phoneNumber : "";
  data.password = !isEmpty(data.password) ? data.password : "";

  // Username validator
  if (Validator.isEmpty(data.username)) {
    errors.status = 401;
    errors.message = {
      ...errors.message,
      username: "Username is required.",
    };
    // the result without "!" is true. we're trying to get the reverse result
    // isAlphanumeric = we dont want "@", "#", etc. Only want text & number.
  } else if (!Validator.isAlphanumeric(data.username)) {
    errors.status = 401;
    errors.message = {
      ...errors.message,
      username: "Username is invalid.",
    };
  } else if (!Validator.isLowercase(data.username)) {
    errors.status = 401;
    errors.message = {
      ...errors.message,
      username: "Username must be lowercase only.",
    };
  }

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

  // PhoneNumber validator
  if (Validator.isEmpty(data.phoneNumber)) {
    errors.status = 401;
    errors.message = {
      ...errors.message,
      phoneNumber: "PhoneNumber is required.",
    };
  } else if (!Validator.isMobilePhone(data.phoneNumber)) {
    errors.status = 401;
    errors.message = {
      ...errors.message,
      phoneNumber: "PhoneNumber is invalid.",
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
