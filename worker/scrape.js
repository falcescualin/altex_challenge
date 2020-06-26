import { getCategories, getItemsByCategory } from "../constants/api";
import { MAX_NUMBER_OF_PRODUCTS } from "../constants";
import ProductModel from "../models/Product";
import CategoryModel from "../models/Category";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Promise from "bluebird";

mongoose.Promise = Promise;

dotenv.config();

mongoose
    .connect(process.env.MONGODB_URL, {
        auto_reconnect: true,
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
    })
    .then(() => console.log("Connected to DB"));

console.time("Workers execution time");

(async function scrape() {
    const categoriesData = await getCategories();

    for (const mainCategory of categoriesData) {
        if (mainCategory.subcategories)
            for (const subcategory_i of mainCategory.subcategories) {
                if (subcategory_i.subcategories)
                    for (const subcategory_ii of subcategory_i.subcategories) {
                        if (subcategory_ii.subcategories)
                            for (const subcategory_iii of subcategory_ii.subcategories) {
                                let url = mainCategory.url_key + "/" + subcategory_i.url_key + "/" + subcategory_ii.url_key + "/" + subcategory_iii.url_key;

                                try {
                                    let category = await new CategoryModel({
                                        name: subcategory_iii.url_key,
                                        url,
                                    }).save();

                                    let items = await getItemsByCategory(subcategory_iii.url_key);
                                    let maxNumberOfProducts =
                                        items.products.length - 1 > MAX_NUMBER_OF_PRODUCTS ? MAX_NUMBER_OF_PRODUCTS : items.products.length - 1;

                                    for (const product of items.products.slice(0, maxNumberOfProducts)) {
                                        let { name, price, ean_codes, brand_name, url_key, eol_status, status } = product; // Deconstruct product
                                        product.short_description = product.short_description.trim();
                                        if (product.short_description && product.short_description != "") {
                                            await new ProductModel({
                                                name,
                                                categoryId: category._id,
                                                price,
                                                ean: ean_codes,
                                                brand: brand_name,
                                                url: url_key,
                                                isEOL: eol_status,
                                                isAvailable: status,
                                            }).save();
                                        }
                                    }
                                } catch (e) {
                                    console.error(e);
                                }
                            }
                    }
            }
    }

    mongoose.disconnect(function () {
        console.log("DB connection closed");
    });
})();

console.timeEnd("Workers execution time");
