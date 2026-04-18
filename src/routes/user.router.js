import { Router } from "express";
import {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getUserEnrollments,
} from "../controllers/user.controller.js";
import { createUserValidator, updateUserValidator } from "../validations/userValidators.js";
import validateResults from "../validations/validateResults.js";
import { idParamValidator, paginationValidator } from "../validations/paramValidators.js";
import authMW from "../middlewares/authMW.js";
import { authorize } from "../middlewares/authorizeMW.js";

const router = Router();

router.use(authMW);

router.get(
  "/",
  authorize("admin"),
  paginationValidator,
  validateResults,
  getAllUsers
);

router.post(
  "/",
  authorize("admin"),
  createUserValidator,
  validateResults,
  createUser
);

router.delete(
  "/:id",
  authorize("admin"),
  idParamValidator,
  validateResults,
  deleteUser
);


router.get(
  "/:id",
  idParamValidator,
  validateResults,
  getUserById
);

router.patch(
  "/:id",
  idParamValidator,
  validateResults,
  updateUserValidator,
  validateResults,
  updateUser
);

router.get(
  "/:id/enrollments",
  idParamValidator,
  paginationValidator,
  validateResults,
  getUserEnrollments
);

export default router;
