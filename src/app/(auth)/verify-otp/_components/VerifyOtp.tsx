"use client";

import React, {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  KeyboardEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyOtp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState<number>(59);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(countdown);
    }
  }, [timer]);

  // Handle OTP input change
  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, idx) => {
      if (idx < 6) newOtp[idx] = char;
    });
    setOtp(newOtp);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const otpMutation = useMutation({
    mutationFn: async (bodyData: { email: string; otp: string }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/verify-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyData),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.message || "OTP verification failed");
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || "OTP verified successfully");
      console.log("Reset Token:", data?.resetToken);
      localStorage.setItem("refreshToken", data?.resetToken);
      router.push(`/change-password?email=${email}`);
    },
    onError: (err) => {
      toast.error(err.message || "Invalid OTP, try again");
    },
  });

  // Handle Verify button click
  const handleVerify = () => {
    if (!email) {
      toast.error("Email not found in URL");
      return;
    }

    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);
    otpMutation.mutate({ email, otp: otpValue });
    setIsLoading(false);
  };

  // Handle Resend OTP
  const handleResend = () => {
    setTimer(59);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
    toast.info("OTP resent!", {
      description: "A new OTP has been sent to your email.",
      position: "bottom-right",
    });
  };

  const isComplete = otp.every((digit) => digit !== "");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-semibold text-green-700">
            Verify Email
          </CardTitle>
          <CardDescription className="text-sm">
            Enter the 6-digit code sent to your email address
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* OTP Inputs */}
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleChange(index, e.target.value)
                  }
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`w-12 h-12 text-center text-lg font-semibold border-2 rounded-md transition-all focus:ring-2 ${digit
                      ? "border-green-600 focus:ring-green-500"
                      : "border-gray-300 focus:border-green-500"
                    }`}
                />
              ))}
            </div>

            {/* Timer & Info */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>00:{timer.toString().padStart(2, "0")}</span>
              </div>
            </div>

            <div className="text-center my-4">
              <p className="text-gray-700 text-sm md:text-sm font-medium">
                Type your exact OTP
              </p>
            </div>

            {/* Verify Button */}
            <Button
              onClick={handleVerify}
              disabled={!isComplete || isLoading}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-2.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Verifying..." : "Verify"}
            </Button>

            {/* Resend OTP */}
            <div className="text-center mt-2">
              <button
                onClick={handleResend}
                disabled={timer > 0}
                className="text-green-700 font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Resend OTP
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default VerifyOtp;
