// src/middleware/role.middleware.js
export const isTeacher = (req, res, next) => {
  if (req.user.role !== "teacher") {
    return res.status(403).json({ message: "Akses ditolak. Hanya untuk guru." });
  }
  next();
};

export const isStudent = (req, res, next) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ message: "Akses ditolak. Hanya untuk siswa." });
  }
  next();
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Akses ditolak. Hanya untuk admin." });
  }
  next();
};
