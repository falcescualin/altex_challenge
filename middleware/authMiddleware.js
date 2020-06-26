import User from "../models/User";
import jwt from "jsonwebtoken";
import logger from "../logger";

export default (req, res, next) => {
    const header = req.get("X-Acces-Key");
    let token;

    if (header) token = header;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                if (err.message === "jwt expired") {
                    res.status(401).json({ success: false, message: "Token expired" });
                    logger.debug(
                        `Token expired: { Path: ${req.originalUrl}, IP: ${req.connection.remoteAddress}, UserAgent: ${req.headers["user-agent"]}, Token: ${err.expiredAt} }`,
                        { label: "Authentification Middleware" },
                    );
                } else {
                    res.status(401).json({ success: false, message: "Invalid Token" });
                    logger.debug(
                        `Unauthenticated request attempted UNVERIFIED token: { Path: ${req.originalUrl}, IP: ${req.connection.remoteAddress}, UserAgent: ${req.headers["user-agent"]}, Token: ${token} }`,
                        { label: "Authentification Middleware" },
                    );
                }
            } else {
                User.findOne({ email: decoded.email }).then((user) => {
                    if (!user) {
                        res.status(400).json({ success: false, message: "User does not exist" });
                        logger.info("User does not exist", { label: "Authentification Middleware" });
                    } else {
                        logger.debug(
                            `User JWT verified: { User: ${user.email}, Path: ${req.originalUrl}, IP: ${req.connection.remoteAddress}, Role: ${req.role}, UserAgent: ${req.headers["user-agent"]}, Token: ${token} }`,
                            { label: "Authentification Middleware" },
                        );

                        req.currentUser = user;

                        next();
                    }
                });
            }
        });
    } else {
        res.status(400).json({ success: false, message: "No token provided" });
        logger.debug(
            `Unauthenticated request attempted NO token provided: { Path: ${req.originalUrl}, IP: ${req.connection.remoteAddress}, UserAgent: ${req.headers["user-agent"]} }`,
            {
                label: "Authentification Middleware",
            },
        );
    }
};
