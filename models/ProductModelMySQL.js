module.exports = (sequenlize, DataTypes) => {
  const ProductModelMySQL = sequenlize.define("product", {
    image: {
      type: DataTypes.STRING,
      defaultValue: "public/productImages/default-product-image.jpg",
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      require: true,
    },
    price: {
      type: DataTypes.STRING,
      required: true,
    },
    description: {
      type: DataTypes.STRING,
      required: true,
    },
    quantity: {
      type: DataTypes.NUMBER,
      required: true,
    },
    productType: {
      type: DataTypes.STRING,
      required: true,
    },
    status: {
      type: DataTypes.STRING,
      required: true,
    },
  });
  return ProductModelMySQL;
};
