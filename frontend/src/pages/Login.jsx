import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const navigate = useNavigate();
  const {
    token,
    setToken,
    backendUrl,
    setUserProfile,
    showVerificationPopup,
    fetchUserProfile,
  } = useContext(ShopContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStep, setResetStep] = useState(1); // 1: email, 2: code, 3: new password
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  // State for floating label animation
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isResetEmailFocused, setIsResetEmailFocused] = useState(false);
  const [isResetCodeFocused, setIsResetCodeFocused] = useState(false);
  const [isNewPasswordFocused, setIsNewPasswordFocused] = useState(false);

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
  };

  const resetPasswordForm = () => {
    setResetEmail("");
    setResetCode("");
    setNewPassword("");
    setResetStep(1);
    setShowNewPassword(false);
  };

  // Toggle functions for password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const handleGoogleLoginError = () => {
    toast.error("Google login failed");
  };

  // Forgot Password Handler
  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (resetStep === 1) {
        // Step 1: Request password reset
        const response = await axios.post(
          `${backendUrl}/api/user/forgot-password`,
          { email: resetEmail },
          { withCredentials: true },
        );

        if (response.data.success) {
          toast.success("Reset code sent to your email!");
          setResetStep(2);
        } else {
          toast.error(response.data.message);
        }
      } else if (resetStep === 2) {
        // Step 2: Verify reset code
        const response = await axios.post(
          `${backendUrl}/api/user/verify-reset-code`,
          { email: resetEmail, code: resetCode },
          { withCredentials: true },
        );

        if (response.data.success) {
          toast.success("Code verified successfully!");
          setResetStep(3);
        } else {
          toast.error(response.data.message);
        }
      } else if (resetStep === 3) {
        // Step 3: Reset password
        const response = await axios.post(
          `${backendUrl}/api/user/reset-password`,
          { email: resetEmail, code: resetCode, newPassword },
          { withCredentials: true },
        );

        if (response.data.success) {
          toast.success("Password reset successfully!");
          setForgotPasswordMode(false);
          resetPasswordForm();
          setCurrentState("Login");
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error(
        error.response?.data?.message || "An error occurred. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      let response;

      if (currentState === "Sign Up") {
        response = await axios.post(
          backendUrl + "/api/user/register",
          {
            name,
            email,
            password,
          },
          {
            withCredentials: true,
          },
        );

        if (response.data.success) {
          setToken(response.data.accessToken);

          // IMPORTANT: Ensure user profile is properly set
          if (response.data.user) {
            console.log(
              "✅ Setting user profile from registration:",
              response.data.user,
            );
            setUserProfile(response.data.user);
          } else {
            // Fallback: fetch the complete profile
            await fetchUserProfile(response.data.accessToken);
          }

          // Show verification popup for unverified users after registration
          if (!response.data.user?.isVerified) {
            showVerificationPopup(email);
          }

          // Clear any previous dismissal so the profile reminder can show
          try {
            localStorage.removeItem("profileReminderDismissed");
          } catch (err) {
            // silent
          }

          // Ensure profile is refreshed (this will trigger checkProfileCompletion)
          await fetchUserProfile(response.data.accessToken);

          toast.success(
            "Account created successfully! Please check your email for verification.",
          );
          resetForm();
          setCurrentState("Login");
          // Navigate to home so the reminder popup is visible on the main page
          navigate("/");
        } else {
          toast.error(response.data.message);
        }
      } else {
        // LOGIN
        response = await axios.post(
          backendUrl + "/api/user/login",
          {
            email,
            password,
          },
          {
            withCredentials: true,
          },
        );

        if (response.data.success) {
          setToken(response.data.accessToken);

          // CRITICAL FIX: Ensure user profile is properly set with complete data
          if (response.data.user && response.data.user.name) {
            console.log(
              "✅ Setting complete user profile from login:",
              response.data.user,
            );
            setUserProfile(response.data.user);
          } else {
            // If user data is incomplete, fetch the full profile
            console.log("🔄 Fetching complete user profile...");
            const fullProfile = await fetchUserProfile(
              response.data.accessToken,
            );
            if (fullProfile) {
              setUserProfile(fullProfile);
            }
          }

          // Show verification popup for unverified users after login
          if (!response.data.user?.isVerified) {
            showVerificationPopup(email);
          }

          toast.success("Login successful!");
          resetForm();
          navigate("/");
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error(
        error.response?.data?.message || "An error occurred. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Using centralized fetchUserProfile from ShopContext

  // Update Google Login Success Handler
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setIsSubmitting(true);

    if (!credentialResponse || !credentialResponse.credential) {
      setIsSubmitting(false);
      toast.error("Google login failed - no credential received");
      return;
    }
    try {
      const response = await axios.post(
        `${backendUrl}/api/user/google`,
        {
          token: credentialResponse.credential,
        },
        {
          withCredentials: true,
        },
      );

      if (response.data.success) {
        setToken(response.data.accessToken);

        // Ensure complete user profile is set
        if (response.data.user && response.data.user.name) {
          console.log("✅ Setting Google user profile:", response.data.user);
          setUserProfile(response.data.user);
        } else {
          // Fetch complete profile if needed (use centralized fetch)
          const fullProfile = await fetchUserProfile(response.data.accessToken);
          if (fullProfile) setUserProfile(fullProfile);
        }

        // Clear dismissal and refresh profile so reminder can show
        try {
          localStorage.removeItem("profileReminderDismissed");
        } catch (err) {}
        await fetchUserProfile(response.data.accessToken);

        toast.success("Google login successful!");
        resetForm();
        navigate("/");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error(
        error.response?.data?.message ||
          "Google login failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Facebook Login Handler
  const handleFacebookLogin = () => {
    if (!window.FB) {
      toast.error("Facebook SDK not loaded");
      return;
    }

    window.FB.login(
      async (response) => {
        if (response.authResponse) {
          await handleFacebookLoginSuccess(response.authResponse);
        } else {
          toast.error("Facebook login was cancelled");
        }
      },
      { scope: "public_profile,email" },
    );
  };

  // Facebook Login Success Handler
  const handleFacebookLoginSuccess = async (response) => {
    if (!response.accessToken) {
      toast.error("Facebook login failed - no access token received");
      return;
    }

    setIsSubmitting(true);
    try {
      const backendResponse = await axios.post(
        `${backendUrl}/api/user/facebook`,
        {
          token: response.accessToken,
        },
        {
          withCredentials: true,
        },
      );

      if (backendResponse.data.success) {
        setToken(backendResponse.data.accessToken);

        // Set user profile
        if (backendResponse.data.user && backendResponse.data.user.name) {
          setUserProfile(backendResponse.data.user);
        } else {
          const fullProfile = await fetchUserProfile(
            backendResponse.data.accessToken,
          );
          if (fullProfile) {
            setUserProfile(fullProfile);
          }
        }

        // Clear dismissal and refresh profile so reminder can show
        try {
          localStorage.removeItem("profileReminderDismissed");
        } catch (err) {}
        await fetchUserProfile(backendResponse.data.accessToken);

        toast.success("Facebook login successful!");
        resetForm();
        navigate("/");
      } else {
        toast.error(backendResponse.data.message);
      }
    } catch (error) {
      console.error("Facebook login error:", error);
      toast.error(
        error.response?.data?.message ||
          "Facebook login failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Facebook Login Failure Handler
  const handleFacebookLoginFailure = (error) => {
    console.error("Facebook login failed:", error);
    toast.error("Facebook login was not completed.");
  };

  // Custom Facebook Button Component with Tailwind
  const CustomFacebookButton = ({ onClick, disabled, isLoading }) => {
    return (
      <button
        onClick={onClick}
        disabled={disabled || isLoading}
        className={`
        w-full max-w-[200px] h-10 px-4
        bg-[#1877F2] hover:bg-[#166FE5]
        text-white font-medium text-sm
        rounded transition-all duration-300
        flex items-center justify-center gap-2
        border-none outline-none
        ${
          disabled || isLoading
            ? "opacity-70 cursor-not-allowed"
            : "cursor-pointer"
        }
        active:scale-[0.98]
      `}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Continue with Facebook</span>
          </>
        )}
      </button>
    );
  };

  const handleStateChange = () => {
    const newState = currentState === "Login" ? "Sign Up" : "Login";
    setCurrentState(newState);
    resetForm();
    setForgotPasswordMode(false);
    resetPasswordForm();
  };

  const handleForgotPasswordClick = () => {
    setForgotPasswordMode(true);
    resetPasswordForm();
  };

  const handleBackToLogin = () => {
    setForgotPasswordMode(false);
    resetPasswordForm();
  };

  // Forgot Password UI
  if (forgotPasswordMode) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-3 sm:p-4"
        style={{
          backgroundImage: `url(${assets.background_image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="relative w-full max-w-md bg-black/50 backdrop-blur-sm border border-white/30 rounded-lg shadow-lg">
          <form
            onSubmit={handleForgotPassword}
            className="flex flex-col items-center p-4 sm:p-6"
          >
            {/* Title */}
            <div className="mb-4 text-center">
              <h2 className="text-xl font-bold text-gray-300">
                {resetStep === 1
                  ? "Reset Password"
                  : resetStep === 2
                    ? "Enter Reset Code"
                    : "Set New Password"}
              </h2>
              <p className="text-gray-400 mt-1 text-sm">
                {resetStep === 1
                  ? "Enter your email to receive a reset code"
                  : resetStep === 2
                    ? "Check your email for the reset code"
                    : "Enter your new password"}
              </p>
            </div>

            {/* Form Fields */}
            <div className="w-full space-y-3">
              {resetStep === 1 && (
                <div className="relative mt-5">
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    onFocus={() => setIsResetEmailFocused(true)}
                    onBlur={() => setIsResetEmailFocused(!!resetEmail)}
                    className="w-full px-4 py-3 bg-black/50 backdrop-blur-sm border border-white/30 focus:border-blue-500 outline-none transition-all duration-300 text-gray-700 rounded peer"
                    required
                    disabled={isSubmitting}
                  />
                  <label
                    className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                      isResetEmailFocused || resetEmail
                        ? "top-1 text-xs text-blue-500"
                        : "top-3.5 text-gray-500"
                    }`}
                  >
                    Email Address
                  </label>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800">
                    <img
                      src={assets.mail_icon}
                      alt="Email"
                      className="h-5 w-5 text-gray-400"
                    />
                  </div>
                </div>
              )}

              {resetStep === 2 && (
                <div className="relative mt-5">
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    onFocus={() => setIsResetCodeFocused(true)}
                    onBlur={() => setIsResetCodeFocused(!!resetCode)}
                    className="w-full px-4 py-3 bg-black/50 backdrop-blur-sm border border-white/30 focus:border-blue-500 outline-none transition-all duration-300 text-gray-700 rounded peer"
                    required
                    disabled={isSubmitting}
                  />
                  <label
                    className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                      isResetCodeFocused || resetCode
                        ? "top-1 text-xs text-blue-500"
                        : "top-3.5 text-gray-500"
                    }`}
                  >
                    Reset Code
                  </label>
                </div>
              )}

              {resetStep === 3 && (
                <div className="relative mt-5">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onFocus={() => setIsNewPasswordFocused(true)}
                    onBlur={() => setIsNewPasswordFocused(!!newPassword)}
                    className="w-full px-10 py-3 pr-10 bg-black/50 backdrop-blur-sm border border-white/30 focus:border-blue-500 outline-none transition-all duration-300 text-gray-700 rounded peer"
                    required
                    minLength={8}
                    disabled={isSubmitting}
                  />
                  <label
                    className={`absolute left-10 transition-all duration-300 pointer-events-none ${
                      isNewPasswordFocused || newPassword
                        ? "top-1 text-xs text-blue-500"
                        : "top-3.5 text-gray-500"
                    }`}
                  >
                    New Password
                  </label>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <img
                      src={assets.password_icon}
                      alt="Password"
                      className="h-5 w-5 text-gray-400"
                    />
                  </div>
                  <button
                    type="button"
                    className="absolute cursor-pointer inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                    onClick={toggleNewPasswordVisibility}
                    disabled={isSubmitting}
                  >
                    {showNewPassword ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-2 mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 bg-gray-800 text-white font-medium transition-colors duration-300 rounded ${
                  isSubmitting
                    ? "opacity-80 cursor-not-allowed"
                    : "hover:bg-gray-900"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
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
                  </span>
                ) : resetStep === 1 ? (
                  "Send Reset Code"
                ) : resetStep === 2 ? (
                  "Verify Code"
                ) : (
                  "Reset Password"
                )}
              </button>

              <button
                type="button"
                onClick={handleBackToLogin}
                className="w-full py-2 px-4 text-gray-400 hover:text-gray-100 transition-colors duration-300 text-sm"
                disabled={isSubmitting}
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Regular Login/Signup UI
  return (
    <div
      className="min-h-screen flex items-center justify-center p-3 sm:p-4"
      style={{
        backgroundImage: `url(${assets.background_image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="relative w-full max-w-md">
        <form
          onSubmit={onSubmitHandler}
          className="relative z-10 flex flex-col items-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm border border-white/30 rounded-lg shadow-lg"
        >
          {/* Title */}
          <div className="mb-4 text-center">
            <div className="mb-3 text-xl font-bold text-gray-800">
              <Title
                text1={currentState === "Login" ? "WELCOME" : "CREATE"}
                text2={currentState === "Login" ? "BACK" : "ACCOUNT"}
                className="text-xl"
              />
            </div>
            <p className="text-gray-400 text-sm">
              {currentState === "Login"
                ? "Sign in to your account"
                : "Create a new account"}
            </p>
          </div>

          {/* Form Fields */}
          <div className="w-full space-y-3">
            {currentState === "Sign Up" && (
              <div className="relative mt-5">
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  type="text"
                  onFocus={() => setIsNameFocused(true)}
                  onBlur={() => setIsNameFocused(!!name)}
                  className="w-full px-4 py-3 bg-black/50 backdrop-blur-sm border border-white/30 focus:border-blue-500 outline-none transition-all duration-300 text-gray-700 rounded peer"
                  required
                  disabled={isSubmitting}
                />
                <label
                  className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                    isNameFocused || name
                      ? "top-1 text-xs text-blue-500"
                      : "top-3.5 text-gray-500"
                  }`}
                >
                  Full Name
                </label>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800">
                  <img
                    src={assets.profile}
                    alt="Name"
                    className="h-5 w-5 text-gray-400"
                  />
                </div>
              </div>
            )}

            <div className="relative mt-5">
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(!!email)}
                className="w-full px-4 py-3 bg-black/50 backdrop-blur-sm border border-white/30 focus:border-blue-500 outline-none transition-all duration-300 text-gray-700 rounded peer"
                required
                disabled={isSubmitting}
              />
              <label
                className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                  isEmailFocused || email
                    ? "top-1 text-xs text-blue-500"
                    : "top-3.5 text-gray-500"
                }`}
              >
                Email Address
              </label>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800">
                <img
                  src={assets.mail_icon}
                  alt="Email"
                  className="h-5 w-5 text-gray-400"
                />
              </div>
            </div>

            <div className="relative mt-5">
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type={showPassword ? "text" : "password"}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(!!password)}
                className="w-full px-4 py-3 pr-10 bg-black/50 backdrop-blur-sm border border-white/30 focus:border-blue-500 outline-none transition-all duration-300 text-gray-700 rounded peer"
                required
                disabled={isSubmitting}
                minLength={currentState === "Sign Up" ? 8 : 1}
              />
              <label
                className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                  isPasswordFocused || password
                    ? "top-1 text-xs text-blue-500"
                    : "top-3.5 text-gray-500"
                }`}
              >
                Password
              </label>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800">
                <img
                  src={assets.password_icon}
                  alt="Password"
                  className="h-5 w-5 text-gray-400"
                />
              </div>
              <button
                type="button"
                className="absolute cursor-pointer inset-y-0 right-8 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                onClick={togglePasswordVisibility}
                disabled={isSubmitting}
              >
                {showPassword ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Action Links */}
          <div className="w-full flex justify-between text-xs mt-3 mb-4 text-gray-400">
            <button
              type="button"
              onClick={handleForgotPasswordClick}
              className="hover:text-gray-200 cursor-pointer transition-colors duration-300"
              disabled={isSubmitting}
            >
              Forgot Password?
            </button>

            <button
              type="button"
              onClick={handleStateChange}
              className="hover:text-gray-200 cursor-pointer transition-colors duration-300"
              disabled={isSubmitting}
            >
              {currentState === "Login" ? "Create Account" : "Back to Login"}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full cursor-pointer py-3 px-4 bg-black/90 backdrop-blur-sm border border-white/10 text-white hover:bg-gray-800 font-medium transition-colors duration-300 rounded ${
              isSubmitting
                ? "opacity-80 cursor-not-allowed"
                : "hover:bg-gray-900"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
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
                    className="opacity-70"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : currentState === "Login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>

          {/* Divider */}
          <div className="relative w-full my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600/50"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-black/50 backdrop-blur-sm text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login Buttons Container */}
          <div className="flex flex-col items-center w-full gap-3">
            {/* Google Login Button */}
            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginError}
                shape="rectangular"
                size="medium"
                text="signin_with"
                theme="filled_blue"
                width="200"
                disabled={isSubmitting}
              />
            </div>

            {/* Facebook Login Button */}
            <button
              type="button"
              onClick={handleFacebookLogin}
              disabled={isSubmitting}
              className="flex justify-center cursor-pointer w-50 py-1 px-2 bg-blue-600 hover:bg-blue-700 text-white text-[15px] rounded transition-colors duration-300 items-center gap-4"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Sign in with Facebook</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
