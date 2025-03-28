const mongoose = require("mongoose");

const ShopSchema = mongoose.Schema({
    storeLocation: {type: String, required: [true, "Vui lòng nhập vị trí cửa hàng!"]},
    hotLine: {type: String, required: [true, "Vui lòng nhập Hot Line cửa hàng!"]},
    email: {type: String, required: [true, "Vui lòng nhập Email cửa hàng!"]},
    storeDecription: {type: String, required: [true, "Giới thiệu cửa hàng thật oách chứ Bờ Rô!"]}
})

module.exports = mongoose.model("Shop_SellingPetProducts", ShopSchema);