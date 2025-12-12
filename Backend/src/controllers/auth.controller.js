// src/controllers/auth.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config();

const SALT = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10");

/**
 * 🔹 REGISTER User (Admin / Guru / Siswa)
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role, className } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Semua field wajib diisi" });

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "Email sudah terdaftar" });

    const hashedPassword = await bcrypt.hash(password, SALT);
    const roleUpper = (role || "SISWA").toUpperCase();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: roleUpper,
      className: className || null,
    });

    return res.status(201).json({
      message: "Registrasi berhasil",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        className: user.className,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error: " + err.message });
  }
};

/**
 * 🔹 LOGIN User
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(400).json({ message: "Email tidak ditemukan" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ message: "Password salah" });

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        role: user.role,
      },
      process.env.JWT_SECRET || "ujian-secret",
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        className: user.className,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error: " + err.message });
  }
};

/**
 * 🔹 GET Profile (dari token)
 */
export const profile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "role", "className", "createdAt"],
    });
    if (!user)
      return res.status(404).json({ message: "User tidak ditemukan" });

    return res.json(user);
  } catch (err) {
    console.error("Profile error:", err);
    return res.status(500).json({ message: "Server error: " + err.message });
  }
};
