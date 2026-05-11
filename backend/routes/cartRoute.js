import express from "express";
import {
  addToCart,
  getUserCart,
  updateCart,
  removeFromCart,
} from "../controllers/cartController.js";
import { verifyToken } from "../controllers/userController.js";

const cartRouter = express.Router();

// ========================
// CART MANAGEMENT ROUTES
// SEO Note: Cart routes are user-specific and require authentication
// All endpoints manage shopping cart operations for authenticated users
// ========================

/**
 * GET - Retrieve user's cart data
 * Returns complete cart contents with items and quantities
 */
cartRouter.get("/", verifyToken, getUserCart);
cartRouter.post("/get", verifyToken, getUserCart);
/**
 * POST - Add item to cart
 * Adds product with specific size to user's shopping cart
 */
cartRouter.post("/add", verifyToken, addToCart);

/**
 * POST - Update cart item quantity
 * Modifies quantity for specific item size in cart
 */
cartRouter.post("/update", verifyToken, updateCart);

/**
 * POST - Remove item from cart
 * Removes specific size variation of item from cart
 */
cartRouter.post("/remove", verifyToken, removeFromCart);

export default cartRouter;
