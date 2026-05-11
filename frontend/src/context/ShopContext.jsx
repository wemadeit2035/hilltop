import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import EmailVerificationPopup from "../components/EmailVerificationPopup";
import ProfileReminderPopup from "../components/ProfileReminderPopup";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);

  // SIMPLIFIED TOKEN MANAGEMENT - JUST LIKE ADMIN
  const [token, setTokenState] = useState(() => {
    try {
      return localStorage.getItem("token") || "";
    } catch (error) {
      return "";
    }
  });

  const [userProfile, setUserProfile] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");

  // Popup states
  const [showProfileReminder, setShowProfileReminder] = useState(false);
  const [profileReminderDismissed, setProfileReminderDismissed] =
    useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  // SIMPLIFIED: Set token and update localStorage
  const setToken = (newToken) => {
    setTokenState(newToken);
    try {
      if (newToken) {
        localStorage.setItem("token", newToken);
      } else {
        localStorage.removeItem("token");
      }
    } catch (error) {
      // Silent fail
    }
  };

  // SIMPLIFIED: Token validation on app start - JUST CHECK IF TOKEN EXISTS
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    console.log(
      "🔑 Token check on app load:",
      storedToken ? "EXISTS" : "MISSING",
    );

    if (storedToken && !token) {
      console.log("🔄 Restoring token from localStorage");
      setTokenState(storedToken);

      // IMPORTANT: Fetch user profile immediately when token is restored
      fetchUserProfile(storedToken)
        .then((profile) => {
          console.log("✅ User profile loaded:", profile?.name);
        })
        .catch(console.error);
    }

    getProductsData();
  }, []);

  // Fetch user profile (background process)
  const fetchUserProfile = async (tokenToUse = token) => {
    const currentToken = tokenToUse || localStorage.getItem("token");
    if (!currentToken) return null;

    setIsProfileLoading(true); // Start loading
    try {
      const response = await axios.get(`${backendUrl}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (response.data.success) {
        console.log("📋 User profile fetched:", response.data.user);
        setUserProfile(response.data.user);
        checkProfileCompletion(response.data.user);
        return response.data.user;
      }
    } catch (error) {
      console.log("Profile fetch failed (non-critical):", error.message);
      // Don't logout on profile fetch failures - keep the token
    } finally {
      setIsProfileLoading(false); // End loading
    }
    return null;
  };

  // SIMPLIFIED: Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${backendUrl}/api/user/login`, {
        email,
        password,
      });

      if (response.data.success && response.data.accessToken) {
        setToken(response.data.accessToken);
        setUserProfile(response.data.user);

        // Fetch cart after login
        await fetchCart();

        // Check profile completion
        checkProfileCompletion(response.data.user);

        // User-friendly success message
        try {
          toast.success("Welcome back — you are now logged in.");
        } catch (err) {}

        return { success: true };
      } else {
        try {
          toast.error(response.data.message || "Login failed");
        } catch (err) {}
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      try {
        toast.error(error.response?.data?.message || "Login failed");
      } catch (err) {}
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  // SIMPLIFIED: Logout function
  const logout = async () => {
    try {
      if (token) {
        await axios
          .post(
            `${backendUrl}/api/user/logout`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          )
          .catch(() => {}); // Silent fail if logout API fails
      }
    } finally {
      setToken("");
      setTokenState("");
      setUserProfile(null);
      setCartItems({});
      setShowEmailVerification(false);
      setShowProfileReminder(false);

      try {
        localStorage.removeItem("token");
        localStorage.removeItem("profileReminderDismissed");
      } catch (error) {
        // Silent fail
      }

      try {
        toast.success("You have been logged out.");
      } catch (err) {}
    }
  };

  // SIMPLIFIED: Fetch cart
  const fetchCart = async () => {
    if (!token) return;

    try {
      const response = await axios.get(`${backendUrl}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setCartItems(response.data.cartData || {});
      }
    } catch (error) {
      // Silent fail
    }
  };

  // Keep your existing cart functions (addToCart, removeFromCart, etc.)
  const addToCart = async (itemId, size) => {
    if (!size) return;

    const newCartItems = { ...cartItems };
    if (newCartItems[itemId]) {
      newCartItems[itemId][size] = (newCartItems[itemId][size] || 0) + 1;
    } else {
      newCartItems[itemId] = { [size]: 1 };
    }
    setCartItems(newCartItems);

    if (token) {
      try {
        await axios.post(
          `${backendUrl}/api/cart/add`,
          { itemId, size },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } catch (error) {
        // Silent fail
      }
    }
  };

  const removeFromCart = async (itemId, size) => {
    const newCartItems = { ...cartItems };
    if (newCartItems[itemId] && newCartItems[itemId][size]) {
      newCartItems[itemId][size] -= 1;
      if (newCartItems[itemId][size] <= 0) {
        delete newCartItems[itemId][size];
      }
      if (Object.keys(newCartItems[itemId]).length === 0) {
        delete newCartItems[itemId];
      }
    }
    setCartItems(newCartItems);

    if (token) {
      try {
        await axios.post(
          `${backendUrl}/api/cart/remove`,
          { itemId, size },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } catch (error) {
        // Silent fail
      }
    }
  };

  // Keep your existing helper functions
  const getCartCount = () => {
    if (!cartItems || Object.keys(cartItems).length === 0) return 0;
    return Object.values(cartItems).reduce((total, itemSizes) => {
      return (
        total +
        Object.values(itemSizes).reduce((sum, quantity) => sum + quantity, 0)
      );
    }, 0);
  };

  const getTotalCartAmount = () => {
    if (!cartItems || Object.keys(cartItems).length === 0) return 0;
    return Object.entries(cartItems).reduce((total, [itemId, sizes]) => {
      const product = products.find((p) => p._id === itemId);
      if (!product) return total;
      const itemTotal = Object.entries(sizes).reduce(
        (itemSum, [size, quantity]) => itemSum + product.price * quantity,
        0,
      );
      return total + itemTotal;
    }, 0);
  };

  const getProductsData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setProducts(response.data.products || []);
      }
    } catch (error) {
      setProducts([]);
    }
  };

  // Keep your existing popup functions
  const checkProfileCompletion = (profile) => {
    if (!profile) return;
    const isProfileIncomplete =
      !profile.profileCompleted ||
      !profile.phone ||
      !profile.address ||
      !profile.address.street ||
      !profile.address.city;
    const hasBeenDismissed = localStorage.getItem("profileReminderDismissed");
    if (isProfileIncomplete && !hasBeenDismissed) {
      setShowProfileReminder(true);
    }
  };

  const showVerificationPopup = (email) => {
    setVerificationEmail(email);
    setShowEmailVerification(true);
  };

  const resendVerificationEmail = async () => {
    try {
      await axios.post(`${backendUrl}/api/user/resend-verification`, {
        email: verificationEmail,
      });
    } catch (error) {
      // Silent error handling
    }
  };

  const handleCloseVerificationPopup = () => {
    setShowEmailVerification(false);
    setVerificationEmail("");
  };

  const handleCloseProfileReminder = () => {
    setShowProfileReminder(false);
    setProfileReminderDismissed(true);
    try {
      localStorage.setItem("profileReminderDismissed", "true");
    } catch (error) {
      // Silent fail
    }
  };

  const handleUpdateProfile = () => {
    setShowProfileReminder(false);
    setProfileReminderDismissed(true);
    try {
      localStorage.setItem("profileReminderDismissed", "true");
    } catch (error) {
      // Silent fail
    }
    window.location.href = "/profile";
  };

  const value = {
    // Authentication
    token,
    setToken,
    login,
    logout,
    register: async (name, email, password) => {
      try {
        const response = await axios.post(`${backendUrl}/api/user/register`, {
          name,
          email,
          password,
        });
        if (response.data.success) {
          setToken(response.data.accessToken);
          setUserProfile(response.data.user);
          await fetchCart();
          if (!response.data.user.isVerified) {
            showVerificationPopup(email);
          }
          // Ensure any previous dismissal doesn't prevent showing reminder
          try {
            localStorage.removeItem("profileReminderDismissed");
          } catch (err) {
            // silent
          }

          // Re-check profile completion (after clearing dismissal)
          checkProfileCompletion(response.data.user);
          return { success: true };
        }
        return { success: false, error: response.data.message };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.message || "Registration failed",
        };
      }
    },
    userProfile,
    setUserProfile,
    fetchUserProfile,
    isProfileLoading,

    // Products & Cart
    products,
    getProductsData,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    updateCartQuantity: async (itemId, size, quantity) => {
      const newCartItems = { ...cartItems };
      if (newCartItems[itemId]) {
        if (quantity <= 0) {
          delete newCartItems[itemId][size];
          if (Object.keys(newCartItems[itemId]).length === 0) {
            delete newCartItems[itemId];
          }
        } else {
          newCartItems[itemId][size] = quantity;
        }
      }
      setCartItems(newCartItems);

      if (token) {
        try {
          await axios.post(
            `${backendUrl}/api/cart/update`,
            { itemId, size, quantity },
            { headers: { Authorization: `Bearer ${token}` } },
          );
        } catch (error) {
          // Silent fail
        }
      }
    },
    getCartCount,
    getTotalCartAmount,
    clearCart: () => setCartItems({}),
    fetchCart,

    // Search
    showSearch,
    setShowSearch,
    search,
    setSearch,

    // Popup functions
    showVerificationPopup,
    handleCloseProfileReminder,
    handleUpdateProfile,

    // Popup states
    showProfileReminder,
    showEmailVerification,

    // Utilities
    currency: "R",
    delivery_fee: 50,
    backendUrl,
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}

      {/* Popup Components */}
      {showEmailVerification && (
        <EmailVerificationPopup
          email={verificationEmail}
          onClose={handleCloseVerificationPopup}
          onResend={resendVerificationEmail}
        />
      )}

      {showProfileReminder && userProfile && (
        <ProfileReminderPopup
          userProfile={userProfile}
          onClose={handleCloseProfileReminder}
          onUpdateProfile={handleUpdateProfile}
        />
      )}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
