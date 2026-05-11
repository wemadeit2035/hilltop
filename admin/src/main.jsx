import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import AdminContextProvider from "./context/AdminContext.jsx";

// Production error handler for uncaught errors
const handleGlobalError = (error, errorInfo) => {
  console.error("Global error caught:", error, errorInfo);
  // In production, you would send this to your error reporting service
  // logErrorToService(error, errorInfo);
};

// Performance monitoring setup (optional)
const reportWebVitals = (metric) => {
  // In production, you would send these metrics to your analytics service
  console.log(metric);
};

class MainErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    handleGlobalError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <h1>Something went wrong</h1>
          <p>Please refresh the page or try again later.</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

// StrictMode is disabled in production to avoid double-rendering
// but you can enable it during development
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <MainErrorBoundary>
      <BrowserRouter>
        <AdminContextProvider>
          <App />
        </AdminContextProvider>
      </BrowserRouter>
    </MainErrorBoundary>
  </React.StrictMode>
);

// Optional: Initialize error reporting and performance monitoring
if (process.env.NODE_ENV === "production") {
  // Initialize your error reporting service here
  // initErrorReporting();
  // Initialize your performance monitoring here
  // initPerformanceMonitoring(reportWebVitals);
}

// Handle unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  handleGlobalError(event.reason, { type: "unhandledrejection" });
  event.preventDefault();
});

// Handle other uncaught errors
window.addEventListener("error", (event) => {
  handleGlobalError(event.error, { type: "window.error" });
});
