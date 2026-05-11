import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";
import { AdminContext } from "../context/AdminContext";

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userOrders, setUserOrders] = useState(null);
  const [topCustomers, setTopCustomers] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);

  const { token, backendUrl } = useContext(AdminContext);

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

  // Memoized fetch functions
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setMessage("");
      const response = await axios.get(
        `${backendUrl}/api/user/admin/users?page=${pagination.currentPage}&limit=10&search=${searchTerm}&filter=${filter}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        setMessage("Access denied. Admin privileges required.");
      } else {
        setMessage("Error fetching users");
      }
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage, searchTerm, filter, token, backendUrl]);

  const fetchTopCustomers = useCallback(async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/user/admin/top-customers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setTopCustomers(response.data.topCustomers);
      }
    } catch (error) {
      // Silently fail for top customers, it's not critical
    }
  }, [token, backendUrl]);

  const fetchUserOrders = useCallback(
    async (userId) => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/user/admin/users/${userId}/orders`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setUserOrders(response.data.data);
        }
      } catch (error) {
        setUserOrders(null);
      }
    },
    [token, backendUrl]
  );

  // Memoized handlers
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  }, []);

  const handleFilterChange = useCallback((e) => {
    setFilter(e.target.value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleViewUser = useCallback(
    async (user) => {
      setSelectedUser(user);
      setShowUserModal(true);
      await fetchUserOrders(user._id);
    },
    [fetchUserOrders]
  );

  const handleDeleteClick = useCallback((user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  }, []);

  // Memoized utility functions
  const isTopCustomer = useCallback((user) => {
    return user.revenueData?.totalRevenue > 0;
  }, []);

  const getUserRank = useCallback(
    (user) => {
      if (!user.revenueData?.totalRevenue) return null;

      const sortedUsers = [...users].sort(
        (a, b) =>
          (b.revenueData?.totalRevenue || 0) -
          (a.revenueData?.totalRevenue || 0)
      );

      return sortedUsers.findIndex((u) => u._id === user._id) + 1;
    },
    [users]
  );

  const formatDate = useCallback((dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Invalid Date";
    }
  }, []);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount || 0);
  }, []);

  const getAuthType = useCallback((user) => {
    return user.googleId ? "Google" : "Email";
  }, []);

  // Memoized delete function
  const deleteUser = useCallback(async () => {
    if (!userToDelete) return;

    setActionLoading(userToDelete._id);
    try {
      const response = await axios.delete(
        `${backendUrl}/api/user/admin/users/${userToDelete._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setMessage("User deleted successfully");
        setUsers((prev) =>
          prev.filter((user) => user._id !== userToDelete._id)
        );
        setPagination((prev) => ({
          ...prev,
          totalUsers: prev.totalUsers - 1,
        }));
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setMessage("User not found or already deleted");
      } else if (error.response?.status === 403) {
        setMessage("Access denied. Admin privileges required.");
      } else if (error.response?.status === 400) {
        setMessage(error.response.data.message || "Cannot delete this user");
      } else {
        setMessage("Error deleting user");
      }
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
      setActionLoading(null);
      setTimeout(() => setMessage(""), 4000);
    }
  }, [userToDelete, token, backendUrl]);

  // Effects
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchTopCustomers();
  }, [fetchTopCustomers]);

  // Memoized loading skeleton
  const LoadingSkeleton = useMemo(
    () => (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="animate-pulse">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    []
  );

  // Memoized error message component
  const MessageDisplay = useMemo(
    () =>
      message && (
        <div
          className={`p-3 mb-6 rounded-md ${
            message.includes("Error") ||
            message.includes("Failed") ||
            message.includes("denied")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message}
        </div>
      ),
    [message]
  );

  // Memoized top customers section
  const TopCustomersSection = useMemo(
    () =>
      topCustomers.length > 0 && (
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-white text-lg font-semibold mb-2">
            Top Customers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topCustomers.slice(0, 3).map((customer, index) => (
              <div
                key={customer.userId}
                className="bg-white bg-opacity-20 p-3 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-white font-bold text-lg mr-2">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="text-white font-medium">{customer.name}</p>
                      <p className="text-white text-opacity-80 text-sm">
                        {formatCurrency(customer.totalRevenue)}
                      </p>
                    </div>
                  </div>
                  <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                    🏆
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    [topCustomers, formatCurrency]
  );

  // Memoized pagination component
  const PaginationComponent = useMemo(() => {
    if (pagination.totalPages <= 1) return null;

    const renderPageNumbers = () => {
      const pages = [];
      const maxPagesToShow = 5;

      let startPage = Math.max(
        1,
        pagination.currentPage - Math.floor(maxPagesToShow / 2)
      );
      let endPage = Math.min(
        pagination.totalPages,
        startPage + maxPagesToShow - 1
      );

      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
              pagination.currentPage === i
                ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
            }`}
          >
            {i}
          </button>
        );
      }
      return pages;
    };

    return (
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:flex-1 sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {(pagination.currentPage - 1) * 10 + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(pagination.currentPage * 10, pagination.totalUsers)}
              </span>{" "}
              of <span className="font-medium">{pagination.totalUsers}</span>{" "}
              results
            </p>
          </div>
          <div>
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                  pagination.hasPrev
                    ? "bg-white text-gray-500 hover:bg-gray-50"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <span className="sr-only">Previous</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {renderPageNumbers()}

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                  pagination.hasNext
                    ? "bg-white text-gray-500 hover:bg-gray-50"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <span className="sr-only">Next</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  }, [pagination, handlePageChange]);

  if (isLoading && users.length === 0) {
    return (
      <div className="container mx-auto max-w-full overflow-x-hidden">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse mb-6"></div>
        {LoadingSkeleton}
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-full overflow-x-hidden">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">User Management</h1>

      {MessageDisplay}

      {TopCustomersSection}

      {/* Search and Filter */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <form onSubmit={handleSearch} className="w-full md:flex-1">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
              >
                Search
              </button>
            </div>
          </form>

          <div className="w-full md:w-auto">
            <div className="relative">
              <select
                value={filter}
                onChange={handleFilterChange}
                disabled={isLoading}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 appearance-none pr-8"
              >
                <option value="all">All Users</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
                <option value="google">Google Users</option>
                <option value="regular">Regular Users</option>
                <option value="top">Top Customers</option>
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

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          LoadingSkeleton
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                      Auth
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                      Status
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                      Revenue
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                      Joined
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user._id}>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10">
                              <img
                                className="h-8 w-8 md:h-10 md:w-10 rounded-full"
                                src={
                                  user.profileImage ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    user.name || "User"
                                  )}&background=random`
                                }
                                alt={user.name || "User"}
                                onError={(e) => {
                                  e.target.src = `https://ui-avatars.com/api/?name=User&background=random`;
                                }}
                              />
                            </div>
                            <div className="ml-2 md:ml-4">
                              <div className="flex items-center">
                                {/* UPDATED: Show first name only on mobile, full name on desktop */}
                                <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] md:max-w-none">
                                  <span className="md:hidden">
                                    {user.name
                                      ? user.name.split(" ")[0]
                                      : "Unknown User"}
                                  </span>
                                  <span className="hidden md:inline">
                                    {user.name || "Unknown User"}
                                  </span>
                                </div>
                                {isTopCustomer(user) && (
                                  <span className="ml-2 bg-yellow-200 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                                    🏆#{getUserRank(user)}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs md:text-sm text-gray-500 truncate max-w-[120px] md:max-w-none">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap hidden sm:table-cell">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {getAuthType(user)}
                          </span>
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap hidden md:table-cell">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.isVerified
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {user.isVerified ? "Verified" : "Unverified"}
                          </span>
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                          {formatCurrency(user.revenueData?.totalRevenue)}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                              title="View User"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(user)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                              title="Delete User"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-8 text-center text-sm text-gray-500"
                      >
                        <svg
                          className="w-12 h-12 mx-auto text-gray-300 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                          />
                        </svg>
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {PaginationComponent}
          </>
        )}
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-xl font-semibold">User Details</h3>
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setUserOrders(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mt-4">
                <div className="flex items-center mb-6">
                  <img
                    className="h-16 w-16 rounded-full"
                    src={
                      selectedUser.profileImage ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        selectedUser.name || "User"
                      )}&background=random`
                    }
                    alt={selectedUser.name || "User"}
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=User&background=random`;
                    }}
                  />
                  <div className="ml-4">
                    <div className="flex items-center">
                      <h4 className="text-lg font-semibold">
                        {selectedUser.name || "Unknown User"}
                      </h4>
                      {isTopCustomer(selectedUser) && (
                        <span className="ml-3 bg-yellow-200 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
                          🏆#{getUserRank(selectedUser)}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">{selectedUser.email}</p>
                  </div>
                </div>

                {/* Order Statistics Card */}
                {userOrders && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h5 className="font-semibold text-gray-700 mb-3">
                      Order Statistics
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {userOrders.totalOrders || 0}
                        </div>
                        <div className="text-sm text-gray-600">
                          Total Orders
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {userOrders.deliveredOrders || 0}
                        </div>
                        <div className="text-sm text-gray-600">Delivered</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {userOrders.cancelledOrders || 0}
                        </div>
                        <div className="text-sm text-gray-600">Cancelled</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {userOrders.returnedOrders || 0}
                        </div>
                        <div className="text-sm text-gray-600">Returned</div>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {formatCurrency(userOrders.totalRevenue)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Revenue Generated
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">
                      Account Information
                    </h5>
                    <div className="space-y-2">
                      <p className="break-all">
                        <span className="font-medium">User ID:</span>{" "}
                        {selectedUser._id}
                      </p>
                      <p>
                        <span className="font-medium">Authentication:</span>{" "}
                        {getAuthType(selectedUser)}
                      </p>
                      <p>
                        <span className="font-medium">Status:</span>
                        <span
                          className={`ml-2 px-2 py-1 text-xs rounded-full ${
                            selectedUser.isVerified
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {selectedUser.isVerified ? "Verified" : "Unverified"}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Joined:</span>{" "}
                        {formatDate(selectedUser.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">
                      Contact Information
                    </h5>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Phone:</span>{" "}
                        {selectedUser.phone || "Not provided"}
                      </p>
                      {selectedUser.address && (
                        <>
                          <p>
                            <span className="font-medium">Address:</span>{" "}
                            {selectedUser.address.street || "Not provided"}
                          </p>
                          <p>
                            <span className="font-medium">City:</span>{" "}
                            {selectedUser.address.city || "Not provided"}
                          </p>
                          <p>
                            <span className="font-medium">Province:</span>{" "}
                            {selectedUser.address.province || "Not provided"}
                          </p>
                          <p>
                            <span className="font-medium">Postal Code:</span>{" "}
                            {selectedUser.address.postalCode || "Not provided"}
                          </p>
                          <p>
                            <span className="font-medium">Country:</span>{" "}
                            {selectedUser.address.country || "Not provided"}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Orders */}
                {userOrders &&
                  userOrders.orders &&
                  userOrders.orders.length > 0 && (
                    <div className="mt-6">
                      <h5 className="font-medium text-gray-700 mb-3">
                        Recent Orders
                      </h5>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Order ID
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Amount
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                Date
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {userOrders.orders.map((order) => (
                              <tr key={order._id}>
                                <td className="px-4 py-2 text-sm">
                                  {order._id?.substring(0, 8) || "N/A"}...
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  {formatCurrency(order.amount)}
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  {/* UPDATE THIS PART - Replace the existing span with this: */}
                                  <span
                                    className={`px-2 py-1 rounded-md text-xs font-medium ${
                                      statusColors[order.status] ||
                                      statusColors["Order Placed"]
                                    }`}
                                  >
                                    {order.status || "Unknown"}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  {formatDate(order.date)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setUserOrders(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-red-600 mb-4">
                Confirm Deletion
              </h3>
              <p className="mb-4">
                Are you sure you want to delete the user{" "}
                <strong>{userToDelete.name || "Unknown User"}</strong> (
                {userToDelete.email})? This action cannot be undone.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={actionLoading === userToDelete._id}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteUser}
                  disabled={actionLoading === userToDelete._id}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading === userToDelete._id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    "Delete User"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(AdminUserManagement);
