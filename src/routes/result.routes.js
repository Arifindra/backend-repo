// src/routes/result.routes.js
import express from "express";
import {
  createResult,
  getUserResults,
  getAllResults,
} from "../controllers/result.controller.js";
import { verifyToken } from "../middlewares/authJwt.js";

const router = express.Router();

/**
 * 🔹 Siswa menyimpan hasil ujian (dipakai saat submit ujian kalau mau)
 * (kalau kamu sudah pakai submitExamSession yang bikin Result sendiri,
 * route ini bisa jarang dipakai, tapi aman dibiarkan)
 */
router.post("/", verifyToken, createResult);

/**
 * 🔹 Siswa: lihat hasil ujian milik sendiri
 * GET /api/results/my
 */
router.get("/my", verifyToken, getUserResults);

/**
 * 🔹 Admin / Guru: lihat semua hasil ujian
 * GET /api/results
 * Keamanan: cek role di controller (getAllResults) atau di sini bisa ditambah filter role
 */
router.get("/", verifyToken, getAllResults);

export default router;
