// src/controllers/result.controller.js
import db from "../models/index.js";

const Result = db.Result;
const User = db.User;
const Exam = db.Exam;

// ==============================
// POST: Simpan hasil ujian (opsional / manual)
// (Biasanya sudah dibuat otomatis di submitExamSession)
// ==============================
export const createResult = async (req, res) => {
  try {
    const { examId, score } = req.body;

    if (!examId || score === undefined) {
      return res
        .status(400)
        .json({ message: "examId dan score wajib diisi" });
    }

    const parsedScore = Number(score);
    if (Number.isNaN(parsedScore)) {
      return res
        .status(400)
        .json({ message: "score harus berupa angka" });
    }

    const newResult = await Result.create({
      examId,
      studentId: req.user.id, // ⬅️ konsisten dengan model Result & ExamSession
      score: parsedScore,
    });

    return res.status(201).json({
      message: "✅ Hasil ujian berhasil disimpan",
      data: newResult,
    });
  } catch (err) {
    console.error("❌ Error createResult:", err);
    return res.status(500).json({
      message: "Gagal menyimpan hasil ujian",
      error: err.message,
    });
  }
};

// ==============================
// GET: Hasil ujian milik user login (siswa)
// ==============================
export const getUserResults = async (req, res) => {
  try {
    const results = await Result.findAll({
      where: { studentId: req.user.id },
      include: [
        {
          model: Exam,
          attributes: ["id", "title", "subject"],
        },
      ],
      order: [["createdAt", "DESC"]], 
    });

    return res.json(results);
  } catch (err) {
    console.error("❌ Error getUserResults:", err);
    return res.status(500).json({
      message: "Gagal mengambil hasil ujian",
      error: err.message,
    });
  }
};

// ==============================
// GET: Semua hasil ujian (misalnya untuk admin/guru)
// ==============================
export const getAllResults = async (req, res) => {
  try {
    const results = await Result.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
        {
          model: Exam,
          attributes: ["id", "title", "subject"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json(results);
  } catch (err) {
    console.error("❌ Error getAllResults:", err);
    return res.status(500).json({
      message: "Gagal mengambil semua hasil ujian",
      error: err.message,
    });
  }
};
