import express from "express";
import User from "../../models/User";
import logger from "../../logger";
import validator from "../../middleware/validationMiddleware";
import { loginValidationSchema, registerValidationSchema } from "../../validation/auth";

const router = express.Router();

// POST  http://localhost/api/auth/login
// {
//     "credentials": {
//         "email": "falcescu.alin@gmail.com",
//         "password": "test123"
//     }
// }
router.post("/login", loginValidationSchema, validator, (req, res) => {
    const { email, password } = req.body.credentials;

    User.findOne({ email })
        .then(async (user) => {
            if (user && user.isValidPassword(password)) {
                logger.debug(`Login successful ${email}`, { label: "Login" });
                let authJSONData = await user.toAuthJSON();

                res.set("X-User", email);
                res.set("X-Acces-Key", authJSONData.token);

                res.status(200).json({ success: true, user: authJSONData });
            } else {
                logger.debug(`Credentials error ${email}`, { label: "Login" });
                res.status(401).json({ success: false, message: "Credentials error" });
            }
        })
        .catch((err) => {
            res.status(401).json({ success: false, message: "Credentials error", error: err.message });
            logger.error(err.message, { label: "Login" });
        });
});

// POST  http://localhost/api/auth/register
// {
//     "credentials": {
//         "email": "falcescu.alin@gmail.com",
//         "password": "test123"
//     }
// }
router.post("/register", registerValidationSchema, validator, (req, res) => {
    let { email, password } = req.body.credentials;

    const user = new User({ email });

    user.setPassword(password);

    user.save()
        .then(async (userRecord) => {
            res.status(200).json({ success: true, user: await userRecord.toAuthJSON() });
            logger.info(`Register successful: ${JSON.stringify(userRecord.email)}`, { label: "Register" });
        })
        .catch((err) => {
            res.status(500).json({ success: false, message: err.message });
            logger.error(err.message, { label: "Register" });
        });
});

export default router;
