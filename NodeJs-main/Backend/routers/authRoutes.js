const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

// Route đăng nhập (không cần bảo vệ)
router.post("/login", authController.login);

// Route đăng ký (không cần bảo vệ)
router.post("/register", authController.register);

module.exports = router;
