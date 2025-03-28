const express = require("express");
const { verifyToken } = require("../utils/jwtUtils");

const router = express.Router();

// Route chỉ dành cho user có token hợp lệ
router.get("/protected-route", verifyToken, (req, res) => {
    res.json({ message: "Bạn đã truy cập vào route bảo vệ!", user: req.user });
});

module.exports = router;
