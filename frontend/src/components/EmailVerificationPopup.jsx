import React, { useEffect, useState } from "react";

const EmailVerificationPopup = ({ email, onClose, onResend }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenClosed, setHasBeenClosed] = useState(false);

  useEffect(() => {
    // Only show if hasn't been closed
    if (!hasBeenClosed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [hasBeenClosed]);

  const handleClose = () => {
    setIsVisible(false);
    setHasBeenClosed(true);
    onClose();
  };

  const handleResend = () => {
    // Close the popup when resend is clicked
    setIsVisible(false);
    setHasBeenClosed(true);
    onResend();
  };

  // Don't show if user has closed the popup
  if (hasBeenClosed) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
    >
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-200 max-w-sm p-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 mt-1 flex-shrink-0 bg-blue-500 rounded flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-300 text-sm mb-1">
              Verify Your Email
            </h3>
            <p className="text-white text-xs mb-2">
              Verification sent to: <span className="font-medium">{email}</span>
            </p>
            <p className="text-gray-400 text-xs mb-3">
              Check your inbox and click the verification link.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleResend}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
              >
                Resend
              </button>
              <button
                onClick={handleClose}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-xs font-medium transition-colors"
              >
                Later
              </button>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none p-1"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPopup;