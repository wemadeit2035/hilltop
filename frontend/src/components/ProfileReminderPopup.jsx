import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";

const ProfileReminderPopup = ({ userProfile, onClose, onUpdateProfile }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenClosed, setHasBeenClosed] = useState(false);

  // Check if profile is incomplete
  const isProfileIncomplete = userProfile && 
    (!userProfile.profileCompleted || 
     !userProfile.phone || 
     !userProfile.address || 
     !userProfile.address.street || 
     !userProfile.address.city);

  useEffect(() => {
    // Only show if profile is incomplete and hasn't been closed
    if (isProfileIncomplete && !hasBeenClosed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isProfileIncomplete, hasBeenClosed]);

  const handleClose = () => {
    setIsVisible(false);
    setHasBeenClosed(true);
    onClose();
  };

  const handleUpdate = () => {
    setIsVisible(false);
    setHasBeenClosed(true);
    onUpdateProfile();
  };

  // Don't show if profile is complete or user has closed the popup
  if (!isProfileIncomplete || hasBeenClosed) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
    >
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-200 max-w-sm p-4">
        <div className="flex items-start gap-3">
          <img
            src={assets.profile}
            className="w-6 h-6 mt-1 flex-shrink-0 text-green-500"
            alt="Profile"
          />
          <div className="flex-1">
            <h3 className="font-medium text-gray-300 text-sm mb-1">
              Complete Your Profile
            </h3>
            <p className="text-white text-xs mb-3">
              Add your phone and address for a better shopping experience.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
              >
                Update Now
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

export default ProfileReminderPopup;