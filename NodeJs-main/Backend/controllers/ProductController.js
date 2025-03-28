// Import mongoose
const mongoose = require("mongoose");

// Import express-async-handler
const asyncHandler = require("express-async-handler");

// Import middleware xác thực và xử lý lỗi
const errorHandler = require("../middlewares/ErrorHandler");

// Import model product 
const productModel = require("../model/ProductModel");

// Import fs & path
const fs = require("fs");
const path = require("path");

// Get all products
const getAllProduct = asyncHandler(async (req, res) => {
    try {
        const productList = await productModel.find();
        if (!productList || productList.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm nào!" });
        }
        return res.status(200).json(productList);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách sản phẩm:", error);
        return res.status(500).json({ message: "Lỗi server khi lấy danh sách sản phẩm!" });
    }
});

// Get product by id
const getProductById = asyncHandler(async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm có mã tương tự!" });
        }
        return res.status(200).json(product);
    } catch (error) {
        console.error("Lỗi khi lấy thông tin sản phẩm:", error);
        return res.status(500).json({ message: "Lỗi server khi lấy thông tin sản phẩm!" });
    }
});

// Get product by name or type
const getProductByName = asyncHandler(async (req, res) => {
    try {
        const foundString = req.query.name;

        if (!foundString) {
            return res.status(400).json({ message: "Bạn chưa nhập thông tin sản phẩm muốn tìm kiếm!, vui lòng nhập thông tin!" });
        }

        // Tìm kiếm sản phẩm theo tên hoặc loại sản phẩm
        const result = await productModel.find({
            $or: [
                { productName: { $regex: foundString, $options: "i" } },
                { productType: { $regex: foundString, $options: "i" } }
            ]
        });

        if (!result || result.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm như bạn mong muốn, hãy thử nhập lại thông tin khác nhé" });
        }
        return res.status(200).json(result);
    } catch (error) {
        console.error("Lỗi khi tìm kiếm sản phẩm:", error);
        return res.status(500).json({ message: "Lỗi server khi tìm kiếm sản phẩm!" });
    }
});

// Get a list of product types
const getAllProductTypes = asyncHandler(async (req, res) => {
    try {
        const productTypes = await productModel.distinct("productType");

        if (!productTypes || productTypes.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy loại sản phẩm nào!" });
        }
        return res.status(200).json(productTypes);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách loại sản phẩm:", error);
        return res.status(500).json({ message: "Lỗi server khi lấy danh sách loại sản phẩm!" });
    }
});

// Filter products by type
const getProductsByType = asyncHandler(async (req, res) => {
    try {
        const { type } = req.query;

        if (!type) {
            return res.status(400).json({ message: "Bạn chưa nhập loại sản phẩm cần tìm!" });
        }

        const products = await productModel.find({ productType: type });

        if (!products || products.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm nào với loại này!" });
        }
        return res.status(200).json(products);
    } catch (error) {
        console.error("Lỗi khi lọc sản phẩm theo loại:", error);
        return res.status(500).json({ message: "Lỗi server khi lọc sản phẩm theo loại!" });
    }
});

// Add product
const addProduct = asyncHandler(async (req, res) => {
    try {
        console.log("Received request to add product");
        console.log("Request body:", req.body);
        console.log("Request file:", req.file);
        console.log("User token:", req.userToken);
        
        const { productName, productType, productPrice, productDescription, productQuantity } = req.body;
        const roles = req.userToken.role;

        if (roles.toLowerCase() !== "admin") {
            return res.status(403).json({ message: "Bạn không có quyền sử dụng chức năng này!" });
        }

        if (!productName || !productType || !productPrice || !productDescription || !productQuantity) {
            return res.status(400).json({ message: "Bạn nhập thiếu thông tin sản phẩm!" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Vui lòng tải lên ảnh sản phẩm!" });
        }

        if (isNaN(parseFloat(productPrice)) || productPrice <= 0) {
            return res.status(400).json({ message: "Giá sản phẩm phải là số và lớn hơn 0!" });
        }

        if (isNaN(parseInt(productQuantity)) || productQuantity <= 0) {
            return res.status(400).json({ message: "Số lượng sản phẩm phải là số nguyên và lớn hơn 0!" });
        }

        const newProduct = new productModel({
            productName,
            productType,
            productPrice,
            productDescription,
            productQuantity,
            imageURL: `/uploads/${req.file.filename}`
        });

        await newProduct.save();
        
        return res.status(201).json({ 
            message: "Thêm mới sản phẩm thành công!", 
            product: newProduct.toObject() 
        });
    } catch (error) {
        console.error("Error in addProduct:", error);
        return res.status(500).json({ message: "Lỗi server khi thêm sản phẩm!" });
    }
});

// Update product
const updateProduct = asyncHandler(async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
        const { productName, productType, productPrice, productDescription, productQuantity } = req.body;
        const roles = req.userToken?.role;

        if (!roles || roles.toLowerCase() !== "admin") {
            return res.status(403).json({ message: "Bạn không có quyền sử dụng chức năng này!" });
        }

        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm muốn sửa!" });
        }

        if (!productName || !productType || !productPrice || !productDescription || !productQuantity) {
            return res.status(400).json({ message: "Bạn nhập thiếu thông tin sản phẩm!" });
        }

        if (isNaN(parseFloat(productPrice)) || productPrice <= 0 || isNaN(parseInt(productQuantity)) || productQuantity <= 0) {
            return res.status(400).json({ message: "Giá và số lượng sản phẩm phải là số hợp lệ!" });
        }

        if (req.file) {
            const oldImagePath = path.join(__dirname, "../uploads", product.imageURL.split("/").pop());
            if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
            product.imageURL = `/uploads/${req.file.filename}`;
        }

        product.productName = productName;
        product.productType = productType;
        product.productPrice = productPrice;
        product.productDescription = productDescription;
        product.productQuantity = productQuantity;

        await product.save();
        return res.status(200).json({ message: "Cập nhật sản phẩm thành công!", product: product.toObject() });
    } catch (error) {
        console.error("Lỗi khi cập nhật sản phẩm:", error);
        return res.status(500).json({ message: "Lỗi server khi cập nhật sản phẩm!" });
    }
});

// Delete product
const deleteProduct = asyncHandler(async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
        const roles = req.userToken?.role;

        if (!roles || roles.toLowerCase() !== "admin") {
            return res.status(403).json({ message: "Bạn không có quyền sử dụng chức năng này!" });
        }

        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });
        }

        const imagePath = path.join(__dirname, "../uploads", product.imageURL.split("/").pop());
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

        await product.deleteOne();
        return res.status(200).json({ message: "Sản phẩm đã được xóa thành công!" });
    } catch (error) {
        console.error("Lỗi khi xóa sản phẩm:", error);
        return res.status(500).json({ message: "Lỗi server khi xóa sản phẩm!" });
    }
});

// decreaseSupply (Giảm số lượng sản phẩm khi mua/ Tạo hóa đơnđơn)
const decreaseSupply = asyncHandler(async (productId, productQuantitys) => {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error("ID sản phẩm không hợp lệ");
    }

    if (!Number.isInteger(productQuantitys) || productQuantitys <= 0) {
        throw new Error("Số lượng cần giảm phải là số nguyên dương");
    }

    const updatedProduct = await productModel.findOneAndUpdate(
        { _id: productId, productQuantity: { $gte: productQuantitys } },
        { $inc: { productQuantity: -productQuantitys } },
        { new: true, runValidators: true } // Trả về document sau khi cập nhật
    );

    if (!updatedProduct) {
        throw new Error("Không tìm thấy sản phẩm hoặc số lượng không đủ để giảm");
    }

    return {
        message: "Giảm số lượng sản phẩm thành công",
        remainingQuantity: updatedProduct.productQuantity
    };
});

// increaseSupply (Tăng số lượng sản phẩm khi hóa đơn bị xóa/ hủy đơn)
const increaseSupply = asyncHandler(async (idProduct, quantity) => {
    if (!mongoose.Types.ObjectId.isValid(idProduct)) {
        throw new Error("ID sản phẩm không hợp lệ");
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error("Số lượng cần tăng phải là số nguyên dương");
    }

    const updatedProduct = await productModel.findOneAndUpdate(
        { _id: idProduct },
        { $inc: { productQuantity: quantity } },
        { new: true, runValidators: true } // Trả về document sau khi cập nhật
    );

    if (!updatedProduct) {
        throw new Error("Không tìm thấy sản phẩm");
    }

    return {
        message: "Tăng số lượng sản phẩm thành công",
        remainingQuantity: updatedProduct.productQuantity
    };
});

// Total product cost
const totalProductCost = asyncHandler(async (req, res) => {
    try {
        const { productQuantity } = req.body;
        const product = await productModel.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });
        }

        if (!productQuantity || isNaN(parseInt(productQuantity)) || productQuantity <= 0) {
            return res.status(400).json({ message: "Số lượng sản phẩm phải hợp lệ!" });
        }

        if (productQuantity > product.productQuantity) {
            return res.status(400).json({ message: "Số lượng sản phẩm mua lớn hơn tồn kho!" });
        }

        const totalAmount = parseFloat(product.productPrice) * productQuantity;
        return res.status(200).json({ totalAmount });
    } catch (error) {
        console.error("Lỗi khi tính tổng giá trị sản phẩm:", error);
        return res.status(500).json({ message: "Lỗi server khi tính tổng giá trị sản phẩm!" });
    }
});

// Kiểm tra sự tồn tại của sản phẩm
const productExistenceCheck = asyncHandler(async (productId) => {
    try {
        const exists = await productModel.findById(productId);
        return !!exists;
    } catch (error) {
        console.error("Lỗi khi kiểm tra sản phẩm:", error);
        throw new Error("Lỗi kiểm tra sản phẩm!");
    }
});

module.exports = {
    getAllProduct,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    totalProductCost,
    productExistenceCheck,
    getProductByName,
    getAllProductTypes,
    getProductsByType,
    decreaseSupply,
    increaseSupply
};
