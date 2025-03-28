const mongoose = require("mongoose");

// Import bcrypt
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
    customerName: { type: String, required: [true, "Vui lòng nhập tên khách hàng!"] },
    phoneNumber: { type: String, required: [true, "Vui lòng nhập số điện thoại!"] },
    customerAddress: { type: String, required: [true, "Vui lòng nhập địa chỉ để dễ dàng giao hàng cho bạn!"] },
    email: { type: String, required: [true, "Vui lòng nhập Email!"], unique: [true, "Email đã tồn tại!"] },
    userName: { type: String, required: [true, "Vui lòng nhập bí danh cho đẳng cấp!"] },
    password: { type: String, required: [true, "Vui lòng nhập mật khẩu!"] },
    role: { type: String, required: [true, "Vui lòng cho biết bạn muốn giữ chức vụ gì!"] }
});

// Hàm so sánh mật khẩu
UserSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User_SellingPetProducts", UserSchema);
