// src/routes/admin.routes.js
import express from "express";
import { getAdminStats } from "../controllers/admin.controller.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// 🔹 Hanya admin yang bisa akses
router.get("/stats", authenticateToken, authorizeRoles("ADMIN"), getAdminStats);

export default router;
