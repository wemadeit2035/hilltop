import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";

/**
 * Security headers configuration
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: [
        "'self'",
        "https://api.stripe.com",
        "https://oauth2.googleapis.com",
      ],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: [
        "'self'",
        "https://js.stripe.com",
        "https://accounts.google.com",
      ],
      baseUri: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

/**
 * Rate limiting configurations
 */
export const createRateLimit = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: {
        message,
        type: "RateLimitError",
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
  });

// General API rate limiting
export const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  "Too many requests from this IP, please try again later."
);

// Stricter limits for auth endpoints
export const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 login attempts per window
  "Too many authentication attempts, please try again later."
);

// Stricter limits for OAuth endpoints
export const oauthLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  10, // 10 OAuth attempts per hour
  "Too many OAuth attempts, please try again later."
);

// Stricter limits for payment endpoints
export const paymentLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  10, // 10 payment attempts per window
  "Too many payment requests, please try again later."
);

// Stricter limits for password reset
export const passwordResetLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  3, // 3 password reset attempts per hour
  "Too many password reset attempts, please try again later."
);

/**
 * Custom NoSQL injection sanitization
 */
export const noSqlSanitization = (req, res, next) => {
  // Skip sanitization for OPTIONS requests (preflight)
  if (req.method === "OPTIONS") {
    return next();
  }

  const sanitize = (obj) => {
    if (obj && typeof obj === "object") {
      Object.keys(obj).forEach((key) => {
        // Check for MongoDB operators
        if (key.startsWith("$") || key.includes(".")) {
          delete obj[key];
          console.warn(`NoSQL injection attempt blocked: ${key}`, {
            ip: req.ip,
            path: req.path,
            timestamp: new Date().toISOString(),
          });
        } else if (typeof obj[key] === "object") {
          sanitize(obj[key]);
        }
      });
    }
  };

  // Sanitize request body, query, and params
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
};

/**
 * Custom XSS sanitization
 */
export const xssSanitization = (req, res, next) => {
  // Skip sanitization for OPTIONS requests (preflight)
  if (req.method === "OPTIONS") {
    return next();
  }

  const sanitize = (obj) => {
    if (obj && typeof obj === "object") {
      Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === "string") {
          // Basic XSS prevention - remove dangerous tags
          obj[key] = obj[key]
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
            .replace(/on\w+=/gi, "")
            .replace(/javascript:/gi, "")
            .replace(/vbscript:/gi, "");
        } else if (typeof obj[key] === "object") {
          sanitize(obj[key]);
        }
      });
    }
  };

  // Sanitize request body, query, and params
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
};

/**
 * Protect against parameter pollution
 */
export const parameterPollutionProtection = hpp({
  whitelist: [
    "price",
    "rating",
    "quantity",
    "page",
    "limit",
    "sort",
    "category",
    "search",
  ],
});

/**
 * CORS configuration
 */
export const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.ADMIN_URL,
      ...(process.env.NODE_ENV === "development"
        ? [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:4000",
          ]
        : []),
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Log CORS violations
    console.warn(`CORS violation attempt from origin: ${origin}`, {
      timestamp: new Date().toISOString(),
      allowedOrigins,
    });

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cookie",
    "X-Requested-With",
    "Accept",
    "Stripe-Signature", // For Stripe webhooks
  ],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400, // 24 hours
};

export default {
  securityHeaders,
  generalLimiter,
  authLimiter,
  oauthLimiter,
  paymentLimiter,
  passwordResetLimiter,
  noSqlSanitization,
  xssSanitization,
  parameterPollutionProtection,
  corsOptions,
};
