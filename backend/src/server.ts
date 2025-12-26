import express from "express";
import cors from "cors";
import { validateEnvironment } from "./middleware/safetyGuards";
import { rateLimiter } from "./middleware/rateLimiter";

// Load .env ONLY for local development
if (process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("dotenv").config();
}

// Validate environment on startup
try {
  validateEnvironment();
} catch (error) {
  console.error("Environment validation failed:", error);
  process.exit(1);
}

import leadRoutes from "./routes/lead.routes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Limit request size

// Rate limiting for API routes
app.use("/api/leads", rateLimiter);

// Routes
app.use("/api/leads", leadRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ✅ Correct PORT handling
const PORT = Number(process.env.PORT) || 4000;

// ✅ Bind to all interfaces (required for cloud hosting)
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Rate limit: 10 requests/minute per IP`);
});
