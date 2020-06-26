import { check } from "express-validator";

export const loginValidationSchema = [check("credentials.email").isEmail(), check("credentials.password").isLength({ min: 5 }), check("credentials").exists()];
export const registerValidationSchema = [
    check("credentials.email").isEmail(),
    check("credentials.password").isLength({ min: 5 }),
    check("credentials").exists(),
];
