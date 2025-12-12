// src/app.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import routes from "./routes/index.js";

const app = express();

// ==============================
// Resolusi __dirname (ESM)
// ==============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==============================
// Middleware global
// ==============================
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // sesuaikan dengan URL frontend
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ==============================
// Static files (uploads)
// ==============================
// Kalau folder uploads kamu di src/uploads:
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Kalau kamu juga punya uploads di root Backend/uploads dan mau serve itu juga,
// bisa tambahkan (opsional):
// app.use("/public-uploads", express.static(path.join(__dirname, "..", "uploads")));

// ==============================
// Routes utama
// ==============================
// Semua route API masuk lewat /api
app.use("/api", routes);

// Health check / root info
app.get("/", (req, res) => {
  return res.json({ message: "Smart E-Ujian API running" });
});

// ==============================
// 404 Handler
// ==============================
app.use((req, res, next) => {
  return res.status(404).json({ message: "Endpoint tidak ditemukan" });
});

// ==============================
// Global Error Handler
// ==============================
app.use((err, req, res, next) => {
  console.error("❌ Global error handler:", err);
  const status = err.status || 500;
  return res.status(status).json({
    message: err.message || "Terjadi kesalahan pada server",
  });
});

export default app;
