import express from "express";
import { getTeacherStats } from "../controllers/teacher.controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// 🔹 Hanya role GURU
router.get("/stats", authenticateToken, authorizeRoles("TEACHER"), getTeacherStats);

export default router;
