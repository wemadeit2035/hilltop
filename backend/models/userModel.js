import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

/**
 * User Schema for E-commerce Platform
 * Handles both traditional and Google OAuth authentication
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: function () {
        // Password not required if user signs in via Google OR Facebook
        return !this.googleId && !this.facebookId;
      },
      minlength: 8,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    facebookId: {
      type: String,
      sparse: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    refreshToken: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      province: { type: String, default: "" },
      postalCode: { type: String, default: "" },
      country: { type: String, default: "" },
    },
    cartData: {
      type: Object,
      default: {},
    },
    resetCode: {
      type: String,
      default: null,
    },
    resetCodeExpires: {
      type: Date,
      default: null,
    },
    lastActive: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: Date.now },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { minimize: false, timestamps: true }
);

// Indexes for performance optimization
userSchema.index({ resetCode: 1 });
userSchema.index({ verificationToken: 1 });
userSchema.index({ refreshToken: 1 });
userSchema.index({ isVerified: 1, isAdmin: 1 });
userSchema.index({ lastActive: -1 });

/**
 * Pre-save middleware for password hashing
 * Automatically hashes password before saving if modified
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance method to compare candidate password with stored hash
 * @param {string} candidatePassword - Password to verify
 * @returns {Promise<boolean>} - Password match result
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Update user's last active timestamp
 * Used for tracking user activity and session management
 */
userSchema.methods.updateLastActive = function () {
  this.lastActive = new Date();
  return this.save({ validateBeforeSave: false });
};

/**
 * Static method to find user by email (case-insensitive)
 * @param {string} email - User email address
 * @returns {Promise<Object>} - User document
 */
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

/**
 * Static method to find user by Google ID
 * @param {string} googleId - Google OAuth ID
 * @returns {Promise<Object>} - User document
 */
userSchema.statics.findByGoogleId = function (googleId) {
  return this.findOne({ googleId });
};

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;
