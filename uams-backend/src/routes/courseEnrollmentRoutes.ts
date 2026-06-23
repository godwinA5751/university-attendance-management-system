import express from "express";
import { createCourseEnrollmentController } from "../controllers/courseEnrollmentController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.post("/", verifyJWT, authorize(["admin"]), createCourseEnrollmentController);

export default router;