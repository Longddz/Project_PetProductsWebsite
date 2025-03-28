const express = require('express');
const productRouter = express.Router();
const { verifyToken } = require("../utils/jwtUtils");
const upload = require("../middlewares/multerConfig");

const {
    getAllProduct,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    totalProductCost,
    getProductByName,
    getAllProductTypes,
    getProductsByType
} = require("../controllers/ProductController");

productRouter.route("/").get(getAllProduct).post(verifyToken, upload.single('file'), addProduct);

productRouter.route("/search").get(getProductByName);

productRouter.route("/filter/type").get(getAllProductTypes);

productRouter.route("/filter/productLists").get(getProductsByType);

productRouter.route("/:id").get(getProductById).put(verifyToken, upload.single('file'), updateProduct).delete(verifyToken, deleteProduct);

module.exports = productRouter;