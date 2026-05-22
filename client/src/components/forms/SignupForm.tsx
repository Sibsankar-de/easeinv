"use client";

import { useContext, useState } from "react";
import { Lock, Mail, User } from "lucide-react";
import { Label } from "../ui/Label";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Checkbox } from "../ui/Checkbox";
import Link from "next/link";
import { toast } from "react-toastify";
import AuthContext from "@/contexts/AuthContext";
import { GoogleIcon } from "../icons/GoogleIcon";
import { Separator } from "../ui/Separator";

export const SignupForm = () => {
  const { registerUser, loginWithGoogle } = useContext(AuthContext)!;
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    isAccepted: false,
  });

  function handleFormData(key: keyof typeof formData, value: any) {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSignUp() {
    let isError = false;
    Object.keys(formData).forEach((k) => {
      if (!formData[k as keyof typeof formData] && k != "isAccepted") {
        isError = true;
        toast.error(`${k} is required`);
        return;
      }
    });

    if (isError) return;
    if (formData.password.length < 5) {
      toast.warn("Password should contain minimum of 5 characters.");
      return;
    }
    if (!formData.isAccepted) {
      toast.warn("You need to accept terms and conditions to continue");
      return;
    }

    setIsLoading(true);
    await registerUser(formData);
    setIsLoading(false);
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
          handleSignUp();
        }}
        className="space-y-4"
      >
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="username" required>
            Full name
          </Label>
          <div className="relative">
            <Input
              id="username"
              type="text"
              value={formData.userName}
              onChange={(e) => handleFormData("userName", e)}
              placeholder="Enter your name"
              icon={<User className="w-5 h-5 text-gray-400" />}
              required
              disabled={isLoading || isGoogleLoading}
            />
          </div>
        </div>
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

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={formData.isAccepted}
              onChange={(checked) => handleFormData("isAccepted", checked)}
            />
            <label
              htmlFor="remember"
              className="text-sm text-gray-700 cursor-pointer"
            >
              Accept{" "}
              <Link href={"/"} className="text-primary">
                Terms & conditions.
              </Link>
            </label>
          </div>
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          className="w-full justify-center"
          disabled={isLoading || isGoogleLoading}
          loading={isLoading}
        >
          Sign Up
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
