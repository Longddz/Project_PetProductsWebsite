// Import mongoose
const mongoose = require("mongoose");

// Import validator 
const validator = require("validator");

// Import express-async-handler
const asyncHandler = require('express-async-handler');

// Import middleware 
const errorHandler = require("../middlewares/ErrorHandler");

// Import model shop
const shopModel = require("../model/ShopModel");

// Get all shop information
const getShopInformation = asyncHandler(async(req, res) => {
    const shop = await shopModel.findOne({});

    if (!shop)
    {
        res.status(404);
        throw new Error("Chưa có thông tin vể cửa hàng!");
    }
    res.status(200).json(shop);
});

// Add shop information
const addShopInformation = asyncHandler(async(req, res) => {
    const {storeLocation, hotLine, email, storeDecription} = req.body;
    const storeExists = await shopModel.findOne({});
    const roles = req.userToken.role;

    if (roles.toLowerCase() !== "admin".toLocaleLowerCase())
    {
        res.status(403);
        throw new Error("Bạn không có quyền sử dụng chức năng này!");
    }

    if (storeExists)
    {
        res.status(400);
        throw new Error("Cửa hàng đã có thông tin, bạn không thể thêm thông tin!");
    }

    if (!storeLocation || !hotLine || !email || !storeDecription)
    {
        res.status(400);
        throw new Error("Vui lòng nhập đủ thông tin cửa hàng!");
    }

    if (!validator.isEmail(email))
    {
        res.status(400);
        throw new Error("Email không hợp lệ! nhập đúng mẫu Email ví dụ: abc123@gmail.com");
    }

    const shop = new shopModel({
        storeLocation,
        hotLine,
        email,
        storeDecription
    });
    await shop.save();
    res.status(200).json({msg: "Thêm thông tin cửa hàng thành công: \n", shop: shop.toObject()});
});

// Update shop information
const updateShopInformation = asyncHandler(async(req, res, next) => {
    const {storeLocation, hotLine, email, storeDecription} = req.body;
    const storeExists = await shopModel.findOne({});
    const roles = req.userToken.role;

    if (roles.toLowerCase() !== "admin".toLocaleLowerCase())
    {
        res.status(403);
        throw new Error("Bạn không có quyền sử dụng chức năng này!");
    }

    if (!storeExists)
    {
        res.status(400);
        throw new Error("Cửa hàng chưa có thông tin, bạn không thể cập nhật thông tin!");
    }

    if (!storeLocation || !hotLine || !email || !storeDecription)
    {
        res.status(400);
        throw new Error("Vui lòng nhập đủ thông tin cửa hàng!");
    }

    if (!validator.isEmail(email))
    {
         res.status(400);
        throw new Error("Email không hợp lệ! nhập đúng mẫu Email ví dụ: abc123@gmail.com");
    }

    storeExists.storeLocation = req.body.storeLocation || storeExists.storeLocation;
    storeExists.hotLine = req.body.hotLine || storeExists.hotLine;
    storeExists.email = req.body.email || storeExists.email;
    storeExists.storeDecription = req.body.storeDecription || storeExists.storeDecription;

    await storeExists.save();
    res.status(200).json({msg: "Cập nhật thông tin cửa hàng thành công: \n", shop: storeExists.toObject()});
});

// Get id of shop
const getIdShop = asyncHandler(async () => {
    const shop = await shopModel.findOne({}, "_id"); // Chỉ lấy trường _id
    return shop ? shop._id : null; // Trả về _id hoặc null nếu không có shop nào
});

module.exports = {
    getShopInformation,
    addShopInformation,
    updateShopInformation,
    getIdShop
};