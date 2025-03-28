const express = require('express');
const router = express.Router();
const { verifyToken } = require("../utils/jwtUtils");

const {
    addInvoice,
    deleteInvoice,
    getAllInvoiceByUserId
} = require("../controllers/InvoiceController");

router.route("/").post(verifyToken, addInvoice).get(verifyToken, getAllInvoiceByUserId);

router.route("/:id").delete(verifyToken, deleteInvoice);

module.exports = router;