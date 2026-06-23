import type { Request, Response } from "express";
import { login } from "../services/authService.js";
import { getCurrentUser, changePassword, resetPassword, deactivateUser, activateUser } from "../services/authService.js";

export const loginController = async (req: Request, res: Response) => {
  try {
    const result = await login(req.body);

    return res.status(200).json({
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Invalid credentials"
    ) {
      return res.status(401).json({
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message === "Account is inactive"
    ) {
      return res.status(403).json({
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message === "Invalid role"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const changePasswordController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await changePassword(
      req.user!.id,
      req.body
    );

    return res.status(200).json({
      message: result.message,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Current password is incorrect"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message === "Password must be at least 8 characters"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message === "New password must be different from current password"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message === "User not found"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const meController = async (
  req: Request,
  res: Response
) => {
  try {
    const user = await getCurrentUser(req.user!.id);

    return res.status(200).json({
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "User not found"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const resetPasswordController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await resetPassword(
      req.params.id as string
    );

    return res.status(200).json({
      message: result.message,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "User not found"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deactivateUserController = async (
  req: Request,
  res: Response
) => {
  try {
    await deactivateUser(req.params.id as string);

    return res.status(200).json({
      message: "User deactivated successfully",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "User not found"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const activateUserController = async (
  req: Request,
  res: Response
) => {
  try {
    await activateUser(req.params.id as string);

    return res.status(200).json({
      message: "User activated successfully",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "User not found"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};