// src/controllers/user.controller.js
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config();

const SALT = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10");

/**
 * 🔹 GET /api/users
 * Ambil semua user (khusus admin)
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role", "className", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    return res.json(users);
  } catch (err) {
    console.error("❌ Error getAllUsers:", err);
    return res.status(500).json({
      message: "Gagal mengambil data pengguna",
      error: err.message,
    });
  }
};

/**
 * 🔹 POST /api/users
 * Buat user baru (admin)
 */
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, className } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Nama, email, dan password wajib diisi",
      });
    }

    // Cek email duplikat
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const hashed = await bcrypt.hash(password, SALT);
    const roleUpper = (role || "SISWA").toUpperCase();

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: roleUpper,
      className: className || null, // bisa null untuk admin/guru
    });

    return res.status(201).json({
      message: "User berhasil dibuat",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        className: user.className,
      },
    });
  } catch (err) {
    console.error("❌ Error createUser:", err);
    return res.status(500).json({
      message: "Gagal membuat user",
      error: err.message,
    });
  }
};

/**
 * 🔹 PUT /api/users/:id
 * Update user (nama, email, role, className, password opsional)
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, className, password } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Cek jika email diganti, jangan sampai bentrok
    if (email && email !== user.email) {
      const dup = await User.findOne({ where: { email } });
      if (dup && dup.id !== user.id) {
        return res
          .status(400)
          .json({ message: "Email sudah digunakan user lain" });
      }
    }

    // Password: hanya di-hash kalau diisi dan panjang minimal 3
    let hashedPassword = user.password;
    if (password && password.trim().length >= 3) {
      hashedPassword = await bcrypt.hash(password.trim(), SALT);
    }

    await user.update({
      name: name ?? user.name,
      email: email ?? user.email,
      role: role ? role.toUpperCase() : user.role,
      className: className ?? user.className,
      password: hashedPassword,
    });

    return res.json({
      message: "User berhasil diperbarui",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        className: user.className,
      },
    });
  } catch (err) {
    console.error("❌ Error updateUser:", err);
    return res.status(500).json({
      message: "Gagal memperbarui user",
      error: err.message,
    });
  }
};

/**
 * 🔹 DELETE /api/users/:id
 * Hapus user
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const del = await User.destroy({ where: { id } });
    if (!del) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    return res.json({ message: "User berhasil dihapus" });
  } catch (err) {
    console.error("❌ Error deleteUser:", err);
    return res.status(500).json({
      message: "Gagal menghapus user",
      error: err.message,
    });
  }
};
