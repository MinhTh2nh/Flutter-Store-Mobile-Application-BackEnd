module.exports = (sequenlize, DataTypes) => {
  const OrderModelSQL = sequenlize.define("orders", {
    firstName: {
      type: DataTypes.STRING,
      require: true,
    },
    lastName: {
      type: DataTypes.STRING,
      require: true,
    },
    email: {
      type: DataTypes.STRING,
      required: true,
    },
    country: {
      type: DataTypes.STRING,
      required: true,
    },
    city: {
      type: DataTypes.STRING,
      required: true,
    },
    address: {
      type: DataTypes.STRING,
      required: true,
    },

    phoneNumber: {
      type: DataTypes.INTEGER,
      required: false,
    },
    postalCode: {
      type: DataTypes.NUMBER,
      required: false,
    },
    userID : {
      type: DataTypes.INTEGER,
      required: true,
    },

    status: {
      type: DataTypes.STRING,
      required: true,
    },
    totalPrice: {
      type: DataTypes.STRING,
      required: true,
    },
  });
  return OrderModelSQL;
};
