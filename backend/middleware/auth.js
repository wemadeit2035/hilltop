import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const authUser = (req, res, next) => {
  // Extract token from various possible locations
  let token = req.header("Authorization")?.replace("Bearer ", "").trim();
  if (!token) token = req.header("token")?.trim();
  if (!token) token = req.query.token?.trim();
  if (!token && req.body) token = req.body.token?.trim();

  console.log("=== USER AUTH MIDDLEWARE ===");
  console.log("Received token:", token);

  if (!token) {
    console.log("❌ No token provided");
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("✅ Token verified successfully");
    console.log("User data:", decoded);

    // ✅ FIXED: Only one block of code for user validation
    if (req.user && req.user.id) {
      // Update lastActive in the background (don't wait for it)
      User.findByIdAndUpdate(req.user.id, { lastActive: new Date() }).catch(
        (err) => console.error("LastActive update error:", err)
      );

      console.log("✅ User access granted for:", req.user.email);
      req.body.userId = req.user.id;
      next(); // ✅ Only one call to next()
    } else {
      console.log("❌ User access denied. No user ID found:", req.user);
      return res.status(403).json({
        // ✅ ADDED RETURN
        success: false,
        message: "User access required.",
      });
    }
  } catch (error) {
    console.log("❌ Token verification failed:", error.message);

    let errorMessage = "Invalid token.";
    if (error.name === "TokenExpiredError") {
      errorMessage = "Token expired. Please log in again.";
    } else if (error.name === "JsonWebTokenError") {
      errorMessage = "Malformed token.";
    }

    return res.status(401).json({ success: false, message: errorMessage }); // ✅ ADDED RETURN
  }
};

export default authUser;
