import mongoose from "mongoose";

/**
 * Product Schema for E-commerce Platform
 * Defines the structure for product documents in MongoDB
 */
const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  image: { 
    type: Array, 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  subCategory: { 
    type: String, 
    required: true 
  },
  sizes: { 
    type: Array, 
    required: true 
  },
  bestseller: { 
    type: Boolean 
  },
  date: { 
    type: Number, 
    required: true 
  },
});

// Create or retrieve the Product model
const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;