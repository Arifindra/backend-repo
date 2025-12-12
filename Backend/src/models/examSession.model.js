// src/models/examSession.model.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Exam from "./exam.model.js";
import User from "./user.model.js";

const ExamSession = sequelize.define(
  "ExamSession",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    examId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "exams",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    // 🔹 siswa yang mengerjakan
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    endedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // 🔹 semua jawaban siswa (PG + essay) dalam bentuk array JSON
    // format: [{ questionId, chosenOption?, essayAnswer? }, ...]
    answers: {
      type: DataTypes.JSONB,
      allowNull: true,
    },

    // 🔹 nilai otomatis (PG) / nilai akhir
    finalScore: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
  },
  {
    tableName: "examSessions",
    freezeTableName: true,
    timestamps: true,
  }
);

// RELASI
Exam.hasMany(ExamSession, { foreignKey: "examId" });
ExamSession.belongsTo(Exam, { foreignKey: "examId" });

User.hasMany(ExamSession, { foreignKey: "userId" });
ExamSession.belongsTo(User, { foreignKey: "userId" });

export default ExamSession;
