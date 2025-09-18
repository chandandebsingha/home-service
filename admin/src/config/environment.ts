// Environment Configuration for Admin Next.js app
const resolveBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  return "http://localhost:3001/api";
};

export const ENV = {
  API_BASE_URL: resolveBaseUrl(),
  NODE_ENV: process.env.NODE_ENV || "development",
};

export const getApiUrl = (endpoint: string): string => {
  const base = ENV.API_BASE_URL.replace(/\/$/, "");
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
};


