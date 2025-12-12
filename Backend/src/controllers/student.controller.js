import ExamSession from "../models/examSession.model.js";
import Exam from "../models/exam.model.js";

export const getStudentStats = async (req, res) => {
  try {
    const studentId = req.user.id;

    const sessions = await ExamSession.findAll({
      where: { studentId },
      include: [Exam],
    });

    const totalExams = sessions.length;
    const completedExams = sessions.filter(s => s.status === "FINISHED").length;
    const avgScore =
      sessions.reduce((sum, s) => sum + (s.score || 0), 0) /
      (sessions.length || 1);

    res.json({
      totalExams,
      completedExams,
      avgScore: avgScore ? parseFloat(avgScore).toFixed(1) : 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil statistik siswa" });
  }
};
