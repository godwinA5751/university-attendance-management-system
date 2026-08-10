import express from "express";
import {
  createStudentController,
  studentProfileController,
  getStudentsController,
  getStudentController,
  updateStudentController,
  deleteStudentController,
} from "../controllers/studentController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
import { authorize } from "../middleware/authorize.js";
import { promoteStudentController } from "../controllers/promoteStudentController.js";


const router = express.Router();

router.get(
  "/me",
  verifyJWT,
  authorize(["student"]),
  studentProfileController
);

router.get(
  "/",
  verifyJWT,
  authorize(["admin"]),
  getStudentsController
);

router.get(
  "/:id",
  verifyJWT,
  authorize(["admin"]),
  getStudentController
);

router.post(
  "/",
  verifyJWT,
  authorize(["admin"]),
  createStudentController
);

router.patch(
  "/:id",
  verifyJWT,
  authorize(["admin"]),
  updateStudentController
);

router.delete(
  "/:id",
  verifyJWT,
  authorize(["admin"]),
  deleteStudentController
);

router.patch(
  "/:id/promote",
  verifyJWT,
  authorize(["admin"]),
  promoteStudentController
);

export default router;