import axios from "axios";
import { toast } from "react-toastify";

export const requestHandler = <T>(func: (payload?: any) => Promise<T>) => {
  return async (payload?: any): Promise<T | undefined> => {
    try {
      return await func(payload);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        if (message) {
          toast.error(message);
        }
      }
    }
  };
};
