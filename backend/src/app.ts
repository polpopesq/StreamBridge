import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes";
import session from "express-session";
import cookieParser from "cookie-parser";
import { initDB } from "./config/db";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Use `true` if you're using HTTPS
  })
);

app.use("/api/v1", routes);

initDB();

export default app;
