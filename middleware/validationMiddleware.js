import { validationResult } from "express-validator";

export default (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ success: false, errors: errors.array() });
    } else {
        next();
    }
};
