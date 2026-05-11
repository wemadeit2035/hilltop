import React, { useState, useEffect, useContext } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { AdminContext } from "../context/AdminContext";

const Sidebar = () => {
  const [activePath, setActivePath] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { logout } = useContext(AdminContext);
  const navigate = useNavigate();

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const navItems = [
    { path: "/analytics", icon: assets.analytics_icon, label: "Analytics" },
    { path: "/list", icon: assets.list_icon, label: "List" },
    { path: "/orders", icon: assets.orders_icon, label: "Orders" },
    {
      path: "/subscribers",
      icon: assets.newsletter_icon,
      label: "Subscribers",
    },
    { path: "/admin/users", icon: assets.users_icon, label: "Users" },
    { path: "/add", icon: assets.add_icon, label: "Add" },
  ];

  return (
    <>
      {/* Mobile Menu Button - Hidden when sidebar is open */}
      {!isSidebarOpen && (
        <div className="md:hidden fixed top-4 right-4 z-50">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg bg-black/80 backdrop-blur-sm text-white shadow-lg hover:bg-gray-700 transition-colors"
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
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed h-screen top-0 left-0 z-40 transition-transform duration-300 md:translate-x-0 w-[30%] md:w-[18%] ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full md:bg-gradient-to-b md:from-gray-900 md:to-gray-800 bg-black/80 backdrop-blur-sm border-r border-gray-700 shadow-2xl">
          <div className="flex flex-col h-full">
            {/* Header with logo - Keep visible on both mobile and desktop */}
            <div className="flex items-center py-4 px-[8%] justify-center border-b border-gray-700">
              <img
                className="w-[max(20%,200px)]"
                src={assets.logo}
                alt="logo"
              />
            </div>

            {/* Navigation Items */}
            <div className="flex flex-col gap-2 p-4 flex-grow">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center justify-center md:justify-start gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                        : "text-gray-300 hover:bg-gray-750 hover:text-white border border-gray-700"
                    }`
                  }
                >
                  <div className="min-w-[20px] flex justify-center">
                    <img
                      className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
                      src={item.icon}
                      alt={item.label}
                    />
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap overflow-hidden hidden md:block">
                    {item.label}
                  </span>
                </NavLink>
              ))}
            </div>

            {/* Logout Button */}
            <div className="p-4 border-t md:bg-gradient-to-r md:from-gray-600 md:to-gray-900 bg-black/80 backdrop-blur-sm border-gray-500">
              <button
                onClick={() => {
                  handleLogout();
                  closeSidebar();
                }}
                className="w-full flex shadow-2xl items-center justify-center md:justify-start gap-3 px-3 py-3 rounded-lg transition-all duration-200 group md:bg-gradient-to-r md:from-gray-900 md:to-gray-600 bg-black/80 backdrop-blur-sm hover:bg-gray-750 border border-gray-700 text-gray-300 hover:text-white"
              >
                <div className="min-w-[20px] flex justify-center">
                  <img
                    className="w-6 h-6 group-hover:scale-110 transition-transform duration-200"
                    src={assets.logout_icon}
                    alt="Logout"
                  />
                </div>
                <span className="text-sm font-medium hidden md:block">
                  Logout
                </span>
              </button>
            </div>

            {/* Footer with user info */}
            <div className="p-4 border-t border-gray-500">
              <div className="flex items-center justify-center md:justify-start gap-3 p-2 rounded-lg md:bg-gray-800 bg-black/80 backdrop-blur-sm">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">AD</span>
                </div>
                <div className="overflow-hidden hidden md:block">
                  <p className="text-white text-xs font-medium truncate">
                    Admin User
                  </p>
                  <p className="text-gray-400 text-xs truncate">
                    admin@finezto.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile - Clicking outside closes sidebar */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={closeSidebar}
        />
      )}

      {/* Page Content Margin Adjustment */}
      <div className="md:ml-[18%] pt-[55px] min-h-screen bg-gray-50">
        {/* Your page content will go here */}
      </div>
    </>
  );
};

export default Sidebar;
