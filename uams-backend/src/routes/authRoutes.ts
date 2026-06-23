import express from "express";
import { loginController, meController, changePasswordController, resetPasswordController, deactivateUserController, activateUserController } from "../controllers/authController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
import { authorize } from "../middleware/authorize.js";


const router = express.Router();

router.post("/login", loginController);
router.get("/me", verifyJWT, meController);
router.patch(
  "/change-password",
  verifyJWT,
  changePasswordController
);
router.patch(
  "/reset-password/:id",
  verifyJWT,
  authorize(["admin"]),
  resetPasswordController
);

router.patch(
  "/deactivate/:id",
  verifyJWT,
  authorize(["admin"]),
  deactivateUserController
);

router.patch(
  "/activate/:id",
  verifyJWT,
  authorize(["admin"]),
  activateUserController
);

export default router;