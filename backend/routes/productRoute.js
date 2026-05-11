import express from "express";
import {
  listProducts,
  addProduct,
  removeProduct,
  singleProduct,
  updateProduct,
  getProductUnitsSold,
  triggerBestsellerUpdate,
  getPublicProductUnitsSold,
} from "../controllers/productController.js";
import upload from "../middleware/multer.js";
import { adminLogin, verifyToken } from "../controllers/userController.js";
import adminAuth from "../middleware/adminAuth.js";

const productRouter = express.Router();

/**
 * PRODUCT ROUTES
 * 
 * SEO Note: These API endpoints are structured for internal use only.
 * For public-facing SEO, ensure frontend routes are properly configured
 * with meta tags, structured data, and canonical URLs.
 */

// Admin-only routes
productRouter.post(
  "/add",
  adminAuth,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  addProduct
);

productRouter.post("/remove", adminAuth, removeProduct);

// Analytics route for admin sales data
productRouter.get('/units-sold', verifyToken, getProductUnitsSold);
productRouter.post('/bestseller-update', verifyToken, triggerBestsellerUpdate);

// Public product routes
productRouter.post("/single", singleProduct);
productRouter.get("/list", listProducts);
productRouter.get('/public/units-sold', getPublicProductUnitsSold);


// Admin authentication and product management
productRouter.post("/admin", adminLogin);
productRouter.put("/update/:id", updateProduct);

export default productRouter;