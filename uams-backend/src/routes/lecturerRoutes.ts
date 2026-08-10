import express from "express";
import {
  createLecturerController,
  deleteLecturerController,
  getAllLecturersController,
  getLecturerController,
  getLecturerCoursesController,
  lecturerProfileController,
  updateLecturerController,
} from "../controllers/lecturerController.js";
import { lecturerAttendanceReportController } from "../controllers/lecturerAttendanceController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.get(
  "/",
  verifyJWT,
  authorize(["admin"]),
  getAllLecturersController
);

router.get(
  "/:id",
  verifyJWT,
  authorize(["admin"]),
  getLecturerController
);

router.post(
  "/",
  verifyJWT,
  authorize(["admin"]),
  createLecturerController
);

router.patch(
  "/:id",
  verifyJWT,
  authorize(["admin"]),
  updateLecturerController
);

router.delete(
  "/:id",
  verifyJWT,
  authorize(["admin"]),
  deleteLecturerController
);

router.get(
  "/courses",
  verifyJWT,
  authorize(["lecturer"]),
  getLecturerCoursesController
);

router.get(
  "/attendance-report",
  verifyJWT,
  authorize(["lecturer"]),
  lecturerAttendanceReportController
);

router.get(
  "/profile",
  verifyJWT,
  authorize(["lecturer"]),
  lecturerProfileController
);

export default router;