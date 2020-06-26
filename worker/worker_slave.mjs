import ProductModel from "./Product.mjs";
import CategoryModel from "./Category.mjs";
import userAgents from "../utils/userAgents.json";
import mongoose from "mongoose";
import Promise from "bluebird";
import { workerData } from "worker_threads";
import axios from "axios";

const ALTEX_API = "https://fenrir.altex.ro/";

axios.defaults.baseURL = ALTEX_API + "catalog/category/";

mongoose.Promise = Promise;

const MAX_NUMBER_OF_PRODUCTS = 5;

mongoose
    .connect(process.env.MONGODB_URL, {
        auto_reconnect: true,
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
    })
    .then(() => console.log("Connected to DB"));

const getItemsByCategory = (category) =>
    axios
        .get(category, { headers: { "User-Agent": userAgents[Math.floor(Math.random() * (userAgents.length - 1))] } })
        .then((res) => res.data)
        .catch((err) => console.error(err));

(async function scrape(urls) {
    for (let url of urls) {
        let subcategory_iii = url.split("/").slice(-1)[0];

        try {
            let category = await new CategoryModel({
                name: subcategory_iii,
                url,
            }).save();

            let items = await getItemsByCategory(subcategory_iii);
            let maxNumberOfProducts = items.products.length - 1 > MAX_NUMBER_OF_PRODUCTS ? MAX_NUMBER_OF_PRODUCTS : items.products.length - 1;

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

    mongoose.disconnect(function () {
        console.log("DB connection closed");
    });
})(workerData);
