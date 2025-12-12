// src/controllers/exam.controller.js
import db from "../models/index.js";
import { Op } from "sequelize";

const Exam = db.Exam;
const Question = db.Question;
const Result = db.Result;
const User = db.User;

/**
 * GET /api/exams
 * - Admin: semua ujian
 * - Guru: hanya ujian yang dia buat
 * - Siswa: hanya ujian aktif (isActive = true) + filter kelas
 */
export const getExams = async (req, res) => {
  try {
    const role = String(req.user.role || "").toUpperCase();
    const userId = req.user.id;

    let where = {};

    if (role === "GURU") {
      where.creatorId = userId;
    } else if (role === "SISWA") {
      where.isActive = true;

      const student = await User.findByPk(userId);
      const className = student?.className || null;

      if (className) {
        where[Op.or] = [
          { targetClass: null },      // ujian umum
          { targetClass: className }, // ujian khusus kelasnya
        ];
      } else {
        where.targetClass = null;     // hanya ujian umum
      }
    }
    // ADMIN: tanpa filter (lihat semua)

    const exams = await Exam.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    return res.json(exams);
  } catch (err) {
    console.error("❌ Error getExams:", err);
    return res.status(500).json({
      message: "Gagal mengambil data ujian",
      error: err.message,
    });
  }
};

/**
 * GET /api/exams/:id
 */
export const getExamById = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findByPk(id, {
      include: [
        {
          model: Question,
          attributes: [
            "id",
            "questionText",
            "options",
            "correctAnswer",
            "type",
            "score",
            "order",
          ],
          order: [["order", "ASC"]],
        },
      ],
    });

    if (!exam) {
      return res.status(404).json({ message: "Ujian tidak ditemukan" });
    }

    return res.json(exam);
  } catch (err) {
    console.error("❌ Error getExamById:", err);
    return res.status(500).json({
      message: "Gagal mengambil detail ujian",
      error: err.message,
    });
  }
};

/**
 * POST /api/exams
 * - Guru / Admin membuat ujian
 */
export const createExam = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      duration,
      startTime,
      endTime,
      isActive,
      targetClass,
    } = req.body;

    if (!title || !subject) {
      return res
        .status(400)
        .json({ message: "Judul dan mata pelajaran wajib diisi" });
    }

    const creatorId = req.user.id; // 🔥 penting

    const exam = await Exam.create({
      title,
      description: description || null,
      subject,
      duration: duration || 60,
      startTime: startTime ? new Date(startTime) : null,
      endTime: endTime ? new Date(endTime) : null,
      isActive: !!isActive,
      targetClass: targetClass || null,
      creatorId,
    });

    return res.status(201).json({
      message: "✅ Ujian berhasil dibuat",
      data: exam,
    });
  } catch (err) {
    console.error("❌ Error createExam:", err);
    return res.status(500).json({
      message: "Gagal membuat ujian",
      error: err.message,
    });
  }
};

/**
 * PUT /api/exams/:id
 */
export const updateExam = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findByPk(id);
    if (!exam) {
      return res.status(404).json({ message: "Ujian tidak ditemukan" });
    }

    const {
      title,
      description,
      subject,
      duration,
      startTime,
      endTime,
      isActive,
      targetClass,
    } = req.body;

    await exam.update({
      title: title ?? exam.title,
      description: description ?? exam.description,
      subject: subject ?? exam.subject,
      duration: duration ?? exam.duration,
      startTime: startTime ? new Date(startTime) : exam.startTime,
      endTime: endTime ? new Date(endTime) : exam.endTime,
      isActive:
        typeof isActive === "boolean" ? isActive : exam.isActive,
      targetClass:
        typeof targetClass !== "undefined"
          ? targetClass || null
          : exam.targetClass,
      // creatorId tidak diubah
    });

    return res.json({
      message: "✅ Ujian berhasil diperbarui",
      data: exam,
    });
  } catch (err) {
    console.error("❌ Error updateExam:", err);
    return res.status(500).json({
      message: "Gagal memperbarui ujian",
      error: err.message,
    });
  }
};

/**
 * DELETE /api/exams/:id
 */
export const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findByPk(id);
    if (!exam) {
      return res.status(404).json({ message: "Ujian tidak ditemukan" });
    }

    await exam.destroy();

    return res.json({ message: "✅ Ujian berhasil dihapus" });
  } catch (err) {
    console.error("❌ Error deleteExam:", err);
    return res.status(500).json({
      message: "Gagal menghapus ujian",
      error: err.message,
    });
  }
};
