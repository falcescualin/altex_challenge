import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import uniqueValidator from "mongoose-unique-validator";
import { ACCESS_TOKEN_EXPIRATION_THRESHOLD } from "../constants";

const UserSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Email address required 📧"],
            lowercase: true,
            index: true,
            unique: true,
            validator: (value) => {
                const emailRegexValidator = new RegExp(
                    "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$",
                );
                return emailRegexValidator.test(value);
            },
            message: (props) => {
                `📧 ${props.value} is not a valid email address!`;
            },
        },
        passwordHash: { type: String, required: true },
    },
    { timestamps: true, strict: true, strictQuery: true },
);

UserSchema.methods.isValidPassword = function isValidPassword(password) {
    return bcrypt.compareSync(password, this.passwordHash);
};

UserSchema.methods.setPassword = function setPassword(password) {
    this.passwordHash = bcrypt.hashSync(password, parseInt(process.env.BCRYPT_SECRET));
};

UserSchema.methods.generateJWT = function generateJWT() {
    return jwt.sign(
        {
            email: this.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRATION_THRESHOLD },
    );
};

UserSchema.methods.toAuthJSON = async function toAuthJSON() {
    return {
        email: this.email,
        token: this.generateJWT(),
    };
};

UserSchema.plugin(uniqueValidator, { message: "This email is already taken. ✉" });

export default mongoose.model("User", UserSchema);
