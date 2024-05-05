module.exports = (sequenlize, DataTypes) => {
  const CategoryModel = sequenlize.define("category", {
    Cname: {
      type: DataTypes.STRING,
      require: true,
    },
    Cthumbnail: {
      type: DataTypes.STRING,
      required: true,
    },
    Cdescription: {
      type: DataTypes.STRING,
    },
  });
  return CategoryModel;
}