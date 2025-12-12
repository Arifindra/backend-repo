// src/routes/index.js
import express from "express";

import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import examRoutes from "./exam.routes.js";
import questionRoutes from "./question.routes.js";
import resultRoutes from "./result.routes.js";
import adminRoutes from "./admin.routes.js";
import teacherRoutes from "./teacher.routes.js";
import studentRoutes from "./student.routes.js";
import examSessionRoutes from "./examSession.routes.js";
import dashboardRoutes from "./dashboard.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/exams", examRoutes);
router.use("/questions", questionRoutes);
router.use("/results", resultRoutes);
router.use("/admin", adminRoutes);
router.use("/teacher", teacherRoutes);
router.use("/student", studentRoutes);
router.use("/exam-session", examSessionRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
