// src/models/user.model.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // ADMIN / GURU / SISWA
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "SISWA",
    },

    // 🔹 kelas siswa, contoh: "12 IPA 1"
    // boleh null untuk admin & guru
    className: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    freezeTableName: true,
    timestamps: true,
  }
);

export default User;
