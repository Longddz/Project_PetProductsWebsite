const express = require('express');
const shoppingCartRouter = express.Router();
const { verifyToken } = require("../utils/jwtUtils");

const {
    getAllShoppingCart,
    getShoppingCartById,
    addShoppingCart,
    updateShoppingCart,
    deleteShoppingCart
} = require("../controllers/ShoppingCartController");

shoppingCartRouter.route("/").get(verifyToken, getAllShoppingCart).post(verifyToken, addShoppingCart);

shoppingCartRouter.route("/:id").get(verifyToken, getShoppingCartById).put(verifyToken, updateShoppingCart).delete(verifyToken, deleteShoppingCart);

module.exports = shoppingCartRouter;