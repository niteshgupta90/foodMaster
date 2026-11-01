import axios from "axios";

export const backendUrl = (
  import.meta.env.REACT_APP_BACKEND_URL || "http://localhost:5001"
).replace(/\/$/, "");
export function imageUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(value, backendUrl);
    if (url.pathname.startsWith("/uploads/")) return backendUrl + url.pathname;
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

const instance = axios.create({
  baseURL: backendUrl + "/api", // Use environment variable
});

// Attach token if exists
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["x-auth-token"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default instance;
