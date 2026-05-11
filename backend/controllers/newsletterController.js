import validator from "validator";
import Newsletter from "../models/newsletterModel.js";
import User from "../models/userModel.js";
import { sendNewsletterConfirmationEmail } from "../utils/emailService.js";

/**
 * Helper function for newsletter subscription management
 * Handles both new subscriptions and re-subscriptions
 */
const subscribeToNewsletterEmail = async (
  email,
  name = "",
  source = "website",
) => {
  try {
    const existingSubscription = await Newsletter.findOne({
      email: email.toLowerCase(),
    });

    if (existingSubscription) {
      if (existingSubscription.isSubscribed) {
        throw new Error("Email already subscribed");
      }

      // Re-subscribe existing user
      return await Newsletter.findOneAndUpdate(
        { email: email.toLowerCase() },
        {
          isSubscribed: true,
          name: name || existingSubscription.name,
          unsubscribedAt: null,
          source,
        },
        { new: true, upsert: true },
      );
    }

    // Create new subscription
    return await Newsletter.create({
      email: email.toLowerCase(),
      name,
      source,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Subscribe to newsletter endpoint
 * Handles new subscriptions with email confirmation
 */
const subscribeToNewsletter = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Valid email address is required",
      });
    }

    // Check if user exists in the system
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    // Reject if user doesn't exist
    if (!existingUser) {
      return res.status(403).json({
        success: false,
        message:
          "Only registered users can subscribe to our newsletter. Please create an account first.",
        needsRegistration: true,
      });
    }

    // Check if user exists and is verified
    const user = await User.findOne({ email: email.toLowerCase() });

    // If user exists in the system, they must have verified email
    if (user && !user.isVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your email before subscribing to our newsletter. Check your inbox for the verification link.",
        needsVerification: true,
      });
    }

    await subscribeToNewsletterEmail(email, name || "", "website");

    // Send confirmation email
    await sendNewsletterConfirmationEmail(email, name);

    return res.json({
      success: true,
      message: "Successfully subscribed to newsletter",
    });
  } catch (error) {
    if (error.code === 11000 || error.message === "Email already subscribed") {
      return res.status(400).json({
        success: false,
        message: "This email is already subscribed to our newsletter",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to subscribe to newsletter",
    });
  }
};

/**
 * Check newsletter subscription status for a user
 */
const getNewsletterStatus = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const subscription = await Newsletter.findOne({
      email: email.toLowerCase(),
    });

    return res.json({
      success: true,
      isSubscribed: subscription ? subscription.isSubscribed : false,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to check newsletter status",
    });
  }
};

/**
 * Unsubscribe from newsletter endpoint
 * Handles subscription cancellations with proper tracking
 */
const unsubscribeFromNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    const result = await Newsletter.findOneAndUpdate(
      { email: email.toLowerCase(), isSubscribed: true },
      {
        isSubscribed: false,
        unsubscribedAt: new Date(),
      },
      { new: true },
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Email not found in our newsletter subscriptions",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Successfully unsubscribed from newsletter",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to unsubscribe from newsletter",
    });
  }
};

/**
 * Get newsletter subscribers (Admin only)
 * Provides paginated list of subscribers with filtering options
 */
const getNewsletterSubscribers = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const { page = 1, limit = 50, subscribed = true } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
    };

    const query = { isSubscribed: subscribed === "true" };

    const subscribers = await Newsletter.paginate(query, options);

    return res.json({
      success: true,
      subscribers: subscribers.docs,
      totalPages: subscribers.totalPages,
      currentPage: subscribers.page,
      totalSubscribers: subscribers.totalDocs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch newsletter subscribers",
    });
  }
};

/**
 * Delete newsletter subscriber (Admin only)
 */
const deleteNewsletterSubscriber = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Admin access required" });
    }

    const id = req.params.id;

    const deleted = await Newsletter.findByIdAndDelete(id);

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Subscriber not found" });
    }

    return res.json({ success: true, message: "Subscriber deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete subscriber" });
  }
};

export {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  getNewsletterSubscribers,
  deleteNewsletterSubscriber,
  getNewsletterStatus,
};
