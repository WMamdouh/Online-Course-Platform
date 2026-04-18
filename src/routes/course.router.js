import { Router } from "express";
import {
  getAllCourses,
  getMyCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  unenrollFromCourse,
  getCourseStudents,
  rateCourse,
  deleteRating,
} from "../controllers/course.controller.js";
import {
  createCourseValidator,
  updateCourseValidator,
  ratingValidator,
} from "../validations/courseValidators.js";
import validateResults from "../validations/validateResults.js";
import { idParamValidator, paginationValidator } from "../validations/paramValidators.js";
import authMW from "../middlewares/authMW.js";
import {
  authorize,
  authorizeCourseOwnerOrAdmin,
} from "../middlewares/authorizeMW.js";

const router = Router();

router.get("/", paginationValidator, validateResults, getAllCourses);

router.get(
  "/my",
  authMW,
  authorize("instructor", "admin"),
  paginationValidator,
  validateResults,
  getMyCourses
);

router.get(
  "/:id",
  idParamValidator,
  validateResults,
  (req, res, next) => {
    authMW(req, res, (err) => {
      if (err && err.status === 401) {
        req.user = null;
        return next();
      }
      next(err);
    });
  },
  getCourseById
);

router.post(
  "/",
  authMW,
  authorize("instructor", "admin"),
  createCourseValidator,
  validateResults,
  createCourse
);

router.patch(
  "/:id",
  authMW,
  authorize("instructor", "admin"),
  idParamValidator,
  validateResults,
  authorizeCourseOwnerOrAdmin,
  updateCourseValidator,
  validateResults,
  updateCourse
);

router.delete(
  "/:id",
  authMW,
  authorize("instructor", "admin"),
  idParamValidator,
  validateResults,
  authorizeCourseOwnerOrAdmin,
  deleteCourse
);

router.post(
  "/:id/enroll",
  authMW,
  authorize("student"),
  idParamValidator,
  validateResults,
  enrollInCourse
);

router.delete(
  "/:id/enroll",
  authMW,
  authorize("student"),
  idParamValidator,
  validateResults,
  unenrollFromCourse
);

router.get(
  "/:id/students",
  authMW,
  authorize("instructor", "admin"),
  idParamValidator,
  paginationValidator,
  validateResults,
  authorizeCourseOwnerOrAdmin,
  getCourseStudents
);

router.post(
  "/:id/ratings",
  authMW,
  authorize("student"),
  idParamValidator,
  ratingValidator,
  validateResults,
  rateCourse
);

router.delete(
  "/:id/ratings",
  authMW,
  authorize("student"),
  idParamValidator,
  validateResults,
  deleteRating
);

export default router;
