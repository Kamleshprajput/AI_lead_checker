import express from "express";
import cors from "cors";

// Load .env ONLY for local development
if (process.env.NODE_ENV !== "production") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("dotenv").config();
}

import leadRoutes from "./routes/lead.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/leads", leadRoutes);

app.get("/health", (_req, res) => {
  res.send("OK");
});

// ✅ Correct PORT handling
const PORT = Number(process.env.PORT) || 4000;

// ✅ Bind to all interfaces (required for cloud hosting)
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
