import { toast as hotToast, ToastOptions } from "react-hot-toast";

export const toast = Object.assign(
  (message: any, options?: ToastOptions) => hotToast(message, options),
  hotToast,
  {
    warn: (message: any, options?: ToastOptions) =>
      hotToast(message, {
        icon: "⚠️",
        style: {
          color: "#854d0e",
          ...options?.style,
        },
        ...options,
      }),
    info: (message: any, options?: ToastOptions) =>
      hotToast(message, {
        icon: "ℹ️",
        style: {
          color: "#1e40af",
          ...options?.style,
        },
        ...options,
      }),
  },
);

export default toast;
