// src/routes/dashboard.routes.js
import express from "express";
import {
  getAdminDashboard,
  getTeacherDashboard,
  getStudentDashboard,
} from "../controllers/dashboard.controller.js";
import {
  verifyToken,
  isAdmin,
  isTeacher,
  isStudent,
} from "../middlewares/authJwt.js";

const router = express.Router();

// ADMIN
router.get("/admin", verifyToken, isAdmin, getAdminDashboard);

// GURU
router.get("/teacher", verifyToken, isTeacher, getTeacherDashboard);

// SISWA
router.get("/student", verifyToken, isStudent, getStudentDashboard);

export default router;
