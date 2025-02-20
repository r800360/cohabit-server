"use strict";
// import dotenv from "dotenv";
// import express, { Express, NextFunction, Request, Response } from "express";
// import { isHttpError } from "http-errors";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import userRoutes from "./routes/user";
// dotenv.config();
// const app: Express = express();
// const port = process.env.PORT ?? 5000;
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// app.get("/", (req: Request, res: Response) => {
//   res.send("Express + TypeScript Server");
// });
// // app.use("/api/users", userRoutes);
// // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
// app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
//   // 500 is the "internal server error" error code, this will be our fallback
//   let statusCode = 500;
//   let errorMessage = "An error has occurred.";
//   // check is necessary because anything can be thrown, type is not guaranteed
//   if (isHttpError(error)) {
//     // error.status is unique to the http error class, it allows us to pass status codes with errors
//     statusCode = error.status;
//     errorMessage = error.message;
//   }
//   // prefer custom http errors but if they don't exist, fallback to default
//   else if (error instanceof Error) {
//     errorMessage = error.message;
//   }
//   res.status(statusCode).json({ error: errorMessage });
// });
// app.listen(port, () => {
//   // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
//   console.log(`[server]: Server is running at http://localhost:${port}`);
// });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
app.get('/', (_req, res) => {
    res.send('Express Typescript on Vercel');
});
app.get('/ping', (_req, res) => {
    res.send('pong 🏓');
});
app.listen(port, () => {
    console.log(`Server is listening on ${port}`);
});
//# sourceMappingURL=index.js.map