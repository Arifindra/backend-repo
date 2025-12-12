import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Exam from "./exam.model.js";
import User from "./user.model.js";

const Question = sequelize.define(
  "Question",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // =======================
    // RELASI
    // =======================
    examId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Exam,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "SET NULL",
    },

    // =======================
    // KONTEN SOAL
    // =======================
    questionText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    // JSON: { A: "text", B: "text", ... }
    options: {
      type: DataTypes.JSONB,
      allowNull: true, // jika soal essay, boleh kosong
    },

    // Contoh: "A" / "B" / "C" / "D"
    correctAnswer: {
      type: DataTypes.STRING,
      allowNull: true, // essay tidak punya kunci jawaban
    },

    // =======================
    // PENGATURAN SOAL
    // =======================
    type: {
      type: DataTypes.ENUM("MULTIPLE_CHOICE", "ESSAY"),
      defaultValue: "MULTIPLE_CHOICE",
    },

    score: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },

    order: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "questions",
    freezeTableName: true,
    timestamps: true,
  }
);

// RELATION
Exam.hasMany(Question, { foreignKey: "examId" });
Question.belongsTo(Exam, { foreignKey: "examId" });

User.hasMany(Question, { foreignKey: "creatorId" });
Question.belongsTo(User, { foreignKey: "creatorId" });

export default Question;
