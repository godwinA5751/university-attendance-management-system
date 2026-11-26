
import express from "express";
import {
  createAttendanceSessionController,
  getLecturerAttendanceSessionsController,
  updateAttendanceSessionController,
  openAttendanceSessionController,
  closeAttendanceSessionController,
  cancelAttendanceSessionController,
} from "../controllers/attendanceSessionController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.use(verifyJWT, authorize(["lecturer"]));

router.post("/", createAttendanceSessionController);
router.get("/", getLecturerAttendanceSessionsController);
router.patch("/:sessionId", updateAttendanceSessionController);
router.patch("/:sessionId/open", openAttendanceSessionController);
router.patch("/:sessionId/close", closeAttendanceSessionController);
router.patch("/:sessionId/cancel", cancelAttendanceSessionController);

export default router;
