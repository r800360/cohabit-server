import dotenv from "dotenv";
import express, { Express, NextFunction, Request, Response } from "express";
import { isHttpError } from "http-errors";
import session from "express-session";
import crypto from "crypto";
// import cors from "cors";

import userRoutes from "./routes/user";
import authRoutes from "./routes/auth";
import friendRoutes from "./routes/friends";
import habitRoutes from "./routes/habit";


dotenv.config();

const app: Express = express();
const port = process.env.PORT ?? 5000;

// Middleware
//app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express session setup
app.use(
  session({
    secret: process.env.CLIENT_SECRET || crypto.randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false, // Changed to false for better session security
  })
);

// Root routes
app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.get("/tick", (req: Request, res: Response) => {
  res.send("tock");
});


// API Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/habits", habitRoutes);

// Global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500;
  let errorMessage = "An error has occurred.";

  if (isHttpError(error)) {
    statusCode = error.status;
    errorMessage = error.message;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  res.status(statusCode).json({ error: errorMessage });
});

// Start server
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});