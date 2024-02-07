const Account = require("../models/accountModel");
const { transactions } = require("../zod");
const { v4: uuidv4 } = require("uuid");

// Check Balance
const handleCheckBalance = async (req, res) => {
  try {
    // Assuming you have a user ID available in req.user.id after authentication
    const userId = req.user.userId;

    // Find the user's account based on the user ID
    const userAccount = await Account.findOne({ userId });

    // Check if the user account exists
    if (!userAccount) {
      return res.status(404).json({ error: "User account not found" });
    }

    // Extract and send the balance in the response
    const balance = userAccount.balance;
    res.status(200).json({ accountBalance: `${balance} INR` });
  } catch (error) {
    console.error("Error checking balance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Check Balance
const handleGetTransactions = async (req, res) => {
  try {
    // Assuming you have a user ID available in req.user.id after authentication
    const userId = req.user.userId;

    // Find the user's account based on the user ID
    const userAccount = await Account.findOne({ userId });

    // Check if the user account exists
    if (!userAccount) {
      return res.status(404).json({ error: "User account not found" });
    }

    // Extract and send the transactions in the response
    const transactions  = userAccount.transactions;
    res.status(200).json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Transfer
const handleTransaction = async (req, res) => {
  try {
    // Assuming you have a user ID available in req.user.id after authentication
    const userId = req.user.userId;

    // Extracting values
    const { receiver, amount } = req.body;

    // Generate a unique transaction ID
    const transactionId = uuidv4();

    // Creating data object for validation
    const data = {
      receiver,
      userId,
      amount: parseInt(amount),
    };

    // Validate input using Zod schema for user details
    const validatedData = transactions.parse(data);

    // Validate data using Zod schema
    if (!validatedData) {
      return res.status(400).json({ message: "Invalid data format" });
    }

    // Checking for the sender's account within the transaction
    const account = await Account.findOne({ userId });

    // Check if the sender's account exists and has sufficient balance
    if (!account || account.balance < amount) {
      return res.status(400).json({
        message: "Insufficient balance",
      });
    }

    // Checking for the receiver's account
    const toAccount = await Account.findOne({ userId: receiver });

    // Check if the receiver's account exists
    if (!toAccount) {
      return res.status(400).json({
        message: "Invalid receiver account",
      });
    }

    // Perform the transfer
    await Account.updateOne(
      { userId },
      {
        $inc: { balance: -amount },
        $push: {
          transactions: {
            action: "send",
            transactionId,
            amount,
            sender: userId,
            receiver,
          },
        },
      }
    );

    await Account.updateOne(
      { userId: receiver },
      {
        $inc: { balance: amount },
        $push: {
          transactions: {
            action: "receive",
            transactionId,
            amount,
            sender: userId,
            receiver,
          },
        },
      }
    );

    return res.status(200).json({
      message: "Transfer successful",
      transactionId,
    });
  } catch (error) {
    console.error("Error in transaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
module.exports = { handleCheckBalance, handleTransaction, handleGetTransactions };
