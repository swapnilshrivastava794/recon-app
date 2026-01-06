import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import constant from "../constants/constant";

// ----------------------------------------------------------
// AXIOS INSTANCE
// ----------------------------------------------------------
const axiosInstance = axios.create({
  baseURL: constant.appBaseUrl,
});

// ----------------------------------------------------------
// PUBLIC ENDPOINTS (No token needed)
// ----------------------------------------------------------
const publicEndpoints = [
  "/account/registration/",
  "/account/login/",
  "/api/auth/otp/",
];

// ----------------------------------------------------------
// REQUEST INTERCEPTOR → Attach token for protected APIs
// ----------------------------------------------------------
axiosInstance.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("accessToken");

  // Check if URL is public
  const isPublic = publicEndpoints.some((endpoint) =>
    config.url && config.url.includes(endpoint)
  );

  if (!isPublic && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ----------------------------------------------------------
// RESPONSE INTERCEPTOR (Auto-Refresh Logic)
// ----------------------------------------------------------
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
        return Promise.reject(error);
    }

    // IF 401 Unauthorized AND NOT already retried
    const isLoginRequest = originalRequest.url && originalRequest.url.includes("account/login" || "api/auth/login");
    
    if (error.response && error.response.status === 401 && !originalRequest._retry && !isLoginRequest) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        if (!refreshToken) {
            // No refresh token -> Logout
            await logoutUser();
            return Promise.reject(error);
        }

        // Call Refresh API
        const res = await axios.post(`${constant.appBaseUrl}/api/token/refresh/`, {
            refresh: refreshToken
        });

        if (res.data.access) {
            await saveToken(res.data.access, res.data.refresh || refreshToken);
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
            return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed -> Logout
        console.log("❌ REFRESH FAILED:", refreshError?.response?.data || refreshError.message);
        console.log("Session expired, logging out...");
        await logoutUser();
        return Promise.reject(refreshError);
      }
    }

    if (error.response) {
      return Promise.reject(error.response.data);
    }
    if (error.request) {
      return Promise.reject("Server did not respond");
    }
    return Promise.reject(error.message);
  }
);


// ----------------------------------------------------------
// TOKEN HELPERS
// ----------------------------------------------------------
export async function saveToken(accessToken, refreshToken) {
  await AsyncStorage.setItem("accessToken", accessToken);
  if (refreshToken) {
    await AsyncStorage.setItem("refreshToken", refreshToken);
  }
}

export async function logoutUser() {
  await AsyncStorage.removeItem("accessToken");
  await AsyncStorage.removeItem("refreshToken");
}

// ----------------------------------------------------------
// AUTH APIS
// ----------------------------------------------------------

// LOGIN → multipart/form-data
export function login(formData) {
  return axiosInstance.post("/account/login/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

// REGISTER → multipart/form-data
// REGISTER → multipart/form-data
export function signup(formData) {
  return axiosInstance.post("/account/registration/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

// GET PROFILE
export function getReporterProfile() {
  return axiosInstance.get("/reporter/profile/");
}

// UPDATE PROFILE
export function updateReporterProfile(formData) {
  return axiosInstance.put("/reporter/profile/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export default axiosInstance;
