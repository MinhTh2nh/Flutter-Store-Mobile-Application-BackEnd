module.exports = (sequenlize, DataTypes) => {
    const ItemModel = sequenlize.define("item", {
        productID: {
        type: DataTypes.INTEGER,
        required: true,
        },
        sizeID: {
        type: DataTypes.INTEGER,
        required: true,
        },
        stock: {
        type: DataTypes.INTEGER,
        required: true,
        },
    });
    return ItemModel;
}