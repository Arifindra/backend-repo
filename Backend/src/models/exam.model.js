  import { DataTypes } from "sequelize";
  import sequelize from "../config/db.js";
  import User from "./user.model.js";

  const Exam = sequelize.define(
    "Exam",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 60,
      },
      startTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      endTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      creatorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      targetClass: {
        type: DataTypes.STRING,
        allowNull: true, // kalau null => ujian bisa untuk semua kelas
      },
    },
    {
      tableName: "exams",
      freezeTableName: true,
      timestamps: true,
    }
  );


  User.hasMany(Exam, { foreignKey: "creatorId" });
Exam.belongsTo(User, { foreignKey: "creatorId" });



  export default Exam;
