// Parsing env file
require("dotenv").config();
const bcrypt = require("bcrypt");
const { userSignin, userSignup, userDetails, usersRange,updatePassword } = require("../zod");
const jwt = require("jsonwebtoken");
const JWT_PASSWORD = process.env.JWT_PASSWORD;
const SALT = 10;

// Database
const User = require("../models/userModel");
const Account = require("../models/accountModel");

// User Signup
const handleSignup = async (req, res) => {
  try {
    const { username, password, firstName, lastName } = req.body;

    // Validate input using Zod schema for signup
    const validatedData = userSignup.parse({
      username,
      password,
      firstName,
      lastName,
    });

    if (validatedData) {
      // Hash the password before storing it
      const hashedPassword = await bcrypt.hash(password, SALT);

      // Create a new user
      const user = await User.create({
        username,
        password: hashedPassword,
        firstName,
        lastName,
      });

      // Create an account for the user
      await Account.create({
        userId: user._id,
        balance: Math.round(1 + Math.random() * 1000000),
        transactions: [],
      });

      return res.status(201).json({ message: "User created successfully" });
    } else {
      return res.status(401).json({ message: "Invalid input" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to signup" });
  }
};

// User Signin
const handleSignin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input using Zod schema for signin
    const validatedData = userSignin.parse({ username, password });

    // Find user by username
    const userExist = await User.findOne({ username });

    if (userExist && validatedData) {
      // Check if the provided password matches the stored hashed password
      const isPasswordValid = await bcrypt.compare(
        password,
        userExist.password
      );

      if (isPasswordValid) {
        // Generate a JWT token upon successful authentication
        const token = jwt.sign(
          { username: userExist.username, userId: userExist._id },
          JWT_PASSWORD
        );
        return res.status(200).json({ token, username: userExist.username });
      } else {
        return res.status(401).json({ message: "Invalid password" });
      }
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to signin" });
  }
};

// Update Details
const handleUpdateDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName } = req.body;

    // Validate input using Zod schema for user details
    const validatedData = userDetails.parse({ firstName, lastName });

    if (validatedData && id) {
      // Update user details by ID
      await User.findByIdAndUpdate(id, { firstName, lastName });
      return res.status(200).json({ message: "Details updated successfully" });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update" });
  }
};

// Update Password
const handleResetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, updatedPassword } = req.body;

    // Find user by ID
    const userExist = await User.findById(id);

    if (!userExist) {
      return res.status(404).json({ message: "User not found" });
    }

    const validatedData = updatePassword.parse({
      currentPassword,
      updatedPassword,
    });

    // Validate input using Zod schema for user details
    if (!validatedData) {
      return res.status(404).json({ message: "Invalid data type" });
    }

    // Check if the provided current password matches the stored hashed password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      userExist.password
    );

    if (isPasswordValid) {
      // Hash the updated password before updating it in the database
      const hashedPassword = await bcrypt.hash(updatedPassword, SALT);
      await User.findByIdAndUpdate(id, { password: hashedPassword });
      return res.status(200).json({ message: "Password updated successfully" });
    } else {
      return res.status(401).json({ message: "Invalid current password" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update password" });
  }
};

// Get Users & filter
const handleGetUsers = async (req, res) => {
  try {
    // Extract parameters from body
    const { start, end, filterBy, filterValue } = req.body;

    // Apply pagination
    const startIndex = start ? parseInt(start, 10) : 0;
    const endIndex = end ? parseInt(end, 10) : startIndex + 19;

    // Validate input using Zod schema for user details
    const validatedData = usersRange.parse({
      start: startIndex,
      end: endIndex,
    });
    if (!validatedData) {
      return res.status(404).json({ message: "Invalid data type" });
    }

    // Construct filter based on filterBy and filterValue
    const filter = {};
    if (filterBy && filterValue) {
      if (filterBy === "firstName") {
        filter.firstname = filterValue;
      } else if (filterBy === "lastName") {
        filter.lastname = filterValue;
      } else if (filterBy === "id") {
        filter._id = filterValue;
      }
      // Add more conditions for other filter options if needed
    }

    // Find users based on filter and pagination
    const users = await User.find(filter)
      .skip(startIndex)
      .limit(endIndex - startIndex + 1);

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No Users Found" });
    }

    // Remove the password field from each user object
    const usersWithoutPassword = users.map((user) => {
      const { password, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    });

    res.status(200).json({ users: usersWithoutPassword });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Get User
const handleGetUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Omitting the password field from the user object
      const { password, ...userWithoutPassword } = user.toObject();
      res.status(200).json({ user: userWithoutPassword });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Post Username avilable
const handleCheckUsernameAvailability = async (req, res) => {
  const { username } = req.body;

  try {
    // Check if the username exists in the database
    const existingUser = await User.findOne({ username });

    // If a user with the given username exists, return false
    if (existingUser) {
      return res.json({ available: false });
    }

    // If no user with the given username exists, return true
    return res.json({ available: true });
  } catch (error) {
    console.error("Error checking username availability:", error);
    // Return false in case of any error
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  handleSignup,
  handleSignin,
  handleUpdateDetails,
  handleResetPassword,
  handleGetUsers,
  handleGetUser,
  handleCheckUsernameAvailability
};
