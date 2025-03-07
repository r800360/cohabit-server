"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const http_errors_1 = require("http-errors");
const express_session_1 = __importDefault(require("express-session"));
const crypto_1 = __importDefault(require("crypto"));
const cors_1 = __importDefault(require("cors"));
const user_1 = __importDefault(require("./routes/user"));
const auth_1 = __importDefault(require("./routes/auth"));
const request_1 = __importDefault(require("./routes/request"));
const habit_1 = __importDefault(require("./routes/habit"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 5000;
// Middleware
app.use((0, cors_1.default)()); // Enable CORS for cross-origin requests
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Express session setup
app.use((0, express_session_1.default)({
    secret: process.env.CLIENT_SECRET || crypto_1.default.randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false, // Changed to false for better session security
}));
// Root routes
app.get("/", (req, res) => {
    res.send("Express + TypeScript Server");
});
app.get("/tick", (req, res) => {
    res.send("tock");
});
// API Routes
app.use("/api/users", user_1.default);
app.use("/api/auth", auth_1.default);
app.use("/api/friends", request_1.default);
app.use("/api/habits", habit_1.default);
// Global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
app.use((error, req, res, next) => {
    let statusCode = 500;
    let errorMessage = "An error has occurred.";
    if ((0, http_errors_1.isHttpError)(error)) {
        statusCode = error.status;
        errorMessage = error.message;
    }
    else if (error instanceof Error) {
        errorMessage = error.message;
    }
    res.status(statusCode).json({ error: errorMessage });
});
// Start server
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map