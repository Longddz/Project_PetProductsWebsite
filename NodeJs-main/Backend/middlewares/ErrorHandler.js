const {errorConstant} = require("../errorConstant");

const errorHandler = (error, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;
    let response = {
        message: error.message || "Lỗi server không xác định",
        status: statusCode
    };

    // Chỉ thêm stack trace trong môi trường development
    if (process.env.NODE_ENV === 'development') {
        response.stack = error.stack;
    }

    console.error(`[Error] ${statusCode}:`, error);

    return res.status(statusCode).json(response);
};

module.exports = errorHandler;