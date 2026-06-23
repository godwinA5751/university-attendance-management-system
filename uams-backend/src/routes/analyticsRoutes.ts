import express from "express";
import { studentAnalyticsController, courseAnalyticsController, dashboardController, lecturerDashboardController } from "../controllers/attendanceAnalyticsController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.get(
  "/student/me",
  verifyJWT,
  authorize(["student"]),
  studentAnalyticsController
);

router.get(
  "/student/:id",
  verifyJWT,
  authorize(["admin"]),
  studentAnalyticsController
);

router.get(
  "/course/:id",
  verifyJWT,
  authorize(["admin", "lecturer"]),
  courseAnalyticsController
);

router.get(
  "/dashboard",
  verifyJWT,
  authorize(["admin"]),
  dashboardController
);

router.get(
  "/lecturer/dashboard",
  verifyJWT,
  authorize(["lecturer"]),
  lecturerDashboardController
);

export default router;