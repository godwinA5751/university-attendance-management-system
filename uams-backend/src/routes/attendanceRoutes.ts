
import express from "express";
import { createAttendanceController } from "../controllers/attendanceController.js";
import { getStudentAttendanceController } from "../controllers/studentController.js";
import { getCourseAttendanceController } from "../controllers/courseController.js";
import { getEnrollmentAttendanceController } from "../controllers/courseEnrollmentController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

// Admin attendance reports
router.get(
  "/student/:id",
  verifyJWT,
  authorize(["admin"]),
  getStudentAttendanceController
);

router.get(
  "/course/:id",
  verifyJWT,
  authorize(["admin"]),
  getCourseAttendanceController
);

router.get(
  "/enrollment/:id",
  verifyJWT,
  authorize(["admin"]),
  getEnrollmentAttendanceController
);

// Lecturer records manual attendance
router.post(
  "/",
  verifyJWT,
  authorize(["lecturer"]),
  createAttendanceController
);

export default router;
