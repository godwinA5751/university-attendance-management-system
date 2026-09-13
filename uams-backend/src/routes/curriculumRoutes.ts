import { Router } from "express";

import {
  createCurriculumController,
  getAllCurriculaController,
  getCurriculumController,
  updateCurriculumController,
  deleteCurriculumController,
} from "../controllers/curriculumController.js";

import { verifyJWT } from "../middleware/verifyJWT.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.post(
  "/",
  verifyJWT,
  authorize(["admin"]),
  createCurriculumController
);

router.get(
  "/",
  verifyJWT,
  authorize(["admin"]),
  getAllCurriculaController
);

router.get(
  "/:id",
  verifyJWT,
  authorize(["admin"]),
  getCurriculumController
);

router.put(
  "/:id",
  verifyJWT,
  authorize(["admin"]),
  updateCurriculumController
);

router.delete(
  "/:id",
  verifyJWT,
  authorize(["admin"]),
  deleteCurriculumController
);

export default router;