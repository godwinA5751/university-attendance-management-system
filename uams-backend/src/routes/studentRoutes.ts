import express from "express";
import { createStudentController, studentProfileController } from "../controllers/studentController.js";
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

router.post(
  "/",
  verifyJWT,
  authorize(["admin"]),
  createStudentController
);

router.patch(
  "/:id/promote",
  verifyJWT,
  authorize(["admin"]),
  promoteStudentController
);

export default router;