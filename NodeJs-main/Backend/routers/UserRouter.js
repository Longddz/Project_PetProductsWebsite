const express = require('express');
const userRouter = express.Router();
const { verifyToken } = require("../utils/jwtUtils");

const {
    getAllUser,
    getUserById,
    updateUser,
} = require("../controllers/UserController");

userRouter.route("/").get(verifyToken, getAllUser);

userRouter.route("/:id").get(verifyToken, getUserById).put(verifyToken, updateUser);

module.exports = userRouter;