import { body } from "express-validator";


export const createLessonValidator = [
  body("title")
    .trim()
    .notEmpty().withMessage("Lesson title is required")
    .isLength({ min: 3, max: 150 }).withMessage("Title must be between 3 and 150 characters"),

  body("content")
    .trim()
    .notEmpty().withMessage("Lesson content is required")
    .isLength({ min: 10 }).withMessage("Content must be at least 10 characters"),

  body("order")
    .notEmpty().withMessage("Lesson order is required")
    .isInt({ min: 1 }).withMessage("Order must be a positive integer")
    .toInt(),

  body("videoUrl")
    .optional()
    .isURL().withMessage("Video URL must be a valid URL")
    .trim(),

  body("duration")
    .optional()
    .isFloat({ min: 0 }).withMessage("Duration must be a non-negative number")
    .toFloat(),

  body("isPublished")
    .optional()
    .isBoolean().withMessage("isPublished must be true or false")
    .toBoolean(),
];


export const updateLessonValidator = [
  body("title")
    .optional()
    .trim()
    .notEmpty().withMessage("Title cannot be empty")
    .isLength({ min: 3, max: 150 }).withMessage("Title must be between 3 and 150 characters"),

  body("content")
    .optional()
    .trim()
    .notEmpty().withMessage("Content cannot be empty")
    .isLength({ min: 10 }).withMessage("Content must be at least 10 characters"),

  body("order")
    .optional()
    .isInt({ min: 1 }).withMessage("Order must be a positive integer")
    .toInt(),

  body("videoUrl")
    .optional()
    .isURL().withMessage("Video URL must be a valid URL")
    .trim(),

  body("duration")
    .optional()
    .isFloat({ min: 0 }).withMessage("Duration must be a non-negative number")
    .toFloat(),

  body("isPublished")
    .optional()
    .isBoolean().withMessage("isPublished must be true or false")
    .toBoolean(),
];


export const commentValidator = [
  body("content")
    .trim()
    .notEmpty().withMessage("Comment content is required")
    .isLength({ max: 500 }).withMessage("Comment cannot exceed 500 characters")
    .escape(), // sanitize HTML entities
];
