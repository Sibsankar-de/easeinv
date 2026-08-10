"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";
import { useDispatch } from "react-redux";
import { fetchNotificationsThunk } from "@/store/features/notificationSlice";
import { NotificationDto } from "@/types/dto/notificationDto";
import { toast } from "@/utils/toast";

interface NotificationContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType>({
  socket: null,
  isConnected: false,
});

export const useNotificationSocket = () => useContext(NotificationContext);

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isAuthenticated } = useAuth();
  const dispatch = useDispatch<any>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketUrl = new URL(process.env.NEXT_PUBLIC_API_URI!).origin;

    const socketInstance = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    // Real-time Notification Listener
    socketInstance.on("notification:new", (notification: NotificationDto) => {
      // 1. Immediately fetch page 1 to update Redux store & unread badge
      dispatch(fetchNotificationsThunk({ page: 1 }));

      // 2. Display simple real-time toast alert
      const text = notification.title
        ? `${notification.title}: ${notification.message}`
        : notification.message;
      toast.info(text);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [isAuthenticated, dispatch]);

  return (
    <NotificationContext.Provider value={{ socket, isConnected }}>
      {children}
    </NotificationContext.Provider>
  );
};
