import express from "express";

import {
  assignLecturersController,
  replaceLecturersController,
  removeLecturerController,
} from "../controllers/courseAssignmentController.js";

import { verifyJWT } from "../middleware/verifyJWT.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.post(
  "/",
  verifyJWT,
  authorize(["admin"]),
  assignLecturersController
);

router.patch(
  "/",
  verifyJWT,
  authorize(["admin"]),
  replaceLecturersController
);

router.delete(
  "/:courseId/:lecturerId",
  verifyJWT,
  authorize(["admin"]),
  removeLecturerController
);

export default router;