import { OAuth2Client } from "google-auth-library";
import User from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import axios from "axios";
import jwt from "jsonwebtoken";
import validator from "validator";
import bcrypt from "bcryptjs";
import {
  sendWelcomeEmail,
  sendContactEmail,
  sendPasswordResetEmail,
} from "../utils/emailService.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Generate a 6-digit numeric reset token for password recovery
 * @returns {string} - 6-digit reset code
 */
const generateResetToken = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate JWT access and refresh tokens for user authentication
 * @param {Object} user - User document
 * @returns {Object} - Access and refresh tokens
 */
const generateTokens = (user) => {
  const payload = {
    id: user._id || user.id,
    email: user.email,
    isAdmin: user.isAdmin || false,
    isVerified: user.isVerified || false,
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "24h",
  });

  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });

  return { accessToken, refreshToken };
};

/**
 * Generate email verification token with 24-hour expiration
 * @returns {string} - JWT verification token
 */
const generateVerificationToken = () => {
  return jwt.sign({}, process.env.JWT_SECRET, { expiresIn: "24h" });
};

/**
 * Verify user email using token from verification link
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by verification token
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification token",
      });
    }

    // Check if token is expired
    if (Date.now() > decoded.exp * 1000) {
      return res.status(400).json({
        success: false,
        message: "Verification token has expired",
      });
    }

    // Update user as verified and remove the token
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({
        success: false,
        message: "Verification token has expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({
        success: false,
        message: "Invalid verification token",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during email verification",
    });
  }
};

/**
 * Resend verification email to user
 */
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    user.verificationToken = verificationToken;
    await user.save();

    // Send verification email
    await sendWelcomeEmail(user.email, user.name, verificationToken);

    res.json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while resending verification email",
    });
  }
};

/**
 * Register new user with email verification
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Input sanitization
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // Check if user exists
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      if (existingUser.googleId) {
        return res.status(400).json({
          success: false,
          message:
            "This email is already registered with Google. Please use Google Sign-In.",
        });
      }
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Validations
    if (!validator.isEmail(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email",
      });
    }
    if (trimmedPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Create new user - password will be hashed by pre-save middleware
    const user = new User({
      name: trimmedName,
      email: trimmedEmail,
      password: trimmedPassword,
      isVerified: false,
      verificationToken: generateVerificationToken(),
      profileCompleted: false,
    });

    await user.save();

    // Send welcome email with verification link
    await sendWelcomeEmail(trimmedEmail, trimmedName, user.verificationToken);

    // Generate authentication tokens
    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message:
        "User created successfully. Please check your email to verify your account.",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

/**
 * Get user orders summary with revenue calculation (Admin only)
 */
const getUserOrdersSummary = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    // Get all orders for the user
    const orders = await orderModel.find({ userId }).sort({ date: -1 });

    // Calculate statistics
    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(
      (order) => order.status === "Delivered"
    ).length;
    const cancelledOrders = orders.filter(
      (order) => order.status === "Cancelled"
    ).length;
    const returnedOrders = orders.filter(
      (order) => order.status === "Returned"
    ).length;

    // Calculate total revenue (only from delivered orders)
    const totalRevenue = orders
      .filter((order) => order.status === "Delivered")
      .reduce((sum, order) => sum + order.amount, 0);

    res.json({
      success: true,
      data: {
        totalOrders,
        deliveredOrders,
        cancelledOrders,
        returnedOrders,
        totalRevenue,
        orders: orders.slice(0, 10), // Return recent 10 orders
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching user orders summary",
    });
  }
};

/**
 * Get top customers by revenue (Admin only)
 */
const getTopCustomers = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    // Aggregate to get top customers by revenue from delivered orders
    const topCustomers = await orderModel.aggregate([
      {
        $match: {
          status: "Delivered", // Only count delivered orders for revenue
        },
      },
      {
        $group: {
          _id: "$userId",
          totalRevenue: { $sum: "$amount" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $sort: { totalRevenue: -1 },
      },
      {
        $limit: 10, // Top 10 customers
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $project: {
          userId: "$_id",
          name: "$userDetails.name",
          email: "$userDetails.email",
          profileImage: "$userDetails.profileImage",
          totalRevenue: 1,
          orderCount: 1,
        },
      },
    ]);

    res.json({
      success: true,
      topCustomers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching top customers",
    });
  }
};

/**
 * Handle contact form submissions
 */
const contactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Send email using Nodemailer
    const emailSent = await sendContactEmail({ name, email, message });

    if (emailSent) {
      res.json({
        success: true,
        message: "Your message has been sent successfully!",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send your message. Please try again later.",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while processing your message",
    });
  }
};

/**
 * Google OAuth authentication
 * Handles both new user registration and existing user login
 */
const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Google token is required",
      });
    }

    // Verify token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Find or create user
    let user = await User.findOne({ $or: [{ email }, { googleId }] });
    let isNewUser = false;

    if (!user) {
      user = new User({
        name,
        email,
        googleId,
        profileImage: picture,
        isVerified: true,
        lastLogin: new Date(),
        lastActive: new Date(),
        profileCompleted: false,
      });
      await user.save();
      isNewUser = true;
    } else {
      // ✅ Update lastActive for existing users
      await User.findByIdAndUpdate(user._id, {
        lastLogin: new Date(),
        lastActive: new Date(),
      });
    }

    // ✅ FIXED: Use correct cookie settings for production
    const cookieOptions = {
      httpOnly: true,
      secure: true, // Vercel always uses HTTPS
      sameSite: "none", // ✅ CRITICAL: "none" for cross-domain
      maxAge: 7 * 24 * 60 * 60 * 1000,
      domain: "mystore-drab.vercel.app", // ✅ Your FRONTEND domain
    };

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    // Set cookie with correct options
    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.json({
      success: true,
      message: "Google login successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid Google token",
    });
  }
};

/**
 * Facebook OAuth authentication
 * Similar to googleAuth - handles registration and login
 */
const facebookAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Facebook access token is required",
      });
    }

    // 1. Verify the token with Facebook's Graph API
    const fbResponse = await axios.get(`https://graph.facebook.com/v19.0/me`, {
      params: {
        access_token: token,
        fields: "id,name,email,picture.type(large)", // Request necessary fields
      },
    });

    const { id: facebookId, name, email, picture } = fbResponse.data;

    // 2. Check if user exists by email OR facebookId
    let user = await User.findOne({
      $or: [{ email }, { facebookId }],
    });

    let isNewUser = false;

    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        name,
        email,
        facebookId, // Store the Facebook ID
        profileImage: picture?.data?.url || "", // Facebook's picture structure
        isVerified: true, // Facebook emails are typically verified
        lastLogin: new Date(),
        lastActive: new Date(),
        profileCompleted: false,
      });
      await user.save();
      isNewUser = true;
    } else if (!user.facebookId) {
      // Link Facebook account to existing email account
      user.facebookId = facebookId;
      user.profileImage = picture?.data?.url || user.profileImage;
      user.isVerified = true;
      await user.save();
      isNewUser = true;
    } else {
      // Update existing user's last login
      await User.findByIdAndUpdate(user._id, {
        lastLogin: new Date(),
        lastActive: new Date(),
      });
    }

    // 3. Generate JWT tokens (use your existing generateTokens function)
    const { accessToken, refreshToken } = generateTokens(user);

    // 4. Save refresh token and set cookie (follow your existing pattern)
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 5. Send response
    res.json({
      success: true,
      message: "Facebook login successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error(
      "Facebook auth error:",
      error.response?.data || error.message
    );

    // Handle specific Facebook API errors
    if (error.response?.data?.error?.code === 190) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired Facebook token",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during Facebook authentication",
    });
  }
};

/**
 * Traditional email/password login - MOBILE OPTIMIZED
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input sanitization
    const trimmedEmail = email?.trim().toLowerCase();
    const trimmedPassword = password?.trim();

    console.log("[loginUser] incoming login attempt:", {
      email: trimmedEmail,
      hasPassword: !!trimmedPassword,
      client: req.clientType,
      mobile: req.isMobile,
    });

    // Enhanced validation for mobile
    if (!trimmedEmail || !trimmedPassword) {
      console.log("[loginUser] missing email or password", {
        trimmedEmail,
        trimmedPasswordPresent: !!trimmedPassword,
      });
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
        mobile: req.isMobile,
      });
    }

    const user = await User.findOne({ email: trimmedEmail });

    if (!user) {
      console.log("[loginUser] user not found for email:", trimmedEmail);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        mobile: req.isMobile,
      });
    }

    // Update last login and active status
    await User.findByIdAndUpdate(user._id, {
      lastLogin: new Date(),
      lastActive: new Date(),
    });

    if (user.googleId) {
      console.log(
        "[loginUser] login blocked: account linked to Google for",
        trimmedEmail
      );
      return res.status(401).json({
        success: false,
        message:
          "This email is associated with Google login. Please use Google Sign-In.",
        mobile: req.isMobile,
      });
    }

    if (!user.password) {
      console.log(
        "[loginUser] user has no password set (incomplete setup)",
        trimmedEmail
      );
      return res.status(401).json({
        success: false,
        message: "Account setup incomplete. Please reset your password.",
        mobile: req.isMobile,
      });
    }

    // Verify password using model method
    const isMatch = await user.comparePassword(trimmedPassword);

    if (!isMatch) {
      console.log("[loginUser] password mismatch for", trimmedEmail);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        mobile: req.isMobile,
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    // Mobile-optimized cookie settings
    const cookieOptions = {
      httpOnly: true,
      secure: true, // Always true for Vercel
      sameSite: "none", // ✅ MUST be "none" for cross-domain (frontend-backend on different domains)
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      domain: "mystore-drab.vercel.app", // ✅ Your FRONTEND domain
    };

    // For mobile, use more permissive settings
    if (req.isMobile) {
      cookieOptions.sameSite = "none";
      cookieOptions.secure = true;
    }

    // Add domain in production
    if (process.env.NODE_ENV === "production") {
      cookieOptions.domain = ".mystore-drab.vercel.app";
    }

    res.cookie("refreshToken", refreshToken, cookieOptions);

    // Mobile-optimized response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      isVerified: user.isVerified,
      profileCompleted: user.profileCompleted,
    };

    res.json({
      success: true,
      message: "Login successful",
      accessToken,
      user: userResponse,
      mobile: req.isMobile,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      mobile: req.isMobile,
    });
  }
};

/**
 * Admin login with environment variables
 */
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      // Create admin token with isAdmin flag
      const token = jwt.sign(
        {
          id: "admin",
          email: process.env.ADMIN_EMAIL,
          isAdmin: true,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "24h" }
      );

      res.json({ success: true, accessToken: token });
    } else {
      res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/**
 * JWT token verification middleware
 */
const verifyToken = (req, res, next) => {
  let token = req.header("Authorization")?.replace("Bearer ", "").trim();
  if (!token) token = req.header("token")?.trim();
  if (!token) token = req.query.token?.trim();
  if (!token && req.body) token = req.body.token?.trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Check if it's an admin token (created by adminLogin)
    if (decoded.isAdmin === true) {
      req.user.isAdmin = true;
      req.user.email = decoded.email || process.env.ADMIN_EMAIL;
    } else {
      req.user.isAdmin = false;
    }

    next();
  } catch (error) {
    // Specific error messages for different JWT errors
    let errorMessage = "Invalid token.";
    if (error.name === "TokenExpiredError") {
      errorMessage = "Token expired. Please log in again.";
    } else if (error.name === "JsonWebTokenError") {
      errorMessage = "Malformed token.";
    }

    return res.status(401).json({ success: false, message: errorMessage });
  }
};

/**
 * Refresh token verification middleware
 */
const verifyRefreshToken = (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Refresh token not provided.",
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: "Invalid refresh token." });
  }
};

/**
 * Get authenticated user's profile
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        phone: user.phone,
        address: user.address,
        profileCompleted: user.profileCompleted,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Update user profile information
 */
const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    // Find user and update
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, address },
      { new: true, runValidators: true }
    ).select("-password -refreshToken");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Enhanced profile completion check
    const isProfileComplete = !!(
      name?.trim() &&
      phone?.trim() &&
      address?.street?.trim() &&
      address?.city?.trim() &&
      address?.postalCode?.trim() &&
      address?.country?.trim()
    );

    // Update profile completion status if needed
    if (isProfileComplete !== user.profileCompleted) {
      user.profileCompleted = isProfileComplete;
      await user.save();
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        phone: user.phone,
        address: user.address,
        profileCompleted: user.profileCompleted,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Change user password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Input sanitization
    const trimmedCurrent = currentPassword.trim();
    const trimmedNew = newPassword.trim();

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google authentication. Password change not available.",
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(trimmedCurrent);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    if (trimmedNew.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    // Set new password - pre-save middleware will handle hashing
    user.password = trimmedNew;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Refresh access token using refresh token
 */
const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not provided",
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (verifyError) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Find user and check if refresh token matches
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    if (user.refreshToken !== refreshToken) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Update refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();

    // Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      domain:
        process.env.NODE_ENV === "production" ? "yourdomain.com" : "localhost",
    });

    res.json({ success: true, accessToken });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during token refresh",
    });
  }
};

/**
 * Logout user and clear refresh token
 */
const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Find user and clear refresh token
      try {
        const decoded = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );
        const user = await User.findById(decoded.id);

        if (user) {
          user.refreshToken = null;
          await user.save();
        }
      } catch (error) {
        // Continue with logout even if token verification fails
      }
    }

    /// ✅ Clear cookie with same settings
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      domain: "mystore-drab.vercel.app",
    });

    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/**
 * Get all users with pagination and filtering (Admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get search and filter parameters
    const search = req.query.search || "";
    const filter = req.query.filter || "all";

    // Build query
    let query = {};

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Filter users
    if (filter === "verified") {
      query.isVerified = true;
    } else if (filter === "unverified") {
      query.isVerified = false;
    } else if (filter === "google") {
      query.googleId = { $exists: true };
    } else if (filter === "regular") {
      query.googleId = { $exists: false };
    } else if (filter === "top") {
      // Get top customer IDs first
      const topCustomers = await orderModel.aggregate([
        {
          $match: { status: "Delivered" },
        },
        {
          $group: {
            _id: "$userId",
            totalRevenue: { $sum: "$amount" },
          },
        },
        {
          $sort: { totalRevenue: -1 },
        },
        {
          $limit: 50,
        },
      ]);

      const topCustomerIds = topCustomers.map((customer) => customer._id);
      query._id = { $in: topCustomerIds };
    }

    // Get users with pagination
    const users = await User.find(query)
      .select("-password -refreshToken")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get revenue data for all users in this page
    const userIds = users.map((user) => user._id.toString());

    const userRevenues = await orderModel.aggregate([
      {
        $match: {
          userId: { $in: userIds },
          status: "Delivered",
        },
      },
      {
        $group: {
          _id: "$userId",
          totalRevenue: { $sum: "$amount" },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    // Create a map for quick lookup
    const revenueMap = {};
    userRevenues.forEach((revenue) => {
      revenueMap[revenue._id] = {
        totalRevenue: revenue.totalRevenue,
        orderCount: revenue.orderCount,
      };
    });

    // Add revenue data to users
    const usersWithRevenue = users.map((user) => ({
      ...user.toObject(),
      revenueData: revenueMap[user._id.toString()] || {
        totalRevenue: 0,
        orderCount: 0,
      },
    }));

    // Get total count for pagination
    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      success: true,
      users: usersWithRevenue,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching users",
    });
  }
};

/**
 * Delete user account (Admin only)
 */
const deleteUser = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account.",
      });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while deleting user",
    });
  }
};

/**
 * Initiate password reset process
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const trimmedEmail = email.trim().toLowerCase();

    if (!validator.isEmail(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    const user = await User.findOne({ email: trimmedEmail });

    // Don't reveal if email exists or not for security
    if (!user) {
      return res.json({
        success: true,
        message: "If the email exists, a reset code has been sent",
      });
    }

    if (user.googleId) {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google authentication. Please use Google Sign-In.",
      });
    }

    // Generate reset code and set expiration (10 minutes)
    const resetCode = generateResetToken();
    const resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.resetCode = resetCode;
    user.resetCodeExpires = resetCodeExpires;
    await user.save();

    // Send reset email
    try {
      await sendPasswordResetEmail(user.email, user.name, resetCode);
      res.json({
        success: true,
        message: "If the email exists, a reset code has been sent",
      });
    } catch (emailError) {
      // Clean up the reset code if email fails
      user.resetCode = undefined;
      user.resetCodeExpires = undefined;
      await user.save();

      res.status(500).json({
        success: false,
        message: "Failed to send reset email. Please try again.",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during password reset request",
    });
  }
};

/**
 * Verify password reset code
 */
const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedCode = code.trim();

    // Find user by email
    const user = await User.findOne({ email: trimmedEmail });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset code",
      });
    }

    // Check if reset code matches and is not expired
    if (
      !user.resetCode ||
      user.resetCode !== trimmedCode ||
      new Date() > user.resetCodeExpires
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset code",
      });
    }

    res.json({
      success: true,
      message: "Reset code verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during code verification",
    });
  }
};

/**
 * Reset password with verified code
 */
const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = newPassword.trim();

    if (trimmedPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Find user by email
    const user = await User.findOne({ email: trimmedEmail });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset code",
      });
    }

    // Check reset code and expiration
    if (
      !user.resetCode ||
      user.resetCode !== code ||
      new Date() > user.resetCodeExpires
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset code",
      });
    }

    // Set new password - pre-save middleware will handle hashing
    user.password = trimmedPassword;
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during password reset",
    });
  }
};

/**
 * Delete user account (self-service)
 */
const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Prevent admin from deleting themselves if needed
    if (req.user.isAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin accounts cannot be deleted through this interface.",
      });
    }

    // Find and delete the user
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Optional: Delete user's orders and other related data
    try {
      await orderModel.deleteMany({ userId: userId });
    } catch (orderError) {
      // Continue with account deletion even if order deletion fails
    }

    res.json({
      success: true,
      message: "Account deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while deleting account",
    });
  }
};

export {
  loginUser,
  registerUser,
  adminLogin,
  getAllUsers,
  deleteUser,
  verifyToken,
  verifyRefreshToken,
  getUserProfile,
  updateUserProfile,
  changePassword,
  refreshToken,
  logoutUser,
  googleAuth,
  facebookAuth,
  verifyEmail,
  contactForm,
  resendVerificationEmail,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  deleteUserAccount,
  getUserOrdersSummary,
  getTopCustomers,
};
