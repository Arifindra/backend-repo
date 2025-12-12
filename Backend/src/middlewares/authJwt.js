// src/middlewares/authJwt.js
import jwt from "jsonwebtoken";
import db from "../models/index.js";

const User = db.User;

// ==============================
// Middleware: Verifikasi Token
// ==============================
export const verifyToken = async (req, res, next) => {
  try {
    const header = req.headers["authorization"];

    const token = header?.startsWith("Bearer ")
      ? header.split(" ")[1]
      : null;

    if (!token) {
      return res.status(403).json({ message: "Token tidak disertakan" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "ujian-secret"
    );

    // decoded berisi { id, name, role }
    req.user = decoded;

    next();
  } catch (err) {
    console.error("❌ Error verifyToken:", err);
    return res
      .status(401)
      .json({ message: "Token tidak valid atau sudah kadaluarsa" });
  }
};

// Helper: ambil user dari DB dan cek role
const checkRole = (roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      const roleUpper = String(user.role || "").toUpperCase();

      if (!roles.includes(roleUpper)) {
        return res
          .status(403)
          .json({ message: "Anda tidak memiliki akses ke resource ini" });
      }

      next();
    } catch (err) {
      console.error("❌ Error checkRole:", err);
      return res.status(500).json({
        message: "Gagal memverifikasi role",
        error: err.message,
      });
    }
  };
};

// ==============================
// Role: GURU
// ==============================
export const isTeacher = checkRole(["GURU"]);

// ==============================
// Role: SISWA
// ==============================
export const isStudent = checkRole(["SISWA"]);

// ==============================
// Role: ADMIN
// ==============================
export const isAdmin = checkRole(["ADMIN"]);
