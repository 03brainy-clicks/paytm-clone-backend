const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const JWT_PASSWORD = "PAYTM@07";

// Middleware for handling auth
async function userAuthMiddleware(req, res, next) {
  try {
    let token = req.headers.authorization;
    if (token) {
      jwt.verify(token.split(" ")[1], JWT_PASSWORD, (err, user) => {
        if (err) {
          return res.status(403).json({ message: "Token verification failed" });
        }
        req.user = user;
        next();
      });
    } else {
      return res.status(401).json({ message: "Unauthorized access" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error });
  }
}

module.exports = userAuthMiddleware;
