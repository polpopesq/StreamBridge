import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/v1";
import session from 'express-session';
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Use `true` if you're using HTTPS
}));

app.use("/api/v1", routes);

export default app;
