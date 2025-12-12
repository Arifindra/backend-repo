// src/models/result.model.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Exam from "./exam.model.js";
import User from "./user.model.js";

const Result = sequelize.define(
  "Result",
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

    // 🔹 SIMPAN ID SISWA YANG MENGERJAKAN
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    score: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "results",
    freezeTableName: true,
    timestamps: true,
  }
);

// =======================
// RELATION
// =======================

// 1 ujian punya banyak hasil
Exam.hasMany(Result, { foreignKey: "examId" });
Result.belongsTo(Exam, { foreignKey: "examId" });

// 1 siswa punya banyak hasil
User.hasMany(Result, { foreignKey: "studentId" });
Result.belongsTo(User, { foreignKey: "studentId" });

export default Result;
