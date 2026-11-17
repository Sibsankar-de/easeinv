"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { Mail, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<"email" | "otp">("email");
  const [email, setEmail] = React.useState("");
  const [otpValue, setOtpValue] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("otp");
      toast.success("Verification Code Dispatched", {
        description: `We've sent a 6-digit OTP code to ${email}. (Demo code: 123456)`,
      });
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length < 6) {
      toast.error("Please enter all 6 digits of the OTP code");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Welcome back!", {
        description: "Successfully authenticated with [STORE_NAME] customer session.",
      });
      router.push("/");
    }, 600);
  };

  return (
    <Card className="w-full max-w-md border-border/80 shadow-md">
      <CardHeader className="space-y-1.5 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-brand/10 text-brand mb-2">
          <Mail className="size-5" />
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">
          {step === "email" ? "Sign In or Create Account" : "Enter Verification Code"}
        </CardTitle>
        <CardDescription className="text-xs">
          {step === "email"
            ? "Enter your email address to receive a secure passwordless login code."
            : `We sent a 6-digit security code to ${email}`}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {step === "email" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-2 text-xs">
              <Label htmlFor="email" className="font-semibold text-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                required
                autoFocus
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 text-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 font-semibold gap-2"
            >
              <span>{isLoading ? "Sending Code..." : "Continue with Email"}</span>
              <ArrowRight className="size-4" />
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="flex flex-col items-center justify-center space-y-3">
              <InputOTP
                maxLength={6}
                value={otpValue}
                onChange={setOtpValue}
              >
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} className="size-11 text-base font-mono font-bold rounded-lg border border-border/80" />
                  <InputOTPSlot index={1} className="size-11 text-base font-mono font-bold rounded-lg border border-border/80" />
                  <InputOTPSlot index={2} className="size-11 text-base font-mono font-bold rounded-lg border border-border/80" />
                  <InputOTPSlot index={3} className="size-11 text-base font-mono font-bold rounded-lg border border-border/80" />
                  <InputOTPSlot index={4} className="size-11 text-base font-mono font-bold rounded-lg border border-border/80" />
                  <InputOTPSlot index={5} className="size-11 text-base font-mono font-bold rounded-lg border border-border/80" />
                </InputOTPGroup>
              </InputOTP>

              <div className="rounded-lg bg-muted/40 px-3 py-1 text-center">
                <span className="text-[11px] text-muted-foreground font-mono">
                  Dummy Test Code: <strong className="text-foreground">123456</strong>
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                type="submit"
                disabled={isLoading || otpValue.length < 6}
                className="w-full h-10 font-semibold gap-2"
              >
                <span>{isLoading ? "Verifying..." : "Verify & Sign In"}</span>
                <CheckCircle2 className="size-4" />
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setOtpValue("");
                }}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors pt-2"
              >
                Use a different email address
              </button>
            </div>
          </form>
        )}
      </CardContent>

      <CardFooter className="pt-2 border-t border-border/50 justify-center">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="size-3.5 text-emerald-600" />
          <span>Passwordless OTP Authentication</span>
        </div>
      </CardFooter>
    </Card>
  );
}
