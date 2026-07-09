import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { env } from "./configs/env";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

const origins = env.CORS_ORIGIN.split(",");
app.use(
  cors({
    origin: origins,
    credentials: true,
  }),
);

app.use(helmet());
app.use(cookieParser());

app.use(express.json());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

app.use(morgan("dev"));

// routes
app.use(routes);

// error middleware
app.use(errorMiddleware);

export { app };
