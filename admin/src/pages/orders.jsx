import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { AdminContext } from "../context/AdminContext";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);
  const { token, logout } = useContext(AdminContext);

  const topRef = useRef(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(50);

  // Memoized constants
  const statusOptions = useMemo(
    () => [
      "Order Placed",
      "Packing",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
      "Returned",
    ],
    []
  );

  const statusColors = useMemo(
    () => ({
      "Order Placed": "bg-blue-100 text-blue-800 border border-blue-200",
      Packing: "bg-purple-100 text-purple-800 border border-purple-200",
      Shipped: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      "Out for Delivery":
        "bg-orange-100 text-orange-800 border border-orange-200",
      Delivered: "bg-green-100 text-green-800 border border-green-200",
      Cancelled: "bg-red-100 text-red-800 border border-red-200",
      Returned: "bg-gray-100 text-gray-800 border border-gray-200",
    }),
    []
  );

  // Memoized fetch function with error handling
  const fetchAllOrders = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await axios.post(
        backendUrl + "/api/order/list",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const sortedOrders = response.data.orders.reverse();
        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders);
        setCurrentPage(1);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
      } else if (error.response?.status === 403) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  // Memoized status handler
  const statusHandler = useCallback(
    async (event, orderId) => {
      const newStatus = event.target.value;
      setActionLoading(orderId);

      try {
        const response = await axios.post(
          backendUrl + "/api/order/status",
          { orderId, status: newStatus },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          await fetchAllOrders();
        }
      } catch (error) {
        if (error.response?.status === 401) {
          logout();
        }
      } finally {
        setActionLoading(null);
      }
    },
    [token, fetchAllOrders, logout]
  );

  // Memoized filter function
  const applyFilters = useCallback(() => {
    let result = [...orders];

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (order) =>
          order._id.toLowerCase().includes(term) ||
          order.address?.name?.toLowerCase().includes(term) ||
          order.address?.email?.toLowerCase().includes(term) ||
          order.items?.some((item) => item.name?.toLowerCase().includes(term))
      );
    }

    setFilteredOrders(result);
    setCurrentPage(1);
  }, [orders, statusFilter, searchTerm]);

  // Memoized order statistics
  const stats = useMemo(() => {
    // Filter out cancelled and returned orders for total count
    const activeOrders = orders.filter(
      (order) => !["Cancelled", "Returned"].includes(order.status)
    );

    const totalOrders = activeOrders.length;
    const totalRevenue = activeOrders.reduce((sum, order) => {
      // Only count revenue from delivered orders
      if (order.status === "Delivered") {
        return sum + (order.amount || 0);
      }
      return sum;
    }, 0);

    const pendingOrders = activeOrders.filter(
      (order) => order.status !== "Delivered"
    ).length;

    const deliveredOrders = activeOrders.filter(
      (order) => order.status === "Delivered"
    ).length;

    const cancelledOrders = orders.filter(
      (order) => order.status === "Cancelled"
    ).length;

    const returnedOrders = orders.filter(
      (order) => order.status === "Returned"
    ).length;

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      returnedOrders,
    };
  }, [orders]);

  // Memoized pagination calculations
  const paginationData = useMemo(() => {
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(
      indexOfFirstOrder,
      indexOfLastOrder
    );
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    return {
      currentOrders,
      totalPages,
      indexOfFirstOrder: indexOfFirstOrder + 1,
      indexOfLastOrder: Math.min(indexOfLastOrder, filteredOrders.length),
    };
  }, [currentPage, ordersPerPage, filteredOrders]);

  // Memoized page numbers
  const pageNumbers = useMemo(() => {
    const { totalPages } = paginationData;
    const maxPagesToShow = 5;
    const pageNumbers = [];

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  }, [currentPage, paginationData.totalPages]);

  // Navigation functions
  const goToNextPage = useCallback(() => {
    if (currentPage < paginationData.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, paginationData.totalPages]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const goToPage = useCallback(
    (pageNumber) => {
      if (pageNumber >= 1 && pageNumber <= paginationData.totalPages) {
        setCurrentPage(pageNumber);
      }
    },
    [paginationData.totalPages]
  );

  // Effects
  useEffect(() => {
    if (token) {
      fetchAllOrders();
    }
  }, [token, fetchAllOrders]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Scroll to top when currentPage changes
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentPage]);

  // Loading skeleton component
  const OrderSkeleton = () => (
    <div className="animate-pulse">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-3">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="lg:col-span-3">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-28"></div>
            </div>
            <div className="lg:col-span-4">
              <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="lg:col-span-2">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Error component
  const ErrorMessage = ({ onRetry }) => (
    <div className="text-center py-8">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-12 mx-auto text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900">
        Failed to load orders
      </h3>
      <p className="mt-1 text-xs text-gray-500">Please try again</p>
      <button
        onClick={onRetry}
        className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div>
      <div ref={topRef} />
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Order Management</h1>
        <p className="text-sm text-gray-600">
          Manage and track all customer orders
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
          <div className="flex items-start gap-2">
            <div className="rounded-full bg-blue-100 p-1.5 flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-600 truncate">
                Total Orders
              </p>
              <p className="text-base font-semibold text-gray-800 truncate">
                {stats.totalOrders}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
          <div className="flex items-start gap-2">
            <div className="rounded-full bg-green-100 p-1.5 flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-600 truncate">
                Revenue
              </p>
              <p className="text-base font-semibold text-gray-800 truncate">
                {currency}
                {stats.totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
          <div className="flex items-start gap-2">
            <div className="rounded-full bg-orange-100 p-1.5 flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 text-orange-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-600 truncate">
                Pending
              </p>
              <p className="text-base font-semibold text-gray-800 truncate">
                {stats.pendingOrders}
              </p>
            </div>
          </div>
        </div>

        {/* Cancelled Orders Card */}
        <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
          <div className="flex items-start gap-2">
            <div className="rounded-full bg-red-100 p-1.5 flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-600 truncate">
                Cancelled
              </p>
              <p className="text-base font-semibold text-gray-800 truncate">
                {stats.cancelledOrders}
              </p>
            </div>
          </div>
        </div>

        {/* Returned Orders Card */}
        <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
          <div className="flex items-start gap-2">
            <div className="rounded-full bg-gray-100 p-1.5 flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-600 truncate">
                Returned
              </p>
              <p className="text-base font-semibold text-gray-800 truncate">
                {stats.returnedOrders}
              </p>
            </div>
          </div>
        </div>

        {/* Delivered Orders */}
        <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
          <div className="flex items-start gap-2">
            <div className="rounded-full bg-teal-100 p-1.5 flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 text-teal-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-600 truncate">
                Delivered
              </p>
              <p className="text-base font-semibold text-gray-800 truncate">
                {stats.deliveredOrders}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Search Orders
            </label>
            <input
              type="text"
              placeholder="Search by ID, name, email, or items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8"
              >
                <option value="all">All Statuses</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination Info */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-4">
        <div className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1 w-full text-center sm:text-left sm:w-auto">
          Showing {paginationData.indexOfFirstOrder} to{" "}
          {paginationData.indexOfLastOrder} of {filteredOrders.length} orders
        </div>

        {/* Pagination Controls - Centered on mobile, right-aligned on desktop */}
        {paginationData.totalPages > 1 && (
          <div className="flex items-center justify-center space-x-1 sm:space-x-2 order-1 sm:order-2 w-full sm:w-auto">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`p-1 sm:p-2 rounded-md ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              <FaChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>

            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => goToPage(pageNumber)}
                className={`px-2 py-1 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm ${
                  currentPage === pageNumber
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              onClick={goToNextPage}
              disabled={currentPage === paginationData.totalPages}
              className={`p-1 sm:p-2 rounded-md ${
                currentPage === paginationData.totalPages
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              <FaChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        {loading ? (
          <OrderSkeleton />
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No orders found
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Try adjusting your search or filter
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {paginationData.currentOrders.map((order) => (
              <div
                key={order._id}
                className="p-4 hover:bg-gray-100 transition-colors duration-150"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                  {/* Order ID & Status */}
                  <div className="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col justify-between">
                    <div className="mb-2">
                      <h3 className="text-sm font-semibold text-gray-800">
                        Order #{order._id?.slice(-8).toUpperCase() || "N/A"}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {order.date
                          ? new Date(order.date).toLocaleString()
                          : "Date not available"}
                      </p>
                    </div>
                    <div className="flex items-start">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          statusColors[order.status] ||
                          statusColors["Order Placed"]
                        }`}
                      >
                        {order.status || "Unknown"}
                      </span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="lg:col-span-3 border-l border-gray-200 pl-3">
                    <h4 className="text-xs font-medium text-gray-700 mb-1">
                      Customer
                    </h4>
                    <p className="text-xs font-medium">
                      {order.address?.name || "N/A"}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {order.address?.email || "No email"}
                    </p>
                    <p className="text-xs text-gray-600">
                      {order.address?.phone || "No phone"}
                    </p>
                  </div>

                  {/* Order Items */}
                  <div className="lg:col-span-4 border-l border-gray-200 pl-3">
                    <h4 className="text-xs font-medium text-gray-700 mb-1">
                      Items ({order.items?.length || 0})
                    </h4>
                    <div className="text-xs text-gray-800">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="truncate">
                            {item.name || "Unknown Item"} ({item.size || "N/A"})
                            × {item.quantity || 0}
                          </span>
                          <span className="ml-2 whitespace-nowrap">
                            {currency}
                            {((item.price || 0) * (item.quantity || 0)).toFixed(
                              2
                            )}
                          </span>
                        </div>
                      )) || "No items"}
                    </div>
                    <div className="flex justify-between text-xs font-medium mt-1 pt-1 border-t border-gray-100">
                      <span>Total:</span>
                      <span>
                        {currency}
                        {(order.amount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="lg:col-span-2 border-l border-gray-200 pl-3 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-medium text-gray-700 mb-1">
                        Payment
                      </h4>
                      <p className="text-xs capitalize">
                        {order.paymentMethod || "Unknown"}
                      </p>
                      <p
                        className={`text-xs font-medium ${
                          order.payment ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {order.payment ? "Completed" : "Pending"}
                      </p>
                    </div>
                    <div className="mt-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Update Status
                      </label>
                      <div className="relative">
                        <select
                          onChange={(event) => statusHandler(event, order._id)}
                          value={order.status || ""}
                          disabled={actionLoading === order._id}
                          className="w-full p-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed appearance-none pr-6"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-1 pointer-events-none">
                          <svg
                            className="w-3 h-3 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                      {actionLoading === order._id && (
                        <div className="text-xs text-gray-500 mt-1">
                          Updating...
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <h4 className="text-xs font-medium text-gray-700 mb-1">
                    Delivery Address
                  </h4>
                  <p className="text-xs text-gray-800">
                    {order.address
                      ? `${order.address.street || ""}, ${
                          order.address.city || ""
                        }, ${order.address.province || ""}, ${
                          order.address.postalCode || ""
                        }`
                      : "Address not available"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Pagination Controls */}
      {paginationData.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mt-4">
          <div className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
            Page {currentPage} of {paginationData.totalPages}
          </div>

          <div className="flex items-center space-x-2 order-1 sm:order-2">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              Previous
            </button>

            <button
              onClick={goToNextPage}
              disabled={currentPage === paginationData.totalPages}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm ${
                currentPage === paginationData.totalPages
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Orders);
