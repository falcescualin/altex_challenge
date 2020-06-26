import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const { Schema, SchemaTypes } = mongoose;

let CategorySchema = new Schema(
    {
        name: { type: SchemaTypes.String, required: true, unique: true },
        url: { type: SchemaTypes.String },
    },
    { strict: true, minimize: false },
);

CategorySchema.plugin(uniqueValidator, { message: "This category is already registered" });

export default mongoose.model("Category", CategorySchema, "categories");
