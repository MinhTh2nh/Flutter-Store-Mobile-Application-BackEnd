module.exports = (sequenlize, DataTypes) => {
    const SizeCategoryModel = sequenlize.define("size_category", {
        sizeName: {
        type: DataTypes.STRING,
        require: true,
        },
    });
    return SizeCategoryModel;
};