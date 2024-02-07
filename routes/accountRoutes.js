const express = require("express");
const userAuthMiddleware = require("../middleware/userAuthMiddleware");
const {
  handleCheckBalance,
  handleTransaction,
  handleGetTransactions,
} = require("../controller/accountController");
const router = express.Router();

// Get Balance api/account/balance
router.get("/balance", userAuthMiddleware, handleCheckBalance);
// Get Transaction api/account/transactions
router.get("/balance", userAuthMiddleware, handleGetTransactions);
// Transaction api/account/transfer
router.post("/transfer", userAuthMiddleware, handleTransaction);

module.exports = router;
