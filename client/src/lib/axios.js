import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.NODE_ENV === "development"
        ? "http://localhost:8000/api"
        : "https://blog-api-ecru-seven.vercel.app/api",
    withCredentials: true,
});

axiosInstance.interceptors.request.use(
    (config) => {
        try {
            const token = localStorage.getItem("auth_token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error("Failed to get token from localStorage:", error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
