import Course from "../models/course.js";
import Lesson from "../models/lesson.js";
import Enrollment from "../models/enrollment.js";
import HTTPError from "../util/httpError.js";


export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return next(new HTTPError(401, "Authentication required"));

    if (!roles.includes(req.user.role)) {
      return next(new HTTPError(403, "Insufficient permissions"));
    }

    next();
  };
};


export const authorizeCourseOwnerOrAdmin = async (req, res, next) => {
  try {
    const courseId = req.params.courseId || req.params.id;
    const userId = req.user._id;
    const role = req.user.role;

    const course = await Course.findById(courseId);
    if (!course) return next(new HTTPError(404, "Course not found"));

    if (course.instructor.toString() === userId.toString() || role === "admin") {
      req.course = course;
      return next();
    }

    return next(new HTTPError(403, "Not authorized to modify this course"));
  } catch (err) {
    next(err);
  }
};


export const authorizeLessonOwnerOrAdmin = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user._id;
    const role = req.user.role;

    const lesson = await Lesson.findOne({ _id: lessonId, course: courseId });
    if (!lesson) return next(new HTTPError(404, "Lesson not found"));

    const course = await Course.findById(courseId);
    if (!course) return next(new HTTPError(404, "Course not found"));

    if (course.instructor.toString() === userId.toString() || role === "admin") {
      req.lesson = lesson;
      req.course = course;
      return next();
    }

    return next(new HTTPError(403, "Not authorized to modify this lesson"));
  } catch (err) {
    next(err);
  }
};


export const authorizeCommentOwnerOrAdmin = async (req, res, next) => {
  try {
    const { courseId, lessonId, commentId } = req.params;
    const userId = req.user._id;
    const role = req.user.role;

    const lesson = await Lesson.findOne({ _id: lessonId, course: courseId });
    if (!lesson) return next(new HTTPError(404, "Lesson not found"));

    const comment = lesson.comments.id(commentId);
    if (!comment) return next(new HTTPError(404, "Comment not found"));

    if (comment.user.toString() === userId.toString() || role === "admin") {
      req.lesson = lesson;
      req.comment = comment;
      return next();
    }

    return next(new HTTPError(403, "Not authorized to modify this comment"));
  } catch (err) {
    next(err);
  }
};


export const authorizeEnrolledStudentOrInstructorOrAdmin = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;
    const role = req.user.role;

    if (role === "admin") return next();

    const course = await Course.findById(courseId);
    if (!course) return next(new HTTPError(404, "Course not found"));

    if (course.instructor.toString() === userId.toString()) return next();

    const enrollment = await Enrollment.findOne({ student: userId, course: courseId });
    if (!enrollment) return next(new HTTPError(403, "You must be enrolled to access this content"));

    req.enrollment = enrollment;
    next();
  } catch (err) {
    next(err);
  }
};