import express from "express";
import { createCourseEnrollmentController, getCourseEnrollmentsController } from "../controllers/courseEnrollmentController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.post("/", verifyJWT, authorize(["admin"]), createCourseEnrollmentController);

router.get(
  "/course/:courseId",
  verifyJWT,
  authorize(["admin", "lecturer"]),
  getCourseEnrollmentsController
);

export default router;