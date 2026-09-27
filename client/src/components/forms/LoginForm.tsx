"use client";

import React, { useContext, useState } from "react";
import { Lock, Mail } from "lucide-react";
import { Label } from "../ui/Label";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import AuthContext from "@/contexts/AuthContext";
import { toast } from "@/utils/toast";
import { Separator } from "../ui/Separator";
import { GoogleIcon } from "../icons/GoogleIcon";
import { TextLink } from "../ui/TextLink";
import { useTurnstile } from "@/hooks/useTurnstile";
import { TurnstileWidget } from "../ui/TurnstileWidget";

export const LoginForm = () => {
  const { loginUser, loginWithGoogle } = useContext(AuthContext)!;
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { turnstileToken, setTurnstileToken, resetTurnstile, turnstileRef } =
    useTurnstile();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  function handleFormData(key: keyof typeof formData, value: any) {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleLogin() {
    let isError = false;
    Object.keys(formData).forEach((k) => {
      if (!formData[k as keyof typeof formData]) {
        isError = true;
        toast.error(`${k} is required`);
        return;
      }
    });

    if (isError) return;

    if (!turnstileToken) {
      toast.error("Please complete the Turnstile security check");
      return;
    }

    setIsLoading(true);
    try {
      await loginUser({ ...formData, turnstileToken });
    } catch {
      resetTurnstile();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setIsGoogleLoading(true);
    await loginWithGoogle();
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
        className="space-y-4"
      >
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" required>
            Email Address
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleFormData("email", e)}
              placeholder="Enter your email"
              icon={<Mail className="w-5 h-5 text-gray-400" />}
              required
              disabled={isLoading || isGoogleLoading}
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" required>
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={"password"}
              value={formData.password}
              onChange={(e) => handleFormData("password", e)}
              placeholder="Enter your password"
              icon={<Lock className="w-5 h-5 text-gray-400" />}
              required
              disabled={isLoading || isGoogleLoading}
            />
          </div>
        </div>

        {/* Forgot Password */}
        <div className="flex items-center justify-end">
          <TextLink href={"/reset-password"}>Forgot password?</TextLink>
        </div>

        {/* Turnstile Widget */}
        <TurnstileWidget
          ref={turnstileRef}
          onVerify={(token) => setTurnstileToken(token)}
          onExpire={() => setTurnstileToken("")}
          onError={() => setTurnstileToken("")}
        />

        {/* Login Button */}
        <Button
          type="submit"
          className="w-full justify-center"
          disabled={isLoading || isGoogleLoading || !turnstileToken}
          loading={isLoading}
        >
          Log In
        </Button>

        {/* Divider */}
        <Separator text="Or continue with" className="my-7" />

        {/* Google Button */}
        <Button
          variant="outline"
          className="w-full justify-center"
          disabled={isLoading || isGoogleLoading}
          loading={isGoogleLoading}
          onClick={handleGoogleLogin}
        >
          <GoogleIcon />
          Google
        </Button>
      </form>
    </div>
  );
};
