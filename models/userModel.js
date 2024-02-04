const mongoose = require("mongoose");

// Define User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    lowercase: true,
    minLength: [3, "Username should be at least 3 characters"],
    maxLength: [30, "Username should not exceed 30 characters"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minLength: [6, "Password should be at least 6 characters"],
  },
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true,
    maxLength: [50, "First name should not exceed 50 characters"],
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true,
    maxLength: [50, "Last name should not exceed 50 characters"],
  },
});

// User Model
const User = mongoose.model("User", userSchema);

module.exports = User;
