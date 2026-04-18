import Course from "../models/course.js";
import Lesson from "../models/lesson.js";
import Enrollment from "../models/enrollment.js";
import HTTPError from "../util/httpError.js";


export const getAllCourses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    const skip = (page - 1) * limit;

    const filter = { isPublished: true };

    if (search) {
      filter.$text = { $search: search };
    }

    if (category) {
      filter.category = { $regex: category, $options: "i" };
    }

    const courses = await Course.find(filter)
      .populate("instructor", "name email avatar") // show instructor info
      .select("-ratings")                           // hide full ratings array in list
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Course.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    return res.status(200).json({ total, page, pages, courses });
  } catch (err) {
    next(err);
  }
};


export const getMyCourses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const courses = await Course.find({ instructor: req.user._id })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Course.countDocuments({ instructor: req.user._id });
    const pages = Math.ceil(total / limit);

    return res.status(200).json({ total, page, pages, courses });
  } catch (err) {
    next(err);
  }
};


export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email avatar bio")
      .populate("ratings.user", "name avatar");

    if (!course) return next(new HTTPError(404, "Course not found"));

    if (!course.isPublished) {
      if (!req.user) return next(new HTTPError(403, "This course is not published yet"));

      const isOwner  = course.instructor._id.toString() === req.user._id.toString();
      const isAdmin  = req.user.role === "admin";
      const enrolled = await Enrollment.findOne({ student: req.user._id, course: course._id });

      if (!isOwner && !isAdmin && !enrolled) {
        return next(new HTTPError(403, "This course is not published yet"));
      }
    }

    const lessons = await Lesson.find({ course: course._id })
      .select("title order duration isPublished")
      .sort("order")
      .lean();

    return res.status(200).json({ course, lessons });
  } catch (err) {
    next(err);
  }
};


export const createCourse = async (req, res, next) => {
  try {
    const { title, description, category, price, isPublished } = req.body;

    const course = await Course.create({
      title,
      description,
      category,
      price,
      isPublished,
      instructor: req.user._id,
    });

    return res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (err) {
    next(err);
  }
};


export const updateCourse = async (req, res, next) => {
  try {
    const { title, description, category, price, isPublished, thumbnail } = req.body;

    const updateData = { title, description, category, price, isPublished, thumbnail };
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Course updated successfully",
      course,
    });
  } catch (err) {
    next(err);
  }
};


export const deleteCourse = async (req, res, next) => {
  try {
    const courseId = req.params.id;

    await Lesson.deleteMany({ course: courseId });

    await Enrollment.deleteMany({ course: courseId });

    await Course.findByIdAndDelete(courseId);

    return res.status(200).json({ message: "Course deleted successfully" });
  } catch (err) {
    next(err);
  }
};


export const enrollInCourse = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const studentId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) return next(new HTTPError(404, "Course not found"));
    if (!course.isPublished) return next(new HTTPError(400, "Cannot enroll in an unpublished course"));

    const existing = await Enrollment.findOne({ student: studentId, course: courseId });
    if (existing) return next(new HTTPError(409, "You are already enrolled in this course"));

    const enrollment = await Enrollment.create({
      student: studentId,
      course:  courseId,
    });

    return res.status(201).json({
      message: "Enrolled successfully",
      enrollment,
    });
  } catch (err) {
    next(err);
  }
};


export const unenrollFromCourse = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findOneAndDelete({
      student: req.user._id,
      course:  req.params.id,
    });

    if (!enrollment) return next(new HTTPError(404, "Enrollment not found"));

    return res.status(200).json({ message: "Unenrolled successfully" });
  } catch (err) {
    next(err);
  }
};


export const getCourseStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const enrollments = await Enrollment.find({ course: req.params.id })
      .populate("student", "name email avatar")
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Enrollment.countDocuments({ course: req.params.id });
    const pages = Math.ceil(total / limit);

    return res.status(200).json({ total, page, pages, enrollments });
  } catch (err) {
    next(err);
  }
};


export const rateCourse = async (req, res, next) => {
  try {
    const courseId  = req.params.id;
    const studentId = req.user._id;
    const { value, review } = req.body;

    const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    if (!enrollment) return next(new HTTPError(403, "You must be enrolled to rate this course"));

    const course = await Course.findById(courseId);
    if (!course) return next(new HTTPError(404, "Course not found"));

    const existingRating = course.ratings.find(
      (r) => r.user.toString() === studentId.toString()
    );

    if (existingRating) {
      existingRating.value  = value;
      existingRating.review = review || existingRating.review;
    } else {
      course.ratings.push({ user: studentId, value, review });
    }

    const total = course.ratings.reduce((sum, r) => sum + r.value, 0);
    course.averageRating = +(total / course.ratings.length).toFixed(2);

    await course.save();

    return res.status(200).json({
      message: "Rating submitted successfully",
      averageRating: course.averageRating,
      totalRatings:  course.ratings.length,
    });
  } catch (err) {
    next(err);
  }
};


export const deleteRating = async (req, res, next) => {
  try {
    const courseId  = req.params.id;
    const studentId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) return next(new HTTPError(404, "Course not found"));

    const ratingIndex = course.ratings.findIndex(
      (r) => r.user.toString() === studentId.toString()
    );

    if (ratingIndex === -1) return next(new HTTPError(404, "You have not rated this course"));

    course.ratings.splice(ratingIndex, 1);

    course.averageRating =
      course.ratings.length > 0
        ? +(course.ratings.reduce((sum, r) => sum + r.value, 0) / course.ratings.length).toFixed(2)
        : 0;

    await course.save();

    return res.status(200).json({ message: "Rating deleted successfully" });
  } catch (err) {
    next(err);
  }
};
