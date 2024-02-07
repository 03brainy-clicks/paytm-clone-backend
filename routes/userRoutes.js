const express = require("express");
const {
  handleSignup,
  handleSignin,
  handleUpdateDetails,
  handleResetPassword,
  handleGetUsers,
  handleGetUser,
  handleCheckUsernameAvailability,
} = require("../controller/userController");
const userAuthMiddleware = require("../middleware/userAuthMiddleware");
const router = express.Router();

// Get Users / filter
router.get("/", handleGetUsers);
// Get User /
router.get("/:id", handleGetUser);
// Check username avilable /username
router.post("/username", handleCheckUsernameAvailability);
// Signup /signup
router.post("/signup", handleSignup);
// Signup /signin
router.post("/signin", handleSignin);
// Update Details /update/:id
router.put("/update/:id", userAuthMiddleware, handleUpdateDetails);
// Update Password /resetpassword/:id
router.put("/resetpassword/:id", userAuthMiddleware, handleResetPassword);

module.exports = router;
