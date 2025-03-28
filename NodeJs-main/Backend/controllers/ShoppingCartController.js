// Import mongoose
const mongoose = require("mongoose");

// Import express-async-handler
const asyncHandler = require("express-async-handler");

// Import middleware 
const errorHandler = require("../middlewares/ErrorHandler");

// Import model shopping cart
const shoppingCartModel = require("../model/ShoppingCartModel");

// Import product controller
const productController = require("../controllers/ProductController");

// Get all shopping cart 
const getAllShoppingCart = asyncHandler(async(req, res) => {
    const shoppingCartList = await shoppingCartModel.find({ userId: req.userToken.id });

    if (!shoppingCartList || shoppingCartList.length === 0) {
        res.status(404);
        throw new Error("Bạn chưa có giỏ hàng nào!");
    }
    res.status(200).json(shoppingCartList);
});

// Get shopping cart by id
const getShoppingCartById = asyncHandler(async(req, res) => {
    const shoppingCart = await shoppingCartModel.findOne({ _id: req.params.id, userId: req.userToken.id });

    if (!shoppingCart) {
        res.status(404);
        throw new Error("Không tìm thấy giỏ hàng!");
    }
    res.status(200).json({ msg: "Đã tìm thấy giỏ hàng!", shoppingCart: shoppingCart.toObject() });
});

// Add shopping cart
const addShoppingCart = asyncHandler(async(req, res) => {
    const { productName, productQuantity, totalAmount, productId } = req.body;
    const userId = req.userToken.id;

    if (!productName || !productQuantity || !productId || !totalAmount) {
        res.status(400);
        throw new Error("Vui lòng nhập đủ tên sản phẩm, số lượng, tổng tiền, mã sản phẩm!");
    }

    const quantity = Number(productQuantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
        res.status(400);
        throw new Error("Số lượng sản phẩm phải là số nguyên và lớn hơn không!");
    }

    const totalAmounts = Number(totalAmount);
    if (isNaN(totalAmounts) || totalAmounts <= 0) {
        res.status(400);
        throw new Error("Tổng tiền giỏ hàng phải lớn hơn không và là số!");
    }

    if (!(await productController.productExistenceCheck(productId))) {
        res.status(404);
        throw new Error("Không tìm thấy sản phẩm, có thể do sản phẩm mới bị loại bỏ không còn kinh doanh!");
    }

    const newShoppingCart = new shoppingCartModel({
        productName,
        productQuantity: quantity,
        totalAmount: totalAmounts,
        userId: userId,
        productId
    });

    await newShoppingCart.save();
    res.status(200).json({ msg: "Thêm giỏ hàng thành công!", shoppingCart: newShoppingCart.toObject() });
});

// Update shopping cart
const updateShoppingCart = asyncHandler(async(req, res) => {
    const { productName, productQuantity, totalAmount, productId } = req.body;
    const userId = req.userToken.id;

    if (!productName || !productQuantity || !totalAmount || !productId) {
        res.status(400);
        throw new Error("Vui lòng nhập đủ thông tin!");
    }

    const quantity = Number(productQuantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
        res.status(400);
        throw new Error("Số lượng sản phẩm phải là số nguyên và lớn hơn không!");
    }

    const totalAmounts = Number(totalAmount);
    if (isNaN(totalAmounts) || totalAmounts <= 0) {
        res.status(400);
        throw new Error("Tổng tiền giỏ hàng phải là số dương!");
    }

    if (!(await productController.productExistenceCheck(productId))) {
        res.status(404);
        throw new Error("Không tìm thấy sản phẩm để cập nhật giỏ hàng!");
    }

    const shoppingCartOld = await shoppingCartModel.findOne({ _id: req.params.id, userId: userId });
    if (!shoppingCartOld) {
        res.status(404);
        throw new Error("Không tìm thấy giỏ hàng muốn cập nhật!");
    }

    shoppingCartOld.productName = productName;
    shoppingCartOld.productQuantity = quantity;
    shoppingCartOld.totalAmount = totalAmounts;

    await shoppingCartOld.save();
    res.status(200).json({ msg: "Cập nhật giỏ hàng thành công!", shoppingCart: shoppingCartOld.toObject() });
});

// Delete shopping cart use API
const deleteShoppingCart = asyncHandler(async(req, res) => {
    const shoppingCart = await shoppingCartModel.findOne({ _id: req.params.id, userId: req.userToken.id });

    if (!shoppingCart) {
        res.status(404);
        throw new Error("Không tìm thấy giỏ hàng muốn xóa!");
    }

    await shoppingCart.deleteOne();
    res.status(200).json({ msg: "Giỏ hàng đã được xóa thành công!" });
});

// Delete shopping cart use Service
const deleteShoppingCartById = asyncHandler(async (idShoppingCart, idUser) => {
    // Kiểm tra xem idShoppingCart có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(idShoppingCart)) {
        return false;
    }

    const shoppingCart = await shoppingCartModel.findOne({ _id: idShoppingCart, userId: idUser });

    if (!shoppingCart) {
        return false;
    }

    try {
        await shoppingCart.deleteOne();
        return true;
    } catch (error) {
        console.error("Lỗi khi xóa giỏ hàng:", error);
        return false;
    }
});

module.exports = {
    getAllShoppingCart,
    getShoppingCartById,
    addShoppingCart,
    updateShoppingCart,
    deleteShoppingCart,
    deleteShoppingCartById
};