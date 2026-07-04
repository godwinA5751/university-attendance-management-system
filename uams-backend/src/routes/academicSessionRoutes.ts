import express from "express";
import { activateAcademicSessionController, createAcademicSessionController, getAcademicSessionsController, deleteAcademicSessionController } from "../controllers/academicSessionController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.get(
  "/",
  verifyJWT,
  authorize(["admin"]),
  getAcademicSessionsController
);
router.post("/", verifyJWT, authorize(["admin"]), createAcademicSessionController);
router.patch("/:id/activate", verifyJWT, authorize(["admin"]), activateAcademicSessionController);
router.delete(
  "/:id",
  verifyJWT,
  authorize(["admin"]),
  deleteAcademicSessionController
);

export default router;