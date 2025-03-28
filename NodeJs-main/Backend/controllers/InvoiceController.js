// Import mongoose
const mongoose = require("mongoose");

// Import express-async-handler
const asyncHandler = require('express-async-handler');

// Import invoice model
const invoiceModel = require("../model/InvoiceModel");

// Import productController && shoppingCartController
const { increaseSupply, decreaseSupply, productExistenceCheck } = require("./ProductController");
const { deleteShoppingCartById } = require("./ShoppingCartController");
const { isValidVietnamPhoneNumber } = require("./UserController");

// Get invoice lists by user id
const getAllInvoiceByUserId = asyncHandler(async(req, res) => {
    const invoiceLists = await invoiceModel.find({userId: req.userToken.id});
    if (!invoiceLists || invoiceLists.length === 0)
    {
        res.status(404);
        throw new Error ("Không có hóa đơn nào trong danh sách hóa đơn!");
    }
    else
    {
        res.status(200).json(invoiceLists);
    }
})

// Add invoice
const addInvoice = asyncHandler(async (req, res) => {
    const { productName, imageURL, productQuantity, totalAmount, productId, customerAddress, phoneNumber, idShoppingCart } = req.body;
    const userId = req.userToken.id;

    if (!productName || !productQuantity || !totalAmount || !productId || !customerAddress || !phoneNumber) {
        res.status(400);
        throw new Error("Vui lòng nhập đủ thông tin để thêm hóa đơn!");
    }

    if (!(await productExistenceCheck(productId))) {
        res.status(404);
        throw new Error("Không tìm thấy sản phẩm để đặt hàng, có thể do sản phẩm đã ngừng kinh doanh!");
    }

    const productQuantitys = parseInt(productQuantity);
    if (isNaN(productQuantitys) || productQuantitys <= 0) {
        res.status(400);
        throw new Error("Số lượng sản phẩm phải là số nguyên dương!");
    }

    const totalAmounts = parseFloat(totalAmount);
    if (isNaN(totalAmounts) || totalAmounts <= 0) {
        res.status(400);
        throw new Error("Giá đơn hàng phải là số dương!");
    }

    if (!isValidVietnamPhoneNumber(phoneNumber)) {
        res.status(400);
        throw new Error("Bạn nhập sai định dạng số điện thoại, vui lòng nhập đúng định dạng!");
    }

    const newInvoice = new invoiceModel({
        productName,
        imageURL,
        productQuantity: productQuantitys,
        totalAmount: totalAmounts,
        phoneNumber,
        customerAddress,
        userId,
        productId
    });

    await newInvoice.save();

    // Xóa giỏ hàng nếu có idShoppingCart hợp lệ
    if (idShoppingCart) {
        await deleteShoppingCartById(idShoppingCart, userId);
    }

    // Giảm số lượng sản phẩm trong kho
    await decreaseSupply(productId, productQuantitys);

    res.status(200).json(newInvoice);
});

// Delete invoice
const deleteInvoice = asyncHandler(async (req, res) => {
    const idInvoice = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(idInvoice)) {
        res.status(400);
        throw new Error("ID hóa đơn không hợp lệ!");
    }

    const invoice = await invoiceModel.findOne({ _id: idInvoice, userId: req.userToken.id });

    if (!invoice) {
        res.status(404);
        throw new Error("Không tìm thấy hóa đơn bạn muốn xóa!");
    }

    const idProduct = invoice.productId;
    const quantity = invoice.productQuantity;

    const deletedInvoice = await invoiceModel.deleteOne({ _id: idInvoice, userId: req.userToken.id });

    if (deletedInvoice.deletedCount === 0) {
        res.status(500);
        throw new Error("Không thể xóa hóa đơn, vui lòng thử lại sau!");
    }

    // Tăng số lượng sản phẩm trong kho sau khi xóa hóa đơn
    await increaseSupply(idProduct, quantity);

    res.status(200).json({ msg: "Xóa hóa đơn thành công!" });
});

module.exports = {
    addInvoice,
    deleteInvoice,
    getAllInvoiceByUserId
};
