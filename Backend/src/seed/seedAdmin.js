import dotenv from "dotenv";
dotenv.config();
import sequelize from "../config/db.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";

const run = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    const email = process.env.SEED_ADMIN_EMAIL || "admin@eujian.com";
    const exists = await User.findOne({ where: { email } });
    if (exists) {
      console.log("Admin already exists:", email);
      process.exit(0);
    }
    const hashed = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || "admin123", parseInt(process.env.BCRYPT_SALT_ROUNDS || "10"));
    await User.create({ name: "Admin", email, password: hashed, role: "ADMIN" });
    console.log("Admin seeded:", email);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
