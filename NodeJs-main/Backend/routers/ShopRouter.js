const express = require('express');
const shopRouter = express.Router();
const { verifyToken } = require("../utils/jwtUtils");

const {
    getShopInformation,
    addShopInformation,
    updateShopInformation
} = require("../controllers/ShopController");

shopRouter.route("/").get(verifyToken, getShopInformation).post(verifyToken, addShopInformation).put(verifyToken, updateShopInformation);

module.exports = shopRouter;