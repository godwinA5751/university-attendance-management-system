import express from "express";
import {
  createCourseController, assignLecturersController, replaceLecturersController, removeLecturerController, getCourseController, getAllCoursesController
} from "../controllers/courseController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.get("/",
  verifyJWT,
  authorize(["admin"]), getAllCoursesController);
router.get("/:id",
  verifyJWT,
  authorize(["admin", "lecturer"]), getCourseController);
router.post("/", verifyJWT, authorize(["admin"]), createCourseController);
router.put("/:id/lecturers", verifyJWT, authorize(["admin"]), replaceLecturersController);
router.patch("/:id/lecturers", verifyJWT, authorize(["admin"]), assignLecturersController);
router.delete("/:id/lecturers/:lecturerId", verifyJWT, authorize(["admin"]), removeLecturerController);
export default router;