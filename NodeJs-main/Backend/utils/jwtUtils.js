const jwt = require("jsonwebtoken");
require("dotenv").config();

// Tạo token JWT
const generateToken = (userId, role) => {
    return jwt.sign(
        { id: userId, role: role }, // Thêm role vào payload
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
};

// Xác minh token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Không có token, truy cập bị từ chối!" });
    }

    const token = authHeader.split(" ")[1]; // Lấy token sau "Bearer "

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userToken = decoded; // Lưu thông tin user vào request
        next();
    } catch (error) {
        res.status(403).json({ message: "Token không hợp lệ!" });
    }
};

module.exports = { 
    generateToken, 
    verifyToken 
};
