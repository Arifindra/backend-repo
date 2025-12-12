import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { User } from "../models/index.js";

dotenv.config();

const SALT = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10");

const seedUsers = async () => {
  try {
    // Hash password default
    const adminPass = await bcrypt.hash("admin123", SALT);
    const guruPass = await bcrypt.hash("guru123", SALT);

    // Tambahkan user ADMIN
    await User.findOrCreate({
      where: { email: "admin@mail.com" },
      defaults: {
        name: "Administrator",
        email: "admin@mail.com",
        password: adminPass,
        role: "ADMIN",
      },
    });

    // Tambahkan user GURU
    await User.findOrCreate({
      where: { email: "guru@mail.com" },
      defaults: {
        name: "Guru Utama",
        email: "guru@mail.com",
        password: guruPass,
        role: "GURU",
      },
    });

    console.log("✅ Seed user ADMIN dan GURU berhasil!");
    process.exit();
  } catch (err) {
    console.error("❌ Gagal membuat seed:", err.message);
    process.exit(1);
  }
};

seedUsers();
