/**
 * Seed Script
 * ───────────
 * Creates default users (admin, instructor, student) in the database.
 * Run this ONCE after setting up the project:
 *
 *   node scripts/seed.js
 *
 * Safe to run multiple times – it checks if each user already exists
 * before creating them, so no duplicates will be created.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/user.js";

// Load environment variables from .env file
dotenv.config();

// ── Default users to seed ─────────────────────────────────────────────────────
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

// ── Main seed function ────────────────────────────────────────────────────────
const seed = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
    console.log("─────────────────────────────────────");

    // 2. Loop through each default user and create if not exists
    for (const userData of defaultUsers) {
      // Check if this email already exists in the database
      const existing = await User.findOne({ email: userData.email });

      if (existing) {
        // Skip – don't create duplicate
        console.log(`⚠️  Already exists: ${userData.role} (${userData.email})`);
      } else {
        // Create the user – password is hashed by the model's pre-save hook
        const user = await User.create(userData);
        console.log(`✅ Created ${user.role}: ${user.email}`);
      }
    }

    // 3. Done
    console.log("─────────────────────────────────────");
    console.log("🌱 Seeding complete!");
    console.log("");
    console.log("📋 Login credentials:");
    console.log("   Admin:      admin@example.com      / admin12345");
    console.log("   Instructor: instructor@example.com / instructor12345");
    console.log("   Student:    student@example.com    / student12345");
    console.log("");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
};

// Run the seed function
seed();