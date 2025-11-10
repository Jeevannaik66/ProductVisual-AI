// backend/server.js
import dotenv from "dotenv";
dotenv.config(); // ✅ Load environment variables first

import express from "express";
import cors from "cors";

// ✅ Import API routes
import authRoutes from "./routes/auth.js";
import enhanceRoutes from "./routes/enhance.js";
import generateRoutes from "./routes/generations.js";

const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" })); // ✅ Increase JSON size limit for images

// ✅ API Routes
app.use("/api/auth", authRoutes);         // Authentication routes
app.use("/api/enhance", enhanceRoutes);   // Prompt enhancement route
app.use("/api/generate", generateRoutes); // Image generation & generations CRUD

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// ✅ Error-handling middleware (optional but helpful)
app.use((err, req, res, next) => {
  console.error("Global error handler:", err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
