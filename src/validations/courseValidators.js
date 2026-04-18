import { body } from "express-validator";


export const createCourseValidator = [
  body("title")
    .trim()
    .notEmpty().withMessage("Course title is required")
    .isLength({ min: 5, max: 150 }).withMessage("Title must be between 5 and 150 characters"),

  body("description")
    .trim()
    .notEmpty().withMessage("Course description is required")
    .isLength({ min: 20, max: 2000 }).withMessage("Description must be between 20 and 2000 characters"),

  body("category")
    .trim()
    .notEmpty().withMessage("Category is required")
    .isLength({ max: 50 }).withMessage("Category cannot exceed 50 characters"),

  body("price")
    .optional()
    .isFloat({ min: 0 }).withMessage("Price must be a non-negative number")
    .toFloat(),

  body("isPublished")
    .optional()
    .isBoolean().withMessage("isPublished must be true or false")
    .toBoolean(),
];


export const updateCourseValidator = [
  body("title")
    .optional()
    .trim()
    .notEmpty().withMessage("Title cannot be empty")
    .isLength({ min: 5, max: 150 }).withMessage("Title must be between 5 and 150 characters"),

  body("description")
    .optional()
    .trim()
    .notEmpty().withMessage("Description cannot be empty")
    .isLength({ min: 20, max: 2000 }).withMessage("Description must be between 20 and 2000 characters"),

  body("category")
    .optional()
    .trim()
    .notEmpty().withMessage("Category cannot be empty")
    .isLength({ max: 50 }).withMessage("Category cannot exceed 50 characters"),

  body("price")
    .optional()
    .isFloat({ min: 0 }).withMessage("Price must be a non-negative number")
    .toFloat(),

  body("isPublished")
    .optional()
    .isBoolean().withMessage("isPublished must be true or false")
    .toBoolean(),
];


export const ratingValidator = [
  body("value")
    .notEmpty().withMessage("Rating value is required")
    .isInt({ min: 1, max: 5 }).withMessage("Rating must be an integer between 1 and 5")
    .toInt(),

  body("review")
    .optional()
    .isString().withMessage("Review must be a string")
    .isLength({ max: 500 }).withMessage("Review cannot exceed 500 characters")
    .trim(),
];
