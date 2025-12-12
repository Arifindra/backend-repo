// ===============================================
// CONTROLLER: BANK SOAL
// ===============================================

import Question from "../models/question.model.js";
import User from "../models/user.model.js";
import Exam from "../models/exam.model.js";
import multer from "multer";
import xlsx from "xlsx";
import fs from "fs";

// ==================================================
// UTIL / HELPER
// ==================================================

// Normalisasi examId → integer atau null
const normalizeExamId = (rawExamId) => {
  if (rawExamId === undefined || rawExamId === null || rawExamId === "") {
    return null;
  }
  const parsed = parseInt(rawExamId, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

// Normalisasi options:
// - kalau string dan JSON valid → parse
// - kalau object/array → langsung pakai
// - selain itu → kembalikan apa adanya
const normalizeOptions = (rawOptions) => {
  if (rawOptions === undefined || rawOptions === null) return null;

  if (typeof rawOptions === "string") {
    try {
      return JSON.parse(rawOptions);
    } catch (e) {
      console.warn("⚠️ options string tapi bukan JSON valid:", rawOptions);
      return rawOptions;
    }
  }

  return rawOptions;
};

// Pastikan exam ada:
// - kalau examId valid & exam ditemukan → kembalikan exam tsb
// - kalau tidak ada → buat exam baru otomatis
const ensureExam = async ({ examId, questionText, creatorId, context }) => {
  let exam = null;

  if (examId) {
    exam = await Exam.findByPk(examId);
  }

  if (exam) return exam;

  const titleBase =
    context === "UPLOAD"
      ? "Ujian Upload Otomatis"
      : "Ujian Otomatis";

  const titleSuffix =
    context === "UPLOAD"
      ? new Date().toISOString()
      : (questionText || "").substring(0, 30) || "Tanpa Judul";

  const examTitle = `${titleBase} - ${titleSuffix}`;

  const newExam = await Exam.create({
    title: examTitle,
    description:
      context === "UPLOAD"
        ? "Dibuat otomatis saat import Excel soal"
        : "Dibuat otomatis saat penambahan soal",
    subject: "Umum",
    duration: 60,
    startTime: null,
    endTime: null,
    isActive: true,
    creatorId,
  });

  console.log(
    `🆕 Exam otomatis dibuat (context: ${context}) dengan ID:`,
    newExam.id
  );

  return newExam;
};

// ==================================================
// GET: Semua Soal
// ==================================================
export const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "name", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json(questions);
  } catch (err) {
    console.error("❌ Error getAllQuestions:", err);
    return res.status(500).json({
      message: "Gagal mengambil data soal",
      error: err.message,
    });
  }
};

// ==================================================
// GET: Soal berdasarkan ID
// ==================================================
export const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findByPk(id, {
      include: [{ model: User, attributes: ["id", "name", "role"] }],
    });

    if (!question) {
      return res.status(404).json({ message: "Soal tidak ditemukan" });
    }

    return res.json(question);
  } catch (err) {
    console.error("❌ Error getQuestionById:", err);
    return res.status(500).json({
      message: "Gagal mengambil soal",
      error: err.message,
    });
  }
};

// ==================================================
// POST: Tambah Soal Manual (AUTO BUAT EXAM)
// ==================================================
export const createQuestion = async (req, res) => {
  try {
    console.log("📦 [createQuestion] body:", req.body);
    console.log("👤 [createQuestion] user:", req.user);

    let {
      examId,
      questionText,
      options,
      correctAnswer,
      score,
      type,
      order,
      isActive,
    } = req.body;

    if (!questionText) {
      return res.status(400).json({
        message: "questionText wajib diisi",
      });
    }

    const normalizedExamId = normalizeExamId(examId);
    const normalizedOptions = normalizeOptions(options);
    const questionType = type || "MULTIPLE_CHOICE";

    // Validasi khusus pilihan ganda
    if (questionType === "MULTIPLE_CHOICE") {
      if (!normalizedOptions || !correctAnswer) {
        return res.status(400).json({
          message: "options dan correctAnswer wajib untuk pilihan ganda",
        });
      }
    }

    // Pastikan exam ada (auto create jika tidak ada)
    const exam = await ensureExam({
      examId: normalizedExamId,
      questionText,
      creatorId: req.user.id,
      context: "MANUAL",
    });

    const newQuestion = await Question.create({
      examId: exam.id,
      questionText,
      options: normalizedOptions || null,
      correctAnswer: correctAnswer || null,
      score: score ?? 1,
      type: questionType,
      order: order ?? 1,
      isActive: isActive ?? true,
      creatorId: req.user.id,
    });

    return res.status(201).json({
      message:
        "✅ Soal berhasil ditambahkan (ujian otomatis dibuat jika belum ada)",
      data: {
        exam,
        question: newQuestion,
      },
    });
  } catch (err) {
    console.error("❌ Error createQuestion:", err);
    return res.status(500).json({
      message: "Gagal menambah soal",
      error: err.message,
    });
  }
};

// ==================================================
// PUT: Update Soal
// ==================================================
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findByPk(id);

    if (!question) {
      return res.status(404).json({ message: "Soal tidak ditemukan" });
    }

    let {
      questionText,
      options,
      correctAnswer,
      score,
      type,
      order,
      isActive,
    } = req.body;

    const normalizedOptions = normalizeOptions(options);

    await question.update({
      questionText: questionText ?? question.questionText,
      options: normalizedOptions ?? question.options,
      correctAnswer: correctAnswer ?? question.correctAnswer,
      score: score ?? question.score,
      type: type ?? question.type,
      order: order ?? question.order,
      isActive: isActive ?? question.isActive,
    });

    return res.json({
      message: "✅ Soal berhasil diperbarui",
      data: question,
    });
  } catch (err) {
    console.error("❌ Error updateQuestion:", err);
    return res.status(500).json({
      message: "Gagal update soal",
      error: err.message,
    });
  }
};

// ==================================================
// DELETE: Hapus Soal
// ==================================================
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Question.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ message: "Soal tidak ditemukan" });
    }

    return res.json({ message: "✅ Soal berhasil dihapus" });
  } catch (err) {
    console.error("❌ Error deleteQuestion:", err);
    return res.status(500).json({
      message: "Gagal hapus soal",
      error: err.message,
    });
  }
};

// ==================================================
// UPLOAD EXCEL
// ==================================================

// Pastikan folder uploads ada
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Setup multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

// ==================================================
// IMPORT EXCEL → Database (AUTO BUAT EXAM DEFAULT)
// ==================================================
export const uploadQuestionsFromExcel = [
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "File tidak ditemukan" });
      }

      const workbook = xlsx.readFile(req.file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = xlsx.utils.sheet_to_json(sheet);

      if (!rows.length) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "Sheet kosong" });
      }

      let count = 0;
      let defaultExam = null;

      for (const row of rows) {
        try {
          let examId = row.examId;
    if (examId !== undefined && examId !== null) {
      examId = parseInt(examId, 10);
    }
    // 🔹 Bentuk options dari kolom optionA–E (kalau ada)
    let options = null;

    const rawOptions = {
      A: row.optionA,
      B: row.optionB,
      C: row.optionC,
      D: row.optionD,
      E: row.optionE,
    };
    const hasAnyOption = Object.values(rawOptions).some(
      (v) => v !== undefined && v !== null && String(v).trim() !== ""
    );
    if (hasAnyOption) {
      options = {};
      for (const key of ["A", "B", "C", "D", "E"]) {
        if (
          rawOptions[key] !== undefined &&
          rawOptions[key] !== null &&
          String(rawOptions[key]).trim() !== ""
        ) {
          options[key] = String(rawOptions[key]);
        }
      }
    }
    // Kalau masih mau support kolom "options" JSON lama:
    if (!options && row.options) {
      try {
        options = JSON.parse(row.options);
      } catch (e) {
        console.warn("⚠️ Kolom options bukan JSON valid:", row.options);
      }
    }
          
          await Question.create({
            examId: exam.id,
            questionText: row.questionText,
            options: normalizedOptions || null,
            correctAnswer: row.correctAnswer || null,
            score: row.score ?? 1,
            type: row.type || "MULTIPLE_CHOICE",
            order: row.order ?? 1,
            isActive: row.isActive ?? true,
            creatorId: req.user.id,
          });

          count++;
        } catch (e) {
          console.error("❌ Error saat import baris:", row, e);
        }
      }

      fs.unlinkSync(req.file.path);

      return res.json({
        message: `✅ ${count} soal berhasil diimport`,
      });
    } catch (err) {
      console.error("❌ Error uploadQuestionsFromExcel:", err);
      return res.status(500).json({
        message: "Gagal upload Excel",
        error: err.message,
      });
    }
  },
];
