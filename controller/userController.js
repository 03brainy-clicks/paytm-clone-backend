const bcrypt = require("bcrypt");
const { userSignin, userSignup, userDetails, usersRange } = require("../zod");
const jwt = require("jsonwebtoken");
const JWT_PASSWORD = "PAYTM@07";
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

      // Creating account
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
        return res.status(200).json({ token });
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

    console.log(validatedData);

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

    const validatedData = updatedPassword.parse({
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

// Get Users
const handleGetUsers = async (req, res) => {
  try {
    // Extract range parameters from query
    const { start, end } = req.query;

    const validatedData = usersRange.parse({
      start,
      end,
    });

    // Validate input using Zod schema for user details
    if (!validatedData) {
      return res.status(404).json({ message: "Invalid data type" });
    }

    // Convert start and end to integers
    const startIdx = parseInt(start, 10) || 0;
    const endIdx = parseInt(end, 10) || startIdx + 19;

    const users = await User.find({})
      .skip(startIdx)
      .limit(endIdx - startIdx + 1);

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
      res.status(200).json({ user });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  handleSignup,
  handleSignin,
  handleUpdateDetails,
  handleResetPassword,
  handleGetUsers,
  handleGetUser,
};
