// src/utils/config.ts

// Get API URL from environment variable or determine from current hostname
let API_URL = "";

// Check for environment variable first (for production)
if (import.meta.env.VITE_API_BASE_URL) {
  API_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '') + '/api';
} else if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
  // Dev desktop
  API_URL = "http://localhost:8000/api";
} else if (window.location.hostname.startsWith("192.168.")) {
  // LAN access from phone
  API_URL = `http://${window.location.hostname}:8000/api`;
} else {
  // Production - use same hostname with /api
  // This will work when frontend and backend are on same domain
  // For Render, you'll need to set VITE_API_BASE_URL to your backend URL
  API_URL = `${window.location.protocol}//${window.location.hostname}/api`;
}

export default API_URL;
