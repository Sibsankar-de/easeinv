import { setGlobalError } from "@/store/features/globalErrorSlice";
import store from "@/store/store";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URI,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const message = err.response?.data?.message;
      store.dispatch(
        setGlobalError({
          status,
          message: message,
        }),
      );
    }

    return Promise.reject(err);
  },
);

export default api;
