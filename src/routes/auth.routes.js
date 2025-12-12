// src/routes/auth.routes.js
import express from "express";
import { register, login, profile } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/authJwt.js";

const router = express.Router();

// 🔍 Cek koneksi (opsional)
router.get("/ping", (req, res) => {
  res.json({ message: "Auth route is alive!" });
});

// 🔐 Register user (Admin, Guru, Siswa)
router.post("/register", register);

// 🔑 Login user → dapat token JWT
router.post("/login", login);

// 👤 Profil user (hanya jika token valid)
router.get("/profile", verifyToken, profile);

export default router;
