const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
    productName: {type: String, required: [true, "Tên sản phẩm có vấn đề!"]},
    imageURL: {type: String, required: [true, "Vui lòng thêm ảnh!"]},
    productQuantity: {type: Number, required: [true, "Số lượng sản phẩm có vấn đề!"]},
    totalAmount: {type: Number, required: [true, "Tổng tiền sản phẩm có vấn đề!"]},
    phoneNumber: { type: String, required: [true, "Vui lòng nhập số điện thoại!"] },
    customerAddress: { type: String, required: [true, "Vui lòng nhập địa chỉ để dễ dàng giao hàng cho bạn!"] },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User_SellingPetProducts", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product_SellingPetProducts", required: true },
    imageURL: { type: String },
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model("Invoice_SellingPetProducts", InvoiceSchema);