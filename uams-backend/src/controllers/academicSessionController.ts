import type { Request, Response, NextFunction } from "express";
import { createAcademicSession, activateAcademicSession, getAcademicSessions, deleteAcademicSession } from "../services/academicSessionService.js";

export const getAcademicSessionsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessions = await getAcademicSessions();

    res.status(200).json({
      message: "Academic sessions fetched successfully",
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

export const createAcademicSessionController = async (
  req: Request,
  res: Response
) => {
  try {
    const session = await createAcademicSession(req.body);

    return res.status(201).json({
      message: "Academic session created successfully",
      data: session,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Session already exists") {
        return res.status(409).json({
          message: error.message,
        });
      }

      if (error.message === "startDate must be before endDate") {
        return res.status(400).json({
          message: error.message,
        });
      }

      return res.status(500).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteAcademicSessionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await deleteAcademicSession(req.params.id as string);

    res.status(200).json({
      message: "Academic session deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const activateAcademicSessionController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    
    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        message: "Invalid session id",
      });
    }
    
    const session = await activateAcademicSession(id);

    return res.status(200).json({
      message: "Academic session activated successfully",
      data: session,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Session not found") {
        return res.status(404).json({
          message: error.message,
        });
      }

      return res.status(500).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};