import type { LoginInput, ChangePasswordInput } from "../types/auth.types.js";
import { User } from "../models/User.js";
import { Student } from "../models/Student.js";
import { Lecturer } from "../models/Lecturer.js";
import jwt from "jsonwebtoken";

export const login = async (data: LoginInput) => {
  const { role, identifier, password } = data;

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  if (role === "student") {
    // student login
    const student = await Student.findOne({ matricNumber: identifier }).populate({
      path: "userId",
      select: "+password",
    });
    if (!student) {
      throw new Error("Invalid credentials");
    }

    const user = student.userId as any;

    if (!user.isActive) {
      throw new Error("Account is inactive");
    }

    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    return {
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    };
  } else if (role === "lecturer") {
    // lecturer login
    const lecturer = await Lecturer.findOne({
      staffNumber: identifier,
    }).populate({
      path: "userId",
      select: "+password",
    });
    if (!lecturer) {
      throw new Error("Invalid credentials");
    }
    
    const user = lecturer.userId as any;

    if (!user.isActive) {
      throw new Error("Account is inactive");
    }

    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    return {
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    };
  } else if (role === "admin") {
    // admin login
    const user = await User.findOne({
      email: identifier
    }).select("+password");;
    if (!user || user.role !== "admin") {
      throw new Error("Invalid credentials");
    }

    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    return {
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    };
  } else {
    throw new Error("Invalid role");
  }
}

export const changePassword = async (
  userId: string,
  data: ChangePasswordInput
) => {
  const { currentPassword, newPassword } = data;

  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    throw new Error("Current password is incorrect");
  }

  if (newPassword.length < 8) {
    throw new Error(
      "Password must be at least 8 characters"
    );
  }

  if (currentPassword === newPassword) {
    throw new Error(
      "New password must be different from current password"
    );
  }

  user.password = newPassword;
  user.mustChangePassword = false;

  await user.save();

  return {
    message: "Password changed successfully",
  };
};

export const getCurrentUser = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  };
};

export const resetPassword = async (
  userId: string
) => {
  if (!process.env.DEFAULT_PASSWORD) {
    throw new Error(
      "DEFAULT_PASSWORD is not configured"
    );
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  user.password = process.env.DEFAULT_PASSWORD;
  user.mustChangePassword = true;

  await user.save();

  return {
    message: "Password reset successfully",
  };
};

export const deactivateUser = async (
  userId: string
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  user.isActive = false;

  await user.save();

  return user;
};

export const activateUser = async (
  userId: string
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  user.isActive = true;

  await user.save();

  return user;
};