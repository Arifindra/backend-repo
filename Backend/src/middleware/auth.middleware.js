import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/**
 * 🔹 Middleware untuk memverifikasi JWT Token
 */
export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token tidak ditemukan" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // simpan data user (id, role) ke req.user  
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token tidak valid" });
  }
};

/**
 * 🔹 Middleware untuk membatasi akses berdasarkan role
 * Contoh: authorizeRoles("ADMIN"), authorizeRoles("GURU")
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    next();
  };
};