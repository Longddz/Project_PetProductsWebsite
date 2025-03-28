const multer = require("multer");
const path = require("path");

// Cấu hình lưu ảnh vào thư mục uploads/
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // Lưu vào thư mục uploads/
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Đổi tên file theo timestamp
    }
});

// Giới hạn loại file (chỉ cho phép ảnh PNG, JPG, JPEG) và dung lượng 2MB
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: function (req, file, cb) {
        const fileTypes = /jpeg|jpg|png/;
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);

        if (extName && mimeType) {
            return cb(null, true);
        } else {
            cb(new Error("Chỉ được upload file ảnh!"));
        }
    }
});

module.exports = upload;
