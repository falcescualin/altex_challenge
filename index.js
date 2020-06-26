import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import Promise from "bluebird";
import dotenv from "dotenv";
import compression from "compression";
import logger from "./logger";
import routes from "./routes";
import cors from "cors";
import helmet from "helmet";

const app = express();

dotenv.config();

app.disable("x-powered-by");
app.disable("etag");

app.set("port", process.env.PORT);
app.set("host", process.env.HOST);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// TODO Add rate limitter

if (process.env.NODE_ENV === "PROD") {
    app.use(cors());
    app.use(helmet());
    app.use(compression());
}

mongoose.Promise = Promise;

mongoose.set("useCreateIndex", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useNewUrlParser", true);

let mongo_connection_options = {
    auto_reconnect: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
};

mongoose
    .connect(process.env.MONGODB_URL, mongo_connection_options)
    .then(() => {
        logger.info(`Connected to database: ${process.env.MONGODB_URL}`, {
            label: "DataBase Connection SUCCESS",
        });
    })
    .catch((error) =>
        logger.error(error, {
            label: "DataBase Connection ERROR",
        }),
    );

mongoose.connection.on("disconnected", () => [
    logger.error(`Connection with database broken: ${process.env.MONGODB_URL}`, {
        label: "DataBase Connection ERROR",
    }),
]);

mongoose.connection.on("reconnect", () => [
    logger.error(`Connection with database reestablished: ${process.env.MONGODB_URL}`, {
        label: "DataBase Connection ERROR",
    }),
]);

app.use("/api", routes);

app.get("/*/**", (req, res) => {
    res.status(404).send("Not Found");
});

try {
    app.listen(app.get("port"), app.get("host"), () => {
        let { host, port } = { host: app.get("host"), port: app.get("port") };
        logger.info(`Server started succesfully on http://${host}:${port}`, {
            label: "Application Startup",
        });
    });
} catch (err) {
    logger.error(err.error, {
        label: "Application Startup",
    });
}
