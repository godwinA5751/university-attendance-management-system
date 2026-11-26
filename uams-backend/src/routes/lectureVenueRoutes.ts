import express from "express";
import {
  createLectureVenueController,
  getLecturerVenuesController,
  updateLectureVenueController,
  deleteLectureVenueController,
} from "../controllers/lectureVenueController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.use(verifyJWT, authorize(["lecturer"]));

router.post("/", createLectureVenueController);
router.get("/", getLecturerVenuesController);
router.patch("/:venueId", updateLectureVenueController);
router.delete("/:venueId", deleteLectureVenueController);

export default router;