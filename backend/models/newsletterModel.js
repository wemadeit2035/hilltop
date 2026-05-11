import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

/**
 * Newsletter Subscription Schema
 * Manages email subscriptions for marketing communications
 */
const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (email) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: "Invalid email format",
      },
    },
    name: {
      type: String,
      trim: true,
    },
    isSubscribed: {
      type: Boolean,
      default: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
    },
    source: {
      type: String,
      enum: ["website", "registration", "manual"],
      default: "website",
    },
  },
  {
    timestamps: true,
  }
);

// Index for optimized query performance
newsletterSchema.index({ isSubscribed: 1 });
newsletterSchema.index({ createdAt: -1 }); // For recent subscriptions

// Enable pagination plugin
newsletterSchema.plugin(mongoosePaginate);

const Newsletter = mongoose.model("Newsletter", newsletterSchema);
export default Newsletter;