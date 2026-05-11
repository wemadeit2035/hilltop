import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";

/**
 * Add a new product to the database
 * Handles img upload to Cloudinary and product creation
 */
const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
    } = req.body;

    // Extract uploaded img from request files
    const image1 = (req.files.image1 && req.files?.image1?.[0]) || null;
    const image2 = (req.files.image2 && req.files?.image2?.[0]) || null;
    const image3 = (req.files.image3 && req.files?.image3?.[0]) || null;
    const image4 = (req.files.image4 && req.files?.image4?.[0]) || null;

    // Filter out null img and get file paths
    const image = [image1, image2, image3, image4].filter(Boolean);
    const imagePaths = image.map((img) => img.path);

    // Upload img to Cloudinary and get secure URLs
    const imageUrl = await Promise.all(
      image.map(async (item) => {
        const result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );

    // Prepare product data for database
    const productData = {
      name,
      description,
      category,
      price: Number(price),
      subCategory,
      bestseller: bestseller === "true",
      sizes: JSON.parse(sizes),
      image: imageUrl,
      date: Date.now(),
    };

    // Create and save new product
    const product = new productModel(productData);
    await product.save();

    res.json({
      success: true,
      message: "Product added successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Automatically update bestseller status based on units sold
 * Products with over 20 units sold get bestseller status
 */
const updateBestsellerStatus = async () => {
  try {
    // Get units sold data
    const products = await productModel.find({});
    const unitsSoldByName = await orderModel.aggregate([
      {
        $match: {
          status: "Delivered",
        },
      },
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: "$items.name",
          unitsSold: { $sum: "$items.quantity" },
        },
      },
    ]);

    // Create mapping from product names to IDs
    const productNameToId = {};
    products.forEach((product) => {
      productNameToId[product.name] = product._id.toString();
    });

    // Update bestseller status for products with over 20 units sold
    let updatedCount = 0;

    for (const item of unitsSoldByName) {
      if (item._id && productNameToId[item._id] && item.unitsSold >= 20) {
        await productModel.findByIdAndUpdate(productNameToId[item._id], {
          bestseller: true,
        });
        updatedCount++;
      }
    }

    return updatedCount;
  } catch (error) {
    throw error;
  }
};

/**
 * Manually trigger bestseller status update
 * Admin endpoint for immediate bestseller recalculation
 */
const triggerBestsellerUpdate = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const updatedCount = await updateBestsellerStatus();

    res.json({
      success: true,
      message: `Bestseller status updated for ${updatedCount} products`,
      updatedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while updating bestseller status",
    });
  }
};

/**
 * PUBLIC version - get units sold for product bestseller badges
 * No authentication required
 */
const getPublicProductUnitsSold = async (req, res) => {
  try {
    // Get all products first
    const products = await productModel.find({});

    // Get units sold by product name - ONLY FOR DELIVERED ORDERS
    const unitsSoldByName = await orderModel.aggregate([
      {
        $match: {
          status: "Delivered",
        },
      },
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: "$items.name",
          unitsSold: { $sum: "$items.quantity" },
        },
      },
    ]);

    // Create mapping of product names to IDs
    const productNameToId = {};
    const unitsSoldMap = {};

    products.forEach((product) => {
      productNameToId[product.name] = product._id.toString();
    });

    // Convert to product ID mapping
    unitsSoldByName.forEach((item) => {
      if (item._id && productNameToId[item._id]) {
        unitsSoldMap[productNameToId[item._id]] = item.unitsSold;
      }
    });

    res.json({
      success: true,
      unitsSold: unitsSoldMap,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching product units sold data",
    });
  }
};

/**
 * Get units sold for each product from delivered orders
 * Admin-only access to sales analytics data
 */
const getProductUnitsSold = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    // Get all products first
    const products = await productModel.find({});

    // Get units sold by product name - ONLY FOR DELIVERED ORDERS
    const unitsSoldByName = await orderModel.aggregate([
      {
        $match: {
          status: "Delivered",
        },
      },
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: "$items.name",
          unitsSold: { $sum: "$items.quantity" },
        },
      },
    ]);

    // Create mapping of product names to IDs and update bestseller status
    const productNameToId = {};
    const unitsSoldMap = {};
    let matchedProducts = 0;
    let bestsellerUpdates = 0;

    products.forEach((product) => {
      productNameToId[product.name] = product._id.toString();
    });

    // Convert to product ID mapping and check bestseller status
    unitsSoldByName.forEach((item) => {
      if (item._id && productNameToId[item._id]) {
        unitsSoldMap[productNameToId[item._id]] = item.unitsSold;
        matchedProducts++;

        // Auto-update bestseller status if over 20 units sold
        if (item.unitsSold >= 20) {
          productModel
            .findByIdAndUpdate(
              productNameToId[item._id],
              { bestseller: true },
              { new: true }
            )
            .then((updatedProduct) => {
              if (updatedProduct) {
                bestsellerUpdates++;
              }
            });
        }
      }
    });

    res.json({
      success: true,
      unitsSold: unitsSoldMap,
      summary: {
        totalProductsWithSales: matchedProducts,
        totalDeliveredOrdersCounted: unitsSoldByName.length,
        bestsellerUpdates,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching product units sold data",
    });
  }
};

/**
 * Get products with mobile optimization
 */
const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({}).sort({ _id: -1 });

    // Mobile-optimized response
    let optimizedProducts = products;

    if (req.isMobile) {
      optimizedProducts = products.map((product) => ({
        _id: product._id,
        name: product.name,
        description:
          product.description?.substring(0, 100) +
          (product.description?.length > 100 ? "..." : ""),
        price: product.price,
        category: product.category,
        subCategory: product.subCategory,
        image: product.image?.[0] || "", // Only first image for mobile
        bestseller: product.bestseller || false,
        inStock: product.inStock !== undefined ? product.inStock : true,
        sizes: product.sizes || [],
      }));
    }

    res.json({
      success: true,
      products: optimizedProducts,
      mobile: req.isMobile,
      count: products.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      mobile: req.isMobile,
    });
  }
};

/**
 * Remove a product from the database
 * Permanently deletes product document
 */
const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({
      success: true,
      message: "Product removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get single product with mobile optimization
 */
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        mobile: req.isMobile,
      });
    }

    let optimizedProduct = {
      _id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      subCategory: product.subCategory,
      image: product.image || [], // ALWAYS return full image array
      bestseller: product.bestseller || false,
      inStock: product.inStock !== undefined ? product.inStock : true,
      sizes: product.sizes || [],
      date: product.date,
    };

    res.json({
      success: true,
      product: optimizedProduct,
      mobile: req.isMobile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      mobile: req.isMobile,
    });
  }
};

/**
 * Update existing product information
 * Supports partial updates of product data
 */
const updateProduct = async (req, res) => {
  try {
    const updated = await productModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Return updated document
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      product: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  listProducts,
  addProduct,
  removeProduct,
  singleProduct,
  updateProduct,
  getProductUnitsSold,
  getPublicProductUnitsSold,
  updateBestsellerStatus,
  triggerBestsellerUpdate,
};
