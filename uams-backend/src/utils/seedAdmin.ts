import { User } from "../models/User.js";

export const seedAdmin = async (): Promise<void> => {
  if (!process.env.ADMIN_EMAIL) {
    throw new Error("ADMIN_EMAIL is not configured");
  }
  
  if (!process.env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_PASSWORD is not configured");
  }

  const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });

  if (existingAdmin) {
    console.log(`Admin already exists: ${process.env.ADMIN_EMAIL}`);
    return;
  }

  const user = new User({
    firstName: "System",
    lastName: "Admin",
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    role: "admin",
    mustChangePassword: true,
  });

  await user.save();

  console.log(
    `Default admin created: ${process.env.ADMIN_EMAIL}`
  );
}