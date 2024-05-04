module.exports = (sequenlize, DataTypes) => {
  const ProductModel = sequenlize.define("product", {
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
    thumbnail: {
      type: DataTypes.STRING,
      required: true,
    },
    quantity: {
      type: DataTypes.NUMBER,
      required: true,
    },
    status: {
      type: DataTypes.STRING,
      required: true,
    },
    subID: {
      type: DataTypes.INTEGER,
      required: true,
    },
    categoryID: {
      type: DataTypes.INTEGER,
      required: true,
    },
  });
  return ProductModel;
};
