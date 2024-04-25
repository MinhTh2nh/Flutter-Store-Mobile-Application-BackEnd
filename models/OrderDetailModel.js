module.exports = (sequenlize, DataTypes) => {
  const OrderDetailModel = sequenlize.define("order_detail", {
    orderID : {
      type: DataTypes.INTEGER,
      required: true,
    },
    productID : {
      type: DataTypes.INTEGER,
      required: true,
    },
    orderQuantity: {
      type: DataTypes.NUMBER,
      required: true,
    },
  });
  return OrderDetailModel;
};
