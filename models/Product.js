import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const { Schema, SchemaTypes } = mongoose;

let ProductSchema = new Schema(
    {
        name: { type: SchemaTypes.String, unique: true, index: true },
        categoryId: { type: SchemaTypes.ObjectId, ref: "Category", index: true },
        price: { type: SchemaTypes.String },
        ean: { type: SchemaTypes.String },
        brand: { type: SchemaTypes.String },
        url: { type: SchemaTypes.String },

        isEOL: { type: SchemaTypes.Boolean },
        isAvailable: { type: SchemaTypes.Boolean },
    },
    { strict: true, minimize: false },
);

ProductSchema.plugin(uniqueValidator, { message: "This product is already in DB" });

export default mongoose.model("Product", ProductSchema, "products");
