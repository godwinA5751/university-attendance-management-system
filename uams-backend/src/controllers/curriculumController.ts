import type { Request, Response } from "express";

import {
  createCurriculum,
  getAllCurricula,
  getCurriculumById,
  updateCurriculum,
  deleteCurriculum,
} from "../services/curriculumService.js";

export const createCurriculumController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const curriculum =
        await createCurriculum(
          req.body
        );

      return res.status(201).json({
        message:
          "Curriculum created successfully",
        data: curriculum,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          message: error.message,
        });
      }

      return res.status(500).json({
        message:
          "Internal server error",
      });
    }
  };

export const getAllCurriculaController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const curricula =
        await getAllCurricula();

      return res.status(200).json({
        message:
          "Curricula fetched successfully",
        data: curricula,
      });
    } catch (error) {
      return res.status(500).json({
        message:
          "Failed to fetch curricula",
      });
    }
  };

export const getCurriculumController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const curriculum =
        await getCurriculumById(
          req.params.id as string
        );

      return res.status(200).json({
        message:
          "Curriculum fetched successfully",
        data: curriculum,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(404).json({
          message: error.message,
        });
      }

      return res.status(500).json({
        message:
          "Internal server error",
      });
    }
  };

export const updateCurriculumController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const curriculum =
        await updateCurriculum(
          req.params.id as string,
          req.body
        );

      return res.status(200).json({
        message:
          "Curriculum updated successfully",
        data: curriculum,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          message: error.message,
        });
      }

      return res.status(500).json({
        message:
          "Internal server error",
      });
    }
  };

export const deleteCurriculumController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      await deleteCurriculum(
        req.params.id as string
      );

      return res.status(200).json({
        message:
          "Curriculum deleted successfully",
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(404).json({
          message: error.message,
        });
      }

      return res.status(500).json({
        message:
          "Internal server error",
      });
    }
  };