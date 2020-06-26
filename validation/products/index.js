import { query } from "express-validator";

export const delteProductByIdValidationSchema = [query("productId").exists(), query("productId").isMongoId()];
export const getProductsByIdValidationSchema = [query("categoryId").exists(), query("categoryId").isMongoId()];
