// src/routes/exam.routes.js
import express from "express";
import {
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
} from "../controllers/exam.controller.js";
import { verifyToken, isTeacher, isAdmin } from "../middlewares/authJwt.js";

const router = express.Router();

// Semua user login bisa lihat daftar & detail ujian
router.get("/", verifyToken, getExams);
router.get("/:id", verifyToken, getExamById);

// Guru / admin boleh buat, edit, hapus
router.post("/", verifyToken, isTeacher, createExam);
router.put("/:id", verifyToken, isTeacher, updateExam);
router.delete("/:id", verifyToken, isTeacher, deleteExam);

export default router;
