const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
  transactions: [
    {
      amount: { type: String, required: true },
      sender: {
        type: String,
        required: true,
      },
      receiver: {
        type: String,
        required: true,
      },
    },
  ],
});

const Account = mongoose.model("Account", accountSchema);

module.exports = Account;
