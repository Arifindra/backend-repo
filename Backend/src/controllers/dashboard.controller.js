// src/controllers/dashboard.controller.js
import db from "../models/index.js";

const User = db.User;
const Exam = db.Exam;
const Question = db.Question;
const Result = db.Result;
const ExamSession = db.ExamSession;

// ==============================
// ADMIN DASHBOARD
// ==============================
export const getAdminDashboard = async (req, res) => {
  try {
    const [totalUsers, totalTeachers, totalStudents, totalExams, totalQuestions, totalResults] =
      await Promise.all([
        User.count(),
        User.count({ where: { role: "GURU" } }),
        User.count({ where: { role: "SISWA" } }),
        Exam.count(),
        Question.count(),
        Result.count(),
      ]);

    const recentExams = await Exam.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      attributes: ["id", "title", "subject", "createdAt", "isActive"],
    });

    const recentResults = await Result.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: [
        { model: User, attributes: ["id", "name"] },
        { model: Exam, attributes: ["id", "title", "subject"] },
      ],
    });

    return res.json({
      stats: {
        totalUsers,
        totalTeachers,
        totalStudents,
        totalExams,
        totalQuestions,
        totalResults,
      },
      recentExams,
      recentResults,
    });
  } catch (err) {
    console.error("❌ getAdminDashboard error:", err);
    return res.status(500).json({
      message: "Gagal mengambil data dashboard admin",
      error: err.message,
    });
  }
};

// ==============================
// TEACHER DASHBOARD
// ==============================
export const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const [myExamsCount, myQuestionsCount] = await Promise.all([
      Exam.count({ where: { creatorId: teacherId } }),
      Question.count({ where: { creatorId: teacherId } }),
    ]);

    const myExams = await Exam.findAll({
      where: { creatorId: teacherId },
      attributes: ["id", "title"],
    });

    const myExamIds = myExams.map((e) => e.id);

    let participantsCount = 0;
    let myResults = [];

    if (myExamIds.length > 0) {
      myResults = await Result.findAll({
        where: { examId: myExamIds },
        include: [
          { model: User, attributes: ["id", "name"] },
          { model: Exam, attributes: ["id", "title", "subject"] },
        ],
        order: [["createdAt", "DESC"]],
      });

      const studentSet = new Set(myResults.map((r) => r.studentId));
      participantsCount = studentSet.size;
    }

    const recentMyResults = myResults.slice(0, 5);

    return res.json({
      stats: {
        myExamsCount,
        myQuestionsCount,
        participantsCount,
        myResultsCount: myResults.length,
      },
      recentResults: recentMyResults,
    });
  } catch (err) {
    console.error("❌ getTeacherDashboard error:", err);
    return res.status(500).json({
      message: "Gagal mengambil data dashboard guru",
      error: err.message,
    });
  }
};

// ==============================
// STUDENT DASHBOARD
// ==============================
export const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    const [availableExamsCount, myResults] = await Promise.all([
      Exam.count({ where: { isActive: true } }),
      Result.findAll({
        where: { studentId },
        include: [{ model: Exam, attributes: ["id", "title", "subject"] }],
        order: [["createdAt", "DESC"]],
      }),
    ]);

    const myExamsTaken = myResults.length;
    const avgScore =
      myResults.length > 0
        ? myResults.reduce((sum, r) => sum + (Number(r.score) || 0), 0) /
          myResults.length
        : 0;

    const recentMyResults = myResults.slice(0, 5);

    return res.json({
      stats: {
        availableExamsCount,
        myExamsTaken,
        myAverageScore: avgScore,
      },
      recentResults: recentMyResults,
    });
  } catch (err) {
    console.error("❌ getStudentDashboard error:", err);
    return res.status(500).json({
      message: "Gagal mengambil data dashboard siswa",
      error: err.message,
    });
  }
};
