import React, { useContext, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Product from "./pages/Product";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ShippingReturns from "./pages/ShippingReturns";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import PlaceOrder from "./pages/PlaceOrder";
import Orders from "./pages/Orders";
import Footer from "./components/Footer";
import SearchBar from "./components/SearchBar";
import Verify from "./pages/Verify";
import UserProfile from "./pages/UserProfile";
import Unsubscribe from "./pages/Unsubscribe";
import EmailVerification from "./pages/EmailVerification";
import { ShopContext } from "./context/ShopContext";
import ErrorBoundary from "./components/ErrorBoundary";
import SEO from "./components/SEO";

// ScrollToTop component
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { token } = useContext(ShopContext);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  const {
    showProfileReminder,
    userProfile,
    handleCloseProfileReminder,
    handleUpdateProfile,
    token,
  } = useContext(ShopContext);

  const location = useLocation();
  const headerPaddingClass =
    location.pathname === "/collection" ||
    location.pathname.startsWith("/collection/")
      ? "pt-25 sm:pt-35"
      : "pt-10 sm:pt-12";

  return (
    <ErrorBoundary>
      <div className="bg-gradient-to-r from-purple-300 to-indigo-300 min-h-screen">
        {/* Global SEO for the app */}
        <SEO
          title="Fashion Store - Premium Clothing & Accessories"
          description="Your one-stop shop for trendy fashion and premium clothing"
          keywords="fashion, clothing, style, trendy, premium"
        />

        <ScrollToTop />

        <Navbar />
        <div className={`lg:px-10 ${headerPaddingClass}`}>
          <SearchBar />
        </div>
        {/* Main content container with padding */}
        <div className="lg:px-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/shipping-returns" element={<ShippingReturns />} />
            <Route path="/product/:productId" element={<Product />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/place-order"
              element={
                <ProtectedRoute>
                  <PlaceOrder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route path="/verify" element={<Verify />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        <Footer />
        <ToastContainer position="top-right" />
      </div>
    </ErrorBoundary>
  );
};

export default App;
