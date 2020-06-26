import { Worker } from "worker_threads";
import { cpus } from "os";
import { getCategories } from "./constants/api.js";

import dotenv from "dotenv";
import path from "path";

dotenv.config();

// Without workers
// Workers execution time: 1.127ms

// With workers
// Workers execution time: 0.466ms
console.time("Workers execution time");

getCategories().then((categoriesData) => {
    let subCategoriesWorkerData = [];

    for (const mainCategory of categoriesData) {
        if (mainCategory.subcategories)
            for (const subcategory_i of mainCategory.subcategories) {
                if (subcategory_i.subcategories)
                    for (const subcategory_ii of subcategory_i.subcategories) {
                        if (subcategory_ii.subcategories)
                            for (const subcategory_iii of subcategory_ii.subcategories) {
                                subCategoriesWorkerData.push(
                                    mainCategory.url_key + "/" + subcategory_i.url_key + "/" + subcategory_ii.url_key + "/" + subcategory_iii.url_key,
                                );
                            }
                    }
            }
    }

    // Split workload as even as possible
    subCategoriesWorkerData = chunkArray(subCategoriesWorkerData, Math.ceil(subCategoriesWorkerData.length / cpus().length));

    // Maybe not my best work. :))
    // TODO handle exit with error
    for (const subCategory_iii_urls of subCategoriesWorkerData) {
        let worker = new Worker(path.join(__dirname, "/worker/worker_slave.mjs"), {
            env: { MONGODB_URL: process.env.MONGODB_URL },
            execArgv: ["--experimental-modules", "--no-warnings", "--experimental-json-modules"],
            workerData: subCategory_iii_urls,
        });
        worker.on("exit", (code) => {
            console.log("Worker finished.");
        });
    }
});

console.timeEnd("Workers execution time");

function chunkArray(array, size) {
    if (!array) return [];
    const firstChunk = array.slice(0, size);
    if (!firstChunk.length) {
        return array;
    }
    return [firstChunk].concat(chunkArray(array.slice(size, array.length), size));
}
