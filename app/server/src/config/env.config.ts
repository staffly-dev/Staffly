import { getEnv } from "../utils/get-env";

const envConfig = () => ({
  PORT: getEnv("PORT", "4004"),
  NODE_ENV: getEnv("NODE_ENV", "development"),

  MONGO_URI_RMOTE: getEnv("MONGO_URI_RMOTE"),
  // MONGO_URI_LOCAL: getEnv("MONGO_URI_LOCAL"),

  JWT: {
    SECRET: getEnv("JWT_SECRET", "jwt_secret"),
    EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "15m"),
    REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET", "jwt_refresh_key"),
    REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "7d"),
  },

  UPSTASH_REDIS_REST_URL: getEnv("UPSTASH_REDIS_REST_URL"),
  UPSTASH_REDIS_REST_TOKEN: getEnv("UPSTASH_REDIS_REST_TOKEN"),

  ARCJET_KEY: getEnv("ARCJET_KEY"),
  ARCJET_ENV: getEnv("ARCJET_ENV"),

  FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", "localhost"),

  // Email configuration
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || "465"),
  EMAIL_SECURE: process.env.EMAIL_SECURE === "true",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_USER: process.env.EMAIL_USER || "stafflycompany@gmail.com",
  EMAIL_FROM: process.env.EMAIL_FROM || "stafflycompany@gmail.com",
});

export const Env = envConfig();
