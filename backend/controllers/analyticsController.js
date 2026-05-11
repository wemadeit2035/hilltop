import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Newsletter from "../models/newsletterModel.js";

/**
 * Get comprehensive analytics data for admin dashboard
 * Provides sales, revenue, customer, and product analytics
 * Only includes delivered orders for accurate revenue reporting
 */
export const getAnalyticsData = async (req, res) => {
  try {
    const { startDate, endDate, timeRange = "monthly" } = req.query;

    let start, end;

    // Calculate date range based on timeRange parameter
    switch (timeRange) {
      case "weekly":
        start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
        end = new Date();
        break;
      case "monthly":
        start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
        end = new Date();
        break;
      case "yearly":
        start = new Date(new Date().getFullYear(), 0, 1); // Start of current year
        end = new Date();
        break;
      default:
        // Use custom date range if provided, otherwise default to monthly
        start = startDate
          ? new Date(startDate)
          : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        end = endDate ? new Date(endDate) : new Date();
    }

    // Base match filter for DELIVERED orders only (accurate revenue reporting)
    const deliveredOrdersMatch = {
      status: "Delivered",
      date: { $gte: start.getTime(), $lte: end.getTime() },
    };

    // Base match filter for ALL orders (for comparison metrics)
    const allOrdersMatch = {
      date: { $gte: start.getTime(), $lte: end.getTime() },
    };

    // Total platform counts
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalSubscribers = await Newsletter.countDocuments({
      isSubscribed: true,
    });
    
    // Count ALL orders except cancelled and returned for completion rate calculation
    const totalOrdersInRange = await Order.countDocuments({
      date: { $gte: start.getTime(), $lte: end.getTime() },
      status: { $nin: ["Cancelled", "Returned"] },
    });

    // Count delivered orders within the date range
    const deliveredOrders = await Order.countDocuments(deliveredOrdersMatch);

    /**
     * REVENUE CALCULATIONS - ONLY DELIVERED ORDERS
     * Ensures accurate revenue reporting by only counting completed sales
     */
    const revenueData = await Order.aggregate([
      {
        $match: deliveredOrdersMatch,
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          avgOrderValue: { $avg: "$amount" },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
    const avgOrderValue = revenueData.length > 0 ? revenueData[0].avgOrderValue : 0;
    const deliveredOrderCount = revenueData.length > 0 ? revenueData[0].orderCount : 0;

    /**
     * SALES BY CATEGORY ANALYSIS - ONLY DELIVERED ORDERS
     * Provides insights into product category performance
     */
    const categorySales = await Order.aggregate([
      {
        $match: deliveredOrdersMatch,
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.category",
          name: { $first: "$items.category" },
          value: {
            $sum: {
              $multiply: ["$items.quantity", "$items.price"],
            },
          },
          totalSales: { $sum: "$items.quantity" },
        },
      },
      {
        $match: {
          _id: { $ne: null, $exists: true },
        },
      },
      { $sort: { value: -1 } },
    ]);

    /**
     * TIME SERIES DATA - ONLY DELIVERED ORDERS
     * Provides trend analysis for revenue and order patterns
     */
    let groupByFormat;
    switch (timeRange) {
      case "weekly":
        groupByFormat = {
          year: { $year: { $toDate: { $multiply: ["$date", 1] } } },
          week: { $week: { $toDate: { $multiply: ["$date", 1] } } },
        };
        break;
      case "monthly":
        groupByFormat = {
          year: { $year: { $toDate: { $multiply: ["$date", 1] } } },
          month: { $month: { $toDate: { $multiply: ["$date", 1] } } },
        };
        break;
      case "yearly":
        groupByFormat = {
          year: { $year: { $toDate: { $multiply: ["$date", 1] } } },
        };
        break;
      default:
        groupByFormat = {
          year: { $year: { $toDate: { $multiply: ["$date", 1] } } },
          month: { $month: { $toDate: { $multiply: ["$date", 1] } } },
        };
    }

    const timeSeriesData = await Order.aggregate([
      {
        $match: deliveredOrdersMatch,
      },
      {
        $group: {
          _id: groupByFormat,
          totalRevenue: { $sum: "$amount" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1 } },
    ]);

    // Format time series data for frontend consumption
    const formattedTimeSeriesData = timeSeriesData.map((item) => {
      let name;
      switch (timeRange) {
        case "weekly":
          name = `Week ${item._id.week}, ${item._id.year}`;
          break;
        case "monthly":
          const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
          ];
          name = `${monthNames[item._id.month - 1]} ${item._id.year}`;
          break;
        case "yearly":
          name = `${item._id.year}`;
          break;
        default:
          name = `${item._id.year}-${item._id.month}`;
      }

      return {
        name,
        sales: item.totalRevenue,
        orders: item.orderCount,
      };
    });

    /**
     * BEST SELLERS ANALYSIS - ONLY DELIVERED ORDERS
     * Identifies top-performing products by revenue and quantity
     */
    const bestSellersFromSales = await Order.aggregate([
      {
        $match: deliveredOrdersMatch,
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          name: { $first: "$items.name" },
          sales: { $sum: "$items.quantity" },
          revenue: {
            $sum: {
              $multiply: ["$items.quantity", "$items.price"],
            },
          },
          isBestseller: { $first: "$items.bestseller" },
          category: { $first: "$items.category" },
          price: { $first: "$items.price" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]);

    /**
     * CUSTOMER METRICS - ONLY DELIVERED ORDERS
     * Analyzes customer behavior and retention patterns
     */
    const customerOrders = await Order.aggregate([
      {
        $match: deliveredOrdersMatch,
      },
      {
        $group: {
          _id: "$userId",
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$amount" },
        },
      },
    ]);

    const returningCustomers = customerOrders.filter(
      (c) => c.orderCount > 1
    ).length;
    const newCustomers = customerOrders.filter(
      (c) => c.orderCount === 1
    ).length;
    const conversionRate = totalUsers > 0 ? (customerOrders.length / totalUsers) * 100 : 0;

    // Calculate active users (online in last 15 minutes)
    const onlineUsers = await User.countDocuments({
      lastActive: { $gte: new Date(Date.now() - 15 * 60 * 1000) },
    });

    // Calculate order completion rate
    const completionRate = totalOrdersInRange > 0
      ? ((deliveredOrderCount / totalOrdersInRange) * 100).toFixed(1)
      : 0;

    return res.json({
      success: true,
      summary: {
        totalRevenue,
        totalOrders: totalOrdersInRange,
        totalUsers,
        totalProducts,
        totalSubscribers,
        avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
        deliveredOrders: deliveredOrderCount,
        onlineUsers,
        completionRate: `${completionRate}%`,
      },
      salesData: formattedTimeSeriesData,
      categoryData: categorySales,
      bestSellers: bestSellersFromSales.length > 0 ? bestSellersFromSales : [],
      customerMetrics: {
        returningCustomers,
        newCustomers,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
      },
      timeRange: {
        current: timeRange,
        start: start.toISOString(),
        end: end.toISOString(),
      },
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false,
      message: "Server error while fetching analytics data" 
    });
  }
};