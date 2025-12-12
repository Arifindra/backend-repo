// src/routes/examSession.routes.js
import express from "express";
import {
  startExamSession,
  submitExamSession,
  getExamSessionsByExam,
} from "../controllers/examSession.controller.js";
import {
  verifyToken,
  isStudent,
  isTeacher,
} from "../middlewares/authJwt.js";

const router = express.Router();

// Siswa mulai ujian
router.post("/start", verifyToken, isStudent, startExamSession);

// Siswa submit ujian
router.post("/submit", verifyToken, isStudent, submitExamSession);

// Guru: lihat sesi-sesi ujian untuk suatu exam
router.get(
  "/by-exam/:examId",
  verifyToken,
  isTeacher,
  getExamSessionsByExam
);

export default router;
