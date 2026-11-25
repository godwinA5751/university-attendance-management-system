
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const verifyJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error("JWT_SECRET is not configured");

    return res.status(500).json({
      message: "Authentication service unavailable",
    });
  }

  let decoded: jwt.JwtPayload;

  try {
    const payload = jwt.verify(token, secret);

    if (
      typeof payload === "string" ||
      typeof payload.id !== "string" ||
      typeof payload.role !== "string"
    ) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    decoded = payload;
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }

  try {
    const user = await User.findById(decoded.id).select(
      "_id role isActive"
    );

    if (!user) {
      return res.status(401).json({
        message: "Account no longer exists",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is inactive",
      });
    }

    if (user.role !== decoded.role) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
    };

    return next();
  } catch (error) {
    console.error("Authentication middleware error:", error);

    return res.status(500).json({
      message: "Authentication could not be completed",
    });
  }
};
