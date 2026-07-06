import express from "express";
import { createLecturerController, getAllLecturersController, getLecturerCoursesController, lecturerProfileController } from "../controllers/lecturerController.js";
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
router.post(
  "/",
  verifyJWT,
  authorize(["admin"]),
  createLecturerController
);
router.get(
  "/profile",
  verifyJWT,
  authorize(["lecturer"]),
  lecturerProfileController
);

export default router;