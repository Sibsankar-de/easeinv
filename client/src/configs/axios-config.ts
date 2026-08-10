import { setGlobalError } from "@/store/features/globalErrorSlice";
import axios from "axios";

const rawBaseUrl = process.env.NEXT_PUBLIC_API_URI || "http://localhost:4000/backend";
const baseURL = `${rawBaseUrl.replace(/\/+$/, "")}/api/v1`;

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const message = err.response?.data?.message;
      try {
        const { default: store } = await import("@/store/store");
        store.dispatch(
          setGlobalError({
            status,
            message: message,
          }),
        );
      } catch {
        // Fallback if store cannot be imported
      }
    }

    return Promise.reject(err);
  },
);

export default api;
