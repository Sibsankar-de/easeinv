"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PrimaryBox } from "@/components/ui/PrimaryBox";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Lock, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "@/utils/toast";
import api from "@/configs/axios-config";
import { requestHandler } from "@/utils/api-request";

export const ResetPasswordComponent = ({
  initialToken,
  initialTab,
}: {
  initialToken?: string;
  initialTab?: string;
}) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const activeTab =
    initialTab === "reset" || !!initialToken ? "reset" : "email";
  const [token, setToken] = useState(initialToken || "");

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);

  const [emailSent, setEmailSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  useEffect(() => {
    if (initialToken) {
      setToken(initialToken);
    }
  }, [initialToken]);

  useEffect(() => {
    if (!emailSent) return;
    if (resendCountdown <= 0) return;

    const timer = setTimeout(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [emailSent, resendCountdown]);

  useEffect(() => {
    if (!resetSuccess) return;
    if (redirectCountdown <= 0) {
      router.push(isAuthenticated ? "/profile" : "/auth/login");
      return;
    }

    const timer = setTimeout(() => {
      setRedirectCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resetSuccess, redirectCountdown, isAuthenticated, router]);

  const handleRequestLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Email address is required");
      return;
    }

    setIsSubmittingEmail(true);
    const sendRequest = requestHandler(async () => {
      await api.post("/users/forgot-password", { email: email.trim() });
      setEmailSent(true);
      setResendCountdown(60);
      toast.success("Password reset email sent successfully!");
    });

    try {
      await sendRequest();
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("A valid verification token is required");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmittingReset(true);
    const sendReset = requestHandler(async () => {
      await api.post("/users/reset-password", {
        token,
        password: newPassword,
      });
      setResetSuccess(true);
      toast.success("Password reset successfully!");
    });

    try {
      await sendReset();
    } finally {
      setIsSubmittingReset(false);
    }
  };

  if (emailSent) {
    return (
      <PrimaryBox className="max-w-md w-full mx-auto p-8 shadow-xl border-none text-center">
        <div className="flex flex-col items-center py-6">
          <div className="bg-green-50 p-4 rounded-full mb-6">
            <CheckCircle2 className="w-14 h-14 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Check Your Email
          </h2>
          <p className="text-gray-500 mb-8 max-w-sm">
            If this email is registered in our system, a password reset link has
            been sent to{" "}
            <span className="font-semibold text-gray-700">{email}</span>. Click
            on the link to reset your password. Be sure to check your spam
            folder if you do not see it shortly.
          </p>
          <Button
            onClick={() => {
              setEmailSent(false);
            }}
            variant="none"
            className="text-primary text-sm font-semibold mx-auto p-0! border-none! hover:bg-transparent!"
            disabled={resendCountdown > 0}
          >
            {resendCountdown > 0
              ? `Didn't receive email? Send again in ${resendCountdown}s`
              : "Didn't receive email? Send again"}
          </Button>
        </div>
      </PrimaryBox>
    );
  }

  if (resetSuccess) {
    return (
      <PrimaryBox className="max-w-md w-full mx-auto p-8 shadow-xl border-none text-center">
        <div className="flex flex-col items-center py-6">
          <div className="bg-green-50 p-4 rounded-full mb-6">
            <CheckCircle2 className="w-14 h-14 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Password Reset Done!
          </h2>
          <p className="text-gray-500 mb-8 max-w-sm">
            Your password has been reset successfully. Redirecting to{" "}
            {isAuthenticated ? "profile" : "login"} in{" "}
            <span className="font-semibold text-indigo-600">
              {redirectCountdown}s
            </span>
            ...
          </p>
          <Button
            onClick={() =>
              router.push(isAuthenticated ? "/profile" : "/auth/login")
            }
            className="w-full justify-center py-2.5 flex items-center gap-2"
          >
            Go Now
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </PrimaryBox>
    );
  }

  return (
    <PrimaryBox className="max-w-md w-full mx-auto p-6 shadow-xl border-none">
      {activeTab === "email" && (
        <form onSubmit={handleRequestLink} className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Forgot Password
            </h2>
            <p className="text-sm text-gray-500">
              Enter your email address to receive a secure password reset link.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="request-email">Email Address</Label>
            <Input
              id="request-email"
              type="email"
              value={email}
              onChange={(val) => setEmail(val)}
              placeholder="Enter your email"
              icon={<Mail className="w-5 h-5" />}
              required
              disabled={isSubmittingEmail}
            />
          </div>

          <Button
            type="submit"
            className="w-full justify-center py-2.5"
            disabled={isSubmittingEmail}
            loading={isSubmittingEmail}
          >
            Get Reset Link
          </Button>
        </form>
      )}

      {activeTab === "reset" && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              New Credentials
            </h2>
            <p className="text-sm text-gray-500">
              Enter a secure new password for your account.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reset-new-password">New Password</Label>
            <Input
              id="reset-new-password"
              type="password"
              value={newPassword}
              onChange={(val) => setNewPassword(val)}
              placeholder="Enter password"
              icon={<Lock className="w-5 h-5" />}
              required
              disabled={isSubmittingReset}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reset-confirm-password">Confirm Password</Label>
            <Input
              id="reset-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(val) => setConfirmPassword(val)}
              placeholder="Enter password"
              icon={<Lock className="w-5 h-5" />}
              required
              disabled={isSubmittingReset}
            />
          </div>

          <Button
            type="submit"
            className="w-full justify-center py-2.5"
            disabled={isSubmittingReset}
            loading={isSubmittingReset}
          >
            Reset Password
          </Button>
        </form>
      )}
    </PrimaryBox>
  );
};
