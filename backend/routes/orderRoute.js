import express from "express";
import {
  placeOrder,
  placeOrderStripe,
  placeOrderPaypal,
  capturePaypalPayment,
  allOrders,
  userOrders,
  updateStatus,
  verifyStripe,
  stripeWebhook,
  testOrderEmail,
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";

const orderRouter = express.Router();

// ========================
// ADMIN ORDER MANAGEMENT ROUTES
// SEO Note: Admin routes are internal and should not be indexed
// Requires admin authentication for order management operations
// ========================

orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, updateStatus);
orderRouter.post("/test-email", adminAuth, testOrderEmail);

// ========================
// ORDER PLACEMENT ROUTES
// Handles COD, Stripe, and PayPal payment methods
// Requires user authentication for order creation
// ========================

orderRouter.post("/place", authUser, placeOrder);
orderRouter.post("/stripe", authUser, placeOrderStripe);
orderRouter.post("/paypal", authUser, placeOrderPaypal);

// ========================
// PAYMENT CAPTURE ROUTES
// Handles PayPal payment capture after approval
// ========================

orderRouter.post("/paypal/capture", authUser, capturePaypalPayment);

// ========================
// USER ORDER HISTORY ROUTES
// Provides order history and tracking for authenticated users
// ========================

orderRouter.post("/userorders", authUser, userOrders);

// ========================
// PAYMENT VERIFICATION ROUTES
// Handles Stripe payment confirmation and verification
// ========================

orderRouter.post("/verify", authUser, verifyStripe);

// ========================
// STRIPE WEBHOOK ROUTE
// External service integration - no authentication required
// Processes payment events asynchronously from Stripe
// SEO Note: Webhook routes are internal API endpoints
// ========================

orderRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

export default orderRouter;
