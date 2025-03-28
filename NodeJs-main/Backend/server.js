const express = require('express');
const server = express();
const port = process.env.PORT || 5000;
const path = require('path');
const cors = require('cors');

// Cấu hình CORS cho phép tất cả các origin
server.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Middleware để parse JSON và form data
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Middleware bổ sung cho CORS
server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    next();
});

// Cấu hình static files
server.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const dotenv = require('dotenv').config();

// Import config
const dbConnect = require("./config/DbConnect");

// Connect Database
dbConnect();

// Import router
const userRouter = require("./routers/UserRouter");
const productRouter = require("./routers/ProductRouter");
const shoppingCartRouter = require("./routers/ShoppingCartRouter");
const shopRouter = require("./routers/ShopRouter");
const authRoutes = require("./routers/authRoutes");
const invoiceRoutes = require("./routers/InvoiceRouter");

// Import middleware
const errorHandler = require("./middlewares/ErrorHandler");

// server.use router
server.use("/api/user", userRouter);
server.use("/api/product", productRouter);
server.use("/api/shoppingcart", shoppingCartRouter);
server.use("/api/shop", shopRouter);
server.use("/api/auth", authRoutes);
server.use("/api/invoice", invoiceRoutes);

// server.use middleware
server.use(errorHandler);

// Run server
server.listen(port, () => {
    console.log(`Server is running at port ${port} ! \nWellcome to app selling pet products`);
})