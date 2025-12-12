import User from "../models/user.model.js";
import Exam from "../models/exam.model.js";
import ExamSession from "../models/examSession.model.js"; // jika sudah ada model ini

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalExams = await Exam.count();
    const activeExams = await Exam.count({ where: { status: "ACTIVE" } });
    const avgScore = await ExamSession.findAll({
      attributes: [[
        sequelize.fn("AVG", sequelize.col("score")), "averageScore"
      ]],
      raw: true,
    });

    res.json({
      totalUsers,
      totalExams,
      activeExams,
      avgScore: avgScore[0].averageScore ? parseFloat(avgScore[0].averageScore).toFixed(1) : 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil statistik admin" });
  }
};
