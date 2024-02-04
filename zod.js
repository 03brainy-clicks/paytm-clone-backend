const { z } = require("zod");

// Schema for user signup data
const userSignup = z.object({
  username: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});

// Schema for user signin data
const userSignin = z.object({
  username: z.string(),
  password: z.string(),
});

// Schema for user details
const userDetails = z.object({
  firstName: z.string(),
  lastName: z.string(),
});

// Schema for updating user password
const updatePassword = z.object({
  currentPassword: z.string(),
  updatedPassword: z.string(),
});

// Schema for a range of users
const usersRange = z.object({
  start: z.number(),
  end: z.number(),
});

// Schema for a transaction
const transactions = z.object({
  receiver: z.string(),
  amount: z.number(),
  userId: z.string(),
});

module.exports = {
  userSignin,
  userSignup,
  userDetails,
  updatePassword,
  usersRange,
  transactions,
};
