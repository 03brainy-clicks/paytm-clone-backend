const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const userRouter = require("./routes/userRoutes");
const accountRouter = require("./routes/accountRoutes");
const app = express();

// Parsing env file
require("dotenv").config();

// Data parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// CORS configuration
app.use(cors());

// Fetching env variables
const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI;

// Connecting database
try {
  mongoose.connect(MONGODB_URI);
  console.log("MongoDB connected");
} catch (err) {
  console.log("Failed to connect to MongoDB");
  console.error(err);
  // Handle the error appropriately, e.g., exit the application
  process.exit(1);
}

// Routes
// User routes
app.use("/api/users", userRouter);

// Account routes
app.use("/api/account", accountRouter);

// Server
app.listen(PORT, () => {
  console.log("Server running at port", PORT);
});
