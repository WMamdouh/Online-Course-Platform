import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";

// ── Import Middlewares ────────────────────────────────────────────────────────
import errorHandlingMW from "./middlewares/errorHandlingMW.js";
import notFoundMW from "./middlewares/notFoundMW.js";

// ── Import Routers ────────────────────────────────────────────────────────────
import authRouter   from "./routes/auth.router.js";
import userRouter   from "./routes/user.router.js";
import courseRouter from "./routes/course.router.js";
import lessonRouter from "./routes/lesson.router.js";

const app = express();


// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    "http://localhost:4200",     // Angular dev server
    "http://localhost:3000",
  ],
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));



// ── Global Middlewares ────────────────────────────────────────────────────────
app.use(morgan("dev"));
app.use(express.json());

app.use(cookieParser());

// ── Route Mounting ────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/courses", courseRouter);
app.use("/api/courses/:courseId/lessons", lessonRouter);


app.use(notFoundMW);
app.use(errorHandlingMW);


export default app;