import mongoose from "mongoose";

/**
 * Order Schema for E-commerce Platform
 * Tracks customer orders, payments, and fulfillment status
 */
const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  address: {
    type: Object,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "Order Placed",
    enum: [
      "Order Placed",
      "Packing",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
      "Returned",
    ],
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  payment: {
    type: Boolean,
    required: true,
    default: false,
  },
  date: {
    type: Number,
    required: true,
  },
  cancellationReason: {
    type: String,
    default: "",
  },
  returnReason: {
    type: String,
    default: "",
  },
  // PayPal specific fields
  paypalOrderId: {
    type: String,
    default: "",
  },
  paypalPayerId: {
    type: String,
    default: "",
  },
  paypalCaptureId: {
    type: String,
    default: "",
  },
});

// Create indexes for better query performance
orderSchema.index({ userId: 1, date: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ date: -1 });
orderSchema.index({ paymentMethod: 1 });
orderSchema.index({ paypalOrderId: 1 }); // New index for PayPal

const orderModel =
  mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;
