import express from "express";
import { getAnalyticsData } from "../controllers/analyticsController.js";
import adminAuth from "../middleware/adminAuth.js";

const analyticsRouter = express.Router();

// ========================
// ANALYTICS DASHBOARD ROUTES
// SEO Note: Analytics routes are internal admin tools
// Provides business intelligence and performance metrics
// ========================

/**
 * GET /analytics
 * Admin-only endpoint for comprehensive business analytics
 * Returns sales, revenue, customer, and product performance data
 * Supports time range filtering for trend analysis
 * SEO: Internal admin tool - should not be indexed by search engines
 */
analyticsRouter.get("/", adminAuth, getAnalyticsData);

export default analyticsRouter;