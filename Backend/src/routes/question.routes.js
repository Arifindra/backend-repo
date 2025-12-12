import express from "express";
import {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  uploadQuestionsFromExcel,
} from "../controllers/question.controller.js";

import { verifyToken, isTeacher } from "../middlewares/authJwt.js";

const router = express.Router();

// ======================================================
// ROUTES BANK SOAL (Teacher Only)
// ======================================================

// Upload soal via Excel (harus ditempatkan sebelum route :id)
router.post(
  "/upload",
  verifyToken,
  isTeacher,
  uploadQuestionsFromExcel
);

// Ambil semua soal
router.get(
  "/",
  verifyToken,
  isTeacher,
  getAllQuestions
);

// Ambil satu soal berdasarkan ID
router.get(
  "/:id",
  verifyToken,
  isTeacher,
  getQuestionById
);

// Tambah soal manual
router.post(
  "/",
  verifyToken,
  isTeacher,
  createQuestion
);

// Update soal berdasarkan ID
router.put(
  "/:id",
  verifyToken,
  isTeacher,
  updateQuestion
);

// Hapus soal
router.delete(
  "/:id",
  verifyToken,
  isTeacher,
  deleteQuestion
);

export default router;
