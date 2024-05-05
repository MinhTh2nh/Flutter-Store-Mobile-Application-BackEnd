module.exports = (sequenlize, DataTypes) => {
    const SubCategoryModel = sequenlize.define("sub_category", {
        subName: {
        type: DataTypes.STRING,
        require: true,
        },
        categoryID: {
        type: DataTypes.INTEGER,
        required: true,
        },
    });
    return SubCategoryModel;
}