import jwt from "jsonwebtoken";

const adminAuth = (req, res, next) => {
  // Extract token from various possible locations
  let token = req.header("Authorization")?.replace("Bearer ", "").trim();
  if (!token) token = req.header("token")?.trim();
  if (!token) token = req.query.token?.trim();
  if (!token && req.body) token = req.body.token?.trim();

  console.log("=== ADMIN AUTH MIDDLEWARE ===");
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

    // Check if user is admin
    if (req.user && req.user.isAdmin) {
      console.log("✅ Admin access granted for:", req.user.email);
      next();
    } else {
      console.log("❌ Admin access denied. User is not admin:", req.user);
      res.status(403).json({
        success: false,
        message: "Admin access required.",
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

    res.status(401).json({ success: false, message: errorMessage });
  }
};

export default adminAuth;
