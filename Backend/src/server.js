// src/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import sequelize from "./config/db.js";

// ROUTES
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import examRoutes from "./routes/exam.routes.js";
import questionRoutes from "./routes/question.routes.js";
import resultRoutes from "./routes/result.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import studentRoutes from "./routes/student.routes.js";
import examSessionRoutes from "./routes/examSession.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// =============================
// REGISTER ROUTES (PREFIX /api)
// =============================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/exam-session", examSessionRoutes);
app.use("/api/dashboard", dashboardRoutes);

// TEST
app.get("/", (req, res) => {
  res.json({ message: "Smart E-Ujian Backend running!" });
});

// =============================
// RUN SERVER + SYNC DB
// =============================
const startServer = async () => {
  try {
    console.log("Connecting to PostgreSQL...");
    await sequelize.authenticate();
    console.log("✅ Database connected!");

    await sequelize.sync({ alter: true });
    console.log("✅ Database synced!");

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server error:", error.message);
  }
};

startServer();
