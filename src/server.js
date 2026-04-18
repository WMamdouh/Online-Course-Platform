import app from "./app.js";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Load environment variables from .env file into process.env
dotenv.config();



// ── Connect to MongoDB ────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB Connection error:", err.message);
    process.exit(1);
  });



// ── Start Express Server ──────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
