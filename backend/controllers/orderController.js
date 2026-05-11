import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import paypal from "@paypal/checkout-server-sdk";
import {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
} from "../utils/emailService.js";

// Configuration constants
const CURRENCY = "zar";
const DELIVERY_CHARGES = 50;

// Initialize Stripe gateway
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize PayPal environment
let paypalEnvironment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
// For production, use:
// let paypalEnvironment = new paypal.core.LiveEnvironment(
//   process.env.PAYPAL_CLIENT_ID,
//   process.env.PAYPAL_CLIENT_SECRET
// );
let paypalClient = new paypal.core.PayPalHttpClient(paypalEnvironment);

/**
 * Place order using Cash on Delivery (COD) method
 * Creates order, clears user cart, and sends confirmation email
 */
const placeOrder = async (req, res) => {
  try {
    const { items, amount, address } = req.body;
    const userId = req.user.id;

    // Process address to handle field name differences
    const processedAddress = {
      name:
        address.firstName && address.lastName
          ? `${address.firstName} ${address.lastName}`
          : address.name || "",
      email: address.email || "",
      phone: address.phone || "",
      street: address.street || "",
      city: address.city || "",
      province: address.province || "",
      postalCode: address.postalCode || "",
      country: address.country || "",
    };

    const orderData = {
      userId,
      items,
      address: processedAddress,
      amount,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // Clear user's cart after successful order
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // Send order confirmation email
    try {
      const user = await userModel.findById(userId);
      const freshOrder = await orderModel.findById(newOrder._id);
      await sendOrderConfirmationEmail(user.email, user.name, freshOrder);
    } catch (emailError) {
      // Don't fail the request if email fails
    }

    return res.json({
      success: true,
      message: "Order placed successfully",
      orderId: newOrder._id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while placing order",
    });
  }
};

/**
 * Place order using Stripe payment gateway
 * Creates order and redirects to Stripe Checkout
 */
const placeOrderStripe = async (req, res) => {
  try {
    const { items, amount, address } = req.body;
    const userId = req.user.id;
    const { origin } = req.headers;

    // Process address to handle field name differences
    const processedAddress = {
      name:
        address.firstName && address.lastName
          ? `${address.firstName} ${address.lastName}`
          : address.name || "",
      email: address.email || "",
      phone: address.phone || "",
      street: address.street || "",
      city: address.city || "",
      province: address.province || address.province || "",
      postalCode: address.postalCode || address.postalCode || "",
      country: address.country || "",
    };

    const orderData = {
      userId,
      items,
      address: processedAddress,
      amount,
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // Create line items for Stripe Checkout
    const line_items = items.map((item) => ({
      price_data: {
        currency: CURRENCY,
        product_data: {
          name: item.name,
          image: item.image || [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Add delivery charges
    line_items.push({
      price_data: {
        currency: CURRENCY,
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: DELIVERY_CHARGES * 100,
      },
      quantity: 1,
    });

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}&method=stripe`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}&method=stripe`,
      line_items,
      mode: "payment",
      metadata: {
        orderId: newOrder._id.toString(),
        userId: userId.toString(),
      },
    });

    return res.json({
      success: true,
      session_url: session.url,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Payment gateway error",
    });
  }
};

/**
 * Place order using PayPal payment gateway
 * Creates order and redirects to PayPal Checkout
 */
const placeOrderPaypal = async (req, res) => {
  try {
    const { items, amount, address } = req.body;
    const userId = req.user.id;
    const { origin } = req.headers;

    // Process address to handle field name differences
    const processedAddress = {
      name:
        address.firstName && address.lastName
          ? `${address.firstName} ${address.lastName}`
          : address.name || "",
      email: address.email || "",
      phone: address.phone || "",
      street: address.street || "",
      city: address.city || "",
      province: address.province || "",
      postalCode: address.postalCode || "",
      country: address.country || "",
    };

    const orderData = {
      userId,
      items,
      address: processedAddress,
      amount,
      paymentMethod: "PayPal",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // Create PayPal order request
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD", // PayPal typically uses USD, but you can use 'ZAR'
            value: amount.toString(),
          },
          description: `Order #${newOrder._id}`,
          custom_id: newOrder._id.toString(),
        },
      ],
      application_context: {
        brand_name: "Your Store Name",
        landing_page: "BILLING",
        user_action: "PAY_NOW",
        return_url: `${origin}/verify?success=true&orderId=${newOrder._id}&method=paypal`,
        cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}&method=paypal`,
      },
    });

    const paypalOrder = await paypalClient.execute(request);

    // Update order with PayPal order ID
    newOrder.paypalOrderId = paypalOrder.result.id;
    await newOrder.save();

    // Find the approval URL
    const approvalLink = paypalOrder.result.links.find(
      (link) => link.rel === "approve"
    );

    return res.json({
      success: true,
      approval_url: approvalLink.href,
    });
  } catch (error) {
    console.error("PayPal order creation error:", error);
    return res.status(500).json({
      success: false,
      message: "PayPal payment gateway error",
    });
  }
};

/**
 * Capture PayPal payment and update order status
 */
const capturePaypalPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    // Find the order
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Capture the PayPal payment
    const request = new paypal.orders.OrdersCaptureRequest(order.paypalOrderId);
    request.requestBody({});

    const capture = await paypalClient.execute(request);

    if (capture.result.status === "COMPLETED") {
      // Update order status
      order.payment = true;
      order.status = "paid";
      order.paypalCaptureId = capture.result.id;
      order.paypalPayerId = capture.result.payer.payer_id;
      await order.save();

      // Clear user's cart
      await userModel.findByIdAndUpdate(userId, { cartData: {} });

      // Send confirmation email
      try {
        const user = await userModel.findById(userId);
        const freshOrder = await orderModel.findById(orderId);
        await sendOrderConfirmationEmail(user.email, user.name, freshOrder);
      } catch (emailError) {
        // Continue even if email fails
      }

      return res.json({
        success: true,
        message: "Payment completed successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Payment not completed",
      });
    }
  } catch (error) {
    console.error("PayPal capture error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during PayPal payment capture",
    });
  }
};

/**
 * Verify payment and update order status
 * Handles both Stripe and PayPal payments
 */
const verifyStripe = async (req, res) => {
  const { orderId, success, method } = req.body;
  const userId = req.user.id;

  try {
    if (success === "true") {
      if (method === "stripe") {
        // Stripe verification
        await orderModel.findByIdAndUpdate(orderId, {
          payment: true,
          status: "paid",
        });

        // Clear user's cart after successful payment
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        // Send order confirmation email
        try {
          const freshOrder = await orderModel.findById(orderId);
          const user = await userModel.findById(userId);
          await sendOrderConfirmationEmail(user.email, user.name, freshOrder);
        } catch (emailError) {
          // Continue even if email fails
        }
      }
      // For PayPal, we handle capture separately

      return res.json({
        success: true,
        message: "Payment completed successfully",
      });
    } else {
      // Remove order if payment was cancelled
      await orderModel.findByIdAndDelete(orderId);
      return res.json({
        success: false,
        message: "Payment was cancelled",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error during payment verification",
    });
  }
};

/**
 * Stripe webhook handler for payment events
 * Processes completed checkout sessions asynchronously
 */
const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle completed checkout sessions
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      await orderModel.findByIdAndUpdate(session.metadata.orderId, {
        payment: true,
        status: "paid",
      });

      await userModel.findByIdAndUpdate(session.metadata.userId, {
        cartData: {},
      });

      // Send order confirmation email
      try {
        const freshOrder = await orderModel.findById(session.metadata.orderId);
        const user = await userModel.findById(session.metadata.userId);
        await sendOrderConfirmationEmail(user.email, user.name, freshOrder);
      } catch (emailError) {
        // Continue even if email fails
      }
    } catch (error) {
      // Log error but don't fail webhook
    }
  }

  return res.json({ received: true });
};

/**
 * Get order history for authenticated user
 * Returns orders sorted by most recent first
 */
const userOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await orderModel.find({ userId }).sort({ date: -1 });

    return res.json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
    });
  }
};

/**
 * Get all orders for admin panel
 * Includes user information for order management
 */
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).populate("userId", "name email");

    return res.json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching all orders",
    });
  }
};

/**
 * Update order status from admin panel
 * Handles automatic payment completion for COD orders upon delivery
 * Sends status update emails to customers
 */
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    // Get the current order first to compare status
    const currentOrder = await orderModel.findById(orderId);

    if (!currentOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Auto-complete payment for COD orders when delivered
    let updateData = { status };
    let paymentUpdated = false;

    if (
      status === "Delivered" &&
      currentOrder.paymentMethod === "COD" &&
      !currentOrder.payment
    ) {
      updateData.payment = true;
      paymentUpdated = true;
    }

    // Update the order status (and payment if applicable)
    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    );

    // Send email notification if status changed
    if (currentOrder.status !== status) {
      try {
        const user = await userModel.findById(currentOrder.userId);
        if (user && user.email) {
          await sendOrderStatusUpdateEmail(
            user.email,
            user.name,
            updatedOrder,
            status
          );
        }
      } catch (emailError) {
        // Continue even if email fails
      }
    }

    return res.json({
      success: true,
      message: "Order status updated successfully",
      paymentUpdated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while updating order status",
    });
  }
};

/**
 * Test email functionality for order confirmations
 * Admin tool for verifying email service integration
 */
const testOrderEmail = async (req, res) => {
  try {
    const testOrder = await orderModel.findOne().sort({ date: -1 });

    if (!testOrder) {
      return res.status(404).json({
        success: false,
        message: "No orders found for testing",
      });
    }

    const user = await userModel.findById(testOrder.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found for test order",
      });
    }

    await sendOrderConfirmationEmail(user.email, user.name, testOrder);

    return res.json({
      success: true,
      message: "Test email sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while sending test email",
    });
  }
};

export {
  verifyStripe,
  placeOrder,
  placeOrderStripe,
  placeOrderPaypal,
  capturePaypalPayment,
  stripeWebhook,
  allOrders,
  userOrders,
  updateStatus,
  testOrderEmail,
};
