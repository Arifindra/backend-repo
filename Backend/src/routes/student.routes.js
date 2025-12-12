import express from "express";
import { getStudentStats } from "../controllers/student.controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/stats", authenticateToken, authorizeRoles("STUDENT"), getStudentStats);

export default router;
