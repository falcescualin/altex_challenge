import express from "express";

import auth from "./auth";
import category from "./categories";
import product from "./products";

const router = express.Router();

router.use("/auth", auth);
router.use("/product", product);
router.use("/category", category);

export default router;
