import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";


import leadRoutes from "./routes/lead.routes";



const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/leads", leadRoutes);

app.get("/health", (_req, res) => {
  res.send("OK");
});

const PORT = process.env.PORT ?? 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
