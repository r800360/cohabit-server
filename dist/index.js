"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const http_errors_1 = require("http-errors");
const user_1 = __importDefault(require("./routes/user"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 5000;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("Express + TypeScript Server");
});
app.get("/tick", (req, res) => {
    res.send("tock");
});
app.use("/api/users", user_1.default);
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
app.use((error, req, res, next) => {
    // 500 is the "internal server error" error code, this will be our fallback
    let statusCode = 500;
    let errorMessage = "An error has occurred.";
    // check is necessary because anything can be thrown, type is not guaranteed
    if ((0, http_errors_1.isHttpError)(error)) {
        // error.status is unique to the http error class, it allows us to pass status codes with errors
        statusCode = error.status;
        errorMessage = error.message;
    }
    // prefer custom http errors but if they don't exist, fallback to default
    else if (error instanceof Error) {
        errorMessage = error.message;
    }
    res.status(statusCode).json({ error: errorMessage });
});
app.listen(port, () => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map