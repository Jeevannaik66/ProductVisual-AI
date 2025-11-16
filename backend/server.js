// backend/server.js
import 'dotenv/config';
import dotenv from "dotenv";
dotenv.config(); // Load environment variables first

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Import API routes
import authRoutes from "./routes/auth.js";
import enhanceRoutes from "./routes/enhance.js";
import generateRoutes from "./routes/generations.js";

const app = express();

// Basic security middleware
app.use(helmet());

// Basic rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP
  })
);
// CORS configuration: allow the frontend origin (dev or production) and enable credentials
// FRONTEND_URL should be set in your environment to the deployed frontend URL (e.g. https://product-ad-generator.vercel.app)
// FALLBACK: default to Vite dev server at http://localhost:5173 when FRONTEND_URL isn't provided
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const allowedOrigins = [FRONTEND_URL];

app.use(
  cors({
    // origin: dynamic whitelist check
    origin: function (origin, callback) {
      // If no origin (e.g. curl, server-to-server), allow it
      if (!origin) return callback(null, true);
      // If the origin is in our whitelist, allow it
      if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
      // Otherwise, reject
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    },
    // Allow sending cookies (HttpOnly) from the browser
    credentials: true,
  })
);

// Parse JSON bodies (with increased limit for images)
app.use(express.json({ limit: "10mb" }));

// Parse cookies for cookie-based auth
app.use(cookieParser());

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/enhance", enhanceRoutes);
app.use("/api/generate", generateRoutes);

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// ✅ Global error-handling middleware
app.use((err, req, res, next) => {
  console.error("Global error handler:", err && err.stack ? err.stack : err);
  // Default to 500 unless err.status provided
  const status = err?.status || 500;
  res.status(status).json({ error: err?.message || "Internal server error" });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
