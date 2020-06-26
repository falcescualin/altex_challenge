import express from "express";
import CategoryModel from "../../models/Category";
import logger from "../../logger";

const router = express.Router();

// GET http://localhost/api/category/all
router.get("/all", (req, res) => {
    CategoryModel.find({})
        .lean()
        .then((categories) => {
            res.status(200).json(categories);
            logger.info("Categories found: " + JSON.stringify(categories), { label: "CategoryModel" });
        })
        .catch((err) => {
            res.status(500).json({ success: false, message: "Internal server error" });
            logger.error(err.message, { label: "CategoryModel" });
        });
});

export default router;
