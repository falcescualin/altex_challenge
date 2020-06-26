import express from "express";
import ProductModel from "../../models/Product";
import auth from "../auth";
import logger from "../../logger";

import { delteProductByIdValidationSchema, getProductsByIdValidationSchema } from "../../validation/products";
import validator from "../../middleware/validationMiddleware";

const router = express.Router();

//GET http://localhost/api/product/?categoryId=
router.get("/", getProductsByIdValidationSchema, validator, (req, res) => {
    let { categoryId } = req.query;

    ProductModel.find({ categoryId })
        .lean()
        .then((products) => {
            res.status(200).json({ success: true, data: products });
            logger.info("Products found: " + JSON.stringify(products), { label: "Get Product by Category" });
        })
        .catch((err) => {
            res.status(500).json({ success: false, message: "Internal server error" });
            logger.error(err.message, { label: "Get Product by Category" });
        });
});

// DELETE http://localhost/api/product/?productId=
router.delete("/", auth, delteProductByIdValidationSchema, validator, (req, res) => {
    let { productId } = req.query;

    ProductModel.findOneAndDelete({ _id: productId })
        .then((product) => {
            if (product) {
                res.status(200).json({ success: true, message: "Product deleted successfully" });
                logger.info("Product with ID " + productId + " has been deleted", { label: "Delete Product by ID" });
            } else {
                res.status(200).json({ success: false, message: "No product found with the id: " + productId });
                logger.info("No product found with the id: " + productId, { label: "Delete Product by ID" });
            }
        })
        .catch((err) => {
            res.status(500).json({ success: false, message: "Internal server error" });
            logger.error(err.message, { label: "Delete Product by ID" });
        });
});

export default router;
