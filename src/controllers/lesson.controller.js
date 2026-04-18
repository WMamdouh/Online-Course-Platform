import Lesson from "../models/lesson.js";
import Course from "../models/course.js";
import Enrollment from "../models/enrollment.js";
import HTTPError from "../util/httpError.js";


export const getLessons = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const course = await Course.findById(courseId);
    if (!course) return next(new HTTPError(404, "Course not found"));

    const isOwner = req.user && course.instructor.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === "admin";
    const showAll = isOwner || isAdmin;

    const filter = { course: courseId };
    if (!showAll) filter.isPublished = true;

    const lessons = await Lesson.find(filter)
      .select("-comments") // comments are fetched per-lesson to avoid huge payloads
      .sort("order")
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Lesson.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    return res.status(200).json({ total, page, pages, lessons });
  } catch (err) {
    next(err);
  }
};


export const getLessonById = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;

    const lesson = await Lesson.findOne({ _id: lessonId, course: courseId })
      .populate("comments.user", "name avatar"); // show commenter details

    if (!lesson) return next(new HTTPError(404, "Lesson not found"));

    if (!lesson.isPublished) {
      const course  = await Course.findById(courseId);
      const isOwner = req.user && course.instructor.toString() === req.user._id.toString();
      const isAdmin = req.user && req.user.role === "admin";
      if (!isOwner && !isAdmin) {
        return next(new HTTPError(403, "This lesson is not published yet"));
      }
    }

    return res.status(200).json({ lesson });
  } catch (err) {
    next(err);
  }
};


export const createLesson = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, content, order, videoUrl, duration, isPublished } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return next(new HTTPError(404, "Course not found"));

    const orderExists = await Lesson.findOne({ course: courseId, order });
    if (orderExists) {
      return next(new HTTPError(409, `A lesson with order ${order} already exists in this course`));
    }

    const lesson = await Lesson.create({
      title,
      content,
      order,
      videoUrl,
      duration,
      isPublished,
      course: courseId,
    });

    return res.status(201).json({
      message: "Lesson created successfully",
      lesson,
    });
  } catch (err) {
    next(err);
  }
};


export const updateLesson = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const { title, content, order, videoUrl, duration, isPublished } = req.body;

    if (order !== undefined) {
      const conflict = await Lesson.findOne({
        course: courseId,
        order,
        _id: { $ne: lessonId }, // exclude current lesson from check
      });
      if (conflict) {
        return next(new HTTPError(409, `Order ${order} is already taken by another lesson`));
      }
    }

    const updateData = { title, content, order, videoUrl, duration, isPublished };
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const lesson = await Lesson.findByIdAndUpdate(
      lessonId,
      updateData,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Lesson updated successfully",
      lesson,
    });
  } catch (err) {
    next(err);
  }
};


export const deleteLesson = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;

    const lesson = await Lesson.findOneAndDelete({ _id: lessonId, course: courseId });
    if (!lesson) return next(new HTTPError(404, "Lesson not found"));

    await Enrollment.updateMany(
      { course: courseId },
      { $pull: { completedLessons: lesson._id } }
    );

    return res.status(200).json({ message: "Lesson deleted successfully" });
  } catch (err) {
    next(err);
  }
};


export const markLessonComplete = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const studentId = req.user._id;

    const lesson = await Lesson.findOne({ _id: lessonId, course: courseId, isPublished: true });
    if (!lesson) return next(new HTTPError(404, "Lesson not found"));

    const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    if (!enrollment) return next(new HTTPError(403, "You are not enrolled in this course"));

    const alreadyDone = enrollment.completedLessons.some(
      (id) => id.toString() === lessonId
    );
    if (alreadyDone) {
      return res.status(200).json({ message: "Lesson already marked as complete", enrollment });
    }

    enrollment.completedLessons.push(lessonId);

    const totalLessons = await Lesson.countDocuments({ course: courseId, isPublished: true });
    enrollment.progressPercent = Math.round(
      (enrollment.completedLessons.length / totalLessons) * 100
    );

    if (enrollment.progressPercent === 100) {
      enrollment.completedAt = new Date();
    }

    await enrollment.save();

    return res.status(200).json({
      message: "Lesson marked as complete",
      progressPercent: enrollment.progressPercent,
      completedAt: enrollment.completedAt,
    });
  } catch (err) {
    next(err);
  }
};


export const createComment = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const lesson = await Lesson.findOne({ _id: lessonId, course: courseId });
    if (!lesson) return next(new HTTPError(404, "Lesson not found"));

    lesson.comments.push({ content, user: userId });
    await lesson.save();

    await lesson.populate("comments.user", "name avatar");

    return res.status(201).json({
      message: "Comment added successfully",
      comment: lesson.comments[lesson.comments.length - 1],
    });
  } catch (err) {
    next(err);
  }
};


export const getComments = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const lesson = await Lesson.findOne({ _id: lessonId, course: courseId })
      .populate("comments.user", "name avatar");

    if (!lesson) return next(new HTTPError(404, "Lesson not found"));

    const start    = (page - 1) * limit;
    const end      = start + Number(limit);
    const comments = lesson.comments.slice(start, end);
    const total    = lesson.comments.length;
    const pages    = Math.ceil(total / limit);

    return res.status(200).json({ total, page, pages, comments });
  } catch (err) {
    next(err);
  }
};


export const updateComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const lesson  = req.lesson;
    const comment = lesson.comments.id(commentId);

    if (!comment) return next(new HTTPError(404, "Comment not found"));

    comment.content = content || comment.content;
    await lesson.save();

    return res.status(200).json({
      message: "Comment updated successfully",
      comment,
    });
  } catch (err) {
    next(err);
  }
};


export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    const lesson  = req.lesson;
    const comment = lesson.comments.id(commentId);

    if (!comment) return next(new HTTPError(404, "Comment not found"));

    await comment.deleteOne();
    await lesson.save();

    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    next(err);
  }
};
