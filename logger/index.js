import path from "path";
import winston, { format } from "winston";
import "winston-daily-rotate-file";
import moment from "moment";
import "moment/min/locales.min";
import dotenv from "dotenv";
import os from "os";

dotenv.config();

moment.locale("ro");

var options = {
    file: {
        level: process.env.LOG_LEVEL,
        filename: path.join(__dirname, `../logs/${process.env.HOST}_${moment().format("YYYY-MM-DD")}.log`),
        handleExceptions: true,
        json: true,
        // TODO CONFIG MAX_SIZE
        maxsize: 5242880, // 5MB
        // TODO CONFIG MAX_FILES
        maxFiles: "1",
        zippedArchive: true,
        colorize: true,
    },
    console: {
        level: "debug",
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};

// instantiate a new Winston Logger with the settings defined above
var logger = new winston.createLogger({
    format: format.combine(
        format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss.ms",
        }),
        format.printf((info) => {
            return info.state
                ? `${info.timestamp} microservice_id:${os.hostname()} | microservice_name: ${process.env.npm_package_name} | ${info.level.toUpperCase()} | ${
                      info.label
                  } | ${info.state} | ${info.message}`
                : `${info.timestamp} microservice_id:${os.hostname()} | microservice_name: ${process.env.npm_package_name} | ${info.level.toUpperCase()} | ${
                      info.label
                  } | ${info.message}`;
        }),
    ),
    transports: [new winston.transports.File(options.file)],
    exitOnError: false, // do not exit on handled exceptions
});

logger.add(new winston.transports.Console(options.console));

module.exports = logger;
