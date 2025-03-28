const mongoose = require("mongoose");

const ShoppingCartSchema = new mongoose.Schema({
    productName: {type: String, required: [true, "Tên sản phẩm có vấn đề!"]},
    productQuantity: {type: Number, required: [true, "Số lượng sản phẩm có vấn đề!"]},
    totalAmount: {type: Number, required: [true, "Tổng tiền sản phẩm có vấn đề!"]},
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User_SellingPetProducts", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product_SellingPetProducts", required: true }
})

module.exports = mongoose.model("ShoppingCart_SellingPetProducts", ShoppingCartSchema);