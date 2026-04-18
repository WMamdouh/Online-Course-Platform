import { Router } from "express";
import {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  markLessonComplete,
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controllers/lesson.controller.js";
import {
  createLessonValidator,
  updateLessonValidator,
  commentValidator,
} from "../validations/lessonValidators.js";
import validateResults from "../validations/validateResults.js";
import {
  courseIdParamValidator,
  lessonIdParamValidator,
  commentIdParamValidator,
  paginationValidator,
} from "../validations/paramValidators.js";
import authMW from "../middlewares/authMW.js";
import {
  authorize,
  authorizeLessonOwnerOrAdmin,
  authorizeCommentOwnerOrAdmin,
  authorizeEnrolledStudentOrInstructorOrAdmin,
} from "../middlewares/authorizeMW.js";


const router = Router({ mergeParams: true });


router.get(
  "/",
  authMW,
  authorizeEnrolledStudentOrInstructorOrAdmin,
  courseIdParamValidator,
  paginationValidator,
  validateResults,
  getLessons
);

router.get(
  "/:lessonId",
  authMW,
  authorizeEnrolledStudentOrInstructorOrAdmin,
  courseIdParamValidator,
  lessonIdParamValidator,
  validateResults,
  getLessonById
);

router.post(
  "/",
  authMW,
  authorize("instructor", "admin"),
  courseIdParamValidator,
  validateResults,
  createLessonValidator,
  validateResults,
  createLesson
);

router.patch(
  "/:lessonId",
  authMW,
  authorize("instructor", "admin"),
  courseIdParamValidator,
  lessonIdParamValidator,
  validateResults,
  authorizeLessonOwnerOrAdmin,
  updateLessonValidator,
  validateResults,
  updateLesson
);

router.delete(
  "/:lessonId",
  authMW,
  authorize("instructor", "admin"),
  courseIdParamValidator,
  lessonIdParamValidator,
  validateResults,
  authorizeLessonOwnerOrAdmin,
  deleteLesson
);


router.post(
  "/:lessonId/complete",
  authMW,
  authorize("student"),
  courseIdParamValidator,
  lessonIdParamValidator,
  validateResults,
  markLessonComplete
);


router.get(
  "/:lessonId/comments",
  authMW,
  authorizeEnrolledStudentOrInstructorOrAdmin,
  courseIdParamValidator,
  lessonIdParamValidator,
  paginationValidator,
  validateResults,
  getComments
);

router.post(
  "/:lessonId/comments",
  authMW,
  authorize("student", "instructor", "admin"),
  authorizeEnrolledStudentOrInstructorOrAdmin,
  courseIdParamValidator,
  lessonIdParamValidator,
  validateResults,
  commentValidator,
  validateResults,
  createComment
);

router.patch(
  "/:lessonId/comments/:commentId",
  authMW,
  authorize("student", "instructor", "admin"),
  courseIdParamValidator,
  lessonIdParamValidator,
  commentIdParamValidator,
  validateResults,
  authorizeCommentOwnerOrAdmin,
  commentValidator,
  validateResults,
  updateComment
);

router.delete(
  "/:lessonId/comments/:commentId",
  authMW,
  authorize("student", "instructor", "admin"),
  courseIdParamValidator,
  lessonIdParamValidator,
  commentIdParamValidator,
  validateResults,
  authorizeCommentOwnerOrAdmin,
  deleteComment
);

export default router;
