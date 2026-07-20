"use client";

import React, { useEffect, useState } from "react";
import { PrimaryBox } from "@/components/ui/PrimaryBox";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/loader";
import { CheckCircle2, XCircle, Mail, ArrowRight } from "lucide-react";
import api from "@/configs/axios-config";
import { requestHandler } from "@/utils/api-request";
import Link from "next/link";

export const VerifyEmailComponent = ({ token }: { token?: string }) => {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status != "idle") return;
    if (!token) {
      setStatus("error");
      setMessage("No verification token was provided in the URL link.");
      return;
    }

    const verifyToken = requestHandler(async (token: string) => {
      await api
        .post(`/users/verify-email?token=${token}`)
        .then(() => {
          setStatus("success");
          setMessage("Your email address has been successfully verified!");
        })
        .catch(() => {
          setStatus("error");
          setMessage(
            "Verification failed. The token may be invalid or expired.",
          );
        });
    });

    setStatus("loading");
    verifyToken();
  }, [token]);

  return (
    <PrimaryBox className="max-w-md w-full mx-auto p-8 shadow-xl border-none text-center">
      {status === "loading" && (
        <div className="flex flex-col items-center py-6">
          <div className="relative flex items-center justify-center mb-6">
            <Loader
              className="border-indigo-100 border-t-indigo-600"
              size={64}
              stroke={4}
            />
            <Mail className="absolute w-6 h-6 text-indigo-600 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verifying Email
          </h2>
          <p className="text-gray-500 max-w-sm">
            Please wait while we confirm your email verification details...
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center py-6">
          <div className="bg-green-50 p-4 rounded-full mb-6">
            <CheckCircle2 className="w-14 h-14 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verification Complete
          </h2>
          <p className="text-green-600 font-semibold mb-3">{message}</p>
          <p className="text-gray-500 mb-8 max-w-sm">
            Your account is now fully active. You can proceed to your profile
            page.
          </p>
          <Link href="/profile" className="w-full">
            <Button className="w-full justify-center py-3 text-base font-bold flex items-center gap-2">
              Go to Profile
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center py-6">
          <div className="bg-red-50 p-4 rounded-full mb-6">
            <XCircle className="w-14 h-14 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verification Failed
          </h2>
          <p className="text-red-500 font-semibold mb-3">{message}</p>
          <p className="text-gray-500 mb-8 max-w-sm">
            Make sure you copied the full link or request a new verification
            email from your profile/dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link href="/" className="flex-1">
              <Button
                variant="outline"
                className="w-full justify-center text-sm font-semibold"
              >
                Go to Home
              </Button>
            </Link>
            <Link href="/auth/login" className="flex-1">
              <Button className="w-full justify-center text-sm font-semibold">
                Go to Login
              </Button>
            </Link>
          </div>
        </div>
      )}
    </PrimaryBox>
  );
};
