// src/routes/user.routes.js
import express from "express";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { verifyToken, isAdmin } from "../middlewares/authJwt.js";

const router = express.Router();

// 🔍 Test route untuk memastikan router aktif
router.get("/ping", (req, res) => {
  res.json({ message: "User route is alive!" });
});

// 🔹 CRUD User (khusus admin)
// GET /api/users -> lihat semua user
router.get("/", verifyToken, isAdmin, getAllUsers);

// POST /api/users -> buat user baru
router.post("/", verifyToken, isAdmin, createUser);

// PUT /api/users/:id -> update user
router.put("/:id", verifyToken, isAdmin, updateUser);

// DELETE /api/users/:id -> hapus user
router.delete("/:id", verifyToken, isAdmin, deleteUser);

export default router;
