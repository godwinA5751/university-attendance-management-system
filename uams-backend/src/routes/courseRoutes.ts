import express from "express";
import {
  createCourseController,
  getCourseController,
  getAllCoursesController,
  updateCourseController,
  deleteCourseController,
} from "../controllers/courseController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.get(
  "/",
  verifyJWT,
  authorize(["admin"]),
  getAllCoursesController
);


router.get(
  "/:id",
  verifyJWT,
  authorize(["admin", "lecturer"]),
  getCourseController
);

router.post(
  "/",
  verifyJWT,
  authorize(["admin"]),
  createCourseController
);

router.patch(
  "/:id",
  verifyJWT,
  authorize(["admin"]),
  updateCourseController
);

router.delete(
  "/:id",
  verifyJWT,
  authorize(["admin"]),
  deleteCourseController
);

export default router;