import express from "express";

import {
  assignLecturersController,
  replaceLecturersController,
  removeLecturerController,
  getAssignedLecturersForCourseController,
} from "../controllers/courseAssignmentController.js";

import { verifyJWT } from "../middleware/verifyJWT.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.get(
  "/:courseId/lecturers",
  verifyJWT,
  authorize(["admin"]),
  getAssignedLecturersForCourseController
);

router.post(
  "/",
  verifyJWT,
  authorize(["admin"]),
  assignLecturersController
);

router.patch(
  "/:courseId",
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