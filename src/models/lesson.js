import { Schema, model } from "mongoose";


const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: [true, "Comment must have content"],
      maxlength: [500, "Comment cannot exceed 500 characters"],
      trim: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Comment must belong to a user"],
    },
  },
  { timestamps: true }
);


const lessonSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Lesson title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    content: {
      type: String,
      required: [true, "Lesson content is required"],
      minlength: [10, "Content must be at least 10 characters"],
    },

    videoUrl: {
      type: String,
      default: "",
    },

    duration: {
      type: Number, // minutes
      default: 0,
      min: [0, "Duration cannot be negative"],
    },

    order: {
      type: Number,
      required: [true, "Lesson order is required"],
      min: [1, "Order must be at least 1"],
    },

    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Lesson must belong to a course"],
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    comments: [commentSchema],
  },
  { timestamps: true }
);

export default model("Lesson", lessonSchema);
