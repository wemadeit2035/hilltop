import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    setShowSearch,
    getCartCount,
    token,
    userProfile,
    logout,
    isProfileLoading, // Add this to your context value
  } = useContext(ShopContext);

  // Safe user name extraction with better fallbacks
  const getDisplayName = () => {
    // Show loading state
    if (isProfileLoading) {
      return "Loading...";
    }

    if (!userProfile || !userProfile.name) {
      return "User";
    }

    // Handle the name - split and get first name, or use full name
    const name = userProfile.name.trim();
    const firstName = name.split(" ")[0];
    return firstName || name;
  };

  const displayName = getDisplayName();

  // Only show search icon on non-collection pages
  const showSearchIcon = !location.pathname.includes("collection");

  const handleSearchClick = () => {
    if (location.pathname.includes("collection")) {
      setShowSearch(true);
    } else {
      navigate("/collection");
      setTimeout(() => setShowSearch(true), 100);
    }
  };

  const handleProfileClick = () => {
    if (token) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
  };

  return (
    <nav
      className="flex fixed top-0 left-0 right-0 items-center px-2 sm:px-6 lg:px-10 justify-between py-4 sm:py-5 font-medium bg-black w-full z-50" // Added fixed positioning and high z-index
      role="navigation"
      aria-label="Main navigation"
    >
      <Link to="/" aria-label="Home page">
        <img
          src={assets.logo}
          className="w-24 sm:w-28 md:w-30"
          alt="Company Logo"
        />{" "}
        {/* Responsive logo */}
      </Link>

      <ul
        className="hidden sm:flex gap-4 lg:gap-5 text-sm text-white"
        role="menubar"
      >
        {" "}
        {/* Responsive gap */}
        <li role="none">
          <NavLink
            to="/"
            className={({ isActive }) => `
              flex flex-col items-center gap-1 ${
                isActive ? "text-purple-400" : ""
              }`}
            role="menuitem"
            aria-label="Home page"
          >
            <p className="text-xs sm:text-sm">HOME</p> {/* Responsive text */}
            <hr className="w-2/4 border-none h-[1.5px] bg-white hidden" />
          </NavLink>
        </li>
        <li role="none">
          <NavLink
            to="/collection"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 ${
                isActive ? "text-purple-400" : ""
              }`
            }
            role="menuitem"
            aria-label="Browse collection"
          >
            <p className="text-xs sm:text-sm">COLLECTION</p>{" "}
            {/* Responsive text */}
            <hr className="w-2/4 border-none h-[1.5px] bg-white hidden" />
          </NavLink>
        </li>
        <li role="none">
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 ${
                isActive ? "text-purple-400" : ""
              }`
            }
            role="menuitem"
            aria-label="About us"
          >
            <p className="text-xs sm:text-sm">ABOUT</p> {/* Responsive text */}
            <hr className="w-2/4 border-none h-[1.5px] bg-white hidden" />
          </NavLink>
        </li>
        <li role="none">
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 ${
                isActive ? "text-purple-400" : ""
              }`
            }
            role="menuitem"
            aria-label="Contact us"
          >
            <p className="text-xs sm:text-sm">CONTACT</p>{" "}
            {/* Responsive text */}
            <hr className="w-2/4 border-none h-[1.5px] bg-white hidden" />
          </NavLink>
        </li>
      </ul>

      <div className="flex items-center gap-4 sm:gap-6">
        {" "}
        {/* Responsive gap */}
        <button
          onClick={handleSearchClick}
          className="cursor-pointer"
          aria-label="Search products"
        >
          <img src={assets.search} className="w-4 sm:w-5" alt="Search" />{" "}
          {/* Responsive icon */}
        </button>
        <Link to="/cart" className="relative" aria-label="Shopping cart">
          <img
            src={assets.cart_icon}
            className="w-4 sm:w-5 min-w-4 sm:min-w-5"
            alt="Cart"
          />{" "}
          {/* Responsive icon */}
          {getCartCount() > 0 && (
            <span className="absolute right-[-5px] bottom-[-5px] w-3 h-3 sm:w-4 sm:h-4 text-center leading-3 sm:leading-4 bg-green-500 text-black aspect-square rounded-full text-[6px] sm:text-[8px]">
              {" "}
              {/* Responsive badge */}
              {getCartCount()}
            </span>
          )}
        </Link>
        {/* Profile section with better hover area */}
        <div className="group relative">
          <button
            onClick={handleProfileClick}
            className="cursor-pointer hover:opacity-70 transition-opacity flex items-center justify-center"
            aria-label="User profile"
          >
            <img className="w-4 sm:w-5" src={assets.profile} alt="Profile" />
          </button>

          {/* Dropdown menu for desktop */}
          {token && (
            <div className="group-hover:block hidden absolute top-full right-0 pt-2 z-50">
              <div
                className="flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded shadow-lg border border-gray-200"
                role="menu"
              >
                <p className="text-xs text-gray-400 border-b pb-1">
                  Hello, {userProfile?.name?.split(" ")[0] || "User"}
                </p>
                <button
                  onClick={() => navigate("/profile")}
                  className="cursor-pointer hover:text-black text-sm text-left"
                  role="menuitem"
                >
                  My Profile
                </button>
                <button
                  onClick={() => navigate("/orders")}
                  className="cursor-pointer hover:text-black text-sm text-left"
                  role="menuitem"
                >
                  Orders
                </button>
                <button
                  onClick={async () => {
                    await logout();
                    navigate("/login", { replace: true });
                  }}
                  className="cursor-pointer hover:text-black text-sm text-left mt-1 pt-1 border-t"
                  role="menuitem"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => setVisible(true)}
          className="cursor-pointer sm:hidden"
          aria-label="Open menu"
        >
          <img src={assets.menu_icon} className="w-4 sm:w-5" alt="Menu" />{" "}
          {/* Responsive icon */}
        </button>
      </div>

      {/* Premium Sidebar for small screens */}
      <div
        className={`fixed top-0 right-0 bottom-0 overflow-hidden bg-black/80 backdrop-blur-sm text-white transition-all duration-300 z-50 ${
          visible ? "w-80" : "w-0"
        }`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Mobile navigation menu"
        aria-hidden={!visible}
      >
        <div className="flex flex-col h-full">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <Link
              to="/"
              onClick={() => setVisible(false)}
              aria-label="Home page"
            >
              <img src={assets.logo} className="w-28" alt="Company Logo" />
            </Link>
            <button
              onClick={() => setVisible(false)}
              className="text-white p-2 hover:text-green-400 transition-colors"
              aria-label="Close menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col flex-grow p-6 overflow-y-auto">
            <div className="space-y-1 mb-8" role="menu">
              <NavLink
                onClick={() => setVisible(false)}
                className={({ isActive }) =>
                  `block py-4 px-4 text-lg transition-colors ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                      : "hover:bg-gray-800"
                  }`
                }
                to="/"
                role="menuitem"
              >
                HOME
              </NavLink>
              <NavLink
                onClick={() => setVisible(false)}
                className={({ isActive }) =>
                  `block py-4 px-4 text-lg transition-colors ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                      : "hover:bg-gray-800"
                  }`
                }
                to="/collection"
                role="menuitem"
              >
                COLLECTION
              </NavLink>
              <NavLink
                onClick={() => setVisible(false)}
                className={({ isActive }) =>
                  `block py-4 px-4 text-lg transition-colors ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                      : "hover:bg-gray-800"
                  }`
                }
                to="/about"
                role="menuitem"
              >
                ABOUT
              </NavLink>
              <NavLink
                onClick={() => setVisible(false)}
                className={({ isActive }) =>
                  `block py-4 px-4 text-lg transition-colors ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                      : "hover:bg-gray-800"
                  }`
                }
                to="/contact"
                role="menuitem"
              >
                CONTACT
              </NavLink>
            </div>

            {/* User section */}
            <div className="mt-auto pt-8 border-t border-gray-800">
              {token ? (
                <>
                  <div className="px-4 py-2 text-indigo-400 text-sm">
                    Welcome, {userProfile?.name?.split(" ")[0] || "User"}
                  </div>
                  <NavLink
                    onClick={() => setVisible(false)}
                    className={({ isActive }) =>
                      `block py-3 px-4 text-lg transition-colors ${
                        isActive
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                          : "hover:bg-gray-800"
                      }`
                    }
                    to="/profile"
                    role="menuitem"
                  >
                    MY PROFILE
                  </NavLink>
                  <NavLink
                    onClick={() => setVisible(false)}
                    className={({ isActive }) =>
                      `block py-3 px-4 text-lg transition-colors ${
                        isActive
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                          : "hover:bg-gray-800"
                      }`
                    }
                    to="/orders"
                    role="menuitem"
                  >
                    ORDERS
                  </NavLink>
                  <button
                    onClick={async () => {
                      await logout();
                      setVisible(false);
                      navigate("/login", { replace: true });
                    }}
                    className="w-full text-left py-3 px-4 text-lg hover:bg-gray-800 transition-colors"
                    role="menuitem"
                  >
                    LOGOUT
                  </button>
                </>
              ) : (
                <NavLink
                  onClick={() => setVisible(false)}
                  className={({ isActive }) =>
                    `block py-4 px-4 text-lg transition-colors ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                        : "hover:bg-gray-800"
                    }`
                  }
                  to="/login"
                  role="menuitem"
                >
                  LOGIN / REGISTER
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invisible overlay that covers the entire page except sidebar */}
      {visible && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setVisible(false)}
          aria-hidden="true"
        ></div>
      )}
    </nav>
  );
};

export default Navbar;
