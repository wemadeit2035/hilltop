import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import axios from "axios";

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Status configuration with consistent color scheme
  const statusConfig = {
    "Order Placed": {
      label: "Order Placed",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      progressColor: "bg-blue-500",
      description: "Your order has been received and is being processed",
    },
    Packing: {
      label: "Packing",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      progressColor: "bg-purple-500",
      description: "Your items are being prepared for shipment",
    },
    Shipped: {
      label: "Shipped",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      progressColor: "bg-yellow-500",
      description: "Your order is on the way",
    },
    "Out for Delivery": {
      label: "Out for Delivery",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      progressColor: "bg-orange-500",
      description: "Your order will be delivered today",
    },
    Delivered: {
      label: "Delivered",
      color: "text-green-600",
      bgColor: "bg-green-100",
      progressColor: "bg-green-500",
      description: "Your order has been delivered",
    },
    Cancelled: {
      label: "Cancelled",
      color: "text-red-600",
      bgColor: "bg-red-100",
      progressColor: "bg-red-500",
      description: "Your order has been cancelled",
    },
    Returned: {
      label: "Returned",
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      progressColor: "bg-gray-500",
      description: "Your order has been returned",
    },
  };

  // Order tracking steps
  const orderSteps = [
    "Order Placed",
    "Packing",
    "Shipped",
    "Out for Delivery",
    "Delivered",
  ];

  const loadOrderData = async () => {
    try {
      if (!token) return;

      setIsLoading(true);
      const response = await axios.post(
        `${backendUrl}/api/order/userorders`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      // Error handled silently for production
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const filteredOrders =
    filterStatus === "all"
      ? orders
      : orders.filter((order) => order.status === filterStatus);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getOrderTotal = (order) => {
    return order.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  // Get the current step index for progress tracking
  const getCurrentStepIndex = (status) => {
    if (status === "Cancelled" || status === "Returned") {
      return -1; // Hide progress bar for cancelled/returned orders
    }
    return orderSteps.findIndex((step) => step === status);
  };

  // Simple SVG icons as React components
  const PackageIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
      />
    </svg>
  );

  const ChevronDown = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );

  const ChevronUp = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 15l7-7 7 7"
      />
    </svg>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto py-8">
          <Title text1={"MY"} text2={"ORDERS"} />
          <div className="mt-6 flex justify-center">
            <div className="animate-pulse text-gray-500 text-sm">
              Loading your orders...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-center px-4 md:px-6">
      <div className="max-w-6xl mx-auto py-8">
        <div className="text-4xl mb-6">
          <Title text1={"MY"} text2={"ORDERS"} />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between mt-6 mb-4 gap-3">
          <div className="flex items-center space-x-2">
            <label
              htmlFor="order-filter"
              className="text-gray-700 font-medium text-sm"
            >
              Filter:
            </label>
            <div className="relative">
              <select
                id="order-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                onFocus={() => setIsFilterOpen(true)}
                onBlur={() => setIsFilterOpen(false)}
                className="bg-gray-100 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none pr-8 cursor-pointer"
                aria-label="Filter orders by status"
              >
                <option value="all">All Orders</option>
                {Object.keys(statusConfig).map((status) => (
                  <option key={status} value={status}>
                    {statusConfig[status].label}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                {isFilterOpen ? <ChevronUp /> : <ChevronDown />}
              </div>
            </div>
          </div>

          <div className="text-gray-600 text-sm">
            {filteredOrders.length}{" "}
            {filteredOrders.length === 1 ? "order" : "orders"} found
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center mt-6">
            <div className="mx-auto text-3xl text-gray-400 mb-3">
              <PackageIcon />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">
              No orders found
            </h3>
            <p className="text-gray-500 text-sm">
              {filterStatus === "all"
                ? "You haven't placed any orders yet."
                : `You don't have any ${statusConfig[
                    filterStatus
                  ]?.label?.toLowerCase()} orders.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {filteredOrders.map((order) => {
              const currentStepIndex = getCurrentStepIndex(order.status);
              const currentStatusConfig =
                statusConfig[order.status] || statusConfig["Order Placed"];

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
                >
                  {/* Order Header */}
                  <div
                    className="p-3 md:p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleOrderExpand(order._id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleOrderExpand(order._id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-expanded={expandedOrder === order._id}
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      {/* Order info */}
                      <div className="text-center md:text-left">
                        <div className="flex items-center justify-center gap-1 md:gap-2 mb-1 md:justify-start">
                          <span className="text-xs text-gray-500">Order #</span>
                          <span className="font-medium text-xs md:text-sm">
                            {order._id.slice(-8).toUpperCase()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(order.date)}
                        </div>
                      </div>

                      {/* Status badge */}
                      <div className="flex justify-center md:justify-start">
                        <div
                          className={`inline-flex items-center gap-1 px-2 md:px-3 py-1 rounded-full ${currentStatusConfig.bgColor}`}
                        >
                          <span
                            className={`text-xs font-medium ${currentStatusConfig.color}`}
                          >
                            {currentStatusConfig.label}
                          </span>
                        </div>
                      </div>

                      {/* Total and expand button */}
                      <div className="flex items-center justify-between md:justify-end gap-2">
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Total</div>
                          <div className="font-medium text-sm md:text-base">
                            {currency}
                            {getOrderTotal(order).toFixed(2)}
                          </div>
                        </div>

                        <button className="text-gray-500 hover:text-gray-700">
                          {expandedOrder === order._id ? (
                            <ChevronUp />
                          ) : (
                            <ChevronDown />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Details (Collapsible) */}
                  {expandedOrder === order._id && (
                    <div className="p-3 md:p-4 bg-gray-50">
                      {/* Show different message for cancelled/returned orders */}
                      {order.status === "Cancelled" ||
                      order.status === "Returned" ? (
                        <div className="mb-4 md:mb-6">
                          <h4 className="font-medium text-gray-700 text-xs md:text-sm mb-2 md:mb-3">
                            Order Status
                          </h4>
                          <div className="bg-white p-2 md:p-3 rounded border border-gray-200">
                            <div
                              className={`inline-flex items-center gap-2 px-2 md:px-3 py-1 md:py-2 rounded-full ${currentStatusConfig.bgColor} mb-2 md:mb-3`}
                            >
                              <span
                                className={`text-xs md:text-sm font-medium ${currentStatusConfig.color}`}
                              >
                                {currentStatusConfig.label}
                              </span>
                            </div>
                            <p className="text-xs md:text-sm text-gray-600">
                              {currentStatusConfig.description}
                            </p>
                            {order.cancellationReason && (
                              <p className="text-xs md:text-sm text-gray-600 mt-2">
                                <strong>Reason:</strong>{" "}
                                {order.cancellationReason}
                              </p>
                            )}
                            {order.returnReason && (
                              <p className="text-xs md:text-sm text-gray-600 mt-2">
                                <strong>Reason:</strong> {order.returnReason}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Regular order tracking progress bar */
                        <div className="mb-4 md:mb-6">
                          <h4 className="font-medium text-gray-700 text-xs md:text-sm mb-2 md:mb-3">
                            Order Tracking
                          </h4>
                          <div className="bg-white p-2 md:p-3 rounded border border-gray-200">
                            {/* Desktop progress */}
                            <div className="hidden md:flex justify-between mb-3">
                              {orderSteps.map((step, index) => {
                                const stepConfig =
                                  statusConfig[step] ||
                                  statusConfig["Order Placed"];
                                const isCompleted = index <= currentStepIndex;
                                const isCurrent = index === currentStepIndex;

                                return (
                                  <div
                                    key={step}
                                    className="flex flex-col items-center w-1/5"
                                  >
                                    <div
                                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                        isCompleted
                                          ? `${stepConfig.progressColor} text-white`
                                          : "bg-gray-200 text-gray-500"
                                      } ${
                                        isCurrent
                                          ? "ring-2 ring-offset-1 ring-blue-300"
                                          : ""
                                      }`}
                                    >
                                      {index + 1}
                                    </div>
                                    <div
                                      className={`text-xs mt-1 text-center ${
                                        isCompleted
                                          ? "font-medium text-gray-800"
                                          : "text-gray-600"
                                      }`}
                                    >
                                      {step}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Mobile progress */}
                            <div className="md:hidden mb-2">
                              <div className="flex justify-between items-center mb-2">
                                <div className="text-xs text-gray-600">
                                  Progress:
                                </div>
                                <div className="text-xs font-medium">
                                  {currentStepIndex + 1} of {orderSteps.length}
                                </div>
                              </div>
                              <div className="relative h-2 bg-gray-200 rounded-full">
                                <div
                                  className={`absolute top-0 left-0 h-full rounded-full ${currentStatusConfig.progressColor}`}
                                  style={{
                                    width: `${
                                      (currentStepIndex /
                                        (orderSteps.length - 1)) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>

                            <div className="mt-2 text-xs text-gray-600">
                              <p className="font-medium">
                                Status: {currentStatusConfig.label}
                              </p>
                              <p className="mt-1">
                                {currentStatusConfig.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 mb-3 md:mb-4">
                        <div>
                          <h4 className="font-medium text-gray-700 text-xs md:text-sm mb-1 md:mb-2">
                            Delivery Address
                          </h4>
                          <div className="bg-white p-2 md:p-3 rounded border border-gray-200 text-xs">
                            <p className="font-medium">{order.address?.name}</p>
                            <p className="text-gray-600 mt-1">
                              {order.address?.street}
                            </p>
                            <p className="text-gray-600">
                              {order.address?.city}, {order.address?.postalCode}
                            </p>
                            <p className="text-gray-600">
                              {order.address?.country}
                            </p>
                            <p className="text-gray-600 mt-1">
                              Phone: {order.address?.phone}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-700 text-xs md:text-sm mb-1 md:mb-2">
                            Payment Information
                          </h4>
                          <div className="bg-white p-2 md:p-3 rounded border border-gray-200 text-xs">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-gray-600">Method:</span>
                              <span className="font-medium capitalize">
                                {order.paymentMethod}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Status:</span>
                              <span
                                className={`font-medium ${
                                  order.payment
                                    ? "text-green-600"
                                    : "text-yellow-600"
                                }`}
                              >
                                {order.payment ? "Paid" : "Pending"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-gray-600">Amount:</span>
                              <span className="font-medium">
                                {currency}
                                {order.amount?.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <h4 className="font-medium text-gray-700 text-xs md:text-sm mb-2 md:mb-3">
                        Order Items
                      </h4>
                      <div className="space-y-2 md:space-y-3">
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-white rounded border border-gray-200"
                          >
                            {(() => {
                              // Normalize image source: accept array or string
                              const rawImg = Array.isArray(item.image)
                                ? item.image[0]
                                : item.image;
                              const imgSrc = rawImg || null;
                              const placeholder =
                                'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="10">No Image</text></svg>';

                              return (
                                <img
                                  src={imgSrc || placeholder}
                                  alt={item.name || "product image"}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = placeholder;
                                  }}
                                  className="block flex-shrink-0 w-10 h-10 md:w-12 md:h-12 object-cover rounded"
                                />
                              );
                            })()}

                            <div className="flex-grow min-w-0">
                              <h5 className="font-medium text-gray-900 text-xs md:text-sm truncate">
                                {item.name}
                              </h5>
                              <div className="flex flex-wrap gap-1 md:gap-2 mt-1 text-xs text-gray-600">
                                {item.size && <span>Size: {item.size}</span>}
                                <span>Qty: {item.quantity}</span>
                                <span>
                                  {currency}
                                  {item.price}
                                </span>
                              </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <div className="font-medium text-gray-900 text-xs md:text-sm">
                                {currency}
                                {(item.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200 flex justify-end">
                        <div className="text-right space-y-1 text-xs md:text-sm">
                          <div className="flex items-center gap-2 md:gap-3">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium">
                              {currency}
                              {getOrderTotal(order).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 md:gap-3">
                            <span className="text-gray-600">Shipping:</span>
                            <span className="font-medium">{currency}50.00</span>
                          </div>
                          <div className="flex items-center gap-2 md:gap-3">
                            <span className="text-gray-800 font-medium">
                              Total:
                            </span>
                            <span className="font-bold text-green-600">
                              {currency}
                              {(getOrderTotal(order) + 50).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
