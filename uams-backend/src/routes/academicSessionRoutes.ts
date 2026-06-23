import express from "express";
import { activateAcademicSessionController, createAcademicSessionController } from "../controllers/academicSessionController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.post("/", verifyJWT, authorize(["admin"]), createAcademicSessionController);
router.patch("/:id/activate", verifyJWT, authorize(["admin"]), activateAcademicSessionController);

export default router;