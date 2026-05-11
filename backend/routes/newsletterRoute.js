import express from "express";
import {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  getNewsletterStatus,
  getNewsletterSubscribers,
  deleteNewsletterSubscriber,
} from "../controllers/newsletterController.js";
import { verifyToken } from "../controllers/userController.js";

const newsletterRouter = express.Router();

// ========================
// NEWSLETTER MANAGEMENT ROUTES
// SEO Note: Newsletter endpoints handle email marketing subscriptions
// Public routes for user subscriptions, protected routes for admin analytics
// ========================

/**
 * POST /newsletter/subscribe
 * Public endpoint for newsletter subscriptions
 * Allows users to subscribe to marketing communications
 * SEO: This endpoint supports lead generation and user engagement
 */
newsletterRouter.post("/subscribe", subscribeToNewsletter);

/**
 * POST /newsletter/unsubscribe
 * Public endpoint for subscription management
 * Provides GDPR-compliant unsubscribe functionality
 * SEO: Essential for email marketing compliance and user trust
 */
newsletterRouter.post("/unsubscribe", unsubscribeFromNewsletter);

newsletterRouter.get("/status/:email", verifyToken, getNewsletterStatus);

/**
 * GET /newsletter/subscribers
 * Protected admin endpoint for subscriber analytics
 * Requires JWT authentication with admin privileges
 * SEO: Internal admin tool - should not be indexed by search engines
 */
newsletterRouter.get("/subscribers", verifyToken, getNewsletterSubscribers);
// Admin-only delete subscriber
newsletterRouter.delete(
  "/subscribers/:id",
  verifyToken,
  deleteNewsletterSubscriber,
);

export default newsletterRouter;
