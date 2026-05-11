import React, { useContext, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Add from "./pages/add.jsx";
import List from "./pages/list.jsx";
import Orders from "./pages/orders.jsx";
import Login from "./components/Login.jsx";
import { ToastContainer } from "react-toastify";
import { AdminContext } from "./context/AdminContext";
import NewsletterSubscribers from "./pages/NewsletterSubscribers.jsx";
import AdminUserManagement from "./pages/users.jsx";
import Analytics from "./pages/analytics.jsx";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = "R";

// Error Boundary Component
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center p-6">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              We're experiencing technical difficulties. Please try refreshing
              the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ScrollToTop component for admin panel
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const App = () => {
  const { token } = useContext(AdminContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Memoized redirect logic
  const handleAuthRedirect = useCallback(() => {
    if (token && location.pathname === "/login") {
      navigate("/analytics", { replace: true });
    }
  }, [token, location.pathname, navigate]);

  // Memoized routes configuration
  const appRoutes = useCallback(
    () => (
      <Routes>
        <Route path="/" element={<Login token={token} />} />
        <Route path="/add" element={<Add token={token} />} />
        <Route path="/list" element={<List token={token} />} />
        <Route path="/orders" element={<Orders token={token} />} />
        <Route
          path="/subscribers"
          element={<NewsletterSubscribers token={token} />}
        />
        <Route path="/admin/users" element={<AdminUserManagement />} />
        <Route path="/analytics" element={<Analytics token={token} />} />
        <Route path="*" element={<List token={token} />} />
      </Routes>
    ),
    [token]
  );

  useEffect(() => {
    handleAuthRedirect();
  }, [handleAuthRedirect]);

  return (
    <div
      style={{
        overflow: "auto",
        height: "100vh",
        scrollbarWidth: "none" /* Firefox */,
        msOverflowStyle: "none" /* IE/Edge */,
      }}
    >
      <AppErrorBoundary>
        <div className="bg-gradient-to-r from-purple-300 to-indigo-300 min-h-screen">
          <ToastContainer />

          {/* ScrollToTop component - handles scrolling on route changes */}
          <ScrollToTop />

          {!token ? (
            <Login />
          ) : (
            <>
              <Navbar />
              <hr />
              <div className="flex w-full">
                <Sidebar />
                <div className="flex-1 min-w-0 my-4 lg:my-4 px-4 lg:px-4 text-gray-600 text-base">
                  {appRoutes()}
                </div>
              </div>
            </>
          )}
        </div>
      </AppErrorBoundary>
    </div>
  );
};

export default React.memo(App);
