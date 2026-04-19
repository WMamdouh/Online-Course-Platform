import { Schema, model } from "mongoose";


const ratingSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Rating must belong to a user"],
    },

    value: {
      type: Number,
      required: [true, "Rating value is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },

    review: {
      type: String,
      maxlength: [500, "Review cannot exceed 500 characters"],
      default: "",
    },
  },
  { timestamps: true }
);


const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    description: {
      type: String,
      required: [true, "Course description is required"],
      minlength: [20, "Description must be at least 20 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Course must belong to an instructor"],
    },

    category: {
      type: String,
      required: [true, "Course category is required"],
      trim: true,
      maxlength: [50, "Category cannot exceed 50 characters"],
    },

    price: {
      type: Number,
      default: 0,
      min: [0, "Price cannot be negative"],
    },

    thumbnail: {
      type: String,
      default: "",
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    ratings: [ratingSchema],

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true
  }
);

courseSchema.index({ title: "text", description: "text", category: "text" });

export default model("Course", courseSchema);
