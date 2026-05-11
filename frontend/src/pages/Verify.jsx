import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Verify = () => {
  const { navigate, token, setCartItems, backendUrl } = useContext(ShopContext);
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);

  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");
  const method = searchParams.get("method") || "stripe"; // Default to stripe for backward compatibility

  const verifyPayment = async () => {
    try {
      if (!token) {
        toast.error("Please log in to verify payment");
        navigate("/login");
        return;
      }

      if (success === "true") {
        if (method === "stripe") {
          // Handle Stripe verification
          const response = await axios.post(
            backendUrl + "/api/order/verify",
            { success, orderId, method },
            { headers: { token } }
          );

          if (response.data.success) {
            setCartItems({});
            toast.success("Payment completed successfully!");
            navigate("/orders");
          } else {
            toast.error("Payment verification failed");
            navigate("/cart");
          }
        } else if (method === "paypal") {
          // Handle PayPal capture
          const response = await axios.post(
            backendUrl + "/api/order/paypal/capture",
            { orderId },
            { headers: { token } }
          );

          if (response.data.success) {
            setCartItems({});
            toast.success("PayPal payment completed successfully!");
            navigate("/orders");
          } else {
            toast.error("PayPal payment capture failed");
            navigate("/cart");
          }
        }
      } else {
        // Payment was cancelled
        await axios.post(
          backendUrl + "/api/order/verify",
          { success, orderId, method },
          { headers: { token } }
        );
        toast.info("Payment was cancelled");
        navigate("/cart");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      toast.error("Error verifying payment. Please check your orders.");
      navigate("/orders");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    verifyPayment();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying your payment...</p>
            <p className="text-sm text-gray-500 mt-2">
              Please wait while we process your{" "}
              {method === "paypal" ? "PayPal" : "Stripe"} payment
            </p>
          </>
        ) : (
          <>
            <div className="text-green-500 text-4xl mb-4">✓</div>
            <p className="text-gray-600">Redirecting you...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Verify;
