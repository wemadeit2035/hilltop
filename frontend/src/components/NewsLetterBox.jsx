// React Component for Newsletter Signup
import React, { useState } from "react";

const NewsletterBox = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  // Extract name from email function
  const extractNameFromEmail = (email) => {
    const username = email.split("@")[0];
    // Remove numbers and special characters, capitalize first letter
    const cleanName = username.replace(/[^a-zA-Z]/g, " ");
    return cleanName
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
      .trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/newsletter/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            name: extractNameFromEmail(email),
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Success! You have been subscribed to our newsletter.");
        setMessageType("success");
        setEmail("");
      } else {
        // Handle registration required case
        if (data.needsRegistration) {
          setMessage(data.message);
          setMessageType("error");
        }
        // Handle verification required case
        if (data.needsVerification) {
          setMessage(data.message);
          setMessageType("error");
        }
        // Handle the "already subscribed" case specifically
        else if (data.message && data.message.includes("already subscribed")) {
          setMessage("This email is already subscribed to our newsletter.");
          setMessageType("info");
        } else {
          setMessage(data.message || "Subscription failed. Please try again.");
          setMessageType("error");
        }
      }
    } catch (error) {
      setMessage("Network error. Please try again later.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get message class based on type
  const getMessageClass = () => {
    switch (messageType) {
      case "success":
        return "text-green-600";
      case "info":
        return "text-green-600"; // Changed to green for the "already subscribed" message
      case "error":
        return "text-red-600";
      default:
        return "";
    }
  };

  return (
    <div className="text-center px-4">
      <p className="text-2xl font-medium text-gray-800">
        Subscribe to our Newsletter
      </p>
      <p className="text-gray-400 mt-3">
        Stay updated with the latest news and offers.
      </p>
      <form
        onSubmit={handleSubmit}
        className="w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3"
      >
        <input
          className="w-full sm:flex-1 outline-none"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <button
          type="submit"
          className="bg-black hover:bg-gray-800 cursor-pointer text-white text-md px-10 py-4"
          disabled={isLoading}
        >
          {isLoading ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
      {message && <p className={getMessageClass()}>{message}</p>}
    </div>
  );
};

export default NewsletterBox;
