import React, {
  createContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import axios from "axios";

export const AdminContext = createContext();

// Constants
const TOKEN_STORAGE_KEY = "adminToken";
const AUTH_ERROR_CODES = [401, 403];

const AdminContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [token, setTokenState] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY) || "";
    } catch (error) {
      return "";
    }
  });

  const requestInterceptorRef = useRef(null);
  const responseInterceptorRef = useRef(null);

  const logout = useCallback(() => {
    setTokenState("");
    try {
      sessionStorage.clear();
    } catch (error) {
      // Silent fail for cleanup errors
    }
  }, []);

  // Secure token storage with error handling
  useEffect(() => {
    const handleTokenStorage = () => {
      try {
        if (token) {
          localStorage.setItem(TOKEN_STORAGE_KEY, token);
        } else {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      } catch (error) {
        // Fallback to sessionStorage
        if (token) {
          sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
        } else {
          sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      }
    };

    handleTokenStorage();
  }, [token]);

  // Request interceptor for authentication
  useEffect(() => {
    if (requestInterceptorRef.current !== null) {
      axios.interceptors.request.eject(requestInterceptorRef.current);
    }

    requestInterceptorRef.current = axios.interceptors.request.use(
      (config) => {
        if (token && config.url?.startsWith(backendUrl)) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          };
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      if (requestInterceptorRef.current !== null) {
        axios.interceptors.request.eject(requestInterceptorRef.current);
        requestInterceptorRef.current = null;
      }
    };
  }, [token, backendUrl]);

  // Response interceptor for handling auth errors
  useEffect(() => {
    if (responseInterceptorRef.current !== null) {
      axios.interceptors.response.eject(responseInterceptorRef.current);
    }

    responseInterceptorRef.current = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (AUTH_ERROR_CODES.includes(error.response?.status || 0)) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      if (responseInterceptorRef.current !== null) {
        axios.interceptors.response.eject(responseInterceptorRef.current);
        responseInterceptorRef.current = null;
      }
    };
  }, [logout]);

  // Token validation on app start
  useEffect(() => {
    const validateToken = async () => {
      if (!token) return;

      try {
        // Optional: Add token validation endpoint call here
        // await axios.get(`${backendUrl}/auth/validate`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
      } catch (error) {
        logout();
      }
    };

    validateToken();
  }, [token, backendUrl, logout]);

  const value = {
    token,
    setToken: setTokenState,
    logout,
    backendUrl,
    isAuthenticated: !!token,
  };

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

// Custom hook for using the context
export const useAdmin = () => {
  const context = React.useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminContextProvider");
  }
  return context;
};

export default AdminContextProvider;
