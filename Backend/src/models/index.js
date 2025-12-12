// src/models/index.js
import sequelize from "../config/db.js";

import User from "./user.model.js";
import Exam from "./exam.model.js";
import Question from "./question.model.js";
import ExamSession from "./examSession.model.js";
import Result from "./result.model.js";

// Di tiap model kita sudah atur relasi masing-masing (Question, Result, ExamSession, dll)

const db = {
  sequelize,
  User,
  Exam,
  Question,
  ExamSession,
  Result,
};

export default db;
