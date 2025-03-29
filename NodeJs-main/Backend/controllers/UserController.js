// Import mongoose
const mongoose = require("mongoose");

// Import express-async-handler
const asyncHandler = require("express-async-handler");

// Import user model
const userModel = require("../model/UserModel");

// Get all users
const getAllUser = asyncHandler(async (req, res) => {
    const userList = await userModel.find().select("userName customerAddress email");

    if (!userList || userList.length === 0) {
        res.status(404);
        throw new Error("Không tìm thấy bất kỳ user nào!");
    }

    res.status(200).json(userList);
});

// Get user by ID
const getUserById = asyncHandler(async (req, res) => {
    const id = req.userToken.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("ID người dùng không hợp lệ!");
    }

    const user = await userModel.findById(id).select("_id customerName phoneNumber customerAddress email userName");

    if (!user) {
        res.status(404);
        throw new Error("Không tìm thấy người dùng!");
    }

    res.status(200).json(user);
});

// Update user
const updateUser = asyncHandler(async (req, res) => {
    const id = req.userToken.id;
    const { customerName, phoneNumber, customerAddress } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("ID người dùng không hợp lệ!");
    }

    // Kiểm tra số điện thoại nếu có
    if (phoneNumber && !isValidVietnamPhoneNumber(phoneNumber)) {
        res.status(400);
        throw new Error("Bạn nhập sai định dạng số điện thoại, vui lòng nhập đúng số điện thoại!");
    }

    const userOld = await userModel.findById(id);

    if (!userOld) {
        res.status(404);
        throw new Error("Không tìm thấy thông tin user để cập nhật!");
    }

    // Cập nhật chỉ khi có dữ liệu mới
    userOld.customerName = customerName ?? userOld.customerName;
    userOld.phoneNumber = phoneNumber ?? userOld.phoneNumber;
    userOld.customerAddress = customerAddress ?? userOld.customerAddress;

    await userOld.save();

    res.status(200).json({ msg: "Cập nhật thông tin người dùng thành công!" });
});

// Get customer address && phone number
const getCustomerInformation = asyncHandler(async (req, res) => {
    const id = req.userToken.id;
     
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("ID người dùng không hợp lệ!");
    }

    const user = await userModel.findById(id).select("customerAddress phoneNumber");
    if (!user) {
        res.status(404);
        throw new Error("Không tìm thấy người dùng để lấy về địa chỉ hay số điện thoại");
    }

    res.status(200).json(user);
});

// Kiểm tra số điện thoại Việt Nam hợp lệ
const isValidVietnamPhoneNumber = (phoneNumber) => {
    const regex = /^(84|0)(3|5|7|8|9)\d{8}$/;
    return regex.test(phoneNumber);
};

module.exports = {
    getAllUser,
    getUserById,
    updateUser,
    getCustomerInformation,
    isValidVietnamPhoneNumber
};
