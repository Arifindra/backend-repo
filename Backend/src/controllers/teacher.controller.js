import Exam from "../models/exam.model.js";
import Question from "../models/question.model.js";
import ExamSession from "../models/examSession.model.js";

export const getTeacherStats = async (req, res) => {
  try {
    const teacherId = req.user.id; // dari token login
    const totalExams = await Exam.count({ where: { createdBy: teacherId } });
    const totalQuestions = await Question.count({ where: { createdBy: teacherId } });

    const examSessions = await ExamSession.findAll({
      include: [{ model: Exam, where: { createdBy: teacherId } }],
    });

    const totalParticipants = examSessions.length;
    const avgScore =
      examSessions.reduce((sum, s) => sum + (s.score || 0), 0) /
      (examSessions.length || 1);

    res.json({
      totalExams,
      totalQuestions,
      totalParticipants,
      avgScore: avgScore ? parseFloat(avgScore).toFixed(1) : 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil statistik guru" });
  }
};
