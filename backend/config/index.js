import dotenv from "dotenv";

dotenv.config();

// Required environment variables for production
const requiredEnvVars = [
  "MONGODB_URI",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "JWT_SECRET",
  "REFRESH_TOKEN_SECRET",
  "STRIPE_SECRET_KEY",
  "EMAIL_USER",
  "EMAIL_PASSWORD",
  "FRONTEND_URL",
];

// Optional with defaults
const optionalEnvVars = {
  NODE_ENV: "development",
  PORT: 4000,
  ADMIN_URL: "http://localhost:5174",
  JWT_ACCESS_EXPIRES_IN: "24h",
  JWT_REFRESH_EXPIRES_IN: "7d",
  COOKIE_EXPIRE: 30,
  EMAIL_SERVICE: "gmail",
  EMAIL_FROM: "Finezto <amoswetu22@gmail.com>",
  CONTACT_EMAIL: "amoswetu22@gmail.com",
  GOOGLE_CLIENT_ID: "",
  GOOGLE_CLIENT_SECRET: "",
  ADMIN_EMAIL: "amoswetu22@gmail.com",
};

// Validate environment
const validateEnvironment = () => {
  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
        "Please check your .env file or deployment configuration."
    );
  }

  // Set optional variables with defaults
  Object.entries(optionalEnvVars).forEach(([key, defaultValue]) => {
    if (!process.env[key]) {
      process.env[key] = defaultValue.toString();
    }
  });

  // Security validations
  if (process.env.NODE_ENV === "production") {
    if (process.env.JWT_SECRET.length < 32) {
      throw new Error(
        "JWT_SECRET must be at least 32 characters long in production"
      );
    }

    if (process.env.JWT_SECRET === process.env.REFRESH_TOKEN_SECRET) {
      throw new Error("JWT_SECRET and REFRESH_TOKEN_SECRET must be different");
    }

    if (!process.env.MONGODB_URI.includes("mongodb+srv://")) {
      throw new Error("Use MongoDB Atlas connection string in production");
    }

    if (!process.env.FRONTEND_URL.startsWith("https://")) {
      throw new Error("FRONTEND_URL must use HTTPS in production");
    }
  }
};

const config = {
  // Server
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT,
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",

  // Database
  database: {
    uri: process.env.MONGODB_URI,
    options: {
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    },
  },

  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
    expire: process.env.JWT_EXPIRE,
    refreshExpire: process.env.REFRESH_TOKEN_EXPIRE,
  },

  // Cookies
  cookies: {
    expire: parseInt(process.env.COOKIE_EXPIRE),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  },

  // OAuth
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },

  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
  },

  // Email
  email: {
    service: process.env.EMAIL_SERVICE,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM,
    contact: process.env.CONTACT_EMAIL,
  },

  // URLs
  urls: {
    frontend: process.env.FRONTEND_URL,
    admin: process.env.ADMIN_URL,
    api: process.env.API_URL,
  },

  // CORS
  cors: {
    allowedOrigins: [
      process.env.FRONTEND_URL,
      process.env.ADMIN_URL,
      ...(process.env.NODE_ENV === "development"
        ? [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:4000",
          ]
        : []),
    ].filter(Boolean),
  },

  // Admin (for initial setup only)
  admin: {
    email: process.env.ADMIN_EMAIL,
    // Password should NOT be stored in env variables
  },
};

// Validate on import
validateEnvironment();

export default config;
