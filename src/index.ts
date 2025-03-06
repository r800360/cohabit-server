import dotenv from "dotenv";
import express, { Express, NextFunction, Request, Response } from "express";
import { isHttpError } from "http-errors";
import session from "express-session";
import userRoutes from "./routes/user";
import crypto from "crypto";
import authRoutes from "./routes/auth";
import friendRoutes from "./routes/request"


dotenv.config();

const app: Express = express();
const port = process.env.PORT ?? 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// Express session
app.use(session({
  secret: process.env.CLIENT_SECRET || crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: true
}));

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.get("/tick", (req: Request, res: Response) => {
  res.send("tock");
});


app.use("/api/users", userRoutes);
app.use("/api", authRoutes);
app.use("/api/friends", friendRoutes);


// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  // 500 is the "internal server error" error code, this will be our fallback
  let statusCode = 500;
  let errorMessage = "An error has occurred.";

  // check is necessary because anything can be thrown, type is not guaranteed
  if (isHttpError(error)) {
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
