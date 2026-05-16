"use client";

import api from "@/configs/axios-config";
import { AppDispatch } from "@/store/store";
import { requestHandler } from "@/utils/api-request";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser, selectUserSate } from "@/store/features/userSlice";
import { useRouter } from "next/navigation";

type AuthContextTypes = {
  isAuthenticated: boolean;
  isAuthChecking: boolean;
  registerUser: (payload: any) => void;
  loginUser: (payload: any) => void;
  logoutUser: () => void;
  loginWithGoogle: () => void;
};

const AuthContext = createContext<AuthContextTypes | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // fetch current user
  useEffect(() => {
    dispatch(fetchCurrentUser())
      .unwrap()
      .then(() => {
        setIsAuthenticated(true);
      })
      .finally(() => {
        setIsAuthChecking(false);
      });
  }, [dispatch]);

  const registerUser = requestHandler(async (payload) => {
    await api.post("/users/register", payload).then(async () => {
      await loginUser(payload);
    });
  });

  const loginUser = requestHandler(async (payload) => {
    await api.post("/users/login", payload).then(() => {
      window.location.href = `${window.location.origin}/profile`;
    });
  });

  const logoutUser = requestHandler(async () => {
    await api.get("/users/logout").then(() => {
      window.location.href = `${window.location.origin}/auth/login`;
    });
  });

  const loginWithGoogle = requestHandler(async () => {
    window.location.href = `${window.location.origin}/api/oauth/authenticate/google`;
  });

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAuthChecking,
        registerUser,
        loginUser,
        logoutUser,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
