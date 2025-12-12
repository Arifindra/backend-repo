// src/controllers/examSession.controller.js
import db from "../models/index.js";

const ExamSession = db.ExamSession;
const Exam = db.Exam;
const Question = db.Question;
const Result = db.Result;

/**
 * POST /api/exam-session/start
 * Siswa klik "Mulai Ujian"
 * - Cek ujian ada
 * - Cek apakah siswa sudah punya Result (sudah pernah ikut ujian ini) → blok
 * - Kalau ada sesi lama & belum selesai → lanjutkan
 * - Kalau belum ada sesi → buat baru
 */
export const startExamSession = async (req, res) => {
  try {
    const { examId } = req.body;
    const userId = req.user.id;

    if (!examId) {
      return res.status(400).json({ message: "examId wajib diisi" });
    }

    const exam = await Exam.findByPk(examId, {
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

    // 🔥 Cek apakah siswa sudah punya hasil ujian ini
    const existingResult = await Result.findOne({
      where: {
        examId: examId,
        studentId: userId,
      },
    });

    if (existingResult) {
      return res.status(400).json({
        message:
          "Anda sudah mengerjakan dan mengumpulkan ujian ini. Ujian hanya dapat dikerjakan 1 kali.",
      });
    }

    // 🔹 Cek sesi lama yang belum selesai
    let session = await ExamSession.findOne({
      where: { examId, userId },
    });

    if (session && !session.endedAt) {
      return res.json({
        message: "Sesi ujian dilanjutkan",
        data: {
          sessionId: session.id,
          exam,
        },
      });
    }

    // 🔹 Buat sesi baru
    session = await ExamSession.create({
      examId,
      userId,
      startedAt: new Date(),
      endedAt: null,
      answers: null,
      finalScore: null,
    });

    return res.json({
      message: "Sesi ujian dimulai",
      data: {
        sessionId: session.id,
        exam,
      },
    });
  } catch (err) {
    console.error("❌ Error startExamSession:", err);
    return res.status(500).json({
      message: "Gagal memulai sesi ujian",
      error: err.message,
    });
  }
};

/**
 * POST /api/exam-session/submit
 * Siswa klik "Kumpulkan Ujian"
 * - Cek sesi valid & milik siswa
 * - Cek apakah sudah punya Result → blok
 * - Hitung nilai PG
 * - Simpan answers + finalScore ke ExamSession
 * - Simpan juga ke tabel Result
 */
export const submitExamSession = async (req, res) => {
  try {
    const { sessionId, answers } = req.body;
    const userId = req.user.id;

    if (!sessionId || !Array.isArray(answers)) {
      return res
        .status(400)
        .json({ message: "sessionId dan answers wajib diisi" });
    }

    const session = await ExamSession.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Sesi ujian tidak ditemukan" });
    }

    if (session.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Anda tidak berhak menyelesaikan sesi ini" });
    }

    const exam = await Exam.findByPk(session.examId, {
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
        },
      ],
    });

    if (!exam) {
      return res.status(404).json({ message: "Ujian tidak ditemukan" });
    }

    // 🔥 Cek double submit
    const existingResult = await Result.findOne({
      where: {
        examId: exam.id,
        studentId: userId,
      },
    });

    if (existingResult) {
      return res.status(400).json({
        message:
          "Anda sudah mengumpulkan ujian ini sebelumnya. Ujian hanya bisa dikumpulkan 1 kali.",
      });
    }

    // Map soal
    const questionMap = new Map();
    (exam.Questions || []).forEach((q) => {
      questionMap.set(q.id, q);
    });

    // Hitung nilai PG
    let totalScore = 0;

    for (const ans of answers) {
      const q = questionMap.get(ans.questionId);
      if (!q) continue;

      if (
        q.type === "MULTIPLE_CHOICE" &&
        ans.chosenOption &&
        q.correctAnswer &&
        ans.chosenOption === q.correctAnswer
      ) {
        const s = typeof q.score === "number" ? q.score : 1;
        totalScore += s;
      }
      // Essay tidak dihitung otomatis di sini
    }

    // 🔹 Simpan jawaban & nilai ke sesi
    session.answers = answers;      // ✅ jawaban PG + essay
    session.finalScore = totalScore;
    session.endedAt = new Date();
    await session.save();

    // 🔹 Simpan hasil ke Result
    const result = await Result.create({
      examId: exam.id,
      studentId: userId,
      score: totalScore,
    });

    return res.json({
      message: "Ujian berhasil dikumpulkan",
      data: {
        finalScore: result.score,
      },
    });
  } catch (err) {
    console.error("❌ Error submitExamSession:", err);
    return res.status(500).json({
      message: "Gagal mengumpulkan ujian",
      error: err.message,
    });
  }
};

/**
 * GET /api/exam-session/by-exam/:examId
 * Guru melihat daftar sesi ujian (per ujian)
 * - include User (siswa) + basic info sesi + answers
 */
export const getExamSessionsByExam = async (req, res) => {
  try {
    const { examId } = req.params;

    const sessions = await ExamSession.findAll({
      where: { examId },
      include: [
        {
          model: db.User,
          attributes: ["id", "name", "email", "className"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json(sessions);
  } catch (err) {
    console.error("❌ Error getExamSessionsByExam:", err);
    return res.status(500).json({
      message: "Gagal mengambil data sesi ujian",
      error: err.message,
    });
  }
};
