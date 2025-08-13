import path from "path";
import { getEnv } from "../utils/get-env";
import dotenv from 'dotenv';
dotenv.config();
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const envConfig = () => ({
    //? =========== API Gateway Configuration ===========
    PORT: getEnv("PORT", "4005"),
    NODE_ENV: getEnv("NODE_ENV", "development"),
    FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", "http://localhost:3000"),

    //? Server URLs for proxy
    SERVER_URL: getEnv("SERVER_URL", "http://localhost:4004"),
    ATS_SYSTEM_URL: getEnv("ATS_SYSTEM_URL", "http://localhost:4000"),

    //? =========== Auth ===========
    JWT_SECRET: getEnv("JWT_SECRET"),
    JWT_AUDIENCE: getEnv("JWT_AUDIENCE", "user"),

    //! =========== Security Layer===========
    // Rate limiting
    RATE_LIMIT_WINDOW_MS: getEnv("RATE_LIMIT_WINDOW_MS", "900000"),
    RATE_LIMIT_MAX_REQUESTS: getEnv("RATE_LIMIT_MAX_REQUESTS", "100"),
    GLOBAL_RATE_LIMIT_WINDOW_MS: getEnv("GLOBAL_RATE_LIMIT_WINDOW_MS", "60000"),
    GLOBAL_RATE_LIMIT_MAX_REQUESTS: getEnv("GLOBAL_RATE_LIMIT_MAX_REQUESTS", "1000"),
    STRICT_RATE_LIMIT_WINDOW_MS: getEnv("STRICT_RATE_LIMIT_WINDOW_MS", "60000"),
    STRICT_RATE_LIMIT_MAX_REQUESTS: getEnv("STRICT_RATE_LIMIT_MAX_REQUESTS", "10"),
    TRUSTED_IPS: getEnv("TRUSTED_IPS", ""),

    // DDoS Protection
    DDOS_LIMIT: getEnv("DDOS_LIMIT", "100"),
    DDOS_BURST: getEnv("DDOS_BURST", "50"),
    DDOS_WINDOW_MS: getEnv("DDOS_WINDOW_MS", "60000"),
    DDOS_BLACKLIST: getEnv("DDOS_BLACKLIST", ""),
    DDOS_WHITELIST: getEnv("DDOS_WHITELIST", ""),
    DDOS_AUTO_BAN_COUNT: getEnv("DDOS_AUTO_BAN_COUNT", "5"),
    DDOS_AUTO_BAN_TIME: getEnv("DDOS_AUTO_BAN_TIME", "300000"),

    // CORS Protection
    CORS_ORIGIN: getEnv("CORS_ORIGIN", "http://localhost:3000"),
    CORS_METHODS: getEnv("CORS_METHODS", "GET,POST,PUT,DELETE,OPTIONS"),
    CORS_ALLOWED_HEADERS: getEnv("CORS_ALLOWED_HEADERS", "Content-Type,Authorization,X-Requested-With"),
    CORS_EXPOSED_HEADERS: getEnv("CORS_EXPOSED_HEADERS", ""),
    CORS_CREDENTIALS: getEnv("CORS_CREDENTIALS", "true"),
    CORS_MAX_AGE: getEnv("CORS_MAX_AGE", "86400"),
    CORS_WHITELIST: getEnv("CORS_WHITELIST", "http://localhost:3000"),
    CORS_BLACKLIST: getEnv("CORS_BLACKLIST", ""),
    CORS_SECURITY_HEADERS: getEnv("CORS_SECURITY_HEADERS", "true"),

    //* Database configuration (MongoDB) - for logging
    MONGO_URI_RMOTE: getEnv("MONGO_URI_RMOTE"),

    // ============ Redis Configuration ============
    // UPSTASH_REDIS_REST_URL: getEnv("UPSTASH_REDIS_REST_URL"),
    // UPSTASH_REDIS_REST_TOKEN: getEnv("UPSTASH_REDIS_REST_TOKEN"),
});

export const Env = envConfig(); 