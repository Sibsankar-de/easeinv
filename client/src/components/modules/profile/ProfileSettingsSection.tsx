"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { User, Lock, Mail, HelpCircle } from "lucide-react";
import { toast } from "react-toastify";

import { PrimaryBox } from "@/components/ui/PrimaryBox";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import {
  selectUserSate,
  updateUserThunk,
  updatePasswordThunk,
} from "@/store/features/userSlice";
import { AppDispatch } from "@/store/store";

export const ProfileSettingsSection = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    data: user,
    updateProfileStatus,
    updatePasswordStatus,
  } = useSelector(selectUserSate);

  // Username form state
  const [userName, setUserName] = useState("");
  const [prevUserUsername, setPrevUserUsername] = useState("");

  if (user?.userName && user.userName !== prevUserUsername) {
    setPrevUserUsername(user.userName);
    setUserName(user.userName);
  }

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isUpdatingUsername = updateProfileStatus === "loading";
  const isUpdatingPassword = updatePasswordStatus === "loading";

  // Handle Username Update
  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    try {
      await dispatch(
        updateUserThunk({
          userName: userName.trim(),
          email: user?.email,
        }),
      ).unwrap();

      toast.success("Profile username updated successfully!");
    } catch {
      // Errors are handled by api-thunk interceptor
    }
  };

  // Handle Password Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Current password is required");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    await dispatch(
      updatePasswordThunk({
        currentPassword,
        newPassword,
      }),
    )
      .unwrap()
      .then(() => {
        toast.success("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      });
  };

  // Handle Simulated Forgot Password
  const handleForgotPassword = () => {
    toast.info(
      "Forgot password email requested (Simulated). Please check your inbox for instructions.",
    );
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Section 1: Username Update */}
      <section className="space-y-4">
        <div className="border-b border-gray-100 pb-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Profile Information
          </h2>
          <p className="text-xs text-gray-500">
            Update your public identity details.
          </p>
        </div>

        <PrimaryBox className="space-y-6">
          <form onSubmit={handleUpdateUsername} className="space-y-6">
            {/* Username Input */}
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-sm font-medium text-gray-700"
              >
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={userName}
                onChange={(val) => setUserName(val)}
                placeholder="Enter your username"
                icon={<User className="w-5 h-5" />}
                required
                disabled={isUpdatingUsername}
              />
            </div>

            {/* Email Input (Read-only) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email Address
                </Label>
                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Cannot be changed
                </span>
              </div>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                icon={<Mail className="w-5 h-5 text-gray-300" />}
                disabled={true}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isUpdatingUsername}
                loading={isUpdatingUsername}
                className="px-6"
              >
                Save Username
              </Button>
            </div>
          </form>
        </PrimaryBox>
      </section>

      {/* Section 2: Reset Password */}
      <section className="space-y-4">
        <div className="border-b border-gray-100 pb-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Security Credentials
          </h2>
          <p className="text-xs text-gray-500">
            Update your account security password.
          </p>
        </div>

        <PrimaryBox>
          <form onSubmit={handleResetPassword} className="space-y-6">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(val) => setCurrentPassword(val)}
                placeholder="Enter password"
                icon={<Lock className="w-5 h-5" />}
                disabled={isUpdatingPassword}
                required
              />
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(val) => setNewPassword(val)}
                placeholder="Enter password"
                icon={<Lock className="w-5 h-5" />}
                disabled={isUpdatingPassword}
                required
              />
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(val) => setConfirmPassword(val)}
                placeholder="Enter password"
                icon={<Lock className="w-5 h-5" />}
                disabled={isUpdatingPassword}
                required
              />
            </div>

            {/* Form Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 text-left transition-colors cursor-pointer select-none"
              >
                Forgot password?
              </button>
              <Button
                type="submit"
                disabled={isUpdatingPassword}
                loading={isUpdatingPassword}
                className="px-6 justify-center"
              >
                Update Password
              </Button>
            </div>
          </form>
        </PrimaryBox>
      </section>
    </div>
  );
};
