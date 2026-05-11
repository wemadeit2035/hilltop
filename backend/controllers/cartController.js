import userModel from "../models/userModel.js";

/**
 * Add products to user cart
 * Supports size-based product variations in cart
 */
const addToCart = async (req, res) => {
  try {
    const { itemId, size } = req.body;
    const userId = req.user.id;

    const userData = await userModel.findById(userId);

    if (!userData) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    let cartData = userData.cartData || {};

    // Initialize or update cart item with size variation
    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }

    await userModel.findByIdAndUpdate(userId, { cartData });

    return res.json({ 
      success: true, 
      message: "Item added to cart successfully" 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: "Server error while adding item to cart" 
    });
  }
};

/**
 * Update item quantity in user cart
 * Handles size-specific quantity modifications
 */
const updateCart = async (req, res) => {
  try {
    const { itemId, size, quantity } = req.body;
    const userId = req.user.id;

    const userData = await userModel.findById(userId);

    if (!userData) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    let cartData = userData.cartData || {};

    // Validate item exists in cart before updating
    if (!cartData[itemId]) {
      return res.status(404).json({ 
        success: false, 
        message: "Item not found in cart" 
      });
    }

    // Update quantity for specific size
    cartData[itemId][size] = quantity;
    await userModel.findByIdAndUpdate(userId, { cartData });

    return res.json({ 
      success: true, 
      message: "Cart updated successfully" 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: "Server error while updating cart" 
    });
  }
};

/**
 * Get user cart data
 * Retrieves complete cart contents for authenticated user
 */
const getUserCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const userData = await userModel.findById(userId);

    if (!userData) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    let cartData = userData.cartData || {};
    
    return res.json({ 
      success: true, 
      cartData 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: "Server error while retrieving cart data" 
    });
  }
};

/**
 * Remove item from user cart
 * Handles size-specific removal and clean up of empty items
 */
const removeFromCart = async (req, res) => {
  try {
    const { itemId, size } = req.body;
    const userId = req.user.id;

    const userData = await userModel.findById(userId);

    if (!userData) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    let cartData = userData.cartData || {};

    // Check if item exists in cart before removal
    if (cartData[itemId] && cartData[itemId][size]) {
      // Remove specific size variation
      delete cartData[itemId][size];
      
      // Clean up empty items
      if (Object.keys(cartData[itemId]).length === 0) {
        delete cartData[itemId];
      }
      
      await userModel.findByIdAndUpdate(userId, { cartData });
      
      return res.json({ 
        success: true, 
        message: "Item removed from cart successfully" 
      });
    } else {
      return res.status(404).json({ 
        success: false, 
        message: "Item not found in cart" 
      });
    }
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: "Server error while removing item from cart" 
    });
  }
};

export { addToCart, updateCart, getUserCart, removeFromCart };