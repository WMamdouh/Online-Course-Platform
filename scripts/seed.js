import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/user.js";

dotenv.config();

const defaultUsers = [
  {
    name:     "Admin",
    email:    "admin@example.com",
    password: "admin12345",
    role:     "admin",
    bio:      "Platform administrator",
  },
  {
    name:     "Dr. Mohamed Ali",
    email:    "instructor@example.com",
    password: "instructor12345",
    role:     "instructor",
    bio:      "Senior software engineer with 10 years of experience",
  },
  {
    name:     "Ahmed Hassan",
    email:    "student@example.com",
    password: "student12345",
    role:     "student",
    bio:      "Computer science student",
  },
];


const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    for (const userData of defaultUsers) {
      const existing = await User.findOne({ email: userData.email });

      if (existing) {
        console.log(`Already exists: ${userData.role} (${userData.email})`);
      } else {
        const user = await User.create(userData);
        console.log(`Created ${user.role}: ${user.email}`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  }
};

seed();