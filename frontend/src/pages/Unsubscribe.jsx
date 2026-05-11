import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/newsletter/unsubscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(
          "You have been successfully unsubscribed from our newsletter."
        );
        setIsSuccess(true);
      } else {
        setMessage(data.message || "Unsubscribe failed. Please try again.");
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage("Unable to process your request. Please try again later.");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Unsubscribe from Newsletter
          </h1>

          {email ? (
            <>
              <p className="text-gray-600 mb-6">
                Are you sure you want to unsubscribe{" "}
                <strong className="text-gray-900">{email}</strong> from our
                newsletter?
              </p>

              <button
                onClick={handleUnsubscribe}
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
                aria-label={
                  isLoading
                    ? "Processing unsubscribe request"
                    : "Confirm unsubscribe from newsletter"
                }
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Yes, Unsubscribe Me"
                )}
              </button>
            </>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                No email address provided for unsubscribe.
              </p>
              <p className="text-sm text-gray-500">
                Please use the unsubscribe link from our newsletter email.
              </p>
            </div>
          )}

          {message && (
            <div
              className={`mt-6 p-3 rounded-md text-sm font-medium ${
                isSuccess
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
              role="alert"
              aria-live="polite"
            >
              {message}
            </div>
          )}

          {/* Additional information */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              You can resubscribe at any time by visiting our website and
              entering your email in the newsletter section.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unsubscribe;
