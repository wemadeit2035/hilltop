import React, { useContext, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";
import {
  CreditCard,
  Package,
  Wallet,
  MapPin,
  User,
  Mail,
  Home,
  Landmark,
  Smartphone,
  AlertCircle,
} from "lucide-react";
import axios from "axios";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState("cod");
  const {
    backendUrl,
    token,
    cartItems,
    setCartItems,
    delivery_fee,
    products,
    getTotalCartAmount,
    userProfile,
    fetchUserProfile,
  } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    province: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // Function to auto-fill form from user profile
  const autoFillFromProfile = () => {
    const nameParts = userProfile.name ? userProfile.name.split(" ") : ["", ""];
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    setFormData((prev) => ({
      ...prev,
      firstName: firstName,
      lastName: lastName,
      email: userProfile.email || "",
      street: userProfile.address?.street || "",
      city: userProfile.address?.city || "",
      province: userProfile.address?.province || "",
      postalCode: userProfile.address?.postalCode || "",
      country: userProfile.address?.country || "",
      phone: userProfile.phone || "",
    }));
  };

  // Function to refresh profile data
  const refreshProfile = async () => {
    if (!token) {
      setProfileError("Please log in to auto-fill your address");
      return;
    }

    try {
      setIsLoadingProfile(true);
      setProfileError(null);
      await fetchUserProfile();
    } catch (error) {
      setProfileError("Failed to refresh profile data");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Handle auto-fill when userProfile changes
  useEffect(() => {
    if (userProfile && userProfile.name) {
      autoFillFromProfile();
    }
  }, [userProfile]);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setFormData((data) => ({ ...data, [name]: value }));

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }

    if (profileError) {
      setProfileError(null);
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      let orderItems = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const itemInfo = structuredClone(
              products.find((product) => product._id === items)
            );
            if (itemInfo) {
              itemInfo.size = item;
              itemInfo.quantity = cartItems[items][item];
              orderItems.push(itemInfo);
            }
          }
        }
      }

      const amount = getTotalCartAmount() + delivery_fee;

      let orderData = {
        address: formData,
        items: orderItems,
        amount: amount,
      };

      switch (method) {
        case "cod":
          const response = await axios.post(
            backendUrl + "/api/order/place",
            orderData,
            { headers: { token } }
          );

          if (response.data.success) {
            setCartItems({});
            navigate("/orders");
          }
          break;

        case "stripe":
          const responseStripe = await axios.post(
            backendUrl + "/api/order/stripe",
            orderData,
            { headers: { token } }
          );
          if (responseStripe.data.success) {
            const { session_url } = responseStripe.data;
            window.location.replace(session_url);
          }
          break;

        case "paypal":
          const responsePaypal = await axios.post(
            backendUrl + "/api/order/paypal",
            orderData,
            { headers: { token } }
          );
          if (responsePaypal.data.success) {
            const { approval_url } = responsePaypal.data;
            window.location.replace(approval_url);
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("Order submission error:", error);
      // You might want to show a user-friendly error message here
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.street.trim())
      newErrors.street = "Street address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.province.trim()) newErrors.province = "Province is required";
    if (!formData.postalCode.trim())
      newErrors.postalCode = "Postal code is required";
    if (!formData.country.trim()) newErrors.country = "Country is required";

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    // Replace the main container classes
    <div className="min-h-screen py-4 sm:py-8 sm:px-6">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-4">
        {/* Update the title section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 md:mb-15 lg:mb-20"
        >
          <div className="mb-8 sm:mb-12 text-2xl sm:text-4xl md:text-5xl font-bold">
            <Title
              text1={"PLACE"}
              text2={"ORDER"}
              className="text-2xl sm:text-3xl"
            />
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto text-xs sm:text-sm md:text-base px-2">
            Securely finalize your order with our premium checkout experience
          </p>
        </motion.div>

        {/* Update the main content grid */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 px-2 sm:px-6 lg:px-8">
          {/* Left Column - Delivery Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full lg:w-[58%]"
          >
            <div className="bg-white shadow-sm border border-gray-100 overflow-hidden mb-4 sm:mb-6">
              <div className="border-b border-gray-100 p-4 sm:p-6 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-gray-900 text-white p-1.5 sm:p-2 rounded-full">
                      <MapPin size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </div>
                    <h2 className="text-base sm:text-lg md:text-xl font-medium">
                      Delivery Information
                    </h2>
                  </div>
                  {token && (
                    <button
                      type="button"
                      onClick={refreshProfile}
                      disabled={isLoadingProfile}
                      className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded-md flex items-center gap-1 transition-colors"
                    >
                      {isLoadingProfile ? (
                        <>
                          <svg
                            className="animate-spin h-3 w-3 mr-1"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Loading...
                        </>
                      ) : (
                        <>
                          <MapPin size={12} />
                          Auto-fill
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <form
                id="order-form"
                onSubmit={onSubmitHandler}
                className="p-4 sm:p-6"
              >
                {/* Profile Error Message */}
                {profileError && (
                  <div className="mb-3 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                    <AlertCircle
                      size={16}
                      className="text-red-500 mt-0.5 flex-shrink-0"
                    />
                    <p className="text-red-700 text-xs sm:text-sm">
                      {profileError}
                    </p>
                  </div>
                )}

                {!token && (
                  <div className="mb-3 p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-yellow-700 text-xs sm:text-sm">
                      Please log in to auto-fill your delivery information from
                      your profile.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                  {/* Form fields - update padding and spacing */}
                  <div
                    className={`border p-2.5 sm:p-3 ${
                      errors.firstName ? "border-red-500" : "border-gray-200"
                    }`}
                  >
                    <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      <User size={12} className="sm:w-[14px] sm:h-[14px]" />{" "}
                      First Name
                    </label>
                    <input
                      name="firstName"
                      value={formData.firstName}
                      onChange={onChangeHandler}
                      className="w-full focus:outline-none text-gray-900 placeholder-gray-300 text-sm sm:text-base"
                      type="text"
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div
                    className={`border p-2.5 sm:p-3 ${
                      errors.lastName ? "border-red-500" : "border-gray-200"
                    }`}
                  >
                    <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      <User size={12} className="sm:w-[14px] sm:h-[14px]" />{" "}
                      Last Name
                    </label>
                    <input
                      name="lastName"
                      value={formData.lastName}
                      onChange={onChangeHandler}
                      className="w-full focus:outline-none text-gray-900 placeholder-gray-300 text-sm sm:text-base"
                      type="text"
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>

                  {/* Continue updating all form fields with similar pattern */}
                  <div
                    className={`border p-2.5 sm:p-3 ${
                      errors.email ? "border-red-500" : "border-gray-200"
                    }`}
                  >
                    <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      <Mail size={12} className="sm:w-[14px] sm:h-[14px]" />{" "}
                      Email Address
                    </label>
                    <input
                      name="email"
                      value={formData.email}
                      onChange={onChangeHandler}
                      className="w-full focus:outline-none text-gray-900 placeholder-gray-300 text-sm sm:text-base"
                      type="email"
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div
                    className={`border p-2.5 sm:p-3 ${
                      errors.phone ? "border-red-500" : "border-gray-200"
                    }`}
                  >
                    <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      <Smartphone
                        size={12}
                        className="sm:w-[14px] sm:h-[14px]"
                      />{" "}
                      Phone
                    </label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={onChangeHandler}
                      className="w-full focus:outline-none text-gray-900 placeholder-gray-300 text-sm sm:text-base"
                      type="tel"
                      placeholder="(123) 456-7890"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div
                    className={`border p-2.5 sm:p-3 ${
                      errors.street ? "border-red-500" : "border-gray-200"
                    }`}
                  >
                    <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      <Home size={12} className="sm:w-[14px] sm:h-[14px]" />{" "}
                      Street Address
                    </label>
                    <input
                      name="street"
                      value={formData.street}
                      onChange={onChangeHandler}
                      className="w-full focus:outline-none text-gray-900 placeholder-gray-300 text-sm sm:text-base"
                      type="text"
                      placeholder="123 Main Street"
                    />
                    {errors.street && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.street}
                      </p>
                    )}
                  </div>

                  <div
                    className={`border p-2.5 sm:p-3 ${
                      errors.country ? "border-red-500" : "border-gray-200"
                    }`}
                  >
                    <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      <Landmark size={12} className="sm:w-[14px] sm:h-[14px]" />{" "}
                      Country
                    </label>
                    <input
                      name="country"
                      value={formData.country}
                      onChange={onChangeHandler}
                      className="w-full focus:outline-none text-gray-900 placeholder-gray-300 text-sm sm:text-base"
                      type="text"
                      placeholder="South Africa"
                    />
                    {errors.country && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.country}
                      </p>
                    )}
                  </div>

                  {/* Address fields grid */}
                  <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
                    <div
                      className={`border p-2.5 sm:p-3 ${
                        errors.city ? "border-red-500" : "border-gray-200"
                      }`}
                    >
                      <label className="text-xs text-gray-500 mb-1">City</label>
                      <input
                        name="city"
                        value={formData.city}
                        onChange={onChangeHandler}
                        className="w-full focus:outline-none text-gray-900 placeholder-gray-300 text-sm sm:text-base"
                        type="text"
                        placeholder="New York"
                      />
                      {errors.city && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.city}
                        </p>
                      )}
                    </div>

                    <div
                      className={`border p-2.5 sm:p-3 ${
                        errors.province ? "border-red-500" : "border-gray-200"
                      }`}
                    >
                      <label className="text-xs text-gray-500 mb-1">
                        Province
                      </label>
                      <input
                        name="province"
                        value={formData.province}
                        onChange={onChangeHandler}
                        className="w-full focus:outline-none text-gray-900 placeholder-gray-300 text-sm sm:text-base"
                        type="text"
                        placeholder="NY"
                      />
                      {errors.province && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.province}
                        </p>
                      )}
                    </div>

                    <div
                      className={`border p-2.5 sm:p-3 ${
                        errors.postalCode ? "border-red-500" : "border-gray-200"
                      }`}
                    >
                      <label className="text-xs text-gray-500 mb-1">
                        Postal Code
                      </label>
                      <input
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={onChangeHandler}
                        className="w-full focus:outline-none text-gray-900 placeholder-gray-300 text-sm sm:text-base"
                        type="text"
                        placeholder="10001"
                      />
                      {errors.postalCode && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.postalCode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Right Column - Payment & Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="w-full lg:w-[42%] lg:sticky lg:top-4 lg:self-start"
          >
            {/* Payment Method Card - update grid for mobile */}
            <div className="bg-white shadow-sm border border-gray-100 overflow-hidden mb-4 sm:mb-6">
              <div className="border-b border-gray-100 p-4 sm:p-6 bg-gray-50">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-gray-900 text-white p-1.5 sm:p-2 rounded-full">
                    <CreditCard size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </div>
                  <h2 className="text-base sm:text-lg md:text-xl font-medium">
                    Payment Method
                  </h2>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-5">
                  {/* Payment method buttons - smaller on mobile */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`border p-2 cursor-pointer transition-all ${
                      method === "stripe"
                        ? "border-green-500 bg-gray-50 shadow-sm"
                        : "border-gray-100 hover:border-gray-300"
                    }`}
                    onClick={() => setMethod("stripe")}
                  >
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          method === "stripe"
                            ? "bg-green-500"
                            : "border border-gray-300"
                        }`}
                      >
                        {method === "stripe" && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        )}
                      </div>
                      <img
                        className="h-6 sm:h-8 md:h-10"
                        src={assets.stripe_logo}
                        alt="Stripe payment gateway"
                      />
                    </div>
                    <p className="text-gray-600 text-xs mt-1">
                      Secure credit card
                    </p>
                  </motion.div>

                  {/* Update all payment method buttons with similar pattern */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`border p-2 cursor-pointer transition-all ${
                      method === "paypal"
                        ? "border-green-500 bg-gray-50 shadow-sm"
                        : "border-gray-100 hover:border-gray-300"
                    }`}
                    onClick={() => setMethod("paypal")}
                  >
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          method === "paypal"
                            ? "bg-green-500"
                            : "border border-gray-300"
                        }`}
                      >
                        {method === "paypal" && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        )}
                      </div>
                      <img
                        className="h-6 sm:h-8 md:h-10"
                        src={assets.paypal_logo}
                        alt="Paypal payment gateway"
                      />
                    </div>
                    <p className="text-gray-600 text-xs mt-1">PayPal account</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`border p-2 cursor-pointer transition-all ${
                      method === "visa"
                        ? "border-green-500 bg-gray-50 shadow-sm"
                        : "border-gray-100 hover:border-gray-300"
                    }`}
                    onClick={() => setMethod("visa")}
                  >
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          method === "visa"
                            ? "bg-green-500"
                            : "border border-gray-300"
                        }`}
                      >
                        {method === "visa" && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        )}
                      </div>
                      <img
                        className="h-6 sm:h-8 md:h-10"
                        src={assets.visa_logo}
                        alt="Visa payment gateway"
                      />
                    </div>
                    <p className="text-gray-600 text-xs mt-1">
                      Direct Visa card
                    </p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`border p-2 cursor-pointer transition-all ${
                      method === "cod"
                        ? "border-green-500 bg-gray-50 shadow-sm"
                        : "border-gray-100 hover:border-gray-300"
                    }`}
                    onClick={() => setMethod("cod")}
                  >
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          method === "cod"
                            ? "bg-green-500"
                            : "border border-gray-300"
                        }`}
                      >
                        {method === "cod" && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex items-center">
                        <Wallet
                          size={24}
                          className="text-gray-500 mr-1 sm:mr-2"
                        />
                        <span className="font-medium text-green-500 text-xs sm:text-sm">
                          Cash on Delivery
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-xs mt-1">
                      Pay when received
                    </p>
                  </motion.div>
                </div>

                {/* Delivery info - smaller padding */}
                <div className="bg-gray-50 p-2.5 sm:p-3 border border-gray-100 mb-4 sm:mb-5">
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className="text-gray-600 text-xs sm:text-sm">
                      Delivery Method
                    </span>
                    <span className="font-medium text-xs sm:text-sm">
                      Standard Shipping
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-xs sm:text-sm">
                      Estimated Delivery
                    </span>
                    <span className="font-medium text-xs sm:text-sm">
                      3-5 business days
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary Card */}
            <div className="bg-white shadow-sm border border-gray-100 overflow-hidden mb-4 sm:mb-6">
              <div className="border-b border-gray-100 p-4 sm:p-6 bg-gray-50">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-gray-900 text-white p-1.5 sm:p-2 rounded-full">
                    <Package size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </div>
                  <h2 className="text-base sm:text-lg md:text-xl font-medium">
                    Order Summary
                  </h2>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <CartTotal />
              </div>
            </div>

            {/* Terms and button */}
            <p className="text-gray-500 text-xs mt-2 mb-3 text-center px-2">
              By placing your order, you agree to our{" "}
              <a href="#" className="text-gray-900 underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-gray-900 underline">
                Privacy Policy
              </a>
            </p>

            <button
              type="submit"
              form="order-form"
              disabled={isSubmitting || isLoadingProfile}
              className={`w-full py-3 font-medium transition-all text-sm sm:text-base ${
                isSubmitting || isLoadingProfile
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white"
              } flex items-center justify-center`}
            >
              {isSubmitting ? (
                <>
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
                </>
              ) : isLoadingProfile ? (
                "Loading info..."
              ) : (
                "PLACE YOUR ORDER"
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
