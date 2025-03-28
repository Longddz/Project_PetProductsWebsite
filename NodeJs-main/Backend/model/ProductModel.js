const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    productName: {type: String, required: [true, "Vui lòng nhập tên sản phẩm!"]},
    productType: {type: String, required: [true, "Vui lòng nhập loại sản phẩm!"]},
    productPrice: {type: Number, required: [true, "Vui lòng nhập giá sản phẩm!"]},
    productDescription: {type: String, required: [true, "Vui lòng nhập mô tả sản phẩm!"]},
    productQuantity: {type: Number, required: [true, "Vui lòng nhập số lượng sản phẩm!"]},
    imageURL: {type: String, required: [true, "Vui lòng thêm ảnh!"]},
})

module.exports = mongoose.model("Product_SellingPetProducts", ProductSchema);