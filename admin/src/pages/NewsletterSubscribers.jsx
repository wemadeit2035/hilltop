import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { backendUrl } from "../App";

const NewsletterSubscribers = ({ token }) => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [showSubscribed, setShowSubscribed] = useState(true);
  const [error, setError] = useState(null);

  // Memoized fetch function with error handling
  const fetchSubscribers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${backendUrl}/api/newsletter/subscribers?page=${currentPage}&limit=20&subscribed=${showSubscribed}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        setSubscribers(response.data.subscribers);
        setTotalPages(response.data.totalPages);
        setTotalSubscribers(response.data.totalSubscribers);
      }
    } catch (error) {
      setError("Failed to fetch subscribers");
    } finally {
      setLoading(false);
    }
  }, [currentPage, showSubscribed, token]);

  // Memoized CSV export function
  const handleExportCSV = useCallback(() => {
    try {
      const csvContent = [
        ["Email", "Name", "Date", "Source", "Status"],
        ...subscribers.map((sub) => [
          sub.email,
          sub.name || "N/A",
          new Date(sub.subscribedAt).toLocaleDateString(),
          sub.source,
          sub.isSubscribed ? "Subscribed" : "Unsubscribed",
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `newsletter-subscribers-${
        showSubscribed ? "subscribed" : "unsubscribed"
      }-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError("Failed to export CSV");
    }
  }, [subscribers, showSubscribed]);

  // Delete subscriber (admin)
  const handleDeleteSubscriber = useCallback(
    async (id) => {
      if (!window.confirm("Are you sure you want to delete this subscriber?")) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        await axios.delete(`${backendUrl}/api/newsletter/subscribers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setSubscribers((prev) => prev.filter((s) => s._id !== id));
        setTotalSubscribers((prev) => Math.max(prev - 1, 0));
      } catch (err) {
        setError("Failed to delete subscriber");
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  // Memoized date formatter
  const formatDate = useCallback((dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Invalid Date";
    }
  }, []);

  // Memoized toggle handler
  const toggleSubscriptionView = useCallback(() => {
    setShowSubscribed((prev) => !prev);
    setCurrentPage(1);
  }, []);

  // Memoized toggle button style
  const toggleButtonStyle = useMemo(() => {
    return showSubscribed
      ? "bg-green-500 hover:bg-green-600"
      : "bg-red-500 hover:bg-red-600";
  }, [showSubscribed]);

  // Memoized pagination handlers
  const goToPreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  // Memoized loading component
  const LoadingSkeleton = useMemo(
    () => (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="animate-pulse">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    [],
  );

  // Memoized error component
  const ErrorMessage = useMemo(
    () => (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <div className="text-red-600 mb-2">
          <svg
            className="w-6 h-6 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p className="text-red-800 text-sm mb-3">{error}</p>
        <button
          onClick={fetchSubscribers}
          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    ),
    [error, fetchSubscribers],
  );

  // Effects
  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  if (loading && subscribers.length === 0) {
    return (
      <>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
            <div className="h-10 bg-gray-200 rounded w-full sm:w-32 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-full sm:w-32 animate-pulse"></div>
          </div>
        </div>
        {LoadingSkeleton}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-3">
          <p className="text-lg sm:text-xl font-semibold">
            Newsletter Subscribers
          </p>
          <span
            className={`px-2.5 py-1 rounded-full text-sm font-medium ${
              showSubscribed
                ? "bg-green-200 text-green-800 border border-green-500"
                : "bg-red-200 text-red-800 border border-red-500"
            }`}
          >
            {totalSubscribers}
          </span>
        </div>
        <div className="flex gap-4">
          {/* Toggle Button */}
          <button
            onClick={toggleSubscriptionView}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${toggleButtonStyle}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              {showSubscribed ? (
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              )}
            </svg>
            {showSubscribed ? "Subscribed" : "Unsubscribed"}
            <svg
              className="w-3 h-3 opacity-80"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={loading || subscribers.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && ErrorMessage}

      {/* Subscribers Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          LoadingSkeleton
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                    Name
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                    Subscribed
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscribers.length > 0 ? (
                  subscribers.map((subscriber) => (
                    <tr key={subscriber._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-blue-600 truncate max-w-[120px] md:max-w-none">
                          {subscriber.email}
                        </div>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                        {subscriber.name || "N/A"}
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                        {formatDate(subscriber.subscribedAt)}
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell capitalize">
                        {subscriber.source}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            subscriber.isSubscribed
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {subscriber.isSubscribed
                            ? "Subscribed"
                            : "Unsubscribed"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleDeleteSubscriber(subscriber._id)}
                          disabled={loading}
                          className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Delete
                        </button>
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
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      No {showSubscribed ? "subscribed" : "unsubscribed"}{" "}
                      subscribers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1 || loading}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
          >
            Previous
          </button>

          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages || loading}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
};

export default React.memo(NewsletterSubscribers);
